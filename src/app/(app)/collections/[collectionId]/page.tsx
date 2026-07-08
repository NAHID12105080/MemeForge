import type { Metadata } from "next";
import { FolderHeart } from "lucide-react";

import { ComingSoon } from "@/components/composed/coming-soon";

export const metadata: Metadata = { title: "Collection" };

export default async function CollectionDetailPage({
  params,
}: {
  params: Promise<{ collectionId: string }>;
}) {
  await params;
  return (
    <ComingSoon
      icon={FolderHeart}
      title="Collection"
      description="View memes in this collection."
    />
  );
}
