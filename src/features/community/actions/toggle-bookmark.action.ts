"use server";

import { and, eq } from "drizzle-orm";

import { db } from "@/db/client";
import { bookmarks } from "@/db/schema";
import { getSession } from "@/lib/auth/session";

export async function toggleBookmarkAction(input: {
  targetType: "meme" | "template";
  targetId: string;
}) {
  const session = await getSession();
  if (!session) {
    throw new Error("You must be signed in to save favorites.");
  }

  const existing = await db.query.bookmarks.findFirst({
    where: and(
      eq(bookmarks.userId, session.user.id),
      eq(bookmarks.targetType, input.targetType),
      eq(bookmarks.targetId, input.targetId),
    ),
  });

  if (existing) {
    await db.delete(bookmarks).where(eq(bookmarks.id, existing.id));
    return { bookmarked: false };
  }

  await db.insert(bookmarks).values({
    userId: session.user.id,
    targetType: input.targetType,
    targetId: input.targetId,
  });
  return { bookmarked: true };
}
