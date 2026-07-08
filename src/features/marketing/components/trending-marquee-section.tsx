import { TrendingUp } from "lucide-react";

import { EmptyState } from "@/components/composed/empty-state";
import { MarqueeRow } from "@/components/composed/marquee-row";
import { MemeCard } from "@/components/composed/meme-card";
import { SectionHeading } from "@/components/composed/section-heading";
import { getTrendingMemes } from "@/features/marketing/queries/get-landing-data.query";

export async function TrendingMarqueeSection() {
  const trendingMemes = await getTrendingMemes();

  return (
    <section className="bg-muted/30 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          align="center"
          eyebrow="Community"
          title="Trending right now"
          description="The most-loved memes made with MemeForge this week."
        />
      </div>
      <div className="mt-10">
        {trendingMemes.length > 0 ? (
          <MarqueeRow>
            {trendingMemes.map((meme) => (
              <MemeCard key={meme.id} meme={meme} />
            ))}
          </MarqueeRow>
        ) : (
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <EmptyState
              icon={TrendingUp}
              title="No trending memes yet"
              description="Publish a meme to be the first one featured here."
            />
          </div>
        )}
      </div>
    </section>
  );
}
