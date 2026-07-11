# Editor enhancement

## Context

The editor (Konva-based canvas, `src/features/editor/`) is significantly
more built than it first appeared: multiple text layers, drag/resize/rotate
via Konva Transformer, custom Google Fonts, font weight, text align, color
picker, stroke/outline, shadow, glow, gradient fill, image upload with
drag-drop/paste, image filters, shape tool, emoji stickers, a layers panel
with lock/hide/reorder/group, opacity, blend modes, undo/redo (50-step
history), keyboard shortcuts (delete, duplicate mod+d, undo/redo,
select-all, escape, arrow-nudge with shift=10px), zoom/pan, and a
templates→editor flow (`/editor/new?template=slug`). A large pile of this
is implemented but uncommitted.

Real gaps, addressed below as B1-B6.

## B1 — Commit existing work

The uncommitted changes (image upload action, drag/drop/paste, image
filters, shapes popover, emoji picker, font picker, color picker, the
properties-panel split into per-type panels) already typecheck and lint
clean. Committed as-is, no rework.

## B2 — Text styling completion

`textLayerSchema` already has `fontStyle: "normal" | "italic"` but no UI
toggle for it, and has no `underline` field at all.

- Schema: add `underline: z.boolean().default(false)` to `textLayerSchema`.
- UI: a Bold/Italic/Underline `ToggleGroup` (type="multiple") in
  `TextPropertiesPanel`, near the existing Weight/Alignment controls. Bold
  toggles `fontWeight` between 400/700 (the existing Weight dropdown
  remains for finer control — the two don't conflict, the toggle is just a
  fast path for the common case).
- Rendering: `text-layer-node.tsx` maps `fontStyle`+`fontWeight` to Konva's
  combinable `fontStyle` string (`"italic"`, `"bold"`, `"bold italic"`,
  `"normal"`) and sets `textDecoration: "underline"` when the flag is set.

## B3 — Multi-layer alignment & distribution

No alignment tooling exists today beyond raw X/Y number inputs.

- Store actions: `alignSelected(edge)` where edge is one of
  `left | center-h | right | top | center-v | bottom`, and
  `distributeSelected(axis: "horizontal" | "vertical")`.
- Behavior: with exactly one layer selected, align against the canvas
  bounds (fast path for "center this text on the meme"). With 2+ selected,
  align against the selection's combined bounding box (standard
  multi-select alignment, matches Figma/Canva conventions users already
  know). Distribute requires 3+ selected layers and spaces them evenly
  between the two extreme layers on the chosen axis.
- UI: new `AlignmentToolbar` component (icon buttons), shown in the
  properties panel whenever `selectedLayerIds.length >= 1`.

## B4 — Canvas resize

No way to change the meme's canvas dimensions after creation today — fixed
at whatever `BLANK_CANVAS_STATE` or the source template set.

- Store action: `resizeCanvas(width, height)`.
- UI: small panel/popover with common presets (1:1 1080x1080, 4:5 1080x1350,
  9:16 1080x1920, 16:9 1920x1080) plus custom width/height number inputs.
  Resizing does not reposition or rescale existing layers — it changes the
  canvas frame only, consistent with how most meme/design tools behave and
  simplest to reason about; the user can reposition layers afterward if
  needed.

## B5 — High-quality export

`src/features/editor/lib/export/` exists but is empty. `memes` already has
`exportedImageUrl` and `thumbnailUrl` columns; `sharp-pipeline.ts` and
`upload-storage.ts` exist but are unused.

- `lib/export/rasterize-stage.ts` — client util: given the live Konva
  `Stage` node, returns a `Blob` at a chosen mime type
  (`image/png` | `image/jpeg`) and quality, using `stage.toDataURL()`.
- `lib/export/download-blob.ts` — client util: triggers a browser download
  via a temporary `<a>` link.
- The `Stage` ref moves from a local ref inside `EditorCanvas` to a
  mutable field on the editor store (`stageNode`, set imperatively, not
  part of undo/redo history) so `EditorTopBar` can reach it without prop
  drilling.
- `EditorTopBar`: a Download control with a PNG/JPEG format choice,
  rasterizing at native resolution and triggering a download. Works
  without saving first — it reads the live canvas, not the DB.
- New server action `saveMemeThumbnailAction(memeId, formData)`, modeled
  directly on the existing `uploadLayerImageAction` — takes a `File`, runs
  it through `processUploadedImage` (sharp → webp, resized), writes it via
  `writeUploadFile`, inserts a `media` row (`kind: "export"`), and updates
  `memes.thumbnailUrl`.
- `EditorTopBar.handleSave`: after `saveMemeAction` succeeds, rasterizes
  the stage at a small pixel ratio (~0.3) and calls
  `saveMemeThumbnailAction`, fire-and-forget with errors caught and logged
  (never toasted) — thumbnail generation must never block or fail the
  primary save.

## B6 — Mobile / touch responsive layout

The current layout is a fixed three-column flex (`w-64` side panels) that
does not adapt below desktop widths.

- `EditorShell`: below a breakpoint, `LayersPanel` and `PropertiesPanel`
  move from fixed side columns into `Sheet`/`Drawer` overlays (using the
  already-installed `vaul`), triggered by buttons in the top bar.
- `EditorTopBar`: secondary controls (zoom, undo/redo) collapse into an
  overflow menu on narrow screens; Save and Download stay visible.
- Canvas touch: drag/resize/rotate already work via Konva's built-in
  pointer-event normalization (Transformer supports touch out of the box).
  The one net-new piece is pinch-to-zoom, added as a two-pointer gesture
  handler on the `Stage`'s touch events, updating `viewport.zoom` the same
  way the existing wheel handler does.
- Limitation: I can't test on a physical touch device. Verification is via
  Chrome DevTools device emulation (touch simulation), which exercises the
  gesture math but not real-device feel. Flagged as a known gap, not
  silently assumed to be fully validated.

## Testing / verification

No meaningful unit-test surface for canvas/gesture code. Verified by
running the dev server and driving it in-browser for each unit: add every
layer type, exercise text styling toggles, align/distribute a multi-select,
resize the canvas, download PNG and JPEG and open the files, save and
confirm a thumbnail lands in `public/uploads/exports/` with
`memes.thumbnailUrl` set, and check the responsive layout at mobile
viewport widths via DevTools emulation.

## Commit plan

One commit per section, each independently working and typechecked,
following the existing `feat(editor): ...` convention:

1. `feat(editor): add image upload, filters, and shape/emoji pickers`
2. `feat(editor): add bold/italic/underline text styling`
3. `feat(editor): add multi-layer alignment and distribution`
4. `feat(editor): add canvas resize with presets`
5. `feat(editor): add PNG/JPEG export and save thumbnails`
6. `feat(editor): make editor layout responsive with touch support`
