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

// Better Auth tables — column names follow Better Auth's defaults (camelCase).
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
})

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
})

// App tables. categories stays shared/global across accounts.
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
  userId: text("user_id"),
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
  userId: text("user_id"),
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
