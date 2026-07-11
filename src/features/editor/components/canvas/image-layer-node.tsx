import Konva from "konva";
import { type ComponentProps, useEffect, useRef } from "react";
import { Image as KonvaImage } from "react-konva";
import useImage from "use-image";

import type { ImageLayer } from "@/features/editor/schemas/meme-canvas-state.schema";

interface ImageLayerNodeProps {
  layer: ImageLayer;
  onSelect: (event: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => void;
  onChange: (patch: Partial<ImageLayer>, options?: { commit?: boolean }) => void;
  onDragMove?: (event: Konva.KonvaEventObject<DragEvent>) => void;
  registerRef: (node: Konva.Node | null) => void;
}

function hasActiveFilters(filters: ImageLayer["filters"]) {
  return (
    filters.brightness !== 0 ||
    filters.contrast !== 0 ||
    filters.blur !== 0 ||
    filters.hueRotate !== 0 ||
    filters.saturate !== 0 ||
    filters.grayscale !== 0
  );
}

export function ImageLayerNode({
  layer,
  onSelect,
  onChange,
  onDragMove,
  registerRef,
}: ImageLayerNodeProps) {
  const [image] = useImage(layer.src, "anonymous");
  const nodeRef = useRef<Konva.Image>(null);

  const activeFilters: NonNullable<ComponentProps<typeof KonvaImage>["filters"]> = [];
  if (layer.filters.blur !== 0) activeFilters.push(Konva.Filters.Blur);
  if (layer.filters.brightness !== 0) activeFilters.push(Konva.Filters.Brighten);
  if (layer.filters.contrast !== 0) activeFilters.push(Konva.Filters.Contrast);
  if (layer.filters.hueRotate !== 0 || layer.filters.saturate !== 0)
    activeFilters.push(Konva.Filters.HSL);
  if (layer.filters.grayscale >= 50) activeFilters.push(Konva.Filters.Grayscale);

  useEffect(() => {
    const node = nodeRef.current;
    if (!node || !image) return;
    if (hasActiveFilters(layer.filters)) {
      node.cache();
    } else {
      node.clearCache();
    }
    node.getLayer()?.batchDraw();
  }, [image, layer.filters]);

  return (
    <KonvaImage
      ref={(node) => {
        nodeRef.current = node;
        registerRef(node);
      }}
      id={layer.id}
      image={image}
      x={layer.x}
      y={layer.y}
      width={layer.width}
      height={layer.height}
      rotation={layer.rotation}
      opacity={layer.opacity}
      globalCompositeOperation={layer.blendMode === "normal" ? undefined : layer.blendMode}
      visible={!layer.hidden}
      draggable={!layer.locked}
      listening={!layer.locked}
      scaleX={layer.flipX ? -1 : 1}
      scaleY={layer.flipY ? -1 : 1}
      offsetX={layer.flipX ? layer.width : 0}
      offsetY={layer.flipY ? layer.height : 0}
      crop={
        layer.crop
          ? { x: layer.crop.x, y: layer.crop.y, width: layer.crop.width, height: layer.crop.height }
          : undefined
      }
      filters={activeFilters}
      blurRadius={layer.filters.blur}
      brightness={layer.filters.brightness / 100}
      contrast={layer.filters.contrast}
      hue={layer.filters.hueRotate}
      saturation={layer.filters.saturate / 50}
      onClick={onSelect}
      onTap={onSelect}
      onDragMove={onDragMove}
      onDragEnd={(event) => {
        onChange({ x: event.target.x(), y: event.target.y() }, { commit: true });
      }}
      onTransformEnd={() => {
        const node = nodeRef.current;
        if (!node) return;
        const scaleX = Math.abs(node.scaleX());
        const scaleY = Math.abs(node.scaleY());
        onChange(
          {
            x: node.x(),
            y: node.y(),
            rotation: node.rotation(),
            width: Math.max(20, layer.width * scaleX),
            height: Math.max(20, layer.height * scaleY),
          },
          { commit: true },
        );
      }}
    />
  );
}
