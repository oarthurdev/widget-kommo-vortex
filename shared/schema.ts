import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Kommo Tag Schema
export const kommoTagSchema = z.object({
  id: z.number(),
  name: z.string(),
  color: z.string().optional(),
  leadCount: z.number(),
  percentage: z.number(),
});

export type KommoTag = z.infer<typeof kommoTagSchema>;

// Kommo Lead Schema
export const kommoLeadSchema = z.object({
  id: z.number(),
  name: z.string(),
  tags: z.array(z.number()).optional(),
  status_id: z.number().optional(),
  created_at: z.number().optional(),
});

export type KommoLead = z.infer<typeof kommoLeadSchema>;

// Tag Statistics Schema
export const tagStatisticsSchema = z.object({
  totalTags: z.number(),
  totalLeads: z.number(),
  tags: z.array(kommoTagSchema),
  lastUpdated: z.string(),
});

export type TagStatistics = z.infer<typeof tagStatisticsSchema>;

// Widget Settings Schema
export const widgetSettingsSchema = z.object({
  apiKey: z.string().min(1, "API Key é obrigatória"),
  domain: z.string().min(1, "Domínio é obrigatório"),
  refreshInterval: z.number().min(30).max(3600).optional(),
});

export type WidgetSettings = z.infer<typeof widgetSettingsSchema>;
