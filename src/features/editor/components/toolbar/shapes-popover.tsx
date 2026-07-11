"use client";

import { ArrowRight, Circle, Hexagon, Minus, Square, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { ShapeLayer } from "@/features/editor/schemas/meme-canvas-state.schema";

const SHAPES: { type: ShapeLayer["shapeType"]; icon: typeof Square; label: string }[] = [
  { type: "rect", icon: Square, label: "Rectangle" },
  { type: "ellipse", icon: Circle, label: "Ellipse" },
  { type: "line", icon: Minus, label: "Line" },
  { type: "arrow", icon: ArrowRight, label: "Arrow" },
  { type: "polygon", icon: Hexagon, label: "Polygon" },
  { type: "star", icon: Star, label: "Star" },
];

interface ShapesPopoverProps {
  onSelect: (shapeType: ShapeLayer["shapeType"]) => void;
}

export function ShapesPopover({ onSelect }: ShapesPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Square className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56">
        <div className="grid grid-cols-3 gap-1">
          {SHAPES.map((shape) => (
            <button
              key={shape.type}
              type="button"
              onClick={() => onSelect(shape.type)}
              className="hover:bg-accent flex flex-col items-center gap-1 rounded-md p-2 text-xs"
            >
              <shape.icon className="size-4" />
              {shape.label}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
