"use client";

import { Download, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { downloadBlob } from "@/features/editor/lib/export/download-blob";
import {
  dataURLToBlob,
  rasterizeStageDataURL,
} from "@/features/editor/lib/export/rasterize-stage";
import { useEditorStore } from "@/features/editor/store/editor-store";

function slugifyFilename(title: string) {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "meme"
  );
}

export function DownloadButton() {
  const [isExporting, setIsExporting] = useState(false);

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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={isExporting}>
          {isExporting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Download className="size-4" />
          )}
          Download
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => handleDownload("png")}>PNG</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => handleDownload("jpeg")}>JPEG</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
