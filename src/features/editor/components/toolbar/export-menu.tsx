"use client";

import { Download, Loader2 } from "lucide-react";
import { useState, useSyncExternalStore } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { downloadBlob } from "@/features/editor/lib/export/download-blob";
import { dataURLToBlob, rasterizeStageDataURL } from "@/features/editor/lib/export/rasterize-stage";
import { useEditorStore } from "@/features/editor/store/editor-store";

function slugifyFilename(title: string) {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "meme"
  );
}

function subscribeToNothing() {
  return () => {};
}

// Whether the browser exposes file-sharing never changes after mount, so
// there's nothing to subscribe to — this just needs an SSR-safe way to read
// a client-only global without a hydration mismatch.
function getShareSupportSnapshot() {
  return typeof navigator !== "undefined" && "share" in navigator && "canShare" in navigator;
}

function getShareSupportServerSnapshot() {
  return false;
}

async function rasterizePngBlob() {
  const { stageNode, canvasState } = useEditorStore.getState();
  if (!stageNode) return null;
  const dataURL = rasterizeStageDataURL(
    stageNode,
    canvasState.canvas.width,
    canvasState.canvas.height,
    { mimeType: "image/png", pixelRatio: 2 },
  );
  return dataURLToBlob(dataURL);
}

export function ExportMenu() {
  const [isExporting, setIsExporting] = useState(false);
  const canShare = useSyncExternalStore(
    subscribeToNothing,
    getShareSupportSnapshot,
    getShareSupportServerSnapshot,
  );

  async function handleDownload(format: "png" | "jpeg") {
    const { stageNode, canvasState, title } = useEditorStore.getState();
    if (!stageNode) return;

    setIsExporting(true);
    try {
      const dataURL = rasterizeStageDataURL(
        stageNode,
        canvasState.canvas.width,
        canvasState.canvas.height,
        {
          mimeType: format === "png" ? "image/png" : "image/jpeg",
          quality: format === "jpeg" ? 0.92 : undefined,
          pixelRatio: 2,
        },
      );
      const blob = await dataURLToBlob(dataURL);
      downloadBlob(blob, `${slugifyFilename(title)}.${format === "png" ? "png" : "jpg"}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to export image");
    } finally {
      setIsExporting(false);
    }
  }

  async function handleCopy() {
    setIsExporting(true);
    try {
      const blob = await rasterizePngBlob();
      if (!blob) {
        toast.error("Nothing to copy yet");
        return;
      }
      await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
      toast.success("Copied to clipboard");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to copy image");
    } finally {
      setIsExporting(false);
    }
  }

  async function handleShare() {
    setIsExporting(true);
    try {
      const blob = await rasterizePngBlob();
      if (!blob) {
        toast.error("Nothing to share yet");
        return;
      }
      const { title } = useEditorStore.getState();
      const file = new File([blob], `${slugifyFilename(title)}.png`, { type: "image/png" });
      if (!navigator.canShare({ files: [file] })) {
        toast.error("Sharing this image isn't supported on this device");
        return;
      }
      await navigator.share({ files: [file], title });
    } catch (error) {
      // AbortError means the user dismissed the native share sheet — not a failure.
      if (error instanceof DOMException && error.name === "AbortError") return;
      toast.error(error instanceof Error ? error.message : "Failed to share image");
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={isExporting}>
          {isExporting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Download className="size-4" />
          )}
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => handleDownload("png")}>Download PNG</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => handleDownload("jpeg")}>Download JPG</DropdownMenuItem>
        <DropdownMenuItem onSelect={handleCopy}>Copy Image</DropdownMenuItem>
        {canShare ? <DropdownMenuItem onSelect={handleShare}>Share</DropdownMenuItem> : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
