"use client";

import { Check, Crop, FlipHorizontal2, FlipVertical2, RotateCcw, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { CommonLayerControls } from "@/features/editor/components/panels/common-layer-controls";
import type { ImageLayer } from "@/features/editor/schemas/meme-canvas-state.schema";
import { useEditorStore } from "@/features/editor/store/editor-store";

const DEFAULT_FILTERS: ImageLayer["filters"] = {
  brightness: 0,
  contrast: 0,
  blur: 0,
  hueRotate: 0,
  saturate: 0,
  grayscale: 0,
};

export function ImagePropertiesPanel({ layer }: { layer: ImageLayer }) {
  const updateLayer = useEditorStore((s) => s.updateLayer);
  const cropModeLayerId = useEditorStore((s) => s.cropModeLayerId);
  const enterCropMode = useEditorStore((s) => s.enterCropMode);
  const applyCrop = useEditorStore((s) => s.applyCrop);
  const cancelCrop = useEditorStore((s) => s.cancelCrop);
  const isCropping = cropModeLayerId === layer.id;

  function setFilter(key: keyof ImageLayer["filters"], value: number) {
    updateLayer(layer.id, { filters: { ...layer.filters, [key]: value } });
  }

  function commitFilter(key: keyof ImageLayer["filters"], value: number) {
    updateLayer(layer.id, { filters: { ...layer.filters, [key]: value } }, { commit: true });
  }

  if (isCropping) {
    return (
      <div className="space-y-3 p-3">
        <p className="text-muted-foreground text-xs">
          Drag the handles on the canvas to select the crop area.
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={cancelCrop}>
            <X className="size-3.5" />
            Cancel
          </Button>
          <Button size="sm" className="flex-1" onClick={applyCrop}>
            <Check className="size-3.5" />
            Apply
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 p-3">
      <Button variant="outline" size="sm" className="w-full" onClick={() => enterCropMode(layer.id)}>
        <Crop className="size-3.5" />
        Crop
      </Button>

      <div className="flex gap-2">
        <Button
          variant={layer.flipX ? "default" : "outline"}
          size="sm"
          className="flex-1"
          onClick={() => updateLayer(layer.id, { flipX: !layer.flipX }, { commit: true })}
        >
          <FlipHorizontal2 className="size-3.5" />
          Flip X
        </Button>
        <Button
          variant={layer.flipY ? "default" : "outline"}
          size="sm"
          className="flex-1"
          onClick={() => updateLayer(layer.id, { flipY: !layer.flipY }, { commit: true })}
        >
          <FlipVertical2 className="size-3.5" />
          Flip Y
        </Button>
      </div>

      <Separator />

      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium">Filters</Label>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs"
          onClick={() => updateLayer(layer.id, { filters: DEFAULT_FILTERS }, { commit: true })}
        >
          <RotateCcw className="size-3" />
          Reset
        </Button>
      </div>

      <div className="space-y-2">
        <Label className="text-muted-foreground text-xs">Brightness</Label>
        <Slider
          value={[layer.filters.brightness]}
          min={-100}
          max={100}
          step={1}
          onValueChange={([v]) => setFilter("brightness", v)}
          onValueCommit={([v]) => commitFilter("brightness", v)}
        />
      </div>
      <div className="space-y-2">
        <Label className="text-muted-foreground text-xs">Contrast</Label>
        <Slider
          value={[layer.filters.contrast]}
          min={-100}
          max={100}
          step={1}
          onValueChange={([v]) => setFilter("contrast", v)}
          onValueCommit={([v]) => commitFilter("contrast", v)}
        />
      </div>
      <div className="space-y-2">
        <Label className="text-muted-foreground text-xs">Blur</Label>
        <Slider
          value={[layer.filters.blur]}
          min={0}
          max={40}
          step={1}
          onValueChange={([v]) => setFilter("blur", v)}
          onValueCommit={([v]) => commitFilter("blur", v)}
        />
      </div>
      <div className="space-y-2">
        <Label className="text-muted-foreground text-xs">Hue</Label>
        <Slider
          value={[layer.filters.hueRotate]}
          min={0}
          max={360}
          step={1}
          onValueChange={([v]) => setFilter("hueRotate", v)}
          onValueCommit={([v]) => commitFilter("hueRotate", v)}
        />
      </div>
      <div className="space-y-2">
        <Label className="text-muted-foreground text-xs">Saturation</Label>
        <Slider
          value={[layer.filters.saturate]}
          min={-100}
          max={100}
          step={1}
          onValueChange={([v]) => setFilter("saturate", v)}
          onValueCommit={([v]) => commitFilter("saturate", v)}
        />
      </div>
      <div className="flex items-center justify-between">
        <Label className="text-muted-foreground text-xs">Grayscale</Label>
        <Switch
          checked={layer.filters.grayscale >= 50}
          onCheckedChange={(checked) => commitFilter("grayscale", checked ? 100 : 0)}
        />
      </div>

      <Separator />
      <CommonLayerControls layer={layer} />
    </div>
  );
}
