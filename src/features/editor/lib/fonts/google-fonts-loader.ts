"use client";

import { useEffect, useState } from "react";

import { CURATED_FONTS, SYSTEM_FONTS } from "@/features/editor/lib/fonts/curated-fonts";

const loadedFamilies = new Set<string>();
const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

function injectFontLink(family: string, weights: number[]) {
  if (loadedFamilies.has(family) || SYSTEM_FONTS.has(family)) return;

  const href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weights.join(";")}&display=swap`;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  document.head.appendChild(link);
  loadedFamilies.add(family);

  const weightList = weights.map((w) => `${w} 16px "${family}"`);
  Promise.all(weightList.map((spec) => document.fonts.load(spec)))
    .then(() => notifyListeners())
    .catch(() => {});
}

export function loadGoogleFont(family: string) {
  const font = CURATED_FONTS.find((f) => f.family === family);
  injectFontLink(family, font?.weights ?? [400, 700]);
}

export function useFontsReadyTick() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const listener = () => setTick((t) => t + 1);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);
}

// Preload the default meme font eagerly.
if (typeof window !== "undefined") {
  injectFontLink("Anton", [400]);
}
