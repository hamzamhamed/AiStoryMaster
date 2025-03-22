import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Story schema
export const stories = pgTable("stories", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  theme: text("theme").notNull(),
  setting: text("setting"),
  dateGenerated: timestamp("date_generated").defaultNow().notNull(),
});

export const insertStorySchema = createInsertSchema(stories).pick({
  userId: true,
  title: true,
  content: true,
  theme: true,
  setting: true,
});

// Character schema for stories
export const characters = pgTable("characters", {
  id: serial("id").primaryKey(),
  storyId: integer("story_id").references(() => stories.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
});

export const insertCharacterSchema = createInsertSchema(characters).pick({
  storyId: true,
  name: true,
  description: true,
});

// Schema for generating stories
export const generateStorySchema = z.object({
  theme: z.string(),
  title: z.string().optional(),
  setting: z.string().optional(),
  characters: z.array(
    z.object({
      name: z.string(),
      description: z.string().optional(),
    })
  ).optional(),
  length: z.enum(["short", "medium", "long"]),
  plotElements: z.string().optional(),
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertStory = z.infer<typeof insertStorySchema>;
export type Story = typeof stories.$inferSelect & {
  characters?: Character[];
};

export type InsertCharacter = z.infer<typeof insertCharacterSchema>;
export type Character = typeof characters.$inferSelect;

export type GenerateStoryParams = z.infer<typeof generateStorySchema>;
