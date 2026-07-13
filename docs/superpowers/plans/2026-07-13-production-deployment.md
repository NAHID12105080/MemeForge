# Production Deployment (Vercel + Neon + Backblaze B2) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Take MemeForge from "runs on my machine with docker-compose Postgres and local-disk uploads" to a production deployment on Vercel, with a managed Postgres database, object storage for uploads, and a GitHub Actions pipeline that runs CI on every PR and deploys (migrate-then-deploy) on every push to `main`.

**Architecture:** Vercel hosts the Next.js app (already a Next.js-verified deployment adapter). Neon provides managed Postgres — its **pooled** connection string is used by the running app (`DATABASE_URL`), since Vercel serverless functions can otherwise exhaust a small Postgres connection cap under concurrency; its **unpooled/direct** connection string is used only for running schema migrations, which PgBouncer transaction-mode pooling is not reliable for. Backblaze B2 (S3-compatible, free 10GB tier, no credit card required) replaces the current local-disk upload storage (`public/uploads`), which cannot work on Vercel — its filesystem is read-only/ephemeral per invocation, with no shared persistent volume across function instances. The bucket stays **private** — Backblaze gates the public-bucket toggle behind credit-card verification, same as every other provider evaluated — so the app generates **short-lived signed URLs** instead: one at upload time, and a fresh one every time a stored image is loaded again (editor pages, the marketing trending section), via a small `refreshMediaUrl` helper wired into those read paths. `src/lib/storage/upload-storage.ts` gets a B2 code path that only activates when B2 env vars are present, so local dev keeps working unchanged (local-disk fallback) without anyone needing a Backblaze account. Deploys are driven entirely by a GitHub Actions workflow using the Vercel CLI (`vercel build` + `vercel deploy --prebuilt`) rather than Vercel's own Git integration, so database migrations always finish before the new code that depends on them goes live — the two triggers would otherwise race.

**Tech Stack:** Next.js 16 (App Router, this repo's customized build — see `AGENTS.md`), Vercel, Neon (managed Postgres), Backblaze B2, `@aws-sdk/client-s3`, Drizzle ORM/Kit, GitHub Actions, pnpm.

## Global Constraints

- Package manager is pnpm (`pnpm-lock.yaml`, `pnpm-workspace.yaml`) — every command in this plan uses `pnpm`, not `npm`/`yarn`.
- Next.js 16.2.10 requires Node ≥ 20.9.0 (`node_modules/next/package.json`). This plan pins Node 22 (current LTS) everywhere — local `.nvmrc`, CI, and the Vercel project's Node version setting — so all three environments run identical Node.
- `sharp` and `pg` are already in Next.js's built-in `serverExternalPackages` auto-opt-out list (confirmed in `node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/serverExternalPackages.md`) — **no `next.config.ts` changes are needed** for either to work on Vercel. Do not add them there; it would be redundant.
- `src/lib/env.ts` eagerly runs `envSchema.parse(...)` at module import time. Every new required-in-some-environment variable this plan adds (the six `B2_*` vars) must be declared `.optional()` in the shared schema — making any of them non-optional would break `pnpm dev`, `pnpm test`, and CI for every contributor who hasn't set up Backblaze B2 locally. Production-only enforcement happens via the runtime branch in `upload-storage.ts` (Task 4) and the Vercel env var checklist (Task 6), not via the shared schema.
- Do **not** connect the Vercel project to the GitHub repo through Vercel's own Git integration (Task 6). The GitHub Actions workflow in Task 7 is the sole deploy trigger — it runs migrations before deploying. Vercel's Git integration would auto-deploy on push independently, racing the migration step and potentially serving new code against an unmigrated schema.
- Run tests with `pnpm test` (→ `vitest run`), typecheck with `pnpm typecheck`, lint with `pnpm lint`, per existing `package.json` scripts. No jsdom/DOM testing library is used anywhere in this repo's test suite — keep new tests to plain Vitest against pure functions, consistent with existing tests (`src/features/editor/lib/layers/layer-factory.test.ts`, `src/features/editor/store/editor-store.test.ts`).
- GitHub repo is `Nahid-NHB/MemeForge`.

## Known Gaps Out of Scope for This Plan

These are real production gaps, but they're not required to get a first safe production deploy live, and each deserves its own plan:

- **No transactional email provider.** `src/lib/auth/auth.ts` has a comment noting email/password accounts are auto-verified because no provider (e.g. Resend) is wired up. Password reset and email verification don't work in production until that's built.
- **No error monitoring or uptime alerting** (e.g. Sentry, a status-page/uptime pinger). Task 9's smoke test is manual and one-time.
- **No rate limiting** on auth or upload endpoints.
- **Neon backup verification.** Neon takes automatic backups on paid tiers; this plan does not include testing a restore.

---

### Task 1: Pin Node and pnpm versions for reproducible builds

**Files:**
- Modify: `package.json`
- Create: `.nvmrc`

**Interfaces:**
- Produces: `.nvmrc` containing `22`, and `package.json`'s `"engines"`/`"packageManager"` fields — Task 5 (CI workflow) and Task 6 (Vercel project settings) both read `.nvmrc` to select the Node version, so its content must be exactly `22` with no `v` prefix or trailing content beyond a newline.

- [ ] **Step 1: Confirm the currently installed pnpm version**

Run: `pnpm --version`

Expected: a version string like `10.33.2` (whatever pnpm actually reports on your machine — use that exact value in the next step, not the example).

- [ ] **Step 2: Add `engines` and `packageManager` to `package.json`**

Add this top-level key (use the real pnpm version from Step 1 in place of `10.33.2` if it differs):

```json
  "engines": {
    "node": ">=22.0.0"
  },
  "packageManager": "pnpm@10.33.2",
```

- [ ] **Step 3: Create `.nvmrc`**

```
22
```

- [ ] **Step 4: Verify install and typecheck still succeed**

Run: `pnpm install && pnpm typecheck`
Expected: both commands exit 0, no errors.

- [ ] **Step 5: Commit**

```bash
git add package.json .nvmrc
git commit -m "chore: pin Node 22 and pnpm version for reproducible builds"
```

---

### Task 2: Provision managed Postgres on Neon

This is an external account-setup task — no repo changes, no commit. Do it before Task 4/6/7, which all need the connection strings it produces.

- [ ] **Step 1: Create a Neon project**

Go to https://console.neon.tech, sign in, click **New Project**. Name it `memeforge-production`, choose a region close to where most users are, Postgres version 16 (matches `docker-compose.yml`'s `postgres:16-alpine`).

- [ ] **Step 2: Copy both connection strings**

On the project's **Connection Details** panel, there are two connection strings:
- **Pooled** (host ends in `-pooler`, e.g. `...-pooler.us-east-2.aws.neon.tech`) — this is the app's runtime `DATABASE_URL`.
- **Direct/unpooled** (no `-pooler` suffix) — this is used only for running migrations (Task 7). Neon's pooled endpoint runs PgBouncer in transaction mode, which is not reliable for schema-changing DDL.

Save both somewhere safe (a password manager, not a repo file) — you'll paste the pooled one into Vercel in Task 6 and the direct one into a GitHub Actions secret in Task 7.

- [ ] **Step 3: Verify connectivity and run the existing schema against it**

Run (substituting the **direct** connection string):

```bash
DATABASE_URL="<direct-connection-string>" BETTER_AUTH_SECRET=scratch BETTER_AUTH_URL=http://localhost:3000 NEXT_PUBLIC_APP_URL=http://localhost:3000 pnpm exec tsx scripts/db/migrate.ts
```

Expected output: `Migrations applied.` — this proves the direct connection string works and applies this repo's full migration history to the fresh Neon database before it's ever wired into Vercel.

---

### Task 3: Provision a Backblaze B2 bucket (private)

External account-setup task — no repo changes, no commit. Do it before Task 4. Backblaze B2's free tier (10GB storage, 1GB/day free egress) does not require a credit card at signup — this is the reason it replaces Cloudflare R2 in this plan.

> **Revision note:** Backblaze gates the private→public bucket toggle behind credit-card verification, which defeats the "no card" reason this provider was chosen. This task now deliberately keeps the bucket **private** and Task 4 generates short-lived signed URLs instead of using a permanent public URL — `B2_PUBLIC_URL` from the original version of this task is no longer used anywhere.

- [ ] **Step 1: Create a Backblaze account**

Go to <https://www.backblaze.com/sign-up/cloud-storage>, sign up with email, verify the email. No payment method is required to reach the B2 console.

- [ ] **Step 2: Create the bucket**

In the B2 console, go to **B2 Cloud Storage** → **Buckets** → **Create a Bucket**. Name it `memeforge-production-uploads` (bucket names are globally unique across *all* Backblaze accounts — if that's taken, append a random suffix and use that exact name consistently for the rest of this task). Set **Files in Bucket are:** `Private` (the default — do not attempt to switch this to Public; that's the card-gated action this revision avoids). Leave Default Encryption and Object Lock off.

- [ ] **Step 3: Copy the S3-compatible endpoint and region**

On the bucket page (or **Account** → **S3 Compatible API** info panel), Backblaze shows the S3-compatible endpoint for your bucket's region, in the form `https://s3.<region>.backblazeb2.com` (e.g. `https://s3.us-west-004.backblazeb2.com`). Copy the full URL — save as `B2_ENDPOINT`. Copy just the region segment (e.g. `us-west-004`) — save as `B2_REGION`.

- [ ] **Step 4: Create an Application Key scoped to this bucket**

**Account** → **App Keys** → **Add a New Application Key**. Name it `memeforge-production-uploads-key`. **Allow access to Bucket(s):** select `memeforge-production-uploads` only (not "All"). **Type of Access:** Read and Write. Create it, then save the two values it shows you exactly once:

- `keyID` → `B2_KEY_ID`
- `applicationKey` → `B2_APPLICATION_KEY`

You now have five values for Task 4/6: `B2_ENDPOINT`, `B2_REGION`, `B2_KEY_ID`, `B2_APPLICATION_KEY`, `B2_BUCKET_NAME` (`memeforge-production-uploads`). Save them somewhere safe (a password manager, not a repo file).

---

### Task 4: Migrate upload storage to Backblaze B2 (signed URLs, private bucket)

**Files:**
- Modify: `src/lib/env.ts`
- Modify: `.env.example`
- Modify: `src/lib/storage/upload-storage.ts`
- Create: `src/lib/storage/upload-storage.test.ts`
- Modify: `package.json` (add `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner` dependencies)

**Interfaces:**
- Consumes: nothing new from earlier tasks — this task only needs the five B2 values from Task 3, entered as local env vars for manual verification (Step 7) and later into Vercel (Task 6).
- Produces: `buildStoragePath` and `writeUploadFile` in `src/lib/storage/upload-storage.ts` keep their exact existing signatures (`buildStoragePath(kind, userId, mediaId, ext): string`, `writeUploadFile(relativePath, buffer): Promise<string>`) — `src/features/editor/actions/upload-layer-image.action.ts` and `src/features/editor/actions/save-meme-thumbnail.action.ts` both import these two functions and need zero changes. The URL `writeUploadFile` returns for B2 is now a **signed URL good for 6 days**, not a permanent one — Task 4b consumes the new `refreshMediaUrl(url): Promise<string>` export to keep it valid beyond that window. Also exports `isB2Configured(vars): boolean`, used internally and by this task's test.

Because the bucket is private, every URL handed to a browser must be signed. `writeUploadFile` signs once at upload time (good enough for immediate use in the editor session that just created it); `refreshMediaUrl` (used by Task 4b) re-signs a previously-stored URL whenever it's about to be shown again, which is what makes a signed URL usable indefinitely across page loads days or weeks apart.

- [ ] **Step 1: Write the failing test for the B2-vs-local-disk branch decision**

Create `src/lib/storage/upload-storage.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { isB2Configured, refreshMediaUrl } from "@/lib/storage/upload-storage";

describe("isB2Configured", () => {
  it("returns true when all five B2 vars are present", () => {
    expect(
      isB2Configured({
        B2_ENDPOINT: "https://s3.us-west-004.backblazeb2.com",
        B2_REGION: "us-west-004",
        B2_KEY_ID: "key",
        B2_APPLICATION_KEY: "secret",
        B2_BUCKET_NAME: "bucket",
      }),
    ).toBe(true);
  });

  it("returns false when any single B2 var is missing", () => {
    expect(
      isB2Configured({
        B2_ENDPOINT: "https://s3.us-west-004.backblazeb2.com",
        B2_REGION: "us-west-004",
        B2_KEY_ID: "key",
        B2_APPLICATION_KEY: "secret",
        B2_BUCKET_NAME: undefined,
      }),
    ).toBe(false);
  });

  it("returns false when no B2 vars are set (local dev default)", () => {
    expect(
      isB2Configured({
        B2_ENDPOINT: undefined,
        B2_REGION: undefined,
        B2_KEY_ID: undefined,
        B2_APPLICATION_KEY: undefined,
        B2_BUCKET_NAME: undefined,
      }),
    ).toBe(false);
  });
});

describe("refreshMediaUrl", () => {
  it("returns non-B2 URLs unchanged (local-disk dev fallback, B2 unconfigured in tests)", async () => {
    await expect(refreshMediaUrl("/uploads/uploads/user1/abc.webp")).resolves.toBe(
      "/uploads/uploads/user1/abc.webp",
    );
  });
});
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `pnpm test -- src/lib/storage/upload-storage.test.ts`
Expected: FAIL — `isB2Configured`/`refreshMediaUrl` are not exported (module doesn't exist yet at those export names).

- [ ] **Step 3: Add the B2 env vars to the shared schema**

In `src/lib/env.ts`, add five optional fields to `envSchema` (insert after `GITHUB_CLIENT_SECRET`):

```ts
  B2_ENDPOINT: z.string().url().optional(),
  B2_REGION: z.string().optional(),
  B2_KEY_ID: z.string().optional(),
  B2_APPLICATION_KEY: z.string().optional(),
  B2_BUCKET_NAME: z.string().optional(),
```

And add the matching five lines to the `envSchema.parse({...})` call (insert after `GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,`):

```ts
  B2_ENDPOINT: process.env.B2_ENDPOINT,
  B2_REGION: process.env.B2_REGION,
  B2_KEY_ID: process.env.B2_KEY_ID,
  B2_APPLICATION_KEY: process.env.B2_APPLICATION_KEY,
  B2_BUCKET_NAME: process.env.B2_BUCKET_NAME,
```

- [ ] **Step 4: Install the S3 client and presigner**

Run: `pnpm add @aws-sdk/client-s3 @aws-sdk/s3-request-presigner`

- [ ] **Step 5: Rewrite `src/lib/storage/upload-storage.ts`**

Replace the full file contents with:

```ts
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
```

`forcePathStyle: true` keeps the URL shape predictable (`<endpoint>/<bucket>/<key>?...signature...`), which is what `refreshMediaUrl` parses back apart — without it, the AWS SDK defaults to virtual-hosted-style (`<bucket>.<endpoint-host>/<key>`), which would break both the `url.startsWith(env.B2_ENDPOINT)` check and the key extraction.

Note: some AWS SDK v3 releases default to sending checksum headers (`x-amz-checksum-*`) that not every S3-compatible provider accepts. If Step 7 below fails with a checksum- or signature-related error from B2, add `requestChecksumCalculation: "WHEN_REQUIRED"` to the `S3Client` constructor options above and retry.

- [ ] **Step 6: Run the test to confirm it passes**

Run: `pnpm test -- src/lib/storage/upload-storage.test.ts`
Expected: PASS, 4 tests.

- [ ] **Step 7: Manually verify the B2 path against the real bucket from Task 3**

Run the dev server with the five B2 vars set (in addition to your normal `.env`), then sign in and upload a photo through the editor's "Upload your own" flow:

```bash
B2_ENDPOINT=<from-task-3> B2_REGION=<from-task-3> B2_KEY_ID=<from-task-3> B2_APPLICATION_KEY=<from-task-3> B2_BUCKET_NAME=memeforge-production-uploads pnpm dev
```

Expected: the uploaded image renders in the editor, and its URL (visible via browser devtools on the `<img>`/Konva image source, or by checking the `media` table's `storage_path` column) starts with your `B2_ENDPOINT` and includes `X-Amz-Signature=` in the query string. Confirm the object actually landed in the bucket via the Backblaze console's bucket file browser (its private-file preview there uses its own auth, separate from the signed URL your app generated).

Then re-run `pnpm dev` **without** the B2 vars and upload another photo — confirm it still works and its URL starts with `/uploads/`, proving the local-dev fallback is untouched.

- [ ] **Step 8: Add the B2 vars to `.env.example`**

Append to `.env.example`, after the `AI (Anthropic Claude)` section:

```
# File storage (Backblaze B2, private bucket + signed URLs) — leave all
# five unset for local dev; uploads fall back to public/uploads on local
# disk. Required in production (Vercel's filesystem has no persistent
# storage). See docs/superpowers/plans/2026-07-13-production-deployment.md Task 3.
B2_ENDPOINT=
B2_REGION=
B2_KEY_ID=
B2_APPLICATION_KEY=
B2_BUCKET_NAME=
```

- [ ] **Step 9: Full verification pass**

Run: `pnpm typecheck && pnpm lint && pnpm test`
Expected: all three exit 0.

- [ ] **Step 10: Commit**

```bash
git add src/lib/env.ts src/lib/storage/upload-storage.ts src/lib/storage/upload-storage.test.ts .env.example package.json pnpm-lock.yaml
git commit -m "feat(storage): add Backblaze B2 upload path with signed URLs, fall back to local disk in dev"
```

---

### Task 4b: Refresh signed B2 URLs wherever they're loaded

Private-bucket signed URLs expire; Task 4's `refreshMediaUrl` re-signs one, but nothing calls it yet. This task wires it into every place a stored image URL reaches a browser, and allowlists the B2 hostname for `next/image` (which otherwise refuses to load any remote image host not explicitly configured).

**Files:**
- Create: `src/features/editor/lib/layers/refresh-canvas-media-urls.ts`
- Create: `src/features/editor/lib/layers/refresh-canvas-media-urls.test.ts`
- Modify: `src/app/(editor)/editor/[memeId]/page.tsx`
- Modify: `src/app/(editor)/editor/new/page.tsx`
- Modify: `src/features/marketing/queries/get-landing-data.query.ts`
- Modify: `next.config.ts`

**Interfaces:**
- Consumes: `refreshMediaUrl(url: string): Promise<string>` from `src/lib/storage/upload-storage.ts` (Task 4).
- Produces: `refreshCanvasMediaUrls(canvasState: MemeCanvasState): Promise<MemeCanvasState>`, re-exported for use by both editor pages.

- [ ] **Step 1: Write the failing test**

Create `src/features/editor/lib/layers/refresh-canvas-media-urls.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { createImageLayer, createTextLayer } from "@/features/editor/lib/layers/layer-factory";
import { refreshCanvasMediaUrls } from "@/features/editor/lib/layers/refresh-canvas-media-urls";
import type { MemeCanvasState } from "@/features/editor/schemas/meme-canvas-state.schema";

describe("refreshCanvasMediaUrls", () => {
  it("resolves image layer URLs through refreshMediaUrl and leaves other layers untouched", async () => {
    const imageLayer = createImageLayer({
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      zIndex: 1,
      src: "/uploads/uploads/user1/abc.webp",
    });
    const textLayer = createTextLayer({ x: 0, y: 0, zIndex: 2 });
    const canvasState: MemeCanvasState = {
      version: 1,
      canvas: { width: 1080, height: 1080, backgroundColor: "#000000", backgroundImageMediaId: null },
      layers: [imageLayer, textLayer],
    };

    const result = await refreshCanvasMediaUrls(canvasState);

    // B2 is unconfigured in the test env, so refreshMediaUrl passes local-disk
    // URLs through unchanged — this asserts the mapping/passthrough wiring,
    // not B2's signing itself (already covered in upload-storage.test.ts).
    expect(result.layers[0]).toEqual(imageLayer);
    expect(result.layers[1]).toEqual(textLayer);
  });
});
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `pnpm test -- src/features/editor/lib/layers/refresh-canvas-media-urls.test.ts`
Expected: FAIL — module doesn't exist yet.

- [ ] **Step 3: Create `src/features/editor/lib/layers/refresh-canvas-media-urls.ts`**

```ts
import "server-only";

import type { MemeCanvasState } from "@/features/editor/schemas/meme-canvas-state.schema";
import { refreshMediaUrl } from "@/lib/storage/upload-storage";

export async function refreshCanvasMediaUrls(canvasState: MemeCanvasState): Promise<MemeCanvasState> {
  const layers = await Promise.all(
    canvasState.layers.map(async (layer) =>
      layer.type === "image" ? { ...layer, src: await refreshMediaUrl(layer.src) } : layer,
    ),
  );
  return { ...canvasState, layers };
}
```

- [ ] **Step 4: Run the test to confirm it passes**

Run: `pnpm test -- src/features/editor/lib/layers/refresh-canvas-media-urls.test.ts`
Expected: PASS, 1 test.

- [ ] **Step 5: Call it from the existing-meme editor page**

In `src/app/(editor)/editor/[memeId]/page.tsx`, add the import:

```ts
import { refreshCanvasMediaUrls } from "@/features/editor/lib/layers/refresh-canvas-media-urls";
```

Then replace:

```ts
  const canvasState = memeCanvasStateSchema.parse(meme.canvasState);
```

with:

```ts
  const canvasState = await refreshCanvasMediaUrls(memeCanvasStateSchema.parse(meme.canvasState));
```

- [ ] **Step 6: Call it from the new-meme editor page's template branch**

In `src/app/(editor)/editor/new/page.tsx`, add the same import, then replace:

```ts
      const canvasState = memeCanvasStateSchema.parse(template.canvasState);
      return <EditorShell memeId={null} title={template.name} canvasState={canvasState} />;
```

with:

```ts
      const canvasState = await refreshCanvasMediaUrls(memeCanvasStateSchema.parse(template.canvasState));
      return <EditorShell memeId={null} title={template.name} canvasState={canvasState} />;
```

(The `BLANK_CANVAS_STATE` fallback path below it has no image layers — leave it as-is.)

- [ ] **Step 7: Refresh thumbnail URLs in the marketing landing query**

In `src/features/marketing/queries/get-landing-data.query.ts`, add the import:

```ts
import { refreshMediaUrl } from "@/lib/storage/upload-storage";
```

Then replace the body of `getTrendingMemes`:

```ts
export async function getTrendingMemes(limit = 12) {
  return db.query.memes.findMany({
    where: eq(memes.visibility, "public"),
    orderBy: [desc(memes.likeCount), desc(memes.publishedAt)],
    limit,
    with: {
      user: { columns: { name: true, username: true, image: true } },
    },
  });
}
```

with:

```ts
export async function getTrendingMemes(limit = 12) {
  const rows = await db.query.memes.findMany({
    where: eq(memes.visibility, "public"),
    orderBy: [desc(memes.likeCount), desc(memes.publishedAt)],
    limit,
    with: {
      user: { columns: { name: true, username: true, image: true } },
    },
  });
  return Promise.all(
    rows.map(async (row) => ({
      ...row,
      thumbnailUrl: row.thumbnailUrl ? await refreshMediaUrl(row.thumbnailUrl) : row.thumbnailUrl,
    })),
  );
}
```

- [ ] **Step 8: Allowlist the B2 hostname for `next/image`**

`MemeCard` (`src/components/composed/meme-card.tsx`) renders `thumbnailUrl`/`exportedImageUrl` through `next/image`, which refuses to load a remote URL whose hostname isn't explicitly allowed — this predates the B2 work but was never hit until now, since local-disk `/uploads/...` URLs are same-origin and don't need allowlisting.

Replace the full contents of `next.config.ts` with (substituting the **exact hostname** from your own `B2_ENDPOINT` value in Task 3 Step 3, e.g. `s3.us-west-004.backblazeb2.com` — not a wildcard):

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "<your-B2_ENDPOINT-hostname-here>",
        pathname: "/<your-B2_BUCKET_NAME-here>/**",
      },
    ],
  },
};

export default nextConfig;
```

- [ ] **Step 9: Full verification pass**

Run: `pnpm typecheck && pnpm lint && pnpm test`
Expected: all three exit 0.

- [ ] **Step 10: Manually verify end-to-end**

With the five B2 vars set (as in Task 4 Step 7):
1. Start a meme from an uploaded photo, save it, note the URL.
2. Reload the editor page for that meme (`/editor/<memeId>`). Expected: the image still renders, and its signed-URL query string differs from the first load's (proving it was freshly re-signed, not reused).
3. If you have a public meme with a thumbnail, load the marketing homepage and confirm its trending section renders that thumbnail through `next/image` without a console error about an unconfigured image host.

- [ ] **Step 11: Commit**

```bash
git add src/features/editor/lib/layers/refresh-canvas-media-urls.ts src/features/editor/lib/layers/refresh-canvas-media-urls.test.ts "src/app/(editor)/editor/[memeId]/page.tsx" "src/app/(editor)/editor/new/page.tsx" src/features/marketing/queries/get-landing-data.query.ts next.config.ts
git commit -m "feat(storage): refresh signed B2 URLs at read time, allowlist B2 host for next/image"
```

---

### Task 5: Add a GitHub Actions CI workflow

**Files:**
- Create: `.github/workflows/ci.yml`

**Interfaces:**
- Consumes: `.nvmrc` from Task 1 (Node version source of truth).

- [ ] **Step 1: Create the workflow file**

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  pull_request:
  push:
    branches: [main]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_USER: memeforge
          POSTGRES_PASSWORD: memeforge
          POSTGRES_DB: memeforge
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 5s
          --health-timeout 5s
          --health-retries 10
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4

      - uses: actions/setup-node@v4
        with:
          node-version-file: ".nvmrc"
          cache: "pnpm"

      - run: pnpm install --frozen-lockfile

      - run: pnpm lint

      - run: pnpm typecheck

      - run: pnpm test

      - run: pnpm exec tsx scripts/db/migrate.ts
        env:
          DATABASE_URL: postgresql://memeforge:memeforge@localhost:5432/memeforge
          BETTER_AUTH_SECRET: ci-build-placeholder-not-used-at-runtime
          BETTER_AUTH_URL: http://localhost:3000
          NEXT_PUBLIC_APP_URL: http://localhost:3000

      - run: pnpm build
        env:
          DATABASE_URL: postgresql://memeforge:memeforge@localhost:5432/memeforge
          BETTER_AUTH_SECRET: ci-build-placeholder-not-used-at-runtime
          BETTER_AUTH_URL: http://localhost:3000
          NEXT_PUBLIC_APP_URL: http://localhost:3000
```

(The migration step is required: `pnpm build` prerenders the marketing homepage, which queries the `templates` table — without migrating first, the CI Postgres service container has no schema and the build fails with `relation "templates" does not exist`.)

- [ ] **Step 2: Verify it locally as much as possible**

Run: `pnpm lint && pnpm typecheck && pnpm test && DATABASE_URL=postgresql://memeforge:memeforge@localhost:5433/memeforge BETTER_AUTH_SECRET=x BETTER_AUTH_URL=http://localhost:3000 NEXT_PUBLIC_APP_URL=http://localhost:3000 pnpm build`

(Uses your existing docker-compose Postgres on port 5433, since that's what's already running locally — the workflow itself uses port 5432 inside its own isolated service container.)

Expected: all four commands exit 0.

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: add GitHub Actions workflow for lint, typecheck, test, build"
```

- [ ] **Step 4: Push and confirm the workflow runs**

Push this branch and open a PR. Expected: a "CI / build-and-test" check appears on the PR and goes green within a few minutes. If it fails, read the failing step's log — do not proceed to Task 6 until this is green on a real PR.

---

### Task 6: Create the Vercel project and deploy manually once

External setup + one manual deploy to prove the configuration end-to-end before automating it in Task 7. No repo changes, no commit.

- [ ] **Step 1: Install the Vercel CLI and log in**

```bash
pnpm add -g vercel@latest
vercel login
```

- [ ] **Step 2: Link the project without connecting Git**

From the repo root:

```bash
vercel link
```

Answer the prompts: create a new project, name it `memeforge`, do **not** accept any offer to connect a Git repository (skip/decline it — see the Global Constraints note on why). This creates `.vercel/project.json` locally (already covered by the default Next.js `.gitignore` — confirm with `git check-ignore -v .vercel/project.json`; if it's not ignored, add `.vercel` to `.gitignore` before proceeding).

- [ ] **Step 3: Set every production environment variable**

Run `vercel env add <NAME> production` once per variable below, pasting the value when prompted:

| Variable | Value |
|---|---|
| `DATABASE_URL` | Neon **pooled** connection string (Task 2) |
| `BETTER_AUTH_SECRET` | Output of `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | `https://memeforge.vercel.app` (Vercel's default domain for now — updated in Task 8) |
| `NEXT_PUBLIC_APP_URL` | same value as `BETTER_AUTH_URL` |
| `ANTHROPIC_API_KEY` | your existing key from local `.env` |
| `B2_ENDPOINT` | Task 3 |
| `B2_REGION` | Task 3 |
| `B2_KEY_ID` | Task 3 |
| `B2_APPLICATION_KEY` | Task 3 |
| `B2_BUCKET_NAME` | `memeforge-production-uploads` |

`GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`/`GITHUB_CLIENT_ID`/`GITHUB_CLIENT_SECRET` are optional — only add them if you want social login live at launch; each provider's redirect URI must point at whatever domain you land on (revisit after Task 8).

- [ ] **Step 4: Set the Node version**

Vercel project dashboard → **Settings** → **General** → **Node.js Version** → select **22.x** (matches `.nvmrc` from Task 1).

- [ ] **Step 5: Build and deploy once, by hand**

```bash
vercel pull --yes --environment=production
vercel build --prod
vercel deploy --prebuilt --prod
```

Expected: the final command prints a production URL (`https://memeforge.vercel.app` or similar). Open it.

- [ ] **Step 6: Smoke-check the manual deploy**

Visit the printed URL. Expected: the marketing homepage renders. Sign up for a new account (email/password) and confirm you land on the dashboard — this exercises `DATABASE_URL` and `BETTER_AUTH_SECRET`/`BETTER_AUTH_URL` together. If sign-up fails, check `vercel logs <deployment-url>` before touching anything else — it's almost always a missing/wrong env var at this stage.

---

### Task 7: Automate migrate-then-deploy in GitHub Actions

**Files:**
- Modify: `package.json` (add a CI-specific migrate script)
- Create: `.github/workflows/deploy.yml`

**Interfaces:**
- Consumes: the manual deploy recipe proven in Task 6 Step 5; the Neon **unpooled** connection string from Task 2.

- [ ] **Step 1: Add a CI-safe migrate script**

`package.json`'s existing `db:migrate` script is `tsx --env-file=.env scripts/db/migrate.ts` — it requires a literal `.env` file on disk, which won't exist in CI (GitHub Actions injects env vars directly into the process, not via a file, and Node's `--env-file` flag errors if the named file is missing). Add a second script that skips `--env-file`, next to the existing `db:migrate` line in `package.json`:

```json
    "db:migrate:ci": "tsx scripts/db/migrate.ts",
```

- [ ] **Step 2: Verify the new script works with plain env vars**

Run (substituting the Neon **direct/unpooled** string from Task 2):

```bash
DATABASE_URL="<direct-connection-string>" BETTER_AUTH_SECRET=scratch BETTER_AUTH_URL=http://localhost:3000 NEXT_PUBLIC_APP_URL=http://localhost:3000 pnpm db:migrate:ci
```

Expected: `Migrations applied.` (This will be a no-op re-run against the same database you already migrated in Task 2 Step 3 — expected to succeed with nothing new to apply.)

- [ ] **Step 3: Add repository secrets**

GitHub repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**, one per row:

| Secret | Value |
|---|---|
| `PROD_DATABASE_URL_UNPOOLED` | Neon **direct/unpooled** connection string (Task 2) |
| `BETTER_AUTH_SECRET` | same value you set in Vercel (Task 6 Step 3) |
| `BETTER_AUTH_URL` | same value you set in Vercel |
| `NEXT_PUBLIC_APP_URL` | same value you set in Vercel |
| `VERCEL_TOKEN` | Vercel dashboard → Account Settings → Tokens → Create |
| `VERCEL_ORG_ID` | from `.vercel/project.json` (created in Task 6 Step 2) — `orgId` field |
| `VERCEL_PROJECT_ID` | from `.vercel/project.json` — `projectId` field |

- [ ] **Step 4: Create the deploy workflow**

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4

      - uses: actions/setup-node@v4
        with:
          node-version-file: ".nvmrc"
          cache: "pnpm"

      - run: pnpm install --frozen-lockfile

      - name: Run database migrations
        run: pnpm db:migrate:ci
        env:
          DATABASE_URL: ${{ secrets.PROD_DATABASE_URL_UNPOOLED }}
          BETTER_AUTH_SECRET: ${{ secrets.BETTER_AUTH_SECRET }}
          BETTER_AUTH_URL: ${{ secrets.BETTER_AUTH_URL }}
          NEXT_PUBLIC_APP_URL: ${{ secrets.NEXT_PUBLIC_APP_URL }}

      - run: pnpm add -g vercel@latest

      - name: Pull Vercel project settings
        run: vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}
        env:
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}

      - name: Build
        run: vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}
        env:
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}

      - name: Deploy prebuilt output
        run: vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}
        env:
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
```

- [ ] **Step 5: Commit**

```bash
git add package.json .github/workflows/deploy.yml
git commit -m "ci: automate migrate-then-deploy to Vercel on push to main"
```

- [ ] **Step 6: Merge to main and watch it run**

Open a PR with this branch, wait for the `CI` workflow (Task 5) to go green, merge it. Expected: the `Deploy` workflow starts on the merge commit, the migration step logs `Migrations applied.`, and the final `vercel deploy` step prints the same production URL as Task 6. Visit it and confirm the app still works.

---

### Task 8: Point a custom domain at production

External setup task — no repo changes except updating already-deployed env vars (done via `vercel env`, not a commit). Skip this task entirely if you're launching on the `*.vercel.app` URL for now.

- [ ] **Step 1: Add the domain in Vercel**

Project dashboard → **Settings** → **Domains** → add your domain (e.g. `memeforge.app`). Vercel shows the exact DNS records to create (an `A` record for the apex domain, or a `CNAME` for a subdomain like `www`).

- [ ] **Step 2: Create the DNS records**

At your domain registrar/DNS provider, add exactly the records Vercel showed in Step 1. Wait for Vercel's dashboard to show the domain as **Valid Configuration** (DNS propagation can take a few minutes to a few hours) — it also automatically issues a TLS certificate once verified.

- [ ] **Step 3: Update the two URL env vars to the real domain**

```bash
vercel env rm BETTER_AUTH_URL production
vercel env add BETTER_AUTH_URL production
# paste: https://memeforge.app

vercel env rm NEXT_PUBLIC_APP_URL production
vercel env add NEXT_PUBLIC_APP_URL production
# paste: https://memeforge.app
```

Also update the two matching GitHub Actions secrets (`BETTER_AUTH_URL`, `NEXT_PUBLIC_APP_URL`) to the same value, so the next CD run's migration step (Task 7) uses a consistent value — `scripts/db/migrate.ts` imports `env`, which validates this as a required URL even though the migration itself never uses it.

- [ ] **Step 4: Update OAuth redirect URIs, if configured**

Only if you added `GOOGLE_CLIENT_ID`/`GITHUB_CLIENT_ID` in Task 6: update each provider's authorized redirect URI to `https://memeforge.app/api/auth/callback/google` (or `/github`) in the Google Cloud Console / GitHub OAuth App settings — the old `*.vercel.app` callback URL will now be rejected by Better Auth's origin check.

- [ ] **Step 5: Redeploy so the new env vars take effect**

Push any commit to `main` (or re-run the `Deploy` workflow manually via the Actions tab's "Re-run jobs"). Vercel env var changes only apply to new deployments, not retroactively to the currently-live one.

- [ ] **Step 6: Verify**

Visit `https://memeforge.app`. Confirm TLS (padlock, no browser warning) and that sign-in still works.

---

### Task 9: Production smoke test and rollback plan

Verification-only task — no repo changes, no commit. This is the final gate before calling the deploy done.

- [ ] **Step 1: Walk the golden path on the real production URL**

In order, on the actual production domain (not localhost):
1. Sign up for a new account.
2. Browse the template gallery; start a meme from a template.
3. Add a text layer, an emoji, a shape; drag, resize, rotate each.
4. Use the "Upload your own" tile to start a second meme from an uploaded photo — confirm the Base photo layer appears locked. This is the end-to-end proof that B2 (Task 4) works in production, since local-disk fallback is unreachable there.
5. Enter Crop mode on an image layer, apply a crop.
6. Export the meme (Download PNG). Confirm the file downloads and opens correctly.
7. Save the meme, reload the page, confirm it persists (proves `DATABASE_URL` round-trips correctly).
8. Sign out, sign back in.

Expected: every step works with no console errors (check browser devtools).

- [ ] **Step 2: Confirm migrations match what's live**

Run: `vercel logs <production-url> --since=1h` (or check the `Deploy` workflow's run log from Task 7 Step 6) and confirm the `Run database migrations` step shows `Migrations applied.` with no errors on the deployment currently serving traffic.

- [ ] **Step 3: Document the rollback procedure**

If a deploy breaks production:
- **App code:** Vercel dashboard → **Deployments** → find the last known-good deployment → **⋯** → **Promote to Production**. This is instant and doesn't require a new build.
- **Database schema:** Drizzle migrations are forward-only — there is no automatic rollback. If a bad migration already ran, the fix is a new forward migration that corrects it (e.g. `pnpm db:generate` for a corrective change), not reverting Vercel. This is exactly why Task 7's migrate-then-deploy ordering matters: a promoted-back app version must still be compatible with whatever schema is currently live. Favor additive migrations (new nullable columns, new tables) over destructive ones (dropped/renamed columns) to keep old and new app versions compatible with the same schema during a rollback window.

---

## Self-Review

**Spec coverage:** Hosting (Vercel, Task 6/7) ✓. Managed Postgres (Neon, Task 2, pooled-vs-unpooled handled explicitly) ✓. File storage conflict resolved twice over — migrated to Backblaze B2 (no credit card required at signup, unlike R2), then revised again when the public-bucket toggle itself turned out to be card-gated: bucket stays private, signed URLs generated at write time (Task 4) and refreshed at every read time (Task 4b), local-dev fallback preserved throughout ✓. CI/CD via GitHub Actions, both the test gate (Task 5) and the deploy pipeline with correct migrate-then-deploy ordering (Task 7) ✓. Domain (Task 8) and a documented rollback plan (Task 9) included even though not explicitly asked for, since "deploy to production" implies both.

**Placeholder scan:** No TBD/TODO markers; every code block is complete, runnable content; every command has a stated expected result. Task 4b Step 8's `next.config.ts` snippet has a literal placeholder value for the hostname/pathname — flagged inline as something to substitute with the real Task 3 value, not left ambiguous about what goes there or why.

**Type consistency:** `buildStoragePath`/`writeUploadFile` signatures in Task 4 exactly match their current call sites in `upload-layer-image.action.ts` and `save-meme-thumbnail.action.ts` (unchanged — verified by reading both files during planning). `isB2Configured` (5 vars, `B2_PUBLIC_URL` fully removed from schema, test, `.env.example`, and Task 6's env table) and `refreshMediaUrl` are used identically everywhere they appear. `refreshCanvasMediaUrls` (Task 4b) consumes `refreshMediaUrl` with the exact signature Task 4 produces — verified against both files' final text.

**Known limitation (not a gap — a deliberate tradeoff):** signed URLs are refreshed on every server-rendered page load, which covers the editor and the marketing trending section. A URL captured client-side and left open in a browser tab for more than 6 days without a reload would 403 — acceptable for a first production deploy; revisit if that becomes a real complaint.
