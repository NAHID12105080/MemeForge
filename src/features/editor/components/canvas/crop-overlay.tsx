"use client";

import type Konva from "konva";
import { useEffect, useRef } from "react";
import { Rect, Transformer } from "react-konva";
import useImage from "use-image";

import type { ImageLayer } from "@/features/editor/schemas/meme-canvas-state.schema";
import { type CropRect, useEditorStore } from "@/features/editor/store/editor-store";

const MIN_CROP_SIZE = 20;

export function CropOverlay({ layer }: { layer: ImageLayer }) {
  const [image] = useImage(layer.src, "anonymous");
  const rectRef = useRef<Konva.Rect>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  // The store is the single source of truth for the in-progress crop rect,
  // so the Apply/Cancel buttons in the properties panel (a sibling
  // component) can read the same value this overlay is dragging.
  const draft = useEditorStore((s) => s.cropDraft);
  const setCropDraft = useEditorStore((s) => s.setCropDraft);

  useEffect(() => {
    if (!image || draft) return;
    setCropDraft(
      layer.crop ?? { x: 0, y: 0, width: image.naturalWidth, height: image.naturalHeight },
    );
  }, [image, draft, layer.crop, setCropDraft]);

  useEffect(() => {
    transformerRef.current?.nodes(rectRef.current ? [rectRef.current] : []);
    transformerRef.current?.getLayer()?.batchDraw();
  }, [draft]);

  if (!image || !draft) return null;

  const scale = Math.min(layer.width / image.naturalWidth, layer.height / image.naturalHeight);
  const displayWidth = image.naturalWidth * scale;
  const displayHeight = image.naturalHeight * scale;
  const displayX = layer.x + (layer.width - displayWidth) / 2;
  const displayY = layer.y + (layer.height - displayHeight) / 2;

  const rectX = displayX + draft.x * scale;
  const rectY = displayY + draft.y * scale;
  const rectWidth = draft.width * scale;
  const rectHeight = draft.height * scale;

  function commit(node: Konva.Rect) {
    const width = node.width() * node.scaleX();
    const height = node.height() * node.scaleY();
    node.scaleX(1);
    node.scaleY(1);

    const clampedWidth = Math.min(Math.max(width, MIN_CROP_SIZE * scale), displayWidth);
    const clampedHeight = Math.min(Math.max(height, MIN_CROP_SIZE * scale), displayHeight);
    const clampedX = Math.min(Math.max(node.x(), displayX), displayX + displayWidth - clampedWidth);
    const clampedY = Math.min(Math.max(node.y(), displayY), displayY + displayHeight - clampedHeight);

    node.x(clampedX);
    node.y(clampedY);
    node.width(clampedWidth);
    node.height(clampedHeight);

    const next: CropRect = {
      x: (clampedX - displayX) / scale,
      y: (clampedY - displayY) / scale,
      width: clampedWidth / scale,
      height: clampedHeight / scale,
    };
    setCropDraft(next);
  }

  return (
    <>
      <Rect
        x={displayX}
        y={displayY}
        width={displayWidth}
        height={rectY - displayY}
        fill="black"
        opacity={0.55}
        listening={false}
      />
      <Rect
        x={displayX}
        y={rectY + rectHeight}
        width={displayWidth}
        height={displayY + displayHeight - (rectY + rectHeight)}
        fill="black"
        opacity={0.55}
        listening={false}
      />
      <Rect
        x={displayX}
        y={rectY}
        width={rectX - displayX}
        height={rectHeight}
        fill="black"
        opacity={0.55}
        listening={false}
      />
      <Rect
        x={rectX + rectWidth}
        y={rectY}
        width={displayX + displayWidth - (rectX + rectWidth)}
        height={rectHeight}
        fill="black"
        opacity={0.55}
        listening={false}
      />

      <Rect
        ref={rectRef}
        x={rectX}
        y={rectY}
        width={rectWidth}
        height={rectHeight}
        stroke="#ffffff"
        strokeWidth={2}
        dash={[6, 4]}
        draggable
        dragBoundFunc={(pos) => ({
          x: Math.min(Math.max(pos.x, displayX), displayX + displayWidth - rectWidth),
          y: Math.min(Math.max(pos.y, displayY), displayY + displayHeight - rectHeight),
        })}
        onDragEnd={() => rectRef.current && commit(rectRef.current)}
        onTransformEnd={() => rectRef.current && commit(rectRef.current)}
      />
      <Transformer
        ref={transformerRef}
        rotateEnabled={false}
        keepRatio={false}
        boundBoxFunc={(oldBox, newBox) => {
          if (newBox.width < MIN_CROP_SIZE * scale || newBox.height < MIN_CROP_SIZE * scale) {
            return oldBox;
          }
          if (
            newBox.x < displayX ||
            newBox.y < displayY ||
            newBox.x + newBox.width > displayX + displayWidth ||
            newBox.y + newBox.height > displayY + displayHeight
          ) {
            return oldBox;
          }
          return newBox;
        }}
      />
    </>
  );
}
