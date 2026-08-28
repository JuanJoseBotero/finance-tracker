"use server"

import { db, pool } from "@/lib/db"
import { transactions, categories } from "@/lib/db/schema"
import { and, desc, eq, gte, lte, sql } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export type TransactionInput = {
  type: "expense" | "income"
  amount: number
  description: string
  categoryId: number
  paymentMethod: string
  occurredAt: string // YYYY-MM-DD
}

export async function getTransactions(filters?: {
  type?: "expense" | "income"
  categoryId?: number
  paymentMethod?: string
}) {
  const conditions = []
  if (filters?.type) conditions.push(eq(transactions.type, filters.type))
  if (filters?.categoryId) conditions.push(eq(transactions.categoryId, filters.categoryId))
  if (filters?.paymentMethod) conditions.push(eq(transactions.paymentMethod, filters.paymentMethod))

  const rows = await db
    .select({
      id: transactions.id,
      type: transactions.type,
      amount: transactions.amount,
      description: transactions.description,
      categoryId: transactions.categoryId,
      categoryName: categories.name,
      categoryIcon: categories.icon,
      paymentMethod: transactions.paymentMethod,
      occurredAt: transactions.occurredAt,
      createdAt: transactions.createdAt,
    })
    .from(transactions)
    .innerJoin(categories, eq(transactions.categoryId, categories.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(transactions.occurredAt), desc(transactions.createdAt))

  return rows
}

export async function createTransaction(input: TransactionInput) {
  if (!input.amount || input.amount <= 0) throw new Error("El monto debe ser mayor a cero")
  if (!input.categoryId) throw new Error("Selecciona una categoría")
  if (!input.occurredAt) throw new Error("Selecciona una fecha")

  await db.insert(transactions).values({
    type: input.type,
    amount: input.amount.toFixed(2),
    description: input.description?.trim() ?? "",
    categoryId: input.categoryId,
    paymentMethod: input.paymentMethod,
    occurredAt: input.occurredAt,
  })

  revalidatePath("/")
  revalidatePath("/movimientos")
}

export async function updateTransaction(id: number, input: TransactionInput) {
  if (!input.amount || input.amount <= 0) throw new Error("El monto debe ser mayor a cero")

  await db
    .update(transactions)
    .set({
      type: input.type,
      amount: input.amount.toFixed(2),
      description: input.description?.trim() ?? "",
      categoryId: input.categoryId,
      paymentMethod: input.paymentMethod,
      occurredAt: input.occurredAt,
    })
    .where(eq(transactions.id, id))

  revalidatePath("/")
  revalidatePath("/movimientos")
}

export async function deleteTransaction(id: number) {
  await db.delete(transactions).where(eq(transactions.id, id))
  revalidatePath("/")
  revalidatePath("/movimientos")
}

export async function getDashboardSummary() {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)
  const startOfYear = new Date(now.getFullYear(), 0, 1).toISOString().slice(0, 10)

  const totalsResult = await pool.query<{
    income_month: string | null
    expense_month: string | null
    income_total: string | null
    expense_total: string | null
  }>(
    `SELECT
      COALESCE(SUM(CASE WHEN type = 'income' AND occurred_at >= $1 THEN amount END), 0) AS income_month,
      COALESCE(SUM(CASE WHEN type = 'expense' AND occurred_at >= $1 THEN amount END), 0) AS expense_month,
      COALESCE(SUM(CASE WHEN type = 'income' THEN amount END), 0) AS income_total,
      COALESCE(SUM(CASE WHEN type = 'expense' THEN amount END), 0) AS expense_total
    FROM transactions`,
    [startOfMonth],
  )

  const monthlySeries = await pool.query<{
    month: string
    income: string
    expense: string
  }>(
    `SELECT
      to_char(date_trunc('month', occurred_at), 'YYYY-MM') AS month,
      COALESCE(SUM(CASE WHEN type = 'income' THEN amount END), 0) AS income,
      COALESCE(SUM(CASE WHEN type = 'expense' THEN amount END), 0) AS expense
    FROM transactions
    WHERE occurred_at >= $1
    GROUP BY 1
    ORDER BY 1`,
    [new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString().slice(0, 10)],
  )

  const byCategory = await pool.query<{
    category_id: number
    name: string
    icon: string
    total: string
  }>(
    `SELECT c.id AS category_id, c.name, c.icon, SUM(t.amount) AS total
    FROM transactions t
    JOIN categories c ON c.id = t.category_id
    WHERE t.type = 'expense' AND t.occurred_at >= $1
    GROUP BY c.id, c.name, c.icon
    ORDER BY total DESC`,
    [startOfMonth],
  )

  const byPaymentMethod = await pool.query<{
    payment_method: string
    total: string
  }>(
    `SELECT payment_method, SUM(amount) AS total
    FROM transactions
    WHERE type = 'expense' AND occurred_at >= $1
    GROUP BY payment_method
    ORDER BY total DESC`,
    [startOfMonth],
  )

  const recent = await db
    .select({
      id: transactions.id,
      type: transactions.type,
      amount: transactions.amount,
      description: transactions.description,
      categoryName: categories.name,
      categoryIcon: categories.icon,
      paymentMethod: transactions.paymentMethod,
      occurredAt: transactions.occurredAt,
    })
    .from(transactions)
    .innerJoin(categories, eq(transactions.categoryId, categories.id))
    .orderBy(desc(transactions.occurredAt), desc(transactions.createdAt))
    .limit(6)

  const t = totalsResult.rows[0]

  return {
    incomeMonth: Number(t.income_month ?? 0),
    expenseMonth: Number(t.expense_month ?? 0),
    balanceMonth: Number(t.income_month ?? 0) - Number(t.expense_month ?? 0),
    balanceTotal: Number(t.income_total ?? 0) - Number(t.expense_total ?? 0),
    monthlySeries: monthlySeries.rows.map((r) => ({
      month: r.month,
      income: Number(r.income),
      expense: Number(r.expense),
    })),
    byCategory: byCategory.rows.map((r) => ({
      categoryId: r.category_id,
      name: r.name,
      icon: r.icon,
      total: Number(r.total),
    })),
    byPaymentMethod: byPaymentMethod.rows.map((r) => ({
      paymentMethod: r.payment_method,
      total: Number(r.total),
    })),
    recent,
  }
}
