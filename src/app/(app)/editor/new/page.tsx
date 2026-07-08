import type { Metadata } from "next";
import { Palette } from "lucide-react";

import { ComingSoon } from "@/components/composed/coming-soon";

export const metadata: Metadata = { title: "New meme" };

export default function NewMemeEditorPage() {
  return (
    <ComingSoon
      icon={Palette}
      title="Meme editor"
      description="The canvas editor is coming soon."
    />
  );
}
