import "server-only";

import type { MemeCanvasState } from "@/features/editor/schemas/meme-canvas-state.schema";
import { refreshMediaUrl } from "@/lib/storage/upload-storage";

export async function refreshCanvasMediaUrls(canvasState: MemeCanvasState): Promise<MemeCanvasState> {
  const layers = await Promise.all(
    canvasState.layers.map(async (layer) =>
      layer.type === "image" ? { ...layer, src: await refreshMediaUrl(layer.src) } : layer,
    ),
  );
  return { ...canvasState, layers };
}
