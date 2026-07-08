import Konva from "konva";
import { useRef } from "react";
import { Image as KonvaImage, Text } from "react-konva";
import useImage from "use-image";

import type { StickerLayer } from "@/features/editor/schemas/meme-canvas-state.schema";

interface StickerLayerNodeProps {
  layer: StickerLayer;
  onSelect: (event: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => void;
  onChange: (patch: Partial<StickerLayer>, options?: { commit?: boolean }) => void;
  onDragMove?: (event: Konva.KonvaEventObject<DragEvent>) => void;
  registerRef: (node: Konva.Node | null) => void;
}

export function StickerLayerNode({
  layer,
  onSelect,
  onChange,
  onDragMove,
  registerRef,
}: StickerLayerNodeProps) {
  const nodeRef = useRef<Konva.Node>(null);
  const [image] = useImage(
    layer.assetKind === "sticker" ? (layer.assetUrl ?? "") : "",
    "anonymous",
  );

  const common = {
    id: layer.id,
    x: layer.x,
    y: layer.y,
    rotation: layer.rotation,
    opacity: layer.opacity,
    visible: !layer.hidden,
    draggable: !layer.locked,
    listening: !layer.locked,
    onClick: onSelect,
    onTap: onSelect,
    onDragMove,
    onDragEnd: (event: Konva.KonvaEventObject<DragEvent>) => {
      onChange({ x: event.target.x(), y: event.target.y() }, { commit: true });
    },
    onTransformEnd: () => {
      const node = nodeRef.current;
      if (!node) return;
      const scaleX = node.scaleX();
      const scaleY = node.scaleY();
      node.scaleX(1);
      node.scaleY(1);
      onChange(
        {
          x: node.x(),
          y: node.y(),
          rotation: node.rotation(),
          width: Math.max(16, layer.width * scaleX),
          height: Math.max(16, layer.height * scaleY),
        },
        { commit: true },
      );
    },
  };

  if (layer.assetKind === "emoji" && layer.unicodeChar) {
    return (
      <Text
        ref={(node) => {
          nodeRef.current = node;
          registerRef(node);
        }}
        {...common}
        text={layer.unicodeChar}
        fontSize={layer.height}
        width={layer.width}
        height={layer.height}
        align="center"
        verticalAlign="middle"
      />
    );
  }

  return (
    <KonvaImage
      ref={(node) => {
        nodeRef.current = node;
        registerRef(node);
      }}
      {...common}
      image={image}
      width={layer.width}
      height={layer.height}
    />
  );
}
