import { describe, expect, it } from "vitest";

import { getNextZIndex } from "@/features/editor/lib/layers/layer-factory";
import type { Layer } from "@/features/editor/schemas/meme-canvas-state.schema";

describe("getNextZIndex", () => {
  it("returns 1 for an empty layer list", () => {
    expect(getNextZIndex([])).toBe(1);
  });

  it("returns one more than the highest zIndex present", () => {
    const layers = [{ zIndex: 2 }, { zIndex: 5 }, { zIndex: 3 }] as Layer[];

    expect(getNextZIndex(layers)).toBe(6);
  });
});
