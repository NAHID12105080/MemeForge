import type { Metadata } from "next";
import { Compass } from "lucide-react";

import { ComingSoon } from "@/components/composed/coming-soon";

export const metadata: Metadata = { title: "Explore" };

export default function ExplorePage() {
  return (
    <ComingSoon
      icon={Compass}
      title="Explore"
      description="Discover public memes from the community."
    />
  );
}
