import {
  type AnyPgColumn,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { user } from "./auth.schema";
import { tags } from "./categories.schema";
import { templates } from "./templates.schema";

export const memes = pgTable("memes", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  title: text("title").notNull().default("Untitled meme"),
  slug: text("slug").notNull().unique(),
  canvasState: jsonb("canvas_state").notNull(),
  width: integer("width").notNull(),
  height: integer("height").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  exportedImageUrl: text("exported_image_url"),
  status: text("status", { enum: ["draft", "published"] })
    .notNull()
    .default("draft"),
  visibility: text("visibility", { enum: ["private", "unlisted", "public"] })
    .notNull()
    .default("private"),
  templateId: uuid("template_id").references(() => templates.id, { onDelete: "set null" }),
  remixOfMemeId: uuid("remix_of_meme_id").references((): AnyPgColumn => memes.id, {
    onDelete: "set null",
  }),
  viewCount: integer("view_count").notNull().default(0),
  likeCount: integer("like_count").notNull().default(0),
  commentCount: integer("comment_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  publishedAt: timestamp("published_at"),
});

export const memeTags = pgTable(
  "meme_tags",
  {
    memeId: uuid("meme_id")
      .notNull()
      .references(() => memes.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.memeId, t.tagId] })],
);
