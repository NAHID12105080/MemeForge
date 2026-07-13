import { eq } from "drizzle-orm";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { db } from "@/db/client";
import { memes } from "@/db/schema";
import { EditorShell } from "@/features/editor/components/editor-shell";
import { refreshCanvasMediaUrls } from "@/features/editor/lib/layers/refresh-canvas-media-urls";
import { memeCanvasStateSchema } from "@/features/editor/schemas/meme-canvas-state.schema";
import { getSession } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Edit meme" };

export default async function EditMemePage({ params }: { params: Promise<{ memeId: string }> }) {
  const { memeId } = await params;
  const session = await getSession();
  if (!session) {
    redirect(`/sign-in?redirect=/editor/${memeId}`);
  }

  const meme = await db.query.memes.findFirst({ where: eq(memes.id, memeId) });
  if (!meme || meme.userId !== session.user.id) {
    notFound();
  }

  const canvasState = await refreshCanvasMediaUrls(memeCanvasStateSchema.parse(meme.canvasState));

  return <EditorShell memeId={meme.id} title={meme.title} canvasState={canvasState} />;
}
