"use client";

import Konva from "konva";
import { useEffect, useRef, useState } from "react";
import { Layer as KonvaLayer, Rect, Stage, Transformer } from "react-konva";

import { LayerRenderer } from "@/features/editor/components/canvas/layer-renderer";
import { type GuideLine, SnapGuides } from "@/features/editor/components/canvas/snap-guides";
import type { Layer } from "@/features/editor/schemas/meme-canvas-state.schema";
import { useEditorStore } from "@/features/editor/store/editor-store";

const SNAP_THRESHOLD = 6;

export function EditorCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const nodeRefs = useRef(new Map<string, Konva.Node>());
  const [containerSize, setContainerSize] = useState({ width: 800, height: 600 });
  const [guides, setGuides] = useState<GuideLine[]>([]);

  const canvasState = useEditorStore((s) => s.canvasState);
  const selectedLayerIds = useEditorStore((s) => s.selectedLayerIds);
  const setSelection = useEditorStore((s) => s.setSelection);
  const updateLayer = useEditorStore((s) => s.updateLayer);
  const viewport = useEditorStore((s) => s.viewport);
  const setViewport = useEditorStore((s) => s.setViewport);
  const tool = useEditorStore((s) => s.tool);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setContainerSize({ width: entry.contentRect.width, height: entry.contentRect.height });
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const transformer = transformerRef.current;
    if (!transformer) return;

    const expandedIds = selectedLayerIds.flatMap((id) => {
      const layer = canvasState.layers.find((l) => l.id === id);
      return layer?.type === "group" ? layer.childIds : [id];
    });

    const nodes = expandedIds
      .map((id) => nodeRefs.current.get(id))
      .filter((node): node is Konva.Node => !!node);
    transformer.nodes(nodes);
    transformer.getLayer()?.batchDraw();
  }, [selectedLayerIds, canvasState.layers]);

  const { width: canvasWidth, height: canvasHeight } = canvasState.canvas;
  const fitScale = Math.min(
    (containerSize.width - 64) / canvasWidth,
    (containerSize.height - 64) / canvasHeight,
    1,
  );
  const scale = fitScale * viewport.zoom;

  function registerRef(id: string, node: Konva.Node | null) {
    if (node) nodeRefs.current.set(id, node);
    else nodeRefs.current.delete(id);
  }

  function handleSelect(layerId: string, event: Konva.KonvaEventObject<MouseEvent | TouchEvent>) {
    const layer = canvasState.layers.find((l) => l.id === layerId);
    const id = layer?.parentGroupId ?? layerId;
    const isMultiSelect = event.evt && "shiftKey" in event.evt && event.evt.shiftKey;
    if (isMultiSelect) {
      const current = useEditorStore.getState().selectedLayerIds;
      setSelection(
        current.includes(id) ? current.filter((selectedId) => selectedId !== id) : [...current, id],
      );
    } else {
      setSelection([id]);
    }
  }

  function handleStageMouseDown(event: Konva.KonvaEventObject<MouseEvent>) {
    if (event.target === event.target.getStage()) {
      setSelection([]);
    }
  }

  function handleDragMove(layerId: string, event: Konva.KonvaEventObject<DragEvent>) {
    const node = event.target;
    const nodeGuides: GuideLine[] = [];

    const box = { x: node.x(), y: node.y(), width: node.width(), height: node.height() };
    const centerX = box.x + box.width / 2;
    const centerY = box.y + box.height / 2;

    const canvasCenterX = canvasWidth / 2;
    const canvasCenterY = canvasHeight / 2;

    if (Math.abs(centerX - canvasCenterX) < SNAP_THRESHOLD) {
      node.x(canvasCenterX - box.width / 2);
      nodeGuides.push({ orientation: "vertical", position: canvasCenterX });
    }
    if (Math.abs(centerY - canvasCenterY) < SNAP_THRESHOLD) {
      node.y(canvasCenterY - box.height / 2);
      nodeGuides.push({ orientation: "horizontal", position: canvasCenterY });
    }

    for (const other of canvasState.layers) {
      if (other.id === layerId) continue;
      const otherCenterX = other.x + other.width / 2;
      const otherCenterY = other.y + other.height / 2;
      if (Math.abs(centerX - otherCenterX) < SNAP_THRESHOLD) {
        node.x(otherCenterX - box.width / 2);
        nodeGuides.push({ orientation: "vertical", position: otherCenterX });
      }
      if (Math.abs(centerY - otherCenterY) < SNAP_THRESHOLD) {
        node.y(otherCenterY - box.height / 2);
        nodeGuides.push({ orientation: "horizontal", position: otherCenterY });
      }
    }

    setGuides(nodeGuides);
  }

  function handleWheel(event: Konva.KonvaEventObject<WheelEvent>) {
    event.evt.preventDefault();
    const delta = -event.evt.deltaY;
    const nextZoom = Math.min(4, Math.max(0.25, viewport.zoom * (delta > 0 ? 1.05 : 0.95)));
    setViewport({ zoom: nextZoom });
  }

  const sortedLayers = [...canvasState.layers].sort((a, b) => a.zIndex - b.zIndex);

  return (
    <div ref={containerRef} className="bg-muted/40 relative h-full w-full overflow-hidden">
      <Stage
        ref={stageRef}
        width={containerSize.width}
        height={containerSize.height}
        scaleX={scale}
        scaleY={scale}
        x={containerSize.width / 2 - (canvasWidth * scale) / 2 + viewport.panX}
        y={containerSize.height / 2 - (canvasHeight * scale) / 2 + viewport.panY}
        draggable={tool === "pan"}
        onWheel={handleWheel}
        onMouseDown={handleStageMouseDown}
        onDragEnd={(event) => {
          if (event.target === stageRef.current) {
            setViewport({
              panX: event.target.x() - (containerSize.width / 2 - (canvasWidth * scale) / 2),
              panY: event.target.y() - (containerSize.height / 2 - (canvasHeight * scale) / 2),
            });
          }
        }}
      >
        <KonvaLayer>
          <Rect
            x={0}
            y={0}
            width={canvasWidth}
            height={canvasHeight}
            fill={canvasState.canvas.backgroundColor}
            listening={false}
            shadowColor="black"
            shadowBlur={24}
            shadowOpacity={0.25}
          />
          {sortedLayers.map((layer) => (
            <LayerRenderer
              key={layer.id}
              layer={layer}
              onSelect={(event) => handleSelect(layer.id, event)}
              onChange={(patch, options) => {
                updateLayer(layer.id, patch as Partial<Layer>, options);
                setGuides([]);
              }}
              onDragMove={(event) => handleDragMove(layer.id, event)}
              registerRef={registerRef}
            />
          ))}
          <SnapGuides guides={guides} canvasWidth={canvasWidth} canvasHeight={canvasHeight} />
          <Transformer
            ref={transformerRef}
            rotateEnabled
            flipEnabled={false}
            boundBoxFunc={(oldBox, newBox) =>
              newBox.width < 10 || newBox.height < 10 ? oldBox : newBox
            }
          />
        </KonvaLayer>
      </Stage>
    </div>
  );
}
