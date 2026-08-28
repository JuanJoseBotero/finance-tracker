"use server"

import { db } from "@/lib/db"
import { goals, goalContributions } from "@/lib/db/schema"
import { and, desc, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export type GoalInput = {
  name: string
  targetAmount: number
  deadline: string | null
  icon: string
}

export async function getGoals() {
  const rows = await db.select().from(goals).orderBy(desc(goals.createdAt))
  return rows
}

export async function getGoalContributions(goalId: number) {
  return db
    .select()
    .from(goalContributions)
    .where(eq(goalContributions.goalId, goalId))
    .orderBy(desc(goalContributions.occurredAt))
}

export async function createGoal(input: GoalInput) {
  const name = input.name.trim()
  if (!name) throw new Error("El nombre de la meta es obligatorio")
  if (!input.targetAmount || input.targetAmount <= 0) throw new Error("El monto objetivo debe ser mayor a cero")

  await db.insert(goals).values({
    name,
    targetAmount: input.targetAmount.toFixed(2),
    deadline: input.deadline,
    icon: input.icon,
  })

  revalidatePath("/metas")
  revalidatePath("/")
}

export async function updateGoal(id: number, input: GoalInput) {
  await db
    .update(goals)
    .set({
      name: input.name.trim(),
      targetAmount: input.targetAmount.toFixed(2),
      deadline: input.deadline,
      icon: input.icon,
    })
    .where(eq(goals.id, id))

  revalidatePath("/metas")
  revalidatePath("/")
}

export async function deleteGoal(id: number) {
  await db.delete(goalContributions).where(eq(goalContributions.goalId, id))
  await db.delete(goals).where(eq(goals.id, id))
  revalidatePath("/metas")
  revalidatePath("/")
}

export async function addGoalContribution(goalId: number, amount: number, occurredAt: string) {
  if (!amount || amount <= 0) throw new Error("El monto del aporte debe ser mayor a cero")

  const [goal] = await db.select().from(goals).where(eq(goals.id, goalId))
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
