import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { user } from "./auth.schema";

export const media = pgTable("media", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
  kind: text("kind", {
    enum: ["upload", "export", "avatar", "sticker", "template_asset"],
  }).notNull(),
  storagePath: text("storage_path").notNull(),
  originalName: text("original_name"),
  mimeType: text("mime_type").notNull(),
  width: integer("width"),
  height: integer("height"),
  sizeBytes: integer("size_bytes").notNull(),
  checksum: text("checksum"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
