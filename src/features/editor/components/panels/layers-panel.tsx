"use client";

import {
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Lock,
  Shapes,
  Smile,
  Trash2,
  Type,
  Unlock,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Layer } from "@/features/editor/schemas/meme-canvas-state.schema";
import { useEditorStore } from "@/features/editor/store/editor-store";
import { cn } from "@/lib/utils";

const layerIcons: Record<Layer["type"], typeof Type> = {
  text: Type,
  image: ImageIcon,
  shape: Shapes,
  sticker: Smile,
  group: Shapes,
};

export function LayersPanel() {
  const layers = useEditorStore((s) => s.canvasState.layers);
  const selectedLayerIds = useEditorStore((s) => s.selectedLayerIds);
  const setSelection = useEditorStore((s) => s.setSelection);
  const toggleLock = useEditorStore((s) => s.toggleLock);
  const toggleHidden = useEditorStore((s) => s.toggleHidden);
  const reorderLayer = useEditorStore((s) => s.reorderLayer);
  const removeLayer = useEditorStore((s) => s.removeLayer);

  const sorted = [...layers].sort((a, b) => b.zIndex - a.zIndex);

  return (
    <div className="flex h-full flex-col">
      <div className="border-border/60 border-b px-3 py-2">
        <p className="text-sm font-medium">Layers</p>
      </div>
      <ScrollArea className="flex-1">
        <div className="space-y-1 p-2">
          {sorted.length === 0 ? (
            <p className="text-muted-foreground px-2 py-6 text-center text-sm">No layers yet</p>
          ) : (
            sorted.map((layer) => {
              const Icon = layerIcons[layer.type];
              const isSelected = selectedLayerIds.includes(layer.id);
              return (
                <div
                  key={layer.id}
                  onClick={() => setSelection([layer.id])}
                  className={cn(
                    "group flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm",
                    isSelected ? "bg-primary/10 text-primary" : "hover:bg-accent",
                  )}
                >
                  <Icon className="size-3.5 shrink-0" />
                  <span className="flex-1 truncate">{layer.name}</span>
                  <div className="hidden items-center gap-0.5 group-hover:flex">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        reorderLayer(layer.id, "up");
                      }}
                    >
                      <ArrowUp className="size-3" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        reorderLayer(layer.id, "down");
                      }}
                    >
                      <ArrowDown className="size-3" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLock(layer.id);
                      }}
                    >
                      {layer.locked ? <Lock className="size-3" /> : <Unlock className="size-3" />}
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleHidden(layer.id);
                      }}
                    >
                      {layer.hidden ? <EyeOff className="size-3" /> : <Eye className="size-3" />}
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-destructive size-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeLayer(layer.id);
                      }}
                    >
                      <Trash2 className="size-3" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
