import { nanoid } from "nanoid";

import type {
  ImageLayer,
  Layer,
  ShapeLayer,
  StickerLayer,
  TextLayer,
} from "@/features/editor/schemas/meme-canvas-state.schema";

const baseDefaults = {
  rotation: 0,
  opacity: 1,
  blendMode: "normal" as const,
  locked: false,
  hidden: false,
  parentGroupId: null,
};

export function createTextLayer(
  overrides: Partial<TextLayer> & { x: number; y: number; zIndex: number },
): TextLayer {
  return {
    ...baseDefaults,
    id: nanoid(),
    name: "Text",
    type: "text",
    text: "Your text here",
    width: 400,
    height: 100,
    fontFamily: "Anton",
    fontSize: 64,
    fontWeight: 700,
    fontStyle: "normal",
    underline: false,
    color: "#ffffff",
    textAlign: "center",
    letterSpacing: 0,
    lineHeight: 1.1,
    stroke: { enabled: true, color: "#000000", width: 6 },
    shadow: null,
    glow: null,
    gradientFill: null,
    ...overrides,
  };
}

export function createImageLayer(
  overrides: Partial<ImageLayer> & {
    x: number;
    y: number;
    width: number;
    height: number;
    zIndex: number;
    src: string;
  },
): ImageLayer {
  return {
    ...baseDefaults,
    id: nanoid(),
    name: "Image",
    type: "image",
    mediaId: null,
    crop: null,
    flipX: false,
    flipY: false,
    filters: { brightness: 0, contrast: 0, blur: 0, hueRotate: 0, saturate: 0, grayscale: 0 },
    ...overrides,
  };
}

export function createShapeLayer(
  overrides: Partial<ShapeLayer> & {
    x: number;
    y: number;
    width: number;
    height: number;
    zIndex: number;
    shapeType: ShapeLayer["shapeType"];
  },
): ShapeLayer {
  return {
    ...baseDefaults,
    id: nanoid(),
    name: "Shape",
    type: "shape",
    fill: "#6366f1",
    stroke: null,
    strokeWidth: 0,
    cornerRadius: 0,
    sides: null,
    ...overrides,
  };
}

export function createStickerLayer(
  overrides: Partial<StickerLayer> & {
    x: number;
    y: number;
    zIndex: number;
    assetKind: StickerLayer["assetKind"];
  },
): StickerLayer {
  return {
    ...baseDefaults,
    id: nanoid(),
    name: "Sticker",
    type: "sticker",
    width: 96,
    height: 96,
    unicodeChar: null,
    assetUrl: null,
    ...overrides,
  };
}

export function getNextZIndex(layers: Layer[]) {
  return layers.reduce((max, layer) => Math.max(max, layer.zIndex), 0) + 1;
}
