import { Layers, Palette, Sparkles, Users, Wand2, Zap } from "lucide-react";

import { SectionHeading } from "@/components/composed/section-heading";
import { GlassPanel } from "@/components/composed/glass-panel";

const features = [
  {
    icon: Layers,
    title: "Professional layer editor",
    description:
      "Drag, resize, rotate, and layer text, images, shapes, and stickers with pixel-precise snap guides and full undo history.",
  },
  {
    icon: Sparkles,
    title: "AI caption generation",
    description:
      "Generate, rewrite, translate, or punch up captions with AI — then drop them straight onto the canvas as editable text layers.",
  },
  {
    icon: Palette,
    title: "Searchable template library",
    description:
      "Fuzzy search across a growing library of templates, organized by category and trend.",
  },
  {
    icon: Wand2,
    title: "Filters and effects",
    description:
      "Brightness, contrast, blur, hue, and saturation controls plus outlines, shadows, and glow on text.",
  },
  {
    icon: Zap,
    title: "Export anywhere",
    description:
      "PNG, JPEG, WEBP, and SVG — with transparent backgrounds, high resolution, and one-click sharing.",
  },
  {
    icon: Users,
    title: "Built for community",
    description:
      "Follow creators, collect your favorites, and see what's trending across the platform.",
  },
];

export function FeatureShowcase() {
  return (
    <section id="features" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <SectionHeading
        align="center"
        eyebrow="Everything you need"
        title="A meme editor that keeps up with you"
        description="From first draft to final export, MemeForge covers the whole workflow."
      />
      <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <GlassPanel key={feature.title} className="flex flex-col gap-3 p-6">
            <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-xl">
              <feature.icon className="size-5" />
            </div>
            <h3 className="font-medium">{feature.title}</h3>
            <p className="text-muted-foreground text-sm">{feature.description}</p>
          </GlassPanel>
        ))}
      </div>
    </section>
  );
}
