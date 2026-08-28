import {
  pgTable,
  serial,
  text,
  numeric,
  date,
  timestamp,
  boolean,
  integer,
} from "drizzle-orm/pg-core"

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  kind: text("kind").notNull(), // "expense" | "income"
  icon: text("icon").notNull().default("circle"),
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
})

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // "expense" | "income"
  amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
  description: text("description").notNull().default(""),
  categoryId: integer("category_id").notNull(),
  paymentMethod: text("payment_method").notNull(), // "cash" | "debit" | "credit" | "transfer"
  occurredAt: date("occurred_at").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
})

export const goals = pgTable("goals", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  targetAmount: numeric("target_amount", { precision: 14, scale: 2 }).notNull(),
  currentAmount: numeric("current_amount", { precision: 14, scale: 2 }).notNull().default("0"),
  deadline: date("deadline"),
  icon: text("icon").notNull().default("target"),
  status: text("status").notNull().default("active"), // "active" | "completed"
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
})

export const goalContributions = pgTable("goal_contributions", {
  id: serial("id").primaryKey(),
  goalId: integer("goal_id").notNull(),
  amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
  occurredAt: date("occurred_at").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
})
