import type { Metadata } from "next";
import { Video } from "lucide-react";

import { ComingSoon } from "@/components/composed/coming-soon";

export const metadata: Metadata = { title: "GIF Generator" };

export default function GifGeneratorPage() {
  return <ComingSoon icon={Video} title="GIF Generator" description="Turn GIFs into memes." />;
}
