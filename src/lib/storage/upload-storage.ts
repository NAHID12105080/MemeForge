import "server-only";

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { env } from "@/lib/env";

const UPLOADS_ROOT = path.join(process.cwd(), "public", "uploads");
// SigV4 query-string signing has a hard 7-day maximum; 6 days leaves margin.
const SIGNED_URL_EXPIRY_SECONDS = 60 * 60 * 24 * 6;

export type MediaKind = "upload" | "export" | "avatar" | "sticker" | "template_asset";

type B2EnvVars = Pick<
  typeof env,
  "B2_ENDPOINT" | "B2_REGION" | "B2_KEY_ID" | "B2_APPLICATION_KEY" | "B2_BUCKET_NAME"
>;

export function isB2Configured(vars: B2EnvVars): boolean {
  return Boolean(
    vars.B2_ENDPOINT && vars.B2_REGION && vars.B2_KEY_ID && vars.B2_APPLICATION_KEY && vars.B2_BUCKET_NAME,
  );
}

const b2Client = isB2Configured(env)
  ? new S3Client({
      region: env.B2_REGION!,
      endpoint: env.B2_ENDPOINT,
      forcePathStyle: true,
      credentials: {
        accessKeyId: env.B2_KEY_ID!,
        secretAccessKey: env.B2_APPLICATION_KEY!,
      },
    })
  : null;

function signKey(key: string): Promise<string> {
  const command = new GetObjectCommand({ Bucket: env.B2_BUCKET_NAME!, Key: key });
  return getSignedUrl(b2Client!, command, { expiresIn: SIGNED_URL_EXPIRY_SECONDS });
}

export function buildStoragePath(kind: MediaKind, userId: string, mediaId: string, ext: string) {
  const dir = kind === "avatar" ? "avatars" : `${kind}s`;
  const filename = kind === "avatar" ? `${userId}.${ext}` : `${mediaId}.${ext}`;
  return path.posix.join(dir, kind === "avatar" ? "" : userId, filename).replace(/\/+/g, "/");
}

export async function writeUploadFile(relativePath: string, buffer: Buffer) {
  if (b2Client) {
    await b2Client.send(
      new PutObjectCommand({
        Bucket: env.B2_BUCKET_NAME!,
        Key: relativePath,
        Body: buffer,
        ContentType: "image/webp",
      }),
    );
    return signKey(relativePath);
  }

  const absolutePath = path.join(UPLOADS_ROOT, relativePath);
  await mkdir(path.dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, buffer);
  return `/uploads/${relativePath}`;
}

// The bucket is private, so every URL writeUploadFile() hands out expires.
// Call this whenever a previously-stored URL is about to be shown to a
// browser again (a page load, not the original upload) to get a fresh one —
// cheap, and safe to call unconditionally even if the old signature hasn't
// expired yet. Local-disk URLs and anything that isn't one of ours pass
// through unchanged.
export async function refreshMediaUrl(url: string): Promise<string> {
  if (!b2Client || !env.B2_ENDPOINT || !url.startsWith(env.B2_ENDPOINT)) return url;

  const bucketPrefix = `/${env.B2_BUCKET_NAME}/`;
  const pathname = new URL(url).pathname;
  const prefixIndex = pathname.indexOf(bucketPrefix);
  if (prefixIndex === -1) return url;

  const key = decodeURIComponent(pathname.slice(prefixIndex + bucketPrefix.length));
  return signKey(key);
}
