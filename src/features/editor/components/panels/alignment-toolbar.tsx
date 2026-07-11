"use client";

import {
  AlignHorizontalDistributeCenter,
  AlignHorizontalJustifyCenter,
  AlignHorizontalJustifyEnd,
  AlignHorizontalJustifyStart,
  AlignVerticalDistributeCenter,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
  AlignVerticalJustifyStart,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import type { AlignEdge } from "@/features/editor/store/editor-store";
import { useEditorStore } from "@/features/editor/store/editor-store";

const ALIGN_BUTTONS: { edge: AlignEdge; icon: typeof AlignHorizontalJustifyStart; label: string }[] = [
  { edge: "left", icon: AlignHorizontalJustifyStart, label: "Align left" },
  { edge: "center-h", icon: AlignHorizontalJustifyCenter, label: "Align center" },
  { edge: "right", icon: AlignHorizontalJustifyEnd, label: "Align right" },
  { edge: "top", icon: AlignVerticalJustifyStart, label: "Align top" },
  { edge: "center-v", icon: AlignVerticalJustifyCenter, label: "Align middle" },
  { edge: "bottom", icon: AlignVerticalJustifyEnd, label: "Align bottom" },
];

export function AlignmentToolbar() {
  const selectedCount = useEditorStore((s) => s.selectedLayerIds.length);
  const alignSelected = useEditorStore((s) => s.alignSelected);
  const distributeSelected = useEditorStore((s) => s.distributeSelected);

  if (selectedCount === 0) return null;

  return (
    <div className="space-y-2">
      <Label className="text-xs">Align</Label>
      <div className="grid grid-cols-6 gap-1">
        {ALIGN_BUTTONS.map(({ edge, icon: Icon, label }) => (
          <Button
            key={edge}
            type="button"
            variant="outline"
            size="icon"
            aria-label={label}
            onClick={() => alignSelected(edge)}
          >
            <Icon className="size-4" />
          </Button>
        ))}
      </div>
      {selectedCount >= 3 ? (
        <>
          <Separator />
          <Label className="text-xs">Distribute</Label>
          <div className="grid grid-cols-2 gap-1">
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Distribute horizontally"
              onClick={() => distributeSelected("horizontal")}
            >
              <AlignHorizontalDistributeCenter className="size-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Distribute vertically"
              onClick={() => distributeSelected("vertical")}
            >
              <AlignVerticalDistributeCenter className="size-4" />
            </Button>
          </div>
        </>
      ) : null}
    </div>
  );
}
