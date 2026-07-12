"use client";

import { Bold, Italic, Underline } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ColorPickerPopover } from "@/components/composed/color-picker-popover";
import { FontPicker } from "@/components/composed/font-picker";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  CommonLayerControls,
  LayerBlendModeControl,
} from "@/features/editor/components/panels/common-layer-controls";
import { loadGoogleFont } from "@/features/editor/lib/fonts/google-fonts-loader";
import type { TextLayer } from "@/features/editor/schemas/meme-canvas-state.schema";
import { useEditorStore } from "@/features/editor/store/editor-store";

export function TextPropertiesPanel({ layer }: { layer: TextLayer }) {
  const updateLayer = useEditorStore((s) => s.updateLayer);

  return (
    <div className="space-y-5 p-3">
      <div className="space-y-2">
        <Label className="text-xs">Text</Label>
        <textarea
          value={layer.text}
          onChange={(e) => updateLayer(layer.id, { text: e.target.value }, { commit: true })}
          rows={2}
          className="border-input bg-background w-full resize-none rounded-md border px-2 py-1.5 text-sm"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Font</Label>
        <FontPicker
          value={layer.fontFamily}
          onChange={(family) => {
            loadGoogleFont(family);
            updateLayer(layer.id, { fontFamily: family }, { commit: true });
          }}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1.5">
          <Label className="text-xs">Size</Label>
          <input
            type="number"
            value={layer.fontSize}
            onChange={(e) =>
              updateLayer(layer.id, { fontSize: Number(e.target.value) }, { commit: true })
            }
            className="border-input bg-background h-8 w-full rounded-md border px-2 text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Weight</Label>
          <Select
            value={String(layer.fontWeight)}
            onValueChange={(value) =>
              updateLayer(layer.id, { fontWeight: Number(value) }, { commit: true })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="400">Regular</SelectItem>
              <SelectItem value="500">Medium</SelectItem>
              <SelectItem value="600">Semibold</SelectItem>
              <SelectItem value="700">Bold</SelectItem>
              <SelectItem value="900">Black</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Style</Label>
        <ToggleGroup
          type="multiple"
          value={[
            ...(layer.fontWeight >= 700 ? ["bold"] : []),
            ...(layer.fontStyle === "italic" ? ["italic"] : []),
            ...(layer.underline ? ["underline"] : []),
          ]}
          onValueChange={(value) =>
            updateLayer(
              layer.id,
              {
                fontWeight: value.includes("bold") ? 700 : 400,
                fontStyle: value.includes("italic") ? "italic" : "normal",
                underline: value.includes("underline"),
              },
              { commit: true },
            )
          }
          className="w-full"
        >
          <ToggleGroupItem value="bold" className="flex-1" aria-label="Bold">
            <Bold className="size-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="italic" className="flex-1" aria-label="Italic">
            <Italic className="size-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="underline" className="flex-1" aria-label="Underline">
            <Underline className="size-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Alignment</Label>
        <ToggleGroup
          type="single"
          value={layer.textAlign}
          onValueChange={(value) =>
            value &&
            updateLayer(layer.id, { textAlign: value as TextLayer["textAlign"] }, { commit: true })
          }
          className="w-full"
        >
          <ToggleGroupItem value="left" className="flex-1">
            Left
          </ToggleGroupItem>
          <ToggleGroupItem value="center" className="flex-1">
            Center
          </ToggleGroupItem>
          <ToggleGroupItem value="right" className="flex-1">
            Right
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Color</Label>
        <ColorPickerPopover
          value={layer.color}
          onChange={(color) => updateLayer(layer.id, { color }, { commit: true })}
        />
      </div>

      <Separator />

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs">Outline</Label>
          <Switch
            checked={layer.stroke?.enabled ?? false}
            onCheckedChange={(checked) =>
              updateLayer(
                layer.id,
                {
                  stroke: {
                    enabled: checked,
                    color: layer.stroke?.color ?? "#000000",
                    width: layer.stroke?.width ?? 6,
                  },
                },
                { commit: true },
              )
            }
          />
        </div>
        {layer.stroke?.enabled ? (
          <div className="grid grid-cols-2 gap-2">
            <ColorPickerPopover
              value={layer.stroke.color}
              onChange={(color) =>
                updateLayer(layer.id, { stroke: { ...layer.stroke!, color } }, { commit: true })
              }
            />
            <input
              type="number"
              value={layer.stroke.width}
              onChange={(e) =>
                updateLayer(
                  layer.id,
                  { stroke: { ...layer.stroke!, width: Number(e.target.value) } },
                  { commit: true },
                )
              }
              className="border-input bg-background h-8 w-full rounded-md border px-2 text-sm"
            />
          </div>
        ) : null}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs">Shadow</Label>
          <Switch
            checked={layer.shadow?.enabled ?? false}
            onCheckedChange={(checked) =>
              updateLayer(
                layer.id,
                {
                  shadow: {
                    enabled: checked,
                    color: layer.shadow?.color ?? "#000000",
                    blur: layer.shadow?.blur ?? 8,
                    offsetX: layer.shadow?.offsetX ?? 4,
                    offsetY: layer.shadow?.offsetY ?? 4,
                  },
                  glow: {
                    ...(layer.glow ?? { color: "#000000", blur: 0, intensity: 1 }),
                    enabled: false,
                  },
                },
                { commit: true },
              )
            }
          />
        </div>
        {layer.shadow?.enabled ? (
          <div className="space-y-2">
            <ColorPickerPopover
              value={layer.shadow.color}
              onChange={(color) =>
                updateLayer(layer.id, { shadow: { ...layer.shadow!, color } }, { commit: true })
              }
            />
            <Label className="text-muted-foreground text-xs">Blur</Label>
            <Slider
              value={[layer.shadow.blur]}
              min={0}
              max={40}
              step={1}
              onValueCommit={([value]) =>
                updateLayer(
                  layer.id,
                  { shadow: { ...layer.shadow!, blur: value } },
                  { commit: true },
                )
              }
            />
          </div>
        ) : null}
      </div>

      <Accordion type="single" collapsible>
        <AccordionItem value="more-options">
          <AccordionTrigger className="text-xs">More options</AccordionTrigger>
          <AccordionContent className="space-y-5">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Glow</Label>
                <Switch
                  checked={layer.glow?.enabled ?? false}
                  onCheckedChange={(checked) =>
                    updateLayer(
                      layer.id,
                      {
                        glow: {
                          enabled: checked,
                          color: layer.glow?.color ?? "#8b5cf6",
                          blur: layer.glow?.blur ?? 16,
                          intensity: layer.glow?.intensity ?? 1,
                        },
                        shadow: {
                          ...(layer.shadow ?? {
                            color: "#000000",
                            blur: 0,
                            offsetX: 0,
                            offsetY: 0,
                          }),
                          enabled: false,
                        },
                      },
                      { commit: true },
                    )
                  }
                />
              </div>
              {layer.glow?.enabled ? (
                <div className="space-y-2">
                  <ColorPickerPopover
                    value={layer.glow.color}
                    onChange={(color) =>
                      updateLayer(layer.id, { glow: { ...layer.glow!, color } }, { commit: true })
                    }
                  />
                  <Label className="text-muted-foreground text-xs">Intensity</Label>
                  <Slider
                    value={[layer.glow.blur]}
                    min={0}
                    max={60}
                    step={1}
                    onValueCommit={([value]) =>
                      updateLayer(
                        layer.id,
                        { glow: { ...layer.glow!, blur: value } },
                        { commit: true },
                      )
                    }
                  />
                </div>
              ) : null}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Gradient fill</Label>
                <Switch
                  checked={layer.gradientFill?.enabled ?? false}
                  onCheckedChange={(checked) =>
                    updateLayer(
                      layer.id,
                      {
                        gradientFill: {
                          enabled: checked,
                          angle: layer.gradientFill?.angle ?? 0,
                          stops: layer.gradientFill?.stops ?? [
                            { offset: 0, color: "#8b5cf6" },
                            { offset: 1, color: "#ec4899" },
                          ],
                        },
                      },
                      { commit: true },
                    )
                  }
                />
              </div>
              {layer.gradientFill?.enabled ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <ColorPickerPopover
                      value={layer.gradientFill.stops[0]?.color ?? "#8b5cf6"}
                      onChange={(color) =>
                        updateLayer(
                          layer.id,
                          {
                            gradientFill: {
                              ...layer.gradientFill!,
                              stops: [{ offset: 0, color }, layer.gradientFill!.stops[1]],
                            },
                          },
                          { commit: true },
                        )
                      }
                    />
                    <ColorPickerPopover
                      value={layer.gradientFill.stops[1]?.color ?? "#ec4899"}
                      onChange={(color) =>
                        updateLayer(
                          layer.id,
                          {
                            gradientFill: {
                              ...layer.gradientFill!,
                              stops: [layer.gradientFill!.stops[0], { offset: 1, color }],
                            },
                          },
                          { commit: true },
                        )
                      }
                    />
                  </div>
                  <Label className="text-muted-foreground text-xs">Angle</Label>
                  <Slider
                    value={[layer.gradientFill.angle]}
                    min={0}
                    max={360}
                    step={1}
                    onValueCommit={([value]) =>
                      updateLayer(
                        layer.id,
                        { gradientFill: { ...layer.gradientFill!, angle: value } },
                        { commit: true },
                      )
                    }
                  />
                </div>
              ) : null}
            </div>

            <LayerBlendModeControl layer={layer} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Separator />
      <CommonLayerControls layer={layer} hideBlendMode />
    </div>
  );
}
