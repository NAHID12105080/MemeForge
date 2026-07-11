"use client";

import { ColorPickerPopover } from "@/components/composed/color-picker-popover";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { CommonLayerControls } from "@/features/editor/components/panels/common-layer-controls";
import type { ShapeLayer } from "@/features/editor/schemas/meme-canvas-state.schema";
import { useEditorStore } from "@/features/editor/store/editor-store";

export function ShapePropertiesPanel({ layer }: { layer: ShapeLayer }) {
  const updateLayer = useEditorStore((s) => s.updateLayer);

  return (
    <div className="space-y-5 p-3">
      <div className="space-y-2">
        <Label className="text-xs">Fill</Label>
        <ColorPickerPopover
          value={layer.fill}
          onChange={(fill) => updateLayer(layer.id, { fill }, { commit: true })}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Stroke</Label>
        <ColorPickerPopover
          value={layer.stroke ?? "#000000"}
          onChange={(stroke) => updateLayer(layer.id, { stroke }, { commit: true })}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-muted-foreground text-xs">Stroke width</Label>
        <Slider
          value={[layer.strokeWidth]}
          min={0}
          max={20}
          step={1}
          onValueChange={([value]) => updateLayer(layer.id, { strokeWidth: value })}
          onValueCommit={([value]) =>
            updateLayer(layer.id, { strokeWidth: value }, { commit: true })
          }
        />
      </div>

      {layer.shapeType === "rect" ? (
        <div className="space-y-2">
          <Label className="text-muted-foreground text-xs">Corner radius</Label>
          <Slider
            value={[layer.cornerRadius]}
            min={0}
            max={100}
            step={1}
            onValueChange={([value]) => updateLayer(layer.id, { cornerRadius: value })}
            onValueCommit={([value]) =>
              updateLayer(layer.id, { cornerRadius: value }, { commit: true })
            }
          />
        </div>
      ) : null}

      <Separator />
      <CommonLayerControls layer={layer} />
    </div>
  );
}
