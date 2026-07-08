import { useHotkeys } from "react-hotkeys-hook";

import { useEditorStore } from "@/features/editor/store/editor-store";

export function useEditorShortcuts() {
  const removeSelectedLayers = useEditorStore((s) => s.removeSelectedLayers);
  const duplicateLayer = useEditorStore((s) => s.duplicateLayer);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const clearSelection = useEditorStore((s) => s.clearSelection);
  const setSelection = useEditorStore((s) => s.setSelection);
  const updateLayer = useEditorStore((s) => s.updateLayer);

  useHotkeys(["delete", "backspace"], (event) => {
    event.preventDefault();
    removeSelectedLayers();
  });

  useHotkeys("mod+d", (event) => {
    event.preventDefault();
    const [id] = useEditorStore.getState().selectedLayerIds;
    if (id) duplicateLayer(id);
  });

  useHotkeys("mod+z", (event) => {
    event.preventDefault();
    undo();
  });

  useHotkeys("mod+shift+z", (event) => {
    event.preventDefault();
    redo();
  });

  useHotkeys("mod+a", (event) => {
    event.preventDefault();
    setSelection(useEditorStore.getState().canvasState.layers.map((l) => l.id));
  });

  useHotkeys("escape", () => clearSelection());

  useHotkeys(["up", "down", "left", "right"], (event, handler) => {
    event.preventDefault();
    const step = event.shiftKey ? 10 : 1;
    const delta =
      handler.keys?.[0] === "up"
        ? { y: -step }
        : handler.keys?.[0] === "down"
          ? { y: step }
          : handler.keys?.[0] === "left"
            ? { x: -step }
            : { x: step };

    const { selectedLayerIds, canvasState } = useEditorStore.getState();
    for (const id of selectedLayerIds) {
      const layer = canvasState.layers.find((l) => l.id === id);
      if (!layer) continue;
      updateLayer(id, {
        x: layer.x + (delta.x ?? 0),
        y: layer.y + (delta.y ?? 0),
      });
    }
  });
}
