import Konva from "konva";
import { useRef } from "react";
import { Arrow, Ellipse, Line, Rect, RegularPolygon, Star } from "react-konva";

import type { ShapeLayer } from "@/features/editor/schemas/meme-canvas-state.schema";

interface ShapeLayerNodeProps {
  layer: ShapeLayer;
  onSelect: (event: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => void;
  onChange: (patch: Partial<ShapeLayer>, options?: { commit?: boolean }) => void;
  onDragMove?: (event: Konva.KonvaEventObject<DragEvent>) => void;
  registerRef: (node: Konva.Node | null) => void;
}

export function ShapeLayerNode({
  layer,
  onSelect,
  onChange,
  onDragMove,
  registerRef,
}: ShapeLayerNodeProps) {
  const nodeRef = useRef<Konva.Shape>(null);

  const common = {
    id: layer.id,
    x: layer.x,
    y: layer.y,
    rotation: layer.rotation,
    opacity: layer.opacity,
    globalCompositeOperation: layer.blendMode === "normal" ? undefined : layer.blendMode,
    visible: !layer.hidden,
    draggable: !layer.locked,
    listening: !layer.locked,
    fill: layer.fill,
    stroke: layer.stroke ?? undefined,
    strokeWidth: layer.strokeWidth,
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
          width: Math.max(10, layer.width * scaleX),
          height: Math.max(10, layer.height * scaleY),
        },
        { commit: true },
      );
    },
  };

  const setRef = (node: Konva.Shape | null) => {
    nodeRef.current = node;
    registerRef(node);
  };

  switch (layer.shapeType) {
    case "rect":
      return (
        <Rect
          ref={setRef}
          {...common}
          width={layer.width}
          height={layer.height}
          cornerRadius={layer.cornerRadius}
        />
      );
    case "ellipse":
      return (
        <Ellipse
          ref={setRef}
          {...common}
          radiusX={layer.width / 2}
          radiusY={layer.height / 2}
          offsetX={-layer.width / 2}
          offsetY={-layer.height / 2}
        />
      );
    case "line":
      return (
        <Line
          ref={setRef}
          {...common}
          points={[0, layer.height / 2, layer.width, layer.height / 2]}
          stroke={layer.stroke ?? layer.fill}
          strokeWidth={layer.strokeWidth || 4}
        />
      );
    case "arrow":
      return (
        <Arrow
          ref={setRef}
          {...common}
          points={[0, layer.height / 2, layer.width, layer.height / 2]}
          stroke={layer.stroke ?? layer.fill}
          strokeWidth={layer.strokeWidth || 4}
          fill={layer.fill}
          pointerLength={16}
          pointerWidth={16}
        />
      );
    case "polygon":
      return (
        <RegularPolygon
          ref={setRef}
          {...common}
          sides={layer.sides ?? 6}
          radius={Math.min(layer.width, layer.height) / 2}
          offsetX={-layer.width / 2}
          offsetY={-layer.height / 2}
        />
      );
    case "star":
      return (
        <Star
          ref={setRef}
          {...common}
          numPoints={layer.sides ?? 5}
          innerRadius={Math.min(layer.width, layer.height) / 4}
          outerRadius={Math.min(layer.width, layer.height) / 2}
          offsetX={-layer.width / 2}
          offsetY={-layer.height / 2}
        />
      );
    default:
      return null;
  }
}
