import Konva from "konva";
import { useRef } from "react";
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

export function ImageLayerNode({
  layer,
  onSelect,
  onChange,
  onDragMove,
  registerRef,
}: ImageLayerNodeProps) {
  const [image] = useImage(layer.src, "anonymous");
  const nodeRef = useRef<Konva.Image>(null);

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
