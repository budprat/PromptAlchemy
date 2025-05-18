import { pgTable, text, serial, timestamp, integer, jsonb, uuid, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: text("id").primaryKey().notNull(),
  email: text("email").unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  profileImageUrl: text("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Session storage table for auth
export const sessions = pgTable(
  "sessions",
  {
    sid: text("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  }
);

// Prompts table
export const prompts = pgTable("prompts", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  description: text("description"),
  modelId: text("model_id"),
  overallScore: integer("overall_score"),
  tags: text("tags").array(),
  isPublic: boolean("is_public").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Evaluations table
export const evaluations = pgTable("evaluations", {
  id: uuid("id").defaultRandom().primaryKey(),
  promptId: uuid("prompt_id").notNull().references(() => prompts.id),
  userId: text("user_id").references(() => users.id),
  modelId: text("model_id").notNull(),
  overallScore: integer("overall_score"),
  clarityScore: integer("clarity_score"),
  clarityFeedback: text("clarity_feedback"),
  specificityScore: integer("specificity_score"),
  specificityFeedback: text("specificity_feedback"),
  focusScore: integer("focus_score"),
  focusFeedback: text("focus_feedback"),
  aiFriendlinessScore: integer("ai_friendliness_score"),
  aiFriendlinessFeedback: text("ai_friendliness_feedback"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Optimizations table
export const optimizations = pgTable("optimizations", {
  id: uuid("id").defaultRandom().primaryKey(),
  promptId: uuid("prompt_id").notNull().references(() => prompts.id),
  userId: text("user_id").references(() => users.id),
  originalContent: text("original_content").notNull(),
  optimizedContent: text("optimized_content").notNull(),
  improvements: text("improvements").array(),
  settings: jsonb("settings"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Collaborators junction table
export const promptCollaborators = pgTable("prompt_collaborators", {
  id: uuid("id").defaultRandom().primaryKey(),
  promptId: uuid("prompt_id").notNull().references(() => prompts.id),
  userId: text("user_id").notNull().references(() => users.id),
  role: text("role").default("viewer"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Teams table
export const teams = pgTable("teams", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Team members junction table
export const teamMembers = pgTable("team_members", {
  id: uuid("id").defaultRandom().primaryKey(),
  teamId: uuid("team_id").notNull().references(() => teams.id),
  userId: text("user_id").notNull().references(() => users.id),
  role: text("role").default("member"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users);
export const insertPromptSchema = createInsertSchema(prompts);
export const insertEvaluationSchema = createInsertSchema(evaluations);
export const insertOptimizationSchema = createInsertSchema(optimizations);

// Types
export type User = typeof users.$inferSelect;
export type UpsertUser = typeof users.$inferInsert;
export type Prompt = typeof prompts.$inferSelect & {
  collaborators?: { id: string; name: string; role: string }[];
  evaluations?: {
    clarity?: { score: number; feedback: string };
    specificity?: { score: number; feedback: string };
    focus?: { score: number; feedback: string };
    aiFriendliness?: { score: number; feedback: string };
  };
};
export type InsertPrompt = typeof prompts.$inferInsert;
export type Evaluation = typeof evaluations.$inferSelect;
export type InsertEvaluation = typeof evaluations.$inferInsert;
export type Optimization = typeof optimizations.$inferSelect;
export type InsertOptimization = typeof optimizations.$inferInsert;
