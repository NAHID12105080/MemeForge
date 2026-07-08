import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { user } from "./auth.schema";
import { memes } from "./memes.schema";

export const aiGenerations = pgTable("ai_generations", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  memeId: uuid("meme_id").references(() => memes.id, { onDelete: "set null" }),
  kind: text("kind", {
    enum: ["caption_generate", "caption_rewrite", "caption_translate", "humor_enhance"],
  }).notNull(),
  inputPrompt: text("input_prompt").notNull(),
  outputText: text("output_text"),
  provider: text("provider").notNull().default("claude"),
  model: text("model").notNull(),
  inputTokens: integer("input_tokens"),
  outputTokens: integer("output_tokens"),
  status: text("status", { enum: ["succeeded", "failed", "refused"] })
    .notNull()
    .default("succeeded"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
