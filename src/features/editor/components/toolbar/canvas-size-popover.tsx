"use client";

import { Proportions } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { useEditorStore } from "@/features/editor/store/editor-store";

const PRESETS = [
  { label: "Square (1:1)", width: 1080, height: 1080 },
  { label: "Portrait (4:5)", width: 1080, height: 1350 },
  { label: "Story (9:16)", width: 1080, height: 1920 },
  { label: "Widescreen (16:9)", width: 1920, height: 1080 },
];

export function CanvasSizePopover() {
  const canvas = useEditorStore((s) => s.canvasState.canvas);
  const resizeCanvas = useEditorStore((s) => s.resizeCanvas);
  const [width, setWidth] = useState(String(canvas.width));
  const [height, setHeight] = useState(String(canvas.height));

  function applyCustom() {
    const w = Math.round(Number(width));
    const h = Math.round(Number(height));
    if (Number.isFinite(w) && Number.isFinite(h) && w > 0 && h > 0) {
      resizeCanvas(w, h);
    }
  }

  return (
    <Popover
      onOpenChange={(open) => {
        if (open) {
          setWidth(String(canvas.width));
          setHeight(String(canvas.height));
        }
      }}
    >
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Canvas size">
          <Proportions className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 space-y-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Presets</Label>
          <div className="grid grid-cols-2 gap-1.5">
            {PRESETS.map((preset) => (
              <Button
                key={preset.label}
                type="button"
                variant="outline"
                size="sm"
                className="justify-start"
                onClick={() => resizeCanvas(preset.width, preset.height)}
              >
                {preset.label}
              </Button>
            ))}
          </div>
        </div>
        <Separator />
        <div className="space-y-1.5">
          <Label className="text-xs">Custom size (px)</Label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min={1}
              value={width}
              onChange={(e) => setWidth(e.target.value)}
              className="h-8"
            />
            <span className="text-muted-foreground text-xs">×</span>
            <Input
              type="number"
              min={1}
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="h-8"
            />
          </div>
          <Button type="button" size="sm" className="w-full" onClick={applyCustom}>
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
