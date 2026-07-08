import type Konva from "konva";

import { ImageLayerNode } from "@/features/editor/components/canvas/image-layer-node";
import { ShapeLayerNode } from "@/features/editor/components/canvas/shape-layer-node";
import { StickerLayerNode } from "@/features/editor/components/canvas/sticker-layer-node";
import { TextLayerNode } from "@/features/editor/components/canvas/text-layer-node";
import type { Layer } from "@/features/editor/schemas/meme-canvas-state.schema";

interface LayerRendererProps {
  layer: Layer;
  onSelect: (event: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => void;
  onChange: (patch: Partial<Layer>, options?: { commit?: boolean }) => void;
  onDragMove?: (event: Konva.KonvaEventObject<DragEvent>) => void;
  registerRef: (id: string, node: Konva.Node | null) => void;
}

export function LayerRenderer({
  layer,
  onSelect,
  onChange,
  onDragMove,
  registerRef,
}: LayerRendererProps) {
  const registerNodeRef = (node: Konva.Node | null) => registerRef(layer.id, node);

  switch (layer.type) {
    case "text":
      return (
        <TextLayerNode
          layer={layer}
          onSelect={onSelect}
          onChange={onChange}
          onDragMove={onDragMove}
          registerRef={registerNodeRef}
        />
      );
    case "image":
      return (
        <ImageLayerNode
          layer={layer}
          onSelect={onSelect}
          onChange={onChange}
          onDragMove={onDragMove}
          registerRef={registerNodeRef}
        />
      );
    case "shape":
      return (
        <ShapeLayerNode
          layer={layer}
          onSelect={onSelect}
          onChange={onChange}
          onDragMove={onDragMove}
          registerRef={registerNodeRef}
        />
      );
    case "sticker":
      return (
        <StickerLayerNode
          layer={layer}
          onSelect={onSelect}
          onChange={onChange}
          onDragMove={onDragMove}
          registerRef={registerNodeRef}
        />
      );
    case "group":
      return null;
    default:
      return null;
  }
}
