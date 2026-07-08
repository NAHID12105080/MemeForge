import { AnimatedNumber } from "@/components/composed/animated-number";
import { getPlatformStats } from "@/features/marketing/queries/get-landing-data.query";

export async function StatsSection() {
  const stats = await getPlatformStats();

  const items = [
    { label: "Creators", value: stats.users },
    { label: "Templates", value: stats.templates },
    { label: "Memes created", value: stats.memes },
  ];

  return (
    <section className="border-border/60 border-y">
      <div className="mx-auto grid max-w-7xl grid-cols-1 divide-y sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {items.map((item) => (
          <div key={item.label} className="flex flex-col items-center gap-1 px-6 py-12 text-center">
            <span className="font-heading text-4xl font-semibold tracking-tight">
              <AnimatedNumber value={item.value} />
            </span>
            <span className="text-muted-foreground text-sm">{item.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
