import type { Metadata } from "next";
import { Bookmark } from "lucide-react";

import { ComingSoon } from "@/components/composed/coming-soon";

export const metadata: Metadata = { title: "Favorites" };

export default function FavoritesPage() {
  return (
    <ComingSoon icon={Bookmark} title="Favorites" description="Memes and templates you've saved." />
  );
}
