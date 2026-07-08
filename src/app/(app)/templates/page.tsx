import type { Metadata } from "next";
import { Palette } from "lucide-react";

import { ComingSoon } from "@/components/composed/coming-soon";

export const metadata: Metadata = { title: "Templates" };

export default function TemplatesPage() {
  return (
    <ComingSoon icon={Palette} title="Templates" description="Browse the meme template library." />
  );
}
