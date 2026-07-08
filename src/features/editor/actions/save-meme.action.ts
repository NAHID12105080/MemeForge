"use server";

import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { z } from "zod";

import { db } from "@/db/client";
import { memes } from "@/db/schema";
import { memeCanvasStateSchema } from "@/features/editor/schemas/meme-canvas-state.schema";
import { getSession } from "@/lib/auth/session";

const inputSchema = z.object({
  memeId: z.string().nullable(),
  title: z.string().min(1).max(120),
  canvasState: memeCanvasStateSchema,
});

function slugify(title: string) {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return `${base || "meme"}-${nanoid(6)}`;
}

export async function saveMemeAction(input: z.infer<typeof inputSchema>) {
  const session = await getSession();
  if (!session) {
    throw new Error("You must be signed in to save a meme.");
  }

  const { memeId, title, canvasState } = inputSchema.parse(input);

  if (memeId) {
    const existing = await db.query.memes.findFirst({ where: eq(memes.id, memeId) });
    if (!existing || existing.userId !== session.user.id) {
      throw new Error("Meme not found.");
    }
    await db
      .update(memes)
      .set({ title, canvasState, updatedAt: new Date() })
      .where(eq(memes.id, memeId));
    return { id: memeId };
  }

  const [created] = await db
    .insert(memes)
    .values({
      userId: session.user.id,
      title,
      slug: slugify(title),
      canvasState,
      width: canvasState.canvas.width,
      height: canvasState.canvas.height,
    })
    .returning({ id: memes.id });

  return { id: created.id };
}
