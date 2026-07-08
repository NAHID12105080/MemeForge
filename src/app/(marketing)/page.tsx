import { Suspense } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { CtaSection } from "@/features/marketing/components/cta-section";
import { FaqSection } from "@/features/marketing/components/faq-section";
import { FeatureShowcase } from "@/features/marketing/components/feature-showcase";
import { FeaturedTemplatesSection } from "@/features/marketing/components/featured-templates-section";
import { Hero } from "@/features/marketing/components/hero";
import { PricingSection } from "@/features/marketing/components/pricing-section";
import { StatsSection } from "@/features/marketing/components/stats-section";
import { TestimonialsSection } from "@/features/marketing/components/testimonials-section";
import { TrendingMarqueeSection } from "@/features/marketing/components/trending-marquee-section";

export const revalidate = 300;

function SectionSkeleton({ className }: { className?: string }) {
  return <Skeleton className={className ?? "mx-auto h-64 w-full max-w-7xl"} />;
}

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      <Hero />
      <Suspense fallback={<SectionSkeleton />}>
        <StatsSection />
      </Suspense>
      <Suspense fallback={<SectionSkeleton />}>
        <FeaturedTemplatesSection />
      </Suspense>
      <Suspense fallback={<SectionSkeleton />}>
        <TrendingMarqueeSection />
      </Suspense>
      <FeatureShowcase />
      <TestimonialsSection />
      <PricingSection />
      <FaqSection />
      <CtaSection />
    </div>
  );
}
