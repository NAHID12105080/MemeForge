"use client";

import { useState } from "react";
import { toast } from "sonner";

import { uploadLayerImageAction } from "@/features/editor/actions/upload-layer-image.action";
import { createImageLayer, getNextZIndex } from "@/features/editor/lib/layers/layer-factory";
import { useEditorStore } from "@/features/editor/store/editor-store";

export function useAddImageLayer() {
  const [isUploading, setIsUploading] = useState(false);
  const addLayer = useEditorStore((s) => s.addLayer);

  async function addImageFromFile(file: File, dropPosition?: { x: number; y: number }) {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const result = await uploadLayerImageAction(formData);

      const { canvasState } = useEditorStore.getState();
      const maxLayerSize = Math.min(canvasState.canvas.width, canvasState.canvas.height) * 0.6;
      const scale = Math.min(1, maxLayerSize / Math.max(result.width, result.height));
      const width = result.width * scale;
      const height = result.height * scale;

      const x = dropPosition
        ? dropPosition.x - width / 2
        : canvasState.canvas.width / 2 - width / 2;
      const y = dropPosition
        ? dropPosition.y - height / 2
        : canvasState.canvas.height / 2 - height / 2;

      addLayer(
        createImageLayer({
          x,
          y,
          width,
          height,
          zIndex: getNextZIndex(canvasState.layers),
          src: result.url,
          mediaId: result.mediaId,
        }),
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  }

  return { addImageFromFile, isUploading };
}
