import { z } from "zod";

export const blendModeSchema = z.enum([
  "normal",
  "multiply",
  "screen",
  "overlay",
  "darken",
  "lighten",
  "color-dodge",
  "color-burn",
  "difference",
  "exclusion",
  "hue",
  "saturation",
  "color",
  "luminosity",
]);

const baseLayerSchema = z.object({
  id: z.string(),
  name: z.string(),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  rotation: z.number().default(0),
  opacity: z.number().min(0).max(1).default(1),
  blendMode: blendModeSchema.default("normal"),
  locked: z.boolean().default(false),
  hidden: z.boolean().default(false),
  zIndex: z.number().default(0),
  parentGroupId: z.string().nullable().default(null),
});

const strokeSchema = z.object({
  enabled: z.boolean(),
  color: z.string(),
  width: z.number(),
});

const shadowSchema = z.object({
  enabled: z.boolean(),
  color: z.string(),
  blur: z.number(),
  offsetX: z.number(),
  offsetY: z.number(),
});

const glowSchema = z.object({
  enabled: z.boolean(),
  color: z.string(),
  blur: z.number(),
  intensity: z.number(),
});

const gradientFillSchema = z.object({
  enabled: z.boolean(),
  angle: z.number(),
  stops: z.array(z.object({ offset: z.number(), color: z.string() })),
});

export const textLayerSchema = baseLayerSchema.extend({
  type: z.literal("text"),
  text: z.string(),
  fontFamily: z.string().default("Inter"),
  fontSize: z.number().default(48),
  fontWeight: z.number().default(700),
  fontStyle: z.enum(["normal", "italic"]).default("normal"),
  underline: z.boolean().default(false),
  color: z.string().default("#ffffff"),
  textAlign: z.enum(["left", "center", "right"]).default("center"),
  letterSpacing: z.number().default(0),
  lineHeight: z.number().default(1.1),
  stroke: strokeSchema.nullable().default(null),
  shadow: shadowSchema.nullable().default(null),
  glow: glowSchema.nullable().default(null),
  gradientFill: gradientFillSchema.nullable().default(null),
});

export const imageLayerSchema = baseLayerSchema.extend({
  type: z.literal("image"),
  mediaId: z.string().nullable().default(null),
  src: z.string(),
  crop: z
    .object({ x: z.number(), y: z.number(), width: z.number(), height: z.number() })
    .nullable()
    .default(null),
  flipX: z.boolean().default(false),
  flipY: z.boolean().default(false),
  filters: z
    .object({
      brightness: z.number().default(0),
      contrast: z.number().default(0),
      blur: z.number().default(0),
      hueRotate: z.number().default(0),
      saturate: z.number().default(0),
      grayscale: z.number().default(0),
    })
    .default({
      brightness: 0,
      contrast: 0,
      blur: 0,
      hueRotate: 0,
      saturate: 0,
      grayscale: 0,
    }),
});

export const shapeLayerSchema = baseLayerSchema.extend({
  type: z.literal("shape"),
  shapeType: z.enum(["rect", "ellipse", "line", "arrow", "polygon", "star"]),
  fill: z.string().default("#000000"),
  stroke: z.string().nullable().default(null),
  strokeWidth: z.number().default(0),
  cornerRadius: z.number().default(0),
  sides: z.number().nullable().default(null),
});

export const stickerLayerSchema = baseLayerSchema.extend({
  type: z.literal("sticker"),
  assetKind: z.enum(["emoji", "sticker"]),
  unicodeChar: z.string().nullable().default(null),
  assetUrl: z.string().nullable().default(null),
});

export const groupLayerSchema = baseLayerSchema.extend({
  type: z.literal("group"),
  childIds: z.array(z.string()),
});

export const layerSchema = z.discriminatedUnion("type", [
  textLayerSchema,
  imageLayerSchema,
  shapeLayerSchema,
  stickerLayerSchema,
  groupLayerSchema,
]);

export const memeCanvasStateSchema = z.object({
  version: z.number().default(1),
  canvas: z.object({
    width: z.number(),
    height: z.number(),
    backgroundColor: z.string().default("#000000"),
    backgroundImageMediaId: z.string().nullable().default(null),
  }),
  layers: z.array(layerSchema),
});

export type BlendMode = z.infer<typeof blendModeSchema>;
export type TextLayer = z.infer<typeof textLayerSchema>;
export type ImageLayer = z.infer<typeof imageLayerSchema>;
export type ShapeLayer = z.infer<typeof shapeLayerSchema>;
export type StickerLayer = z.infer<typeof stickerLayerSchema>;
export type GroupLayer = z.infer<typeof groupLayerSchema>;
export type Layer = z.infer<typeof layerSchema>;
export type MemeCanvasState = z.infer<typeof memeCanvasStateSchema>;
