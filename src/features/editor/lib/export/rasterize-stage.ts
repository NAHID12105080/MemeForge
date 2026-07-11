import type Konva from "konva";

interface RasterizeOptions {
  mimeType: "image/png" | "image/jpeg";
  quality?: number;
  pixelRatio?: number;
}

// The Stage carries the live pan/zoom transform directly (scaleX/scaleY/x/y),
// and the selection Transformer's handles live in the same layer as the
// content. Neither should appear in an export, so both are reset just for
// the synchronous toDataURL() call and restored immediately after — no
// `await` happens in between, so the browser never gets a chance to paint
// the reset state and there's no visible flash.
export function rasterizeStageDataURL(
  stage: Konva.Stage,
  canvasWidth: number,
  canvasHeight: number,
  options: RasterizeOptions,
): string {
  const transformers = stage.find("Transformer");
  const prevTransformerVisible = transformers.map((node) => node.visible());
  transformers.forEach((node) => node.visible(false));

  const prevScale = { x: stage.scaleX(), y: stage.scaleY() };
  const prevPosition = { x: stage.x(), y: stage.y() };
  stage.scale({ x: 1, y: 1 });
  stage.position({ x: 0, y: 0 });

  try {
    return stage.toDataURL({
      mimeType: options.mimeType,
      quality: options.quality,
      pixelRatio: options.pixelRatio ?? 1,
      x: 0,
      y: 0,
      width: canvasWidth,
      height: canvasHeight,
    });
  } finally {
    stage.scale(prevScale);
    stage.position(prevPosition);
    transformers.forEach((node, i) => node.visible(prevTransformerVisible[i]));
    stage.batchDraw();
  }
}

export async function dataURLToBlob(dataURL: string): Promise<Blob> {
  const response = await fetch(dataURL);
  return response.blob();
}
