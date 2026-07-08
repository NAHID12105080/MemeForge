import type { Metadata } from "next";
import { TrendingUp } from "lucide-react";

import { ComingSoon } from "@/components/composed/coming-soon";

export const metadata: Metadata = { title: "Trending" };

export default function TrendingPage() {
  return (
    <ComingSoon
      icon={TrendingUp}
      title="Trending"
      description="See what's trending across MemeForge right now."
    />
  );
}
