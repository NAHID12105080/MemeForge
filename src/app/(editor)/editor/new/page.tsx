import type { Metadata } from "next";
import { eq } from "drizzle-orm";

import { db } from "@/db/client";
import { templates } from "@/db/schema";
import { EditorShell } from "@/features/editor/components/editor-shell";
import { memeCanvasStateSchema } from "@/features/editor/schemas/meme-canvas-state.schema";

export const metadata: Metadata = { title: "New meme" };

const BLANK_CANVAS_STATE = memeCanvasStateSchema.parse({
  canvas: { width: 1080, height: 1080 },
  layers: [],
});

export default async function NewMemeEditorPage({
  searchParams,
}: {
  searchParams: Promise<{ template?: string }>;
}) {
  const { template: templateSlug } = await searchParams;

  if (templateSlug) {
    const template = await db.query.templates.findFirst({
      where: eq(templates.slug, templateSlug),
    });
    if (template) {
      const canvasState = memeCanvasStateSchema.parse(template.canvasState);
      return <EditorShell memeId={null} title={template.name} canvasState={canvasState} />;
    }
  }

  return <EditorShell memeId={null} title="Untitled meme" canvasState={BLANK_CANVAS_STATE} />;
}
