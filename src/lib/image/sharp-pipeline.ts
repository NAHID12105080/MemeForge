import "server-only";

import sharp from "sharp";

const MAX_DIMENSION = 2400;

export async function processUploadedImage(input: Buffer) {
  const image = sharp(input, { failOn: "none" }).rotate(); // auto-orient, then strip EXIF on output
  const metadata = await image.metadata();

  const needsResize =
    (metadata.width ?? 0) > MAX_DIMENSION || (metadata.height ?? 0) > MAX_DIMENSION;

  const pipeline = needsResize
    ? image.resize({
        width: MAX_DIMENSION,
        height: MAX_DIMENSION,
        fit: "inside",
        withoutEnlargement: true,
      })
    : image;

  const output = await pipeline.webp({ quality: 90 }).toBuffer({ resolveWithObject: true });

  return {
    buffer: output.data,
    width: output.info.width,
    height: output.info.height,
    format: "webp" as const,
  };
}
