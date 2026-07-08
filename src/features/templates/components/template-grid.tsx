"use client";

import Fuse from "fuse.js";
import { Search as SearchIcon } from "lucide-react";
import { useMemo, useState } from "react";

import { EmptyState } from "@/components/composed/empty-state";
import { InfiniteScrollSentinel } from "@/components/composed/infinite-scroll-sentinel";
import { VirtualGrid } from "@/components/composed/virtual-grid";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useTemplatesInfinite } from "@/features/templates/hooks/use-templates-infinite";
import { TemplateCard } from "@/features/templates/components/template-card";
import type { getTemplatesPage } from "@/features/templates/queries/get-templates.query";
import { useColumnCount } from "@/hooks/use-column-count";

interface TemplateGridProps {
  categorySlug?: string;
  favoritedIds: string[];
  initialPage: Awaited<ReturnType<typeof getTemplatesPage>>;
}

export function TemplateGrid({ categorySlug, favoritedIds, initialPage }: TemplateGridProps) {
  const [search, setSearch] = useState("");
  const columns = useColumnCount();
  const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } = useTemplatesInfinite(
    categorySlug,
    initialPage,
  );

  const favoritedSet = useMemo(() => new Set(favoritedIds), [favoritedIds]);

  const allTemplates = useMemo(() => data?.pages.flatMap((page) => page.items) ?? [], [data]);

  const fuse = useMemo(
    () => new Fuse(allTemplates, { keys: ["name", "description"], threshold: 0.35 }),
    [allTemplates],
  );

  const filteredTemplates = useMemo(() => {
    if (!search.trim()) return allTemplates;
    return fuse.search(search).map((result) => result.item);
  }, [search, fuse, allTemplates]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square rounded-2xl" />
        ))}
      </div>
    );
  }

  if (allTemplates.length === 0) {
    return (
      <EmptyState
        icon={SearchIcon}
        title="No templates yet"
        description="Templates in this category will show up here once they're seeded."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="relative max-w-sm">
        <SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search templates..."
          className="pl-9"
        />
      </div>

      {filteredTemplates.length === 0 ? (
        <EmptyState
          icon={SearchIcon}
          title="No matches"
          description="Try a different search term."
        />
      ) : (
        <VirtualGrid
          items={filteredTemplates}
          columns={columns}
          rowHeight={260}
          getKey={(template) => template.id}
          renderItem={(template) => (
            <TemplateCard template={template} initialFavorited={favoritedSet.has(template.id)} />
          )}
        />
      )}

      {!search.trim() ? (
        <InfiniteScrollSentinel
          enabled={!!hasNextPage && !isFetchingNextPage}
          onIntersect={() => fetchNextPage()}
        />
      ) : null}
    </div>
  );
}
