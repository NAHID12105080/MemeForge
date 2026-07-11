"use server";

import { randomUUID } from "node:crypto";
import { createHash } from "node:crypto";

import { eq } from "drizzle-orm";

import { db } from "@/db/client";
import { media, memes } from "@/db/schema";
import { processUploadedImage } from "@/lib/image/sharp-pipeline";
import { buildStoragePath, writeUploadFile } from "@/lib/storage/upload-storage";
import { getSession } from "@/lib/auth/session";

const MAX_UPLOAD_BYTES = 15 * 1024 * 1024; // 15MB

export async function saveMemeThumbnailAction(memeId: string, formData: FormData) {
  const session = await getSession();
  if (!session) {
    throw new Error("Sign in to save a thumbnail.");
  }

  const existing = await db.query.memes.findFirst({ where: eq(memes.id, memeId) });
  if (!existing || existing.userId !== session.user.id) {
    throw new Error("Meme not found.");
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    throw new Error("No file provided.");
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("Thumbnail must be smaller than 15MB.");
  }

  const inputBuffer = Buffer.from(await file.arrayBuffer());
  const processed = await processUploadedImage(inputBuffer);

  const mediaId = randomUUID();
  const storagePath = buildStoragePath("export", session.user.id, mediaId, processed.format);
  const url = await writeUploadFile(storagePath, processed.buffer);
  const checksum = createHash("sha256").update(processed.buffer).digest("hex");

  await db.insert(media).values({
    id: mediaId,
    userId: session.user.id,
    kind: "export",
    storagePath: url,
    originalName: null,
    mimeType: "image/webp",
    width: processed.width,
    height: processed.height,
    sizeBytes: processed.buffer.byteLength,
    checksum,
  });

  await db.update(memes).set({ thumbnailUrl: url }).where(eq(memes.id, memeId));

  return { url };
}
