import { Check } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/composed/glass-panel";
import { SectionHeading } from "@/components/composed/section-heading";

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "Everything you need to create and share memes.",
    features: [
      "Full canvas editor with layers and filters",
      "Searchable template library",
      "AI caption generation (daily limit)",
      "Export to PNG, JPEG, WEBP, and SVG",
      "Public profile and collections",
    ],
    cta: "Get started",
    href: "/sign-up",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "Coming soon",
    description: "Higher AI limits and premium templates, for power creators.",
    features: [
      "Everything in Free",
      "Higher daily AI generation limits",
      "Access to premium templates",
      "Priority export processing",
    ],
    cta: "Join the waitlist",
    href: "/sign-up",
    highlighted: true,
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8">
      <SectionHeading
        align="center"
        eyebrow="Pricing"
        title="Free to start, no credit card required"
      />
      <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
        {plans.map((plan) => (
          <GlassPanel
            key={plan.name}
            className={
              plan.highlighted
                ? "border-primary/40 relative flex flex-col gap-6 p-8"
                : "flex flex-col gap-6 p-8"
            }
          >
            {plan.highlighted ? (
              <Badge className="absolute top-6 right-6" variant="secondary">
                Planned
              </Badge>
            ) : null}
            <div>
              <h3 className="font-medium">{plan.name}</h3>
              <p className="font-heading mt-2 text-3xl font-semibold">{plan.price}</p>
              <p className="text-muted-foreground mt-2 text-sm">{plan.description}</p>
            </div>
            <ul className="flex-1 space-y-2.5">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm">
                  <Check className="text-primary mt-0.5 size-4 shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
            <Button asChild variant={plan.highlighted ? "default" : "outline"}>
              <Link href={plan.href}>{plan.cta}</Link>
            </Button>
          </GlassPanel>
        ))}
      </div>
    </section>
  );
}
