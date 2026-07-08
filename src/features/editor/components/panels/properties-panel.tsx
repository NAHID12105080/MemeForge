"use client";

import { Group, Ungroup } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import type { BlendMode } from "@/features/editor/schemas/meme-canvas-state.schema";
import { useEditorStore } from "@/features/editor/store/editor-store";

const BLEND_MODES: BlendMode[] = [
  "normal",
  "multiply",
  "screen",
  "overlay",
  "darken",
  "lighten",
  "color-dodge",
  "color-burn",
  "difference",
  "exclusion",
  "hue",
  "saturation",
  "color",
  "luminosity",
];

export function PropertiesPanel() {
  const layers = useEditorStore((s) => s.canvasState.layers);
  const selectedLayerIds = useEditorStore((s) => s.selectedLayerIds);
  const updateLayer = useEditorStore((s) => s.updateLayer);
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

  if (selectedLayer.type === "group") {
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
  }

  return (
    <div className="space-y-5 p-3">
      <div className="space-y-2">
        <Label className="text-xs">Opacity</Label>
        <Slider
          value={[selectedLayer.opacity * 100]}
          min={0}
          max={100}
          step={1}
          onValueChange={([value]) => updateLayer(selectedLayer.id, { opacity: value / 100 })}
          onValueCommit={([value]) =>
            updateLayer(selectedLayer.id, { opacity: value / 100 }, { commit: true })
          }
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Blend mode</Label>
        <Select
          value={selectedLayer.blendMode}
          onValueChange={(value) =>
            updateLayer(selectedLayer.id, { blendMode: value as BlendMode }, { commit: true })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {BLEND_MODES.map((mode) => (
              <SelectItem key={mode} value={mode}>
                {mode}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1.5">
          <Label className="text-xs">X</Label>
          <input
            type="number"
            value={Math.round(selectedLayer.x)}
            onChange={(e) =>
              updateLayer(selectedLayer.id, { x: Number(e.target.value) }, { commit: true })
            }
            className="border-input bg-background h-8 w-full rounded-md border px-2 text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Y</Label>
          <input
            type="number"
            value={Math.round(selectedLayer.y)}
            onChange={(e) =>
              updateLayer(selectedLayer.id, { y: Number(e.target.value) }, { commit: true })
            }
            className="border-input bg-background h-8 w-full rounded-md border px-2 text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Width</Label>
          <input
            type="number"
            value={Math.round(selectedLayer.width)}
            onChange={(e) =>
              updateLayer(selectedLayer.id, { width: Number(e.target.value) }, { commit: true })
            }
            className="border-input bg-background h-8 w-full rounded-md border px-2 text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Height</Label>
          <input
            type="number"
            value={Math.round(selectedLayer.height)}
            onChange={(e) =>
              updateLayer(selectedLayer.id, { height: Number(e.target.value) }, { commit: true })
            }
            className="border-input bg-background h-8 w-full rounded-md border px-2 text-sm"
          />
        </div>
        <div className="col-span-2 space-y-1.5">
          <Label className="text-xs">Rotation</Label>
          <Slider
            value={[selectedLayer.rotation]}
            min={-180}
            max={180}
            step={1}
            onValueChange={([value]) => updateLayer(selectedLayer.id, { rotation: value })}
            onValueCommit={([value]) =>
              updateLayer(selectedLayer.id, { rotation: value }, { commit: true })
            }
          />
        </div>
      </div>
    </div>
  );
}
