import { beforeEach, describe, expect, it } from "vitest";

import { createImageLayer } from "@/features/editor/lib/layers/layer-factory";
import type { MemeCanvasState } from "@/features/editor/schemas/meme-canvas-state.schema";
import { useEditorStore } from "@/features/editor/store/editor-store";

function canvasStateWithImageLayer(): { state: MemeCanvasState; layerId: string } {
  const layer = createImageLayer({ x: 0, y: 0, width: 200, height: 200, zIndex: 1, src: "/x.png" });
  return {
    state: {
      version: 1,
      canvas: { width: 1080, height: 1080, backgroundColor: "#000000", backgroundImageMediaId: null },
      layers: [layer],
    },
    layerId: layer.id,
  };
}

describe("editor store crop mode", () => {
  let layerId: string;

  beforeEach(() => {
    const { state, layerId: id } = canvasStateWithImageLayer();
    layerId = id;
    useEditorStore.getState().loadMeme(null, "Untitled meme", state);
  });

  it("applyCrop commits the draft crop rect onto the layer and exits crop mode", () => {
    useEditorStore.getState().enterCropMode(layerId);
    useEditorStore.getState().setCropDraft({ x: 10, y: 20, width: 100, height: 80 });

    useEditorStore.getState().applyCrop();

    const state = useEditorStore.getState();
    const layer = state.canvasState.layers.find((l) => l.id === layerId);
    expect(layer?.type).toBe("image");
    expect(layer && layer.type === "image" ? layer.crop : null).toEqual({
      x: 10,
      y: 20,
      width: 100,
      height: 80,
    });
    expect(state.cropModeLayerId).toBeNull();
    expect(state.cropDraft).toBeNull();
  });

  it("applyCrop is undo-able", () => {
    useEditorStore.getState().enterCropMode(layerId);
    useEditorStore.getState().setCropDraft({ x: 10, y: 20, width: 100, height: 80 });
    useEditorStore.getState().applyCrop();

    useEditorStore.getState().undo();

    const layer = useEditorStore
      .getState()
      .canvasState.layers.find((l) => l.id === layerId);
    expect(layer && layer.type === "image" ? layer.crop : undefined).toBeNull();
  });

  it("cancelCrop leaves the layer's crop unchanged and exits crop mode", () => {
    useEditorStore.getState().enterCropMode(layerId);
    useEditorStore.getState().setCropDraft({ x: 5, y: 5, width: 50, height: 50 });

    useEditorStore.getState().cancelCrop();

    const state = useEditorStore.getState();
    const layer = state.canvasState.layers.find((l) => l.id === layerId);
    expect(layer && layer.type === "image" ? layer.crop : undefined).toBeNull();
    expect(state.cropModeLayerId).toBeNull();
    expect(state.cropDraft).toBeNull();
  });

  it("only one layer can be in crop mode at a time", () => {
    useEditorStore.getState().enterCropMode(layerId);
    useEditorStore.getState().enterCropMode("some-other-layer-id");

    expect(useEditorStore.getState().cropModeLayerId).toBe("some-other-layer-id");
  });
});
