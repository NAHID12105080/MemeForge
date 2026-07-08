import type { Metadata } from "next";
import { Sparkles } from "lucide-react";

import { ComingSoon } from "@/components/composed/coming-soon";

export const metadata: Metadata = { title: "AI Generator" };

export default function AiGeneratorPage() {
  return (
    <ComingSoon
      icon={Sparkles}
      title="AI Generator"
      description="Generate captions with AI, outside the editor."
    />
  );
}
