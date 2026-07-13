import { describe, expect, it, vi } from "vitest";

// The installed `server-only` package (0.0.1) throws unconditionally on
// import — it doesn't gate on `typeof window`, contrary to what its docs
// imply. `refresh-canvas-media-urls.ts` (and its `upload-storage.ts`
// dependency) import it at the top, so it must be mocked here for this
// file's Node-environment test run to import that module. See
// `upload-storage.test.ts` for the same pattern.
vi.mock("server-only", () => ({}));

import { createImageLayer, createTextLayer } from "@/features/editor/lib/layers/layer-factory";
import { refreshCanvasMediaUrls } from "@/features/editor/lib/layers/refresh-canvas-media-urls";
import type { MemeCanvasState } from "@/features/editor/schemas/meme-canvas-state.schema";

describe("refreshCanvasMediaUrls", () => {
  it("resolves image layer URLs through refreshMediaUrl and leaves other layers untouched", async () => {
    const imageLayer = createImageLayer({
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      zIndex: 1,
      src: "/uploads/uploads/user1/abc.webp",
    });
    const textLayer = createTextLayer({ x: 0, y: 0, zIndex: 2 });
    const canvasState: MemeCanvasState = {
      version: 1,
      canvas: { width: 1080, height: 1080, backgroundColor: "#000000", backgroundImageMediaId: null },
      layers: [imageLayer, textLayer],
    };

    const result = await refreshCanvasMediaUrls(canvasState);

    // B2 is unconfigured in the test env, so refreshMediaUrl passes local-disk
    // URLs through unchanged — this asserts the mapping/passthrough wiring,
    // not B2's signing itself (already covered in upload-storage.test.ts).
    expect(result.layers[0]).toEqual(imageLayer);
    expect(result.layers[1]).toEqual(textLayer);
  });
});
