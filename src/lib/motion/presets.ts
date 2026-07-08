import type { Transition } from "motion/react";

export const springGentle: Transition = {
  type: "spring",
  stiffness: 260,
  damping: 28,
  mass: 0.9,
};

export const springSnappy: Transition = {
  type: "spring",
  stiffness: 420,
  damping: 30,
  mass: 0.6,
};

export const springBouncy: Transition = {
  type: "spring",
  stiffness: 320,
  damping: 18,
  mass: 0.8,
};

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const fadeSlideUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 12 },
};

export const staggerContainer = (staggerChildren = 0.06, delayChildren = 0) => ({
  animate: {
    transition: { staggerChildren, delayChildren },
  },
});

export const scaleIn = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.96 },
};
