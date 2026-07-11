"use client";

import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface ColorPickerPopoverProps {
  value: string;
  onChange: (color: string) => void;
  label?: string;
}

const PRESETS = [
  "#ffffff",
  "#000000",
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
];

export function ColorPickerPopover({ value, onChange, label }: ColorPickerPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={label ?? "Pick a color"}
          className="border-input flex h-8 w-full items-center gap-2 rounded-md border px-2 text-left text-sm"
        >
          <span
            className="size-4 shrink-0 rounded-full border"
            style={{ backgroundColor: value }}
          />
          <span className="text-muted-foreground truncate">{value}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-56 space-y-3">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-full cursor-pointer rounded-md border-none"
        />
        <Input value={value} onChange={(e) => onChange(e.target.value)} className="h-8" />
        <div className="grid grid-cols-9 gap-1.5">
          {PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              aria-label={preset}
              onClick={() => onChange(preset)}
              className="border-border size-5 rounded-full border"
              style={{ backgroundColor: preset }}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
