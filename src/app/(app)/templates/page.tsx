import type { Metadata } from "next";

import { PageHeader } from "@/components/composed/page-header";
import { CategoryFilterBar } from "@/features/templates/components/category-filter-bar";
import { TemplateGrid } from "@/features/templates/components/template-grid";
import {
  getAllCategories,
  getBookmarkedTemplateIds,
  getTemplatesPage,
} from "@/features/templates/queries/get-templates.query";
import { getSession } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Templates" };

export default async function TemplatesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const session = await getSession();

  const [categories, initialPage, favoritedIds] = await Promise.all([
    getAllCategories(),
    getTemplatesPage({ categorySlug: category, page: 0 }),
    session ? getBookmarkedTemplateIds(session.user.id) : Promise.resolve(new Set<string>()),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader title="Templates" description="Browse the meme template library." />
      <CategoryFilterBar categories={categories} />
      <TemplateGrid
        key={category ?? "all"}
        categorySlug={category}
        initialPage={initialPage}
        favoritedIds={[...favoritedIds]}
      />
    </div>
  );
}
