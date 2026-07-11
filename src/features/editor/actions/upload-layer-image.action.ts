"use server";

import { randomUUID } from "node:crypto";
import { createHash } from "node:crypto";

import { db } from "@/db/client";
import { media } from "@/db/schema";
import { processUploadedImage } from "@/lib/image/sharp-pipeline";
import { buildStoragePath, writeUploadFile } from "@/lib/storage/upload-storage";
import { getSession } from "@/lib/auth/session";

const MAX_UPLOAD_BYTES = 15 * 1024 * 1024; // 15MB

export async function uploadLayerImageAction(formData: FormData) {
  const session = await getSession();
  if (!session) {
    throw new Error("Sign in to upload images.");
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    throw new Error("No file provided.");
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("Image must be smaller than 15MB.");
  }
  if (!file.type.startsWith("image/")) {
    throw new Error("Only image files are supported.");
  }

  const inputBuffer = Buffer.from(await file.arrayBuffer());
  const processed = await processUploadedImage(inputBuffer);

  const mediaId = randomUUID();
  const storagePath = buildStoragePath("upload", session.user.id, mediaId, processed.format);
  const url = await writeUploadFile(storagePath, processed.buffer);
  const checksum = createHash("sha256").update(processed.buffer).digest("hex");

  await db.insert(media).values({
    id: mediaId,
    userId: session.user.id,
    kind: "upload",
    storagePath: url,
    originalName: file.name,
    mimeType: "image/webp",
    width: processed.width,
    height: processed.height,
    sizeBytes: processed.buffer.byteLength,
    checksum,
  });

  return { mediaId, url, width: processed.width, height: processed.height };
}
