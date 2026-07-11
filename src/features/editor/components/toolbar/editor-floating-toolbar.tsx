"use client";

import { ImagePlus, Loader2, Type } from "lucide-react";
import { useRef } from "react";

import { Button } from "@/components/ui/button";
import { EmojiPickerPopover } from "@/features/editor/components/toolbar/emoji-picker-popover";
import { ShapesPopover } from "@/features/editor/components/toolbar/shapes-popover";
import { useAddImageLayer } from "@/features/editor/lib/layers/use-add-image-layer";
import {
  createShapeLayer,
  createStickerLayer,
  createTextLayer,
  getNextZIndex,
} from "@/features/editor/lib/layers/layer-factory";
import type { ShapeLayer } from "@/features/editor/schemas/meme-canvas-state.schema";
import { useEditorStore } from "@/features/editor/store/editor-store";

export function EditorFloatingToolbar() {
  const addLayer = useEditorStore((s) => s.addLayer);
  const canvasState = useEditorStore((s) => s.canvasState);
  const { addImageFromFile, isUploading } = useAddImageLayer();
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleAddText() {
    const zIndex = getNextZIndex(canvasState.layers);
    addLayer(
      createTextLayer({
        x: canvasState.canvas.width / 2 - 200,
        y: canvasState.canvas.height / 2 - 50,
        zIndex,
      }),
    );
  }

  function handleAddShape(shapeType: ShapeLayer["shapeType"]) {
    const zIndex = getNextZIndex(canvasState.layers);
    addLayer(
      createShapeLayer({
        x: canvasState.canvas.width / 2 - 100,
        y: canvasState.canvas.height / 2 - 100,
        width: 200,
        height: 200,
        zIndex,
        shapeType,
      }),
    );
  }

  function handleAddEmoji(unicodeChar: string) {
    const zIndex = getNextZIndex(canvasState.layers);
    addLayer(
      createStickerLayer({
        x: canvasState.canvas.width / 2 - 48,
        y: canvasState.canvas.height / 2 - 48,
        zIndex,
        assetKind: "emoji",
        unicodeChar,
      }),
    );
  }

  return (
    <div className="glass-panel shadow-soft-md absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full p-1.5">
      <Button variant="ghost" size="icon" className="rounded-full" onClick={handleAddText}>
        <Type className="size-4" />
      </Button>
      <ShapesPopover onSelect={handleAddShape} />
      <EmojiPickerPopover onSelect={handleAddEmoji} />
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full"
        disabled={isUploading}
        onClick={() => fileInputRef.current?.click()}
      >
        {isUploading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <ImagePlus className="size-4" />
        )}
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) addImageFromFile(file);
          event.target.value = "";
        }}
      />
    </div>
  );
}
