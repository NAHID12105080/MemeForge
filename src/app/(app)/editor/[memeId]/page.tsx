import type { Metadata } from "next";
import { Palette } from "lucide-react";

import { ComingSoon } from "@/components/composed/coming-soon";

export const metadata: Metadata = { title: "Edit meme" };

export default async function EditMemePage({ params }: { params: Promise<{ memeId: string }> }) {
  await params;
  return (
    <ComingSoon
      icon={Palette}
      title="Meme editor"
      description="The canvas editor is coming soon."
    />
  );
}
