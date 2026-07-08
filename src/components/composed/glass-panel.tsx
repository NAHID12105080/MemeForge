import { cn } from "@/lib/utils";

export function GlassPanel({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="glass-panel"
      className={cn("glass-panel shadow-soft-md rounded-2xl", className)}
      {...props}
    />
  );
}
