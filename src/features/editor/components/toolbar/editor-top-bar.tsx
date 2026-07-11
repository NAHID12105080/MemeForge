"use client";

import { Loader2, Redo2, Undo2, ZoomIn, ZoomOut } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import type Konva from "konva";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { saveMemeThumbnailAction } from "@/features/editor/actions/save-meme-thumbnail.action";
import { saveMemeAction } from "@/features/editor/actions/save-meme.action";
import { CanvasSizePopover } from "@/features/editor/components/toolbar/canvas-size-popover";
import { DownloadButton } from "@/features/editor/components/toolbar/download-button";
import { dataURLToBlob, rasterizeStageDataURL } from "@/features/editor/lib/export/rasterize-stage";
import type { MemeCanvasState } from "@/features/editor/schemas/meme-canvas-state.schema";
import { useEditorStore } from "@/features/editor/store/editor-store";

// Best-effort: a broken thumbnail should never fail the actual save, so
// errors are logged, not surfaced to the user.
async function generateThumbnail(
  stageNode: Konva.Stage,
  memeId: string,
  canvasState: MemeCanvasState,
) {
  try {
    const longestSide = Math.max(canvasState.canvas.width, canvasState.canvas.height);
    const pixelRatio = Math.min(1, 480 / longestSide);
    const dataURL = rasterizeStageDataURL(
      stageNode,
      canvasState.canvas.width,
      canvasState.canvas.height,
      { mimeType: "image/png", pixelRatio },
    );
    const blob = await dataURLToBlob(dataURL);
    const formData = new FormData();
    formData.set("file", blob, "thumbnail.png");
    await saveMemeThumbnailAction(memeId, formData);
  } catch (error) {
    console.error("Failed to generate thumbnail", error);
  }
}

export function EditorTopBar() {
  const title = useEditorStore((s) => s.title);
  const setTitle = useEditorStore((s) => s.setTitle);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const history = useEditorStore((s) => s.history);
  const viewport = useEditorStore((s) => s.viewport);
  const setViewport = useEditorStore((s) => s.setViewport);
  const isDirty = useEditorStore((s) => s.isDirty);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave() {
    setIsSaving(true);
    const { memeId, title, canvasState, stageNode } = useEditorStore.getState();
    try {
      const result = await saveMemeAction({ memeId, title, canvasState });
      useEditorStore.setState({ memeId: result.id, isDirty: false });
      toast.success("Meme saved");
      window.history.replaceState(null, "", `/editor/${result.id}`);

      if (stageNode) {
        void generateThumbnail(stageNode, result.id, canvasState);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="border-border/60 bg-background/70 flex h-14 items-center gap-2 border-b px-3 backdrop-blur-lg">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/dashboard">Exit</Link>
      </Button>
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="h-8 max-w-56 border-none shadow-none focus-visible:ring-1"
      />
      <div className="ml-2 flex items-center gap-0.5">
        <Button variant="ghost" size="icon" disabled={history.past.length === 0} onClick={undo}>
          <Undo2 className="size-4" />
        </Button>
        <Button variant="ghost" size="icon" disabled={history.future.length === 0} onClick={redo}>
          <Redo2 className="size-4" />
        </Button>
      </div>
      <div className="flex items-center gap-0.5">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setViewport({ zoom: Math.max(0.25, viewport.zoom - 0.1) })}
        >
          <ZoomOut className="size-4" />
        </Button>
        <span className="text-muted-foreground w-10 text-center text-xs">
          {Math.round(viewport.zoom * 100)}%
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setViewport({ zoom: Math.min(4, viewport.zoom + 0.1) })}
        >
          <ZoomIn className="size-4" />
        </Button>
      </div>
      <CanvasSizePopover />
      <div className="ml-auto flex items-center gap-2">
        <DownloadButton />
        <Button size="sm" onClick={handleSave} disabled={isSaving || !isDirty}>
          {isSaving ? <Loader2 className="size-4 animate-spin" /> : null}
          Save
        </Button>
      </div>
    </div>
  );
}
