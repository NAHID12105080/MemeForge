"use client";

import { animate, useInView } from "motion/react";
import { useEffect, useRef } from "react";

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  formatter?: (value: number) => string;
  className?: string;
}

export function AnimatedNumber({
  value,
  duration = 1.2,
  formatter = (v) => Math.round(v).toLocaleString(),
  className,
}: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-10% 0px" });

  useEffect(() => {
    if (!isInView || !ref.current) return;
    const node = ref.current;
    const controls = animate(0, value, {
      duration,
      ease: "easeOut",
      onUpdate(latest) {
        node.textContent = formatter(latest);
      },
    });
    return () => controls.stop();
  }, [isInView, value, duration, formatter]);

  return (
    <span ref={ref} className={className}>
      {formatter(0)}
    </span>
  );
}
