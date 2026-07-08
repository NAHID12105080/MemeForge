import { Palette } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/composed/empty-state";
import { SectionHeading } from "@/components/composed/section-heading";
import { Button } from "@/components/ui/button";
import { getFeaturedTemplates } from "@/features/marketing/queries/get-landing-data.query";
import { TemplateCard } from "@/features/templates/components/template-card";

export async function FeaturedTemplatesSection() {
  const featuredTemplates = await getFeaturedTemplates();

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeading
          eyebrow="Template library"
          title="Start from a proven format"
          description="Hand-picked templates ready to caption in seconds."
        />
        <Button variant="outline" asChild className="shrink-0">
          <Link href="/templates">Browse all templates</Link>
        </Button>
      </div>
      <div className="mt-10">
        {featuredTemplates.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {featuredTemplates.map((template) => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Palette}
            title="Templates are on the way"
            description="Featured templates will show up here once the library is seeded."
          />
        )}
      </div>
    </section>
  );
}
