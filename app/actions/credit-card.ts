"use server"

import { db } from "@/lib/db"
import { creditCardPayments } from "@/lib/db/schema"
import { auth } from "@/lib/auth"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { headers } from "next/headers"

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error("Unauthorized")
  return session.user.id
}

// Records a payment toward the credit card debt. This only affects how the
// credit card balance is displayed on the dashboard — it never touches
// transactions, cash/account balance, or pockets.
export async function payCreditCard(amount: number, occurredAt: string) {
  const userId = await getUserId()

  if (!amount || amount <= 0) throw new Error("El monto debe ser mayor a cero")
  if (!occurredAt) throw new Error("Selecciona una fecha")

  await db.insert(creditCardPayments).values({
    userId,
    amount: amount.toFixed(2),
    occurredAt,
  })

  revalidatePath("/")
}

export async function getCreditCardPayments() {
  const userId = await getUserId()
  return db.select().from(creditCardPayments).where(eq(creditCardPayments.userId, userId))
}
