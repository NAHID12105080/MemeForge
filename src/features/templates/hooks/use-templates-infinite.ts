import { useInfiniteQuery } from "@tanstack/react-query";

import { getTemplatesPageAction } from "@/features/templates/actions/get-templates-page.action";
import type { getTemplatesPage } from "@/features/templates/queries/get-templates.query";

type TemplatesPage = Awaited<ReturnType<typeof getTemplatesPage>>;

export function useTemplatesInfinite(
  categorySlug: string | undefined,
  initialPage?: TemplatesPage,
) {
  return useInfiniteQuery({
    queryKey: ["templates", categorySlug ?? "all"],
    queryFn: ({ pageParam }) => getTemplatesPageAction({ categorySlug, page: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialData: initialPage ? { pages: [initialPage], pageParams: [0] } : undefined,
  });
}
