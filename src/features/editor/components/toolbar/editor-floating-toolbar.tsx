"use client";

import { Circle, Square, Type } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  createShapeLayer,
  createTextLayer,
  getNextZIndex,
} from "@/features/editor/lib/layers/layer-factory";
import { useEditorStore } from "@/features/editor/store/editor-store";

export function EditorFloatingToolbar() {
  const addLayer = useEditorStore((s) => s.addLayer);
  const canvasState = useEditorStore((s) => s.canvasState);

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

  function handleAddShape(shapeType: "rect" | "ellipse") {
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

  return (
    <div className="glass-panel shadow-soft-md absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full p-1.5">
      <Button variant="ghost" size="icon" className="rounded-full" onClick={handleAddText}>
        <Type className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full"
        onClick={() => handleAddShape("rect")}
      >
        <Square className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full"
        onClick={() => handleAddShape("ellipse")}
      >
        <Circle className="size-4" />
      </Button>
    </div>
  );
}
