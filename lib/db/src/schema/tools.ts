import { pgTable, text, serial, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const toolStatusEnum = pgEnum("tool_status", ["available", "issued", "missing"]);
export const transactionActionEnum = pgEnum("transaction_action", ["issue", "return", "scan"]);

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const toolsTable = pgTable("tools", {
  id: serial("id").primaryKey(),
  toolId: text("tool_id").notNull().unique(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  status: toolStatusEnum("status").notNull().default("available"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const transactionsTable = pgTable("transactions", {
  id: serial("id").primaryKey(),
  toolId: text("tool_id").notNull(),
  userId: text("user_id"),
  action: transactionActionEnum("action").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({ id: true, createdAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;

export const insertToolSchema = createInsertSchema(toolsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertTool = z.infer<typeof insertToolSchema>;
export type Tool = typeof toolsTable.$inferSelect;

export const insertTransactionSchema = createInsertSchema(transactionsTable).omit({ id: true, createdAt: true });
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactionsTable.$inferSelect;
