import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { GlassPanel } from "@/components/composed/glass-panel";
import { SectionHeading } from "@/components/composed/section-heading";

// Placeholder launch copy — swap for real creator testimonials once
// MemeForge has a public user base to draw from.
const testimonials = [
  {
    quote:
      "The layer editor feels as fast as a native design tool. I stopped reaching for anything else to make memes for our team channel.",
    name: "Community Manager",
    context: "Early access tester",
    initials: "CM",
  },
  {
    quote:
      "AI caption rewriting saves me the most time — I generate five variations and just pick the funniest one.",
    name: "Content Creator",
    context: "Early access tester",
    initials: "CC",
  },
  {
    quote:
      "Exporting straight to transparent PNG at full resolution is the feature I didn't know I needed.",
    name: "Social Media Editor",
    context: "Early access tester",
    initials: "SE",
  },
];

export function TestimonialsSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <SectionHeading
        align="center"
        eyebrow="Early feedback"
        title="What early testers are saying"
      />
      <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3">
        {testimonials.map((testimonial) => (
          <GlassPanel key={testimonial.name} className="flex flex-col gap-4 p-6">
            <p className="text-sm text-balance">&ldquo;{testimonial.quote}&rdquo;</p>
            <div className="mt-auto flex items-center gap-3">
              <Avatar className="size-9">
                <AvatarFallback>{testimonial.initials}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{testimonial.name}</p>
                <p className="text-muted-foreground text-xs">{testimonial.context}</p>
              </div>
            </div>
          </GlassPanel>
        ))}
      </div>
    </section>
  );
}
