import "server-only";

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const UPLOADS_ROOT = path.join(process.cwd(), "public", "uploads");

export type MediaKind = "upload" | "export" | "avatar" | "sticker" | "template_asset";

export function buildStoragePath(kind: MediaKind, userId: string, mediaId: string, ext: string) {
  const dir = kind === "avatar" ? "avatars" : `${kind}s`;
  const filename = kind === "avatar" ? `${userId}.${ext}` : `${mediaId}.${ext}`;
  return path.posix.join(dir, kind === "avatar" ? "" : userId, filename).replace(/\/+/g, "/");
}

export async function writeUploadFile(relativePath: string, buffer: Buffer) {
  const absolutePath = path.join(UPLOADS_ROOT, relativePath);
  await mkdir(path.dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, buffer);
  return `/uploads/${relativePath}`;
}
