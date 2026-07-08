import type { Metadata } from "next";
import { FolderHeart } from "lucide-react";

import { ComingSoon } from "@/components/composed/coming-soon";

export const metadata: Metadata = { title: "Collections" };

export default function CollectionsPage() {
  return (
    <ComingSoon
      icon={FolderHeart}
      title="Collections"
      description="Organize your memes into collections."
    />
  );
}
