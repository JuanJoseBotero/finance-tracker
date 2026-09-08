"use server"

import { db } from "@/lib/db"
import { pockets, pocketMovements } from "@/lib/db/schema"
import { auth } from "@/lib/auth"
import { and, desc, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { headers } from "next/headers"

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error("Unauthorized")
  return session.user.id
}

export async function getPockets() {
  const userId = await getUserId()
  return db.select().from(pockets).where(eq(pockets.userId, userId)).orderBy(desc(pockets.createdAt))
}

async function assertOwnsPocket(pocketId: number, userId: string) {
  const [pocket] = await db
    .select({ id: pockets.id })
    .from(pockets)
    .where(and(eq(pockets.id, pocketId), eq(pockets.userId, userId)))
  if (!pocket) throw new Error("Bolsillo no encontrado")
}

export async function getPocketMovements(pocketId: number) {
  const userId = await getUserId()
  await assertOwnsPocket(pocketId, userId)

  return db
    .select()
    .from(pocketMovements)
    .where(eq(pocketMovements.pocketId, pocketId))
    .orderBy(desc(pocketMovements.occurredAt), desc(pocketMovements.createdAt))
}

export async function createPocket(input: { name: string; icon: string }) {
  const userId = await getUserId()

  const name = input.name.trim()
  if (!name) throw new Error("El nombre del bolsillo es obligatorio")

  await db.insert(pockets).values({ userId, name, icon: input.icon })

  revalidatePath("/bolsillos")
  revalidatePath("/")
}

export async function deletePocket(id: number) {
  const userId = await getUserId()
  await assertOwnsPocket(id, userId)

  await db.delete(pocketMovements).where(eq(pocketMovements.pocketId, id))
  await db.delete(pockets).where(and(eq(pockets.id, id), eq(pockets.userId, userId)))

  revalidatePath("/bolsillos")
  revalidatePath("/")
}

export async function addPocketMovement(
  pocketId: number,
  type: "deposit" | "withdrawal",
  amount: number,
  occurredAt: string,
) {
  const userId = await getUserId()

  if (!amount || amount <= 0) throw new Error("El monto debe ser mayor a cero")

  const [pocket] = await db
    .select()
    .from(pockets)
    .where(and(eq(pockets.id, pocketId), eq(pockets.userId, userId)))
  if (!pocket) throw new Error("Bolsillo no encontrado")

  const current = Number(pocket.currentAmount)
  if (type === "withdrawal" && amount > current) {
    throw new Error("No puedes retirar más de lo que hay en el bolsillo")
  }

  const newAmount = type === "deposit" ? current + amount : current - amount

  await db.insert(pocketMovements).values({
    pocketId,
    type,
    amount: amount.toFixed(2),
    occurredAt,
  })

  await db.update(pockets).set({ currentAmount: newAmount.toFixed(2) }).where(eq(pockets.id, pocketId))

  revalidatePath("/bolsillos")
  revalidatePath("/")
}
