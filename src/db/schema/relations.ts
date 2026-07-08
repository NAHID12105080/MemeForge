import { relations } from "drizzle-orm";

import { user } from "./auth.schema";
import { categories, tags } from "./categories.schema";
import { templates, templateTags } from "./templates.schema";
import { memes, memeTags } from "./memes.schema";
import { media } from "./media.schema";
import { likes, bookmarks, comments, follows } from "./social.schema";
import { collections, collectionItems } from "./collections.schema";
import { aiGenerations } from "./ai.schema";

export const userRelations = relations(user, ({ many }) => ({
  memes: many(memes),
  templates: many(templates),
  comments: many(comments),
  likes: many(likes),
  bookmarks: many(bookmarks),
  collections: many(collections),
  media: many(media),
  aiGenerations: many(aiGenerations),
  followers: many(follows, { relationName: "following" }),
  following: many(follows, { relationName: "follower" }),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
    relationName: "subcategories",
  }),
  subcategories: many(categories, { relationName: "subcategories" }),
  templates: many(templates),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  templateTags: many(templateTags),
  memeTags: many(memeTags),
}));

export const templatesRelations = relations(templates, ({ one, many }) => ({
  category: one(categories, {
    fields: [templates.categoryId],
    references: [categories.id],
  }),
  createdBy: one(user, {
    fields: [templates.createdByUserId],
    references: [user.id],
  }),
  templateTags: many(templateTags),
  memes: many(memes),
}));

export const templateTagsRelations = relations(templateTags, ({ one }) => ({
  template: one(templates, {
    fields: [templateTags.templateId],
    references: [templates.id],
  }),
  tag: one(tags, {
    fields: [templateTags.tagId],
    references: [tags.id],
  }),
}));

export const memesRelations = relations(memes, ({ one, many }) => ({
  user: one(user, {
    fields: [memes.userId],
    references: [user.id],
  }),
  template: one(templates, {
    fields: [memes.templateId],
    references: [templates.id],
  }),
  remixOf: one(memes, {
    fields: [memes.remixOfMemeId],
    references: [memes.id],
    relationName: "remixes",
  }),
  remixes: many(memes, { relationName: "remixes" }),
  comments: many(comments),
  memeTags: many(memeTags),
  collectionItems: many(collectionItems),
  aiGenerations: many(aiGenerations),
}));

export const memeTagsRelations = relations(memeTags, ({ one }) => ({
  meme: one(memes, {
    fields: [memeTags.memeId],
    references: [memes.id],
  }),
  tag: one(tags, {
    fields: [memeTags.tagId],
    references: [tags.id],
  }),
}));

export const mediaRelations = relations(media, ({ one }) => ({
  user: one(user, {
    fields: [media.userId],
    references: [user.id],
  }),
}));

export const likesRelations = relations(likes, ({ one }) => ({
  user: one(user, {
    fields: [likes.userId],
    references: [user.id],
  }),
}));

export const bookmarksRelations = relations(bookmarks, ({ one }) => ({
  user: one(user, {
    fields: [bookmarks.userId],
    references: [user.id],
  }),
}));

export const commentsRelations = relations(comments, ({ one, many }) => ({
  meme: one(memes, {
    fields: [comments.memeId],
    references: [memes.id],
  }),
  user: one(user, {
    fields: [comments.userId],
    references: [user.id],
  }),
  parentComment: one(comments, {
    fields: [comments.parentCommentId],
    references: [comments.id],
    relationName: "replies",
  }),
  replies: many(comments, { relationName: "replies" }),
}));

export const followsRelations = relations(follows, ({ one }) => ({
  follower: one(user, {
    fields: [follows.followerId],
    references: [user.id],
    relationName: "follower",
  }),
  following: one(user, {
    fields: [follows.followingId],
    references: [user.id],
    relationName: "following",
  }),
}));

export const collectionsRelations = relations(collections, ({ one, many }) => ({
  user: one(user, {
    fields: [collections.userId],
    references: [user.id],
  }),
  items: many(collectionItems),
}));

export const collectionItemsRelations = relations(collectionItems, ({ one }) => ({
  collection: one(collections, {
    fields: [collectionItems.collectionId],
    references: [collections.id],
  }),
  meme: one(memes, {
    fields: [collectionItems.memeId],
    references: [memes.id],
  }),
}));

export const aiGenerationsRelations = relations(aiGenerations, ({ one }) => ({
  user: one(user, {
    fields: [aiGenerations.userId],
    references: [user.id],
  }),
  meme: one(memes, {
    fields: [aiGenerations.memeId],
    references: [memes.id],
  }),
}));
