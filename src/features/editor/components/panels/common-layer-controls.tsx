"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import type { BlendMode, Layer } from "@/features/editor/schemas/meme-canvas-state.schema";
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

export function LayerBlendModeControl({ layer }: { layer: Layer }) {
  const updateLayer = useEditorStore((s) => s.updateLayer);

  return (
    <div className="space-y-2">
      <Label className="text-xs">Blend mode</Label>
      <Select
        value={layer.blendMode}
        onValueChange={(value) =>
          updateLayer(layer.id, { blendMode: value as BlendMode }, { commit: true })
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
  );
}

export function CommonLayerControls({
  layer,
  hideBlendMode = false,
}: {
  layer: Layer;
  hideBlendMode?: boolean;
}) {
  const updateLayer = useEditorStore((s) => s.updateLayer);

  return (
    <>
      <div className="space-y-2">
        <Label className="text-xs">Opacity</Label>
        <Slider
          value={[layer.opacity * 100]}
          min={0}
          max={100}
          step={1}
          onValueChange={([value]) => updateLayer(layer.id, { opacity: value / 100 })}
          onValueCommit={([value]) =>
            updateLayer(layer.id, { opacity: value / 100 }, { commit: true })
          }
        />
      </div>

      {hideBlendMode ? null : <LayerBlendModeControl layer={layer} />}

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1.5">
          <Label className="text-xs">X</Label>
          <input
            type="number"
            value={Math.round(layer.x)}
            onChange={(e) => updateLayer(layer.id, { x: Number(e.target.value) }, { commit: true })}
            className="border-input bg-background h-8 w-full rounded-md border px-2 text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Y</Label>
          <input
            type="number"
            value={Math.round(layer.y)}
            onChange={(e) => updateLayer(layer.id, { y: Number(e.target.value) }, { commit: true })}
            className="border-input bg-background h-8 w-full rounded-md border px-2 text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Width</Label>
          <input
            type="number"
            value={Math.round(layer.width)}
            onChange={(e) =>
              updateLayer(layer.id, { width: Number(e.target.value) }, { commit: true })
            }
            className="border-input bg-background h-8 w-full rounded-md border px-2 text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Height</Label>
          <input
            type="number"
            value={Math.round(layer.height)}
            onChange={(e) =>
              updateLayer(layer.id, { height: Number(e.target.value) }, { commit: true })
            }
            className="border-input bg-background h-8 w-full rounded-md border px-2 text-sm"
          />
        </div>
        <div className="col-span-2 space-y-1.5">
          <Label className="text-xs">Rotation</Label>
          <Slider
            value={[layer.rotation]}
            min={-180}
            max={180}
            step={1}
            onValueChange={([value]) => updateLayer(layer.id, { rotation: value })}
            onValueCommit={([value]) =>
              updateLayer(layer.id, { rotation: value }, { commit: true })
            }
          />
        </div>
      </div>
    </>
  );
}
