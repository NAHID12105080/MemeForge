"use client";

import { Group, Ungroup } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CommonLayerControls } from "@/features/editor/components/panels/common-layer-controls";
import { ImagePropertiesPanel } from "@/features/editor/components/panels/image-properties-panel";
import { ShapePropertiesPanel } from "@/features/editor/components/panels/shape-properties-panel";
import { TextPropertiesPanel } from "@/features/editor/components/panels/text-properties-panel";
import { useEditorStore } from "@/features/editor/store/editor-store";

export function PropertiesPanel() {
  const layers = useEditorStore((s) => s.canvasState.layers);
  const selectedLayerIds = useEditorStore((s) => s.selectedLayerIds);
  const groupSelected = useEditorStore((s) => s.groupSelected);
  const ungroup = useEditorStore((s) => s.ungroup);

  if (selectedLayerIds.length === 0) {
    return (
      <div className="text-muted-foreground flex h-full items-center justify-center p-4 text-center text-sm">
        Select a layer to edit its properties
      </div>
    );
  }

  if (selectedLayerIds.length > 1) {
    return (
      <div className="p-3">
        <Button variant="outline" size="sm" className="w-full" onClick={groupSelected}>
          <Group className="size-3.5" />
          Group {selectedLayerIds.length} layers
        </Button>
      </div>
    );
  }

  const selectedLayer = layers.find((layer) => layer.id === selectedLayerIds[0]);
  if (!selectedLayer) return null;

  switch (selectedLayer.type) {
    case "text":
      return <TextPropertiesPanel layer={selectedLayer} />;
    case "image":
      return <ImagePropertiesPanel layer={selectedLayer} />;
    case "shape":
      return <ShapePropertiesPanel layer={selectedLayer} />;
    case "sticker":
      return (
        <div className="space-y-5 p-3">
          <CommonLayerControls layer={selectedLayer} />
        </div>
      );
    case "group":
      return (
        <div className="p-3">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => ungroup(selectedLayer.id)}
          >
            <Ungroup className="size-3.5" />
            Ungroup
          </Button>
        </div>
      );
    default:
      return null;
  }
}
