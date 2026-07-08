import { cn } from "@/lib/utils";

interface MarqueeRowProps {
  children: React.ReactNode;
  className?: string;
  reverse?: boolean;
}

export function MarqueeRow({ children, className, reverse }: MarqueeRowProps) {
  return (
    <div className={cn("group relative overflow-hidden", className)}>
      <div className="from-background pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r to-transparent" />
      <div className="from-background pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l to-transparent" />
      <div
        className={cn(
          "animate-marquee flex w-max gap-4 group-hover:[animation-play-state:paused]",
          reverse && "[animation-direction:reverse]",
        )}
      >
        <div className="flex shrink-0 gap-4">{children}</div>
        <div className="flex shrink-0 gap-4" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}
