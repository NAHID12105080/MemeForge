"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";

import { EditorFloatingToolbar } from "@/features/editor/components/toolbar/editor-floating-toolbar";
import { EditorTopBar } from "@/features/editor/components/toolbar/editor-top-bar";
import { LayersPanel } from "@/features/editor/components/panels/layers-panel";
import { PropertiesPanel } from "@/features/editor/components/panels/properties-panel";
import { useEditorShortcuts } from "@/features/editor/lib/keyboard/use-editor-shortcuts";
import type { MemeCanvasState } from "@/features/editor/schemas/meme-canvas-state.schema";
import { useEditorStore } from "@/features/editor/store/editor-store";

const EditorCanvas = dynamic(
  () => import("@/features/editor/components/canvas/editor-canvas").then((mod) => mod.EditorCanvas),
  { ssr: false },
);

interface EditorShellProps {
  memeId: string | null;
  title: string;
  canvasState: MemeCanvasState;
}

export function EditorShell({ memeId, title, canvasState }: EditorShellProps) {
  useEditorShortcuts();

  useEffect(() => {
    useEditorStore.getState().loadMeme(memeId, title, canvasState);
    // Intentionally run once on mount only — this seeds the store from
    // server-fetched initial props; re-running on prop identity would
    // wipe in-progress edits.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 flex flex-col">
      <EditorTopBar />
      <div className="flex flex-1 overflow-hidden">
        <div className="border-border/60 w-64 shrink-0 border-r">
          <LayersPanel />
        </div>
        <div className="relative flex-1">
          <EditorCanvas />
          <EditorFloatingToolbar />
        </div>
        <div className="border-border/60 w-64 shrink-0 border-l">
          <PropertiesPanel />
        </div>
      </div>
    </div>
  );
}
