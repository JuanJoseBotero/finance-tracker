"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PAYMENT_METHODS } from "@/lib/constants"

type Category = { id: number; name: string; kind: string; icon: string }

export function TransactionsFilters({ categories }: { categories: Category[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function setParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (!value || value === "all") {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  const type = searchParams.get("type") ?? "all"
  const categoryId = searchParams.get("categoryId") ?? "all"
  const paymentMethod = searchParams.get("paymentMethod") ?? "all"

  const filteredCategories = type === "all" ? categories : categories.filter((c) => c.kind === type)

  return (
    <div className="flex flex-wrap gap-3">
      <Select value={type} onValueChange={(v) => setParam("type", v)}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Tipo">
            {(value: string) =>
              value === "expense" ? "Gastos" : value === "income" ? "Ingresos" : "Todos los tipos"
            }
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los tipos</SelectItem>
          <SelectItem value="expense">Gastos</SelectItem>
          <SelectItem value="income">Ingresos</SelectItem>
        </SelectContent>
      </Select>

      <Select value={categoryId} onValueChange={(v) => setParam("categoryId", v)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Categoría">
            {(value: string) =>
              filteredCategories.find((c) => c.id.toString() === value)?.name ?? "Todas las categorías"
            }
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas las categorías</SelectItem>
          {filteredCategories.map((c) => (
            <SelectItem key={c.id} value={c.id.toString()}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={paymentMethod} onValueChange={(v) => setParam("paymentMethod", v)}>
        <SelectTrigger className="w-[190px]">
          <SelectValue placeholder="Método de pago">
            {(value: string) =>
              value === "all" ? "Todos los métodos" : PAYMENT_METHODS.find((m) => m.value === value)?.label ?? "Todos los métodos"
            }
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los métodos</SelectItem>
          {PAYMENT_METHODS.map((m) => (
            <SelectItem key={m.value} value={m.value}>
              {m.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
