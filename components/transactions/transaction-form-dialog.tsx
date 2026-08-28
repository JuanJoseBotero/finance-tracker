"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Plus, Pencil } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PAYMENT_METHODS } from "@/lib/constants"
import { createTransaction, updateTransaction } from "@/app/actions/transactions"

type Category = { id: number; name: string; kind: string; icon: string }

type TransactionData = {
  id: number
  type: string
  amount: string
  description: string
  categoryId: number
  paymentMethod: string
  occurredAt: string
}

export function TransactionFormDialog({
  categories,
  transaction,
  open: openProp,
  onOpenChange,
}: {
  categories: Category[]
  transaction?: TransactionData
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const isEdit = Boolean(transaction)
  const [openState, setOpenState] = useState(false)
  const isControlled = openProp !== undefined
  const open = isControlled ? openProp : openState
  const setOpen = isControlled ? (onOpenChange ?? (() => {})) : setOpenState
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  const [type, setType] = useState<"expense" | "income">((transaction?.type as "expense" | "income") ?? "expense")
  const [amount, setAmount] = useState(transaction?.amount ?? "")
  const [description, setDescription] = useState(transaction?.description ?? "")
  const [categoryId, setCategoryId] = useState<string>(transaction?.categoryId?.toString() ?? "")
  const [paymentMethod, setPaymentMethod] = useState(transaction?.paymentMethod ?? "cash")
  const [occurredAt, setOccurredAt] = useState(
    transaction?.occurredAt ?? new Date().toISOString().slice(0, 10),
  )

  const filteredCategories = categories.filter((c) => c.kind === type)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const parsedAmount = Number.parseFloat(amount)
    if (!parsedAmount || parsedAmount <= 0) {
      toast.error("Ingresa un monto válido mayor a cero")
      return
    }
    if (!categoryId) {
      toast.error("Selecciona una categoría")
      return
    }

    startTransition(async () => {
      try {
        const input = {
          type,
          amount: parsedAmount,
          description,
          categoryId: Number(categoryId),
          paymentMethod,
          occurredAt,
        }
        if (isEdit && transaction) {
          await updateTransaction(transaction.id, input)
          toast.success("Movimiento actualizado")
        } else {
          await createTransaction(input)
          toast.success(type === "income" ? "Ingreso registrado" : "Gasto registrado")
          setAmount("")
          setDescription("")
          setCategoryId("")
        }
        setOpen(false)
        router.refresh()
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Ocurrió un error")
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isControlled && (
        <DialogTrigger
          render={
            <Button className="gap-2">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Nuevo movimiento
            </Button>
          }
        />
      )}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar movimiento" : "Nuevo movimiento"}</DialogTitle>
          <DialogDescription>
            Registra un gasto o un ingreso con su categoría y método de pago.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Tabs
            value={type}
            onValueChange={(v) => {
              setType(v as "expense" | "income")
              setCategoryId("")
            }}
          >
            <TabsList className="w-full">
              <TabsTrigger value="expense" className="flex-1">
                Gasto
              </TabsTrigger>
              <TabsTrigger value="income" className="flex-1">
                Ingreso
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex flex-col gap-2">
            <Label htmlFor="amount">Monto (COP)</Label>
            <Input
              id="amount"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="font-mono"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="description">Descripción</Label>
            <Input
              id="description"
              placeholder="Ej. Almuerzo, arriendo, nómina..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="category">Categoría</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger id="category" className="w-full">
                  <SelectValue placeholder="Selecciona" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>{type === "expense" ? "Gastos" : "Ingresos"}</SelectLabel>
                    {filteredCategories.map((c) => (
                      <SelectItem key={c.id} value={c.id.toString()}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="paymentMethod">Método de pago</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger id="paymentMethod" className="w-full">
                  <SelectValue placeholder="Selecciona" />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="occurredAt">Fecha</Label>
            <Input
              id="occurredAt"
              type="date"
              value={occurredAt}
              onChange={(e) => setOccurredAt(e.target.value)}
              required
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={pending} className="gap-2">
              {isEdit ? <Pencil className="h-4 w-4" aria-hidden="true" /> : <Plus className="h-4 w-4" aria-hidden="true" />}
              {pending ? "Guardando..." : isEdit ? "Guardar cambios" : "Registrar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
