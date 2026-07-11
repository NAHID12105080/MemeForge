import type Konva from "konva";
import { create } from "zustand";

import type { Layer, MemeCanvasState } from "@/features/editor/schemas/meme-canvas-state.schema";

const MAX_HISTORY = 50;

export type EditorTool = "select" | "text" | "shape" | "pan";
export type AlignEdge = "left" | "center-h" | "right" | "top" | "center-v" | "bottom";

interface Viewport {
  zoom: number;
  panX: number;
  panY: number;
}

interface EditorStoreState {
  memeId: string | null;
  title: string;
  canvasState: MemeCanvasState;
  selectedLayerIds: string[];
  viewport: Viewport;
  tool: EditorTool;
  history: { past: MemeCanvasState[]; future: MemeCanvasState[] };
  isDirty: boolean;
  // Imperative handle to the live Konva Stage, for export. Not part of
  // undo/redo history — it's a DOM-adjacent ref, not editor state.
  stageNode: Konva.Stage | null;

  setTitle: (title: string) => void;
  setStageNode: (node: Konva.Stage | null) => void;
  loadMeme: (memeId: string | null, title: string, canvasState: MemeCanvasState) => void;
  markSaved: () => void;

  setCanvasStateDraft: (updater: (state: MemeCanvasState) => MemeCanvasState) => void;
  commitHistory: () => void;
  undo: () => void;
  redo: () => void;

  resizeCanvas: (width: number, height: number) => void;
  addLayer: (layer: Layer) => void;
  updateLayer: (id: string, patch: Partial<Layer>, options?: { commit?: boolean }) => void;
  removeLayer: (id: string) => void;
  removeSelectedLayers: () => void;
  duplicateLayer: (id: string) => void;
  reorderLayer: (id: string, direction: "up" | "down") => void;
  toggleLock: (id: string) => void;
  toggleHidden: (id: string) => void;
  groupSelected: () => void;
  ungroup: (groupId: string) => void;
  alignSelected: (edge: AlignEdge) => void;
  distributeSelected: (axis: "horizontal" | "vertical") => void;

  setSelection: (ids: string[]) => void;
  toggleSelection: (id: string) => void;
  clearSelection: () => void;

  setTool: (tool: EditorTool) => void;
  setViewport: (viewport: Partial<Viewport>) => void;
}

const emptyCanvasState: MemeCanvasState = {
  version: 1,
  canvas: { width: 1080, height: 1080, backgroundColor: "#000000", backgroundImageMediaId: null },
  layers: [],
};

function cloneState(state: MemeCanvasState): MemeCanvasState {
  return structuredClone(state);
}

export const useEditorStore = create<EditorStoreState>((set, get) => ({
  memeId: null,
  title: "Untitled meme",
  canvasState: emptyCanvasState,
  selectedLayerIds: [],
  viewport: { zoom: 1, panX: 0, panY: 0 },
  tool: "select",
  history: { past: [], future: [] },
  isDirty: false,
  stageNode: null,

  setTitle: (title) => set({ title, isDirty: true }),
  setStageNode: (node) => set({ stageNode: node }),

  loadMeme: (memeId, title, canvasState) =>
    set({
      memeId,
      title,
      canvasState,
      selectedLayerIds: [],
      history: { past: [], future: [] },
      isDirty: false,
    }),

  markSaved: () => set({ isDirty: false }),

  setCanvasStateDraft: (updater) =>
    set((state) => ({ canvasState: updater(state.canvasState), isDirty: true })),

  commitHistory: () =>
    set((state) => {
      const past = [...state.history.past, cloneState(state.canvasState)].slice(-MAX_HISTORY);
      return { history: { past, future: [] } };
    }),

  undo: () =>
    set((state) => {
      const previous = state.history.past.at(-1);
      if (!previous) return state;
      const past = state.history.past.slice(0, -1);
      const future = [cloneState(state.canvasState), ...state.history.future];
      return { canvasState: previous, history: { past, future }, isDirty: true };
    }),

  redo: () =>
    set((state) => {
      const next = state.history.future[0];
      if (!next) return state;
      const future = state.history.future.slice(1);
      const past = [...state.history.past, cloneState(state.canvasState)];
      return { canvasState: next, history: { past, future }, isDirty: true };
    }),

  resizeCanvas: (width, height) => {
    get().commitHistory();
    set((state) => ({
      canvasState: {
        ...state.canvasState,
        canvas: { ...state.canvasState.canvas, width, height },
      },
      isDirty: true,
    }));
  },

  addLayer: (layer) => {
    get().commitHistory();
    set((state) => ({
      canvasState: { ...state.canvasState, layers: [...state.canvasState.layers, layer] },
      selectedLayerIds: [layer.id],
      isDirty: true,
    }));
  },

  updateLayer: (id, patch, options) => {
    if (options?.commit) get().commitHistory();
    set((state) => ({
      canvasState: {
        ...state.canvasState,
        layers: state.canvasState.layers.map((layer) =>
          layer.id === id ? ({ ...layer, ...patch } as Layer) : layer,
        ),
      },
      isDirty: true,
    }));
  },

  removeLayer: (id) => {
    get().commitHistory();
    set((state) => ({
      canvasState: {
        ...state.canvasState,
        layers: state.canvasState.layers.filter((layer) => layer.id !== id),
      },
      selectedLayerIds: state.selectedLayerIds.filter((selectedId) => selectedId !== id),
      isDirty: true,
    }));
  },

  removeSelectedLayers: () => {
    const { selectedLayerIds } = get();
    if (selectedLayerIds.length === 0) return;
    get().commitHistory();
    set((state) => ({
      canvasState: {
        ...state.canvasState,
        layers: state.canvasState.layers.filter(
          (layer) => !state.selectedLayerIds.includes(layer.id),
        ),
      },
      selectedLayerIds: [],
      isDirty: true,
    }));
  },

  duplicateLayer: (id) => {
    const layer = get().canvasState.layers.find((l) => l.id === id);
    if (!layer) return;
    get().commitHistory();
    const maxZ = Math.max(0, ...get().canvasState.layers.map((l) => l.zIndex));
    const clone: Layer = {
      ...layer,
      id: crypto.randomUUID(),
      x: layer.x + 24,
      y: layer.y + 24,
      zIndex: maxZ + 1,
    };
    set((state) => ({
      canvasState: { ...state.canvasState, layers: [...state.canvasState.layers, clone] },
      selectedLayerIds: [clone.id],
      isDirty: true,
    }));
  },

  reorderLayer: (id, direction) => {
    get().commitHistory();
    set((state) => {
      const sorted = [...state.canvasState.layers].sort((a, b) => a.zIndex - b.zIndex);
      const index = sorted.findIndex((layer) => layer.id === id);
      const swapIndex = direction === "up" ? index + 1 : index - 1;
      if (index === -1 || swapIndex < 0 || swapIndex >= sorted.length) return state;

      const currentZ = sorted[index].zIndex;
      const swapZ = sorted[swapIndex].zIndex;

      return {
        canvasState: {
          ...state.canvasState,
          layers: state.canvasState.layers.map((layer) => {
            if (layer.id === sorted[index].id) return { ...layer, zIndex: swapZ };
            if (layer.id === sorted[swapIndex].id) return { ...layer, zIndex: currentZ };
            return layer;
          }),
        },
        isDirty: true,
      };
    });
  },

  toggleLock: (id) =>
    set((state) => ({
      canvasState: {
        ...state.canvasState,
        layers: state.canvasState.layers.map((layer) =>
          layer.id === id ? { ...layer, locked: !layer.locked } : layer,
        ),
      },
      isDirty: true,
    })),

  toggleHidden: (id) =>
    set((state) => ({
      canvasState: {
        ...state.canvasState,
        layers: state.canvasState.layers.map((layer) =>
          layer.id === id ? { ...layer, hidden: !layer.hidden } : layer,
        ),
      },
      isDirty: true,
    })),

  groupSelected: () => {
    const { selectedLayerIds, canvasState } = get();
    if (selectedLayerIds.length < 2) return;
    get().commitHistory();
    const groupId = crypto.randomUUID();
    const maxZ = Math.max(0, ...canvasState.layers.map((l) => l.zIndex));
    const groupLayer: Layer = {
      id: groupId,
      type: "group",
      name: "Group",
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      rotation: 0,
      opacity: 1,
      blendMode: "normal",
      locked: false,
      hidden: false,
      zIndex: maxZ + 1,
      parentGroupId: null,
      childIds: selectedLayerIds,
    };
    set((state) => ({
      canvasState: {
        ...state.canvasState,
        layers: [
          ...state.canvasState.layers.map((layer) =>
            selectedLayerIds.includes(layer.id) ? { ...layer, parentGroupId: groupId } : layer,
          ),
          groupLayer,
        ],
      },
      selectedLayerIds: [groupId],
      isDirty: true,
    }));
  },

  ungroup: (groupId) => {
    get().commitHistory();
    set((state) => {
      const group = state.canvasState.layers.find((l) => l.id === groupId && l.type === "group");
      if (!group || group.type !== "group") return state;
      return {
        canvasState: {
          ...state.canvasState,
          layers: state.canvasState.layers
            .filter((layer) => layer.id !== groupId)
            .map((layer) =>
              group.childIds.includes(layer.id) ? { ...layer, parentGroupId: null } : layer,
            ),
        },
        selectedLayerIds: group.childIds,
        isDirty: true,
      };
    });
  },

  alignSelected: (edge) => {
    const { selectedLayerIds, canvasState } = get();
    const layers = canvasState.layers.filter((layer) => selectedLayerIds.includes(layer.id));
    if (layers.length === 0) return;

    const bounds =
      layers.length === 1
        ? { x: 0, y: 0, width: canvasState.canvas.width, height: canvasState.canvas.height }
        : (() => {
            const minX = Math.min(...layers.map((l) => l.x));
            const minY = Math.min(...layers.map((l) => l.y));
            const maxX = Math.max(...layers.map((l) => l.x + l.width));
            const maxY = Math.max(...layers.map((l) => l.y + l.height));
            return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
          })();

    get().commitHistory();
    set((state) => ({
      canvasState: {
        ...state.canvasState,
        layers: state.canvasState.layers.map((layer) => {
          if (!selectedLayerIds.includes(layer.id)) return layer;
          switch (edge) {
            case "left":
              return { ...layer, x: bounds.x };
            case "center-h":
              return { ...layer, x: bounds.x + bounds.width / 2 - layer.width / 2 };
            case "right":
              return { ...layer, x: bounds.x + bounds.width - layer.width };
            case "top":
              return { ...layer, y: bounds.y };
            case "center-v":
              return { ...layer, y: bounds.y + bounds.height / 2 - layer.height / 2 };
            case "bottom":
              return { ...layer, y: bounds.y + bounds.height - layer.height };
          }
        }),
      },
      isDirty: true,
    }));
  },

  distributeSelected: (axis) => {
    const { selectedLayerIds, canvasState } = get();
    const layers = canvasState.layers.filter((layer) => selectedLayerIds.includes(layer.id));
    if (layers.length < 3) return;

    const key = axis === "horizontal" ? "x" : "y";
    const sizeKey = axis === "horizontal" ? "width" : "height";
    const sorted = [...layers].sort((a, b) => a[key] - b[key]);
    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    const totalSize = sorted.reduce((sum, l) => sum + l[sizeKey], 0);
    const span = last[key] + last[sizeKey] - first[key];
    const gap = (span - totalSize) / (sorted.length - 1);

    const positions = new Map<string, number>();
    let cursor = first[key];
    for (const layer of sorted) {
      positions.set(layer.id, cursor);
      cursor += layer[sizeKey] + gap;
    }

    get().commitHistory();
    set((state) => ({
      canvasState: {
        ...state.canvasState,
        layers: state.canvasState.layers.map((layer) =>
          positions.has(layer.id) ? { ...layer, [key]: positions.get(layer.id)! } : layer,
        ),
      },
      isDirty: true,
    }));
  },

  setSelection: (ids) => set({ selectedLayerIds: ids }),
  toggleSelection: (id) =>
    set((state) => ({
      selectedLayerIds: state.selectedLayerIds.includes(id)
        ? state.selectedLayerIds.filter((selectedId) => selectedId !== id)
        : [...state.selectedLayerIds, id],
    })),
  clearSelection: () => set({ selectedLayerIds: [] }),

  setTool: (tool) => set({ tool }),
  setViewport: (viewport) => set((state) => ({ viewport: { ...state.viewport, ...viewport } })),
}));
