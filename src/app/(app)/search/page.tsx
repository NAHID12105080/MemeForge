import type { Metadata } from "next";
import { Search } from "lucide-react";

import { ComingSoon } from "@/components/composed/coming-soon";

export const metadata: Metadata = { title: "Search" };

export default function SearchPage() {
  return <ComingSoon icon={Search} title="Search" description="Search memes and templates." />;
}
