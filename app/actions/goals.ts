"use server"

import { db } from "@/lib/db"
import { goals, goalContributions } from "@/lib/db/schema"
import { auth } from "@/lib/auth"
import { and, desc, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { headers } from "next/headers"

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error("Unauthorized")
  return session.user.id
}

export type GoalInput = {
  name: string
  targetAmount: number
  deadline: string | null
  icon: string
}

export async function getGoals() {
  const userId = await getUserId()
  const rows = await db.select().from(goals).where(eq(goals.userId, userId)).orderBy(desc(goals.createdAt))
  return rows
}

async function assertOwnsGoal(goalId: number, userId: string) {
  const [goal] = await db
    .select({ id: goals.id })
    .from(goals)
    .where(and(eq(goals.id, goalId), eq(goals.userId, userId)))
  if (!goal) throw new Error("Meta no encontrada")
}

export async function getGoalContributions(goalId: number) {
  const userId = await getUserId()
  await assertOwnsGoal(goalId, userId)

  return db
    .select()
    .from(goalContributions)
    .where(eq(goalContributions.goalId, goalId))
    .orderBy(desc(goalContributions.occurredAt))
}

export async function createGoal(input: GoalInput) {
  const userId = await getUserId()

  const name = input.name.trim()
  if (!name) throw new Error("El nombre de la meta es obligatorio")
  if (!input.targetAmount || input.targetAmount <= 0) throw new Error("El monto objetivo debe ser mayor a cero")

  await db.insert(goals).values({
    userId,
    name,
    targetAmount: input.targetAmount.toFixed(2),
    deadline: input.deadline,
    icon: input.icon,
  })

  revalidatePath("/metas")
  revalidatePath("/")
}

export async function updateGoal(id: number, input: GoalInput) {
  const userId = await getUserId()

  await db
    .update(goals)
    .set({
      name: input.name.trim(),
      targetAmount: input.targetAmount.toFixed(2),
      deadline: input.deadline,
      icon: input.icon,
    })
    .where(and(eq(goals.id, id), eq(goals.userId, userId)))

  revalidatePath("/metas")
  revalidatePath("/")
}

export async function deleteGoal(id: number) {
  const userId = await getUserId()
  await assertOwnsGoal(id, userId)

  await db.delete(goalContributions).where(eq(goalContributions.goalId, id))
  await db.delete(goals).where(and(eq(goals.id, id), eq(goals.userId, userId)))
  revalidatePath("/metas")
  revalidatePath("/")
}

export async function addGoalContribution(goalId: number, amount: number, occurredAt: string) {
  const userId = await getUserId()

  if (!amount || amount <= 0) throw new Error("El monto del aporte debe ser mayor a cero")

  const [goal] = await db
    .select()
    .from(goals)
    .where(and(eq(goals.id, goalId), eq(goals.userId, userId)))
  if (!goal) throw new Error("Meta no encontrada")

  const newAmount = Number(goal.currentAmount) + amount
  const target = Number(goal.targetAmount)

  await db.insert(goalContributions).values({
    goalId,
    amount: amount.toFixed(2),
    occurredAt,
  })

  await db
    .update(goals)
    .set({
      currentAmount: newAmount.toFixed(2),
      status: newAmount >= target ? "completed" : "active",
    })
    .where(eq(goals.id, goalId))

  revalidatePath("/metas")
  revalidatePath("/")
}
