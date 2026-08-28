"use server"

import { db } from "@/lib/db"
import { categories } from "@/lib/db/schema"
import { asc } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export async function getCategories() {
  return db.select().from(categories).orderBy(asc(categories.kind), asc(categories.name))
}

export async function createCategory(input: { name: string; kind: "expense" | "income"; icon: string }) {
  const name = input.name.trim()
  if (!name) throw new Error("El nombre de la categoría es obligatorio")

  const [created] = await db
    .insert(categories)
    .values({ name, kind: input.kind, icon: input.icon, isDefault: false })
    .returning()

  revalidatePath("/movimientos")
  revalidatePath("/")
  return created
}
