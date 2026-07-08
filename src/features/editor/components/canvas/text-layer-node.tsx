import Konva from "konva";
import { useRef } from "react";
import { Text } from "react-konva";

import type { TextLayer } from "@/features/editor/schemas/meme-canvas-state.schema";

interface TextLayerNodeProps {
  layer: TextLayer;
  onSelect: (event: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => void;
  onChange: (patch: Partial<TextLayer>, options?: { commit?: boolean }) => void;
  onDragMove?: (event: Konva.KonvaEventObject<DragEvent>) => void;
  registerRef: (node: Konva.Node | null) => void;
}

function gradientPoints(width: number, height: number, angleDeg: number) {
  const angle = (angleDeg * Math.PI) / 180;
  const cx = width / 2;
  const cy = height / 2;
  const dx = Math.cos(angle) * cx;
  const dy = Math.sin(angle) * cy;
  return {
    start: { x: cx - dx, y: cy - dy },
    end: { x: cx + dx, y: cy + dy },
  };
}

export function TextLayerNode({
  layer,
  onSelect,
  onChange,
  onDragMove,
  registerRef,
}: TextLayerNodeProps) {
  const nodeRef = useRef<Konva.Text>(null);

  const glow = layer.glow?.enabled ? layer.glow : null;
  const shadow = !glow && layer.shadow?.enabled ? layer.shadow : null;
  const gradient = layer.gradientFill?.enabled ? layer.gradientFill : null;
  const gradientPts = gradient ? gradientPoints(layer.width, layer.height, gradient.angle) : null;

  return (
    <Text
      ref={(node) => {
        nodeRef.current = node;
        registerRef(node);
      }}
      id={layer.id}
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
      text={layer.text}
      fontFamily={layer.fontFamily}
      fontSize={layer.fontSize}
      fontStyle={`${layer.fontWeight >= 700 ? "bold" : "normal"} ${layer.fontStyle}`.trim()}
      align={layer.textAlign}
      letterSpacing={layer.letterSpacing}
      lineHeight={layer.lineHeight}
      fill={gradient ? undefined : layer.color}
      fillLinearGradientStartPoint={gradientPts?.start}
      fillLinearGradientEndPoint={gradientPts?.end}
      fillLinearGradientColorStops={
        gradient ? gradient.stops.flatMap((stop) => [stop.offset, stop.color]) : undefined
      }
      stroke={layer.stroke?.enabled ? layer.stroke.color : undefined}
      strokeWidth={layer.stroke?.enabled ? layer.stroke.width : undefined}
      shadowColor={glow?.color ?? shadow?.color}
      shadowBlur={glow?.blur ?? shadow?.blur}
      shadowOffsetX={glow ? 0 : (shadow?.offsetX ?? 0)}
      shadowOffsetY={glow ? 0 : (shadow?.offsetY ?? 0)}
      shadowOpacity={glow ? (glow.intensity ?? 1) : shadow ? 1 : 0}
      onClick={onSelect}
      onTap={onSelect}
      onDragMove={onDragMove}
      onDragEnd={(event) => {
        onChange({ x: event.target.x(), y: event.target.y() }, { commit: true });
      }}
      onTransformEnd={() => {
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
            width: Math.max(20, layer.width * scaleX),
            height: Math.max(20, layer.height * scaleY),
          },
          { commit: true },
        );
      }}
    />
  );
}
