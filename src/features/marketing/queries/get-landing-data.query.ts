import "server-only";

import { count, desc, eq } from "drizzle-orm";

import { db } from "@/db/client";
import { memes, templates, user } from "@/db/schema";
import { refreshMediaUrl } from "@/lib/storage/upload-storage";

export async function getFeaturedTemplates(limit = 8) {
  return db.query.templates.findMany({
    where: eq(templates.isFeatured, true),
    orderBy: [desc(templates.usageCount)],
    limit,
  });
}

export async function getTrendingMemes(limit = 12) {
  const rows = await db.query.memes.findMany({
    where: eq(memes.visibility, "public"),
    orderBy: [desc(memes.likeCount), desc(memes.publishedAt)],
    limit,
    with: {
      user: { columns: { name: true, username: true, image: true } },
    },
  });
  return Promise.all(
    rows.map(async (row) => ({
      ...row,
      thumbnailUrl: row.thumbnailUrl ? await refreshMediaUrl(row.thumbnailUrl) : row.thumbnailUrl,
    })),
  );
}

export async function getPlatformStats() {
  const [[userCount], [templateCount], [memeCount]] = await Promise.all([
    db.select({ value: count() }).from(user),
    db.select({ value: count() }).from(templates),
    db.select({ value: count() }).from(memes),
  ]);

  return {
    users: userCount?.value ?? 0,
    templates: templateCount?.value ?? 0,
    memes: memeCount?.value ?? 0,
  };
}
