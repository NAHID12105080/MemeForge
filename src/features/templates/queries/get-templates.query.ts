import "server-only";

import { and, desc, eq } from "drizzle-orm";

import { db } from "@/db/client";
import { bookmarks, categories, templates } from "@/db/schema";

const PAGE_SIZE = 24;

export async function getTemplatesPage({
  categorySlug,
  page,
}: {
  categorySlug?: string;
  page: number;
}) {
  const category = categorySlug
    ? await db.query.categories.findFirst({ where: eq(categories.slug, categorySlug) })
    : undefined;

  const whereClause = category ? and(eq(templates.categoryId, category.id)) : undefined;

  const items = await db.query.templates.findMany({
    where: whereClause,
    orderBy: [desc(templates.usageCount), desc(templates.createdAt)],
    limit: PAGE_SIZE,
    offset: page * PAGE_SIZE,
  });

  return {
    items,
    nextPage: items.length === PAGE_SIZE ? page + 1 : null,
  };
}

export async function getAllCategories() {
  return db.query.categories.findMany({ orderBy: [categories.sortOrder] });
}

export async function getBookmarkedTemplateIds(userId: string) {
  const rows = await db.query.bookmarks.findMany({
    where: and(eq(bookmarks.userId, userId), eq(bookmarks.targetType, "template")),
    columns: { targetId: true },
  });
  return new Set(rows.map((row) => row.targetId));
}
