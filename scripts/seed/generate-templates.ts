import { randomUUID } from "node:crypto";
import { mkdir } from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";

import { db } from "@/db/client";
import { templates, type categories } from "@/db/schema";
import type { MemeCanvasState } from "@/features/editor/schemas/meme-canvas-state.schema";

const CANVAS_SIZE = { width: 1080, height: 1080 };
const UPLOADS_ROOT = path.join(process.cwd(), "public", "uploads", "templates");

interface PaletteDefinition {
  from: string;
  via: string;
  to: string;
}

const CATEGORY_PALETTES: Record<string, PaletteDefinition[]> = {
  reactions: [
    { from: "#ff6b6b", via: "#f06595", to: "#cc5de8" },
    { from: "#ffa94d", via: "#ff8787", to: "#f783ac" },
  ],
  "classic-format": [
    { from: "#495057", via: "#343a40", to: "#212529" },
    { from: "#868e96", via: "#495057", to: "#212529" },
  ],
  wholesome: [
    { from: "#ffd6e8", via: "#ffc9de", to: "#ffb3d9" },
    { from: "#d0f4de", via: "#a9def9", to: "#e4c1f9" },
  ],
  gaming: [
    { from: "#5f0f40", via: "#9a031e", to: "#0f4c5c" },
    { from: "#3a0ca3", via: "#7209b7", to: "#f72585" },
  ],
  "work-office": [
    { from: "#2b2d42", via: "#3d5a80", to: "#8d99ae" },
    { from: "#1d3557", via: "#457b9d", to: "#a8dadc" },
  ],
  animals: [
    { from: "#f4a259", via: "#f4d35e", to: "#bc4749" },
    { from: "#588157", via: "#a3b18a", to: "#dad7cd" },
  ],
  minimal: [
    { from: "#f8f9fa", via: "#e9ecef", to: "#dee2e6" },
    { from: "#212529", via: "#343a40", to: "#495057" },
  ],
};

const PATTERNS = ["none", "dots", "stripes"] as const;

function buildBackgroundSvg(palette: PaletteDefinition, pattern: (typeof PATTERNS)[number]) {
  const { width, height } = CANVAS_SIZE;

  const patternDef =
    pattern === "dots"
      ? `<pattern id="p" width="72" height="72" patternUnits="userSpaceOnUse">
           <circle cx="36" cy="36" r="4" fill="white" fill-opacity="0.12" />
         </pattern>`
      : pattern === "stripes"
        ? `<pattern id="p" width="80" height="80" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
             <rect width="40" height="80" fill="white" fill-opacity="0.06" />
           </pattern>`
        : "";

  const patternRect =
    pattern !== "none" ? `<rect width="100%" height="100%" fill="url(#p)" />` : "";

  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${palette.from}" />
        <stop offset="50%" stop-color="${palette.via}" />
        <stop offset="100%" stop-color="${palette.to}" />
      </linearGradient>
      ${patternDef}
    </defs>
    <rect width="100%" height="100%" fill="url(#bg)" />
    ${patternRect}
  </svg>`;
}

function buildTemplateCanvasState(): MemeCanvasState {
  return {
    version: 1,
    canvas: {
      width: CANVAS_SIZE.width,
      height: CANVAS_SIZE.height,
      backgroundColor: "#000000",
      backgroundImageMediaId: null,
    },
    layers: [
      {
        id: randomUUID(),
        type: "text",
        name: "Top text",
        text: "TOP TEXT",
        x: 40,
        y: 40,
        width: CANVAS_SIZE.width - 80,
        height: 140,
        rotation: 0,
        opacity: 1,
        blendMode: "normal",
        locked: false,
        hidden: false,
        zIndex: 1,
        parentGroupId: null,
        fontFamily: "Anton",
        fontSize: 72,
        fontWeight: 700,
        fontStyle: "normal",
        color: "#ffffff",
        textAlign: "center",
        letterSpacing: 0,
        lineHeight: 1.1,
        stroke: { enabled: true, color: "#000000", width: 8 },
        shadow: null,
        glow: null,
        gradientFill: null,
      },
      {
        id: randomUUID(),
        type: "text",
        name: "Bottom text",
        text: "BOTTOM TEXT",
        x: 40,
        y: CANVAS_SIZE.height - 180,
        width: CANVAS_SIZE.width - 80,
        height: 140,
        rotation: 0,
        opacity: 1,
        blendMode: "normal",
        locked: false,
        hidden: false,
        zIndex: 2,
        parentGroupId: null,
        fontFamily: "Anton",
        fontSize: 72,
        fontWeight: 700,
        fontStyle: "normal",
        color: "#ffffff",
        textAlign: "center",
        letterSpacing: 0,
        lineHeight: 1.1,
        stroke: { enabled: true, color: "#000000", width: 8 },
        shadow: null,
        glow: null,
        gradientFill: null,
      },
    ],
  };
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const TEMPLATES_PER_CATEGORY = 6;

export async function generateTemplates(seededCategories: (typeof categories.$inferSelect)[]) {
  await mkdir(UPLOADS_ROOT, { recursive: true });

  let totalInserted = 0;

  for (const category of seededCategories) {
    if (category.slug === "trending") continue; // populated organically by real usage

    const palettes = CATEGORY_PALETTES[category.slug] ?? CATEGORY_PALETTES.reactions;

    for (let i = 0; i < TEMPLATES_PER_CATEGORY; i++) {
      const id = randomUUID();
      const palette = palettes[i % palettes.length];
      const pattern = PATTERNS[i % PATTERNS.length];
      const name = `${category.name} Template ${i + 1}`;
      const slug = `${slugify(category.name)}-${i + 1}-${id.slice(0, 8)}`;

      const svg = buildBackgroundSvg(palette, pattern);
      const templateDir = path.join(UPLOADS_ROOT, id);
      await mkdir(templateDir, { recursive: true });
      const thumbnailPath = path.join(templateDir, "thumbnail.webp");
      await sharp(Buffer.from(svg)).webp({ quality: 82 }).toFile(thumbnailPath);

      await db.insert(templates).values({
        id,
        name,
        slug,
        description: `A ${category.name.toLowerCase()} meme template.`,
        categoryId: category.id,
        canvasState: buildTemplateCanvasState(),
        thumbnailUrl: `/uploads/templates/${id}/thumbnail.webp`,
        width: CANVAS_SIZE.width,
        height: CANVAS_SIZE.height,
        isFeatured: i === 0,
        usageCount: Math.floor(Math.random() * 500),
      });

      totalInserted++;
    }
  }

  console.log(`Generated ${totalInserted} templates with procedural artwork.`);
}
