"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { MoreVertical, Pencil, Trash2 } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatCOP, getCategoryIcon, getPaymentMethodLabel } from "@/lib/constants"
import { cn } from "@/lib/utils"
import { deleteTransaction } from "@/app/actions/transactions"
import { TransactionFormDialog } from "./transaction-form-dialog"

type Category = { id: number; name: string; kind: string; icon: string }

type Transaction = {
  id: number
  type: string
  amount: string
  description: string
  categoryId: number
  categoryName: string
  categoryIcon: string
  paymentMethod: string
  occurredAt: string
}

export function TransactionsTable({
  transactions,
  categories,
}: {
  transactions: Transaction[]
  categories: Category[]
}) {
  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border p-10 text-center">
        <p className="text-sm font-medium">No hay movimientos con estos filtros</p>
        <p className="text-sm text-muted-foreground">Registra un nuevo gasto o ingreso para empezar.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Descripción</TableHead>
            <TableHead>Categoría</TableHead>
            <TableHead>Método de pago</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead className="text-right">Monto</TableHead>
            <TableHead className="w-10" aria-label="Acciones" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((tx) => (
            <TransactionRow key={tx.id} tx={tx} categories={categories} />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function TransactionRow({ tx, categories }: { tx: Transaction; categories: Category[] }) {
  const [editOpen, setEditOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const router = useRouter()
  const Icon = getCategoryIcon(tx.categoryIcon)
  const isIncome = tx.type === "income"

  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteTransaction(tx.id)
        toast.success("Movimiento eliminado")
        router.refresh()
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "No se pudo eliminar")
      }
    })
  }

  return (
    <TableRow>
      <TableCell className="max-w-[220px] truncate font-medium">{tx.description || tx.categoryName}</TableCell>
      <TableCell>
        <Badge variant="secondary" className="gap-1.5 font-normal">
          <Icon className="h-3.5 w-3.5" aria-hidden="true" />
          {tx.categoryName}
        </Badge>
      </TableCell>
      <TableCell className="text-muted-foreground">{getPaymentMethodLabel(tx.paymentMethod)}</TableCell>
      <TableCell className="text-muted-foreground">
        {new Date(tx.occurredAt).toLocaleDateString("es-CO", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })}
      </TableCell>
      <TableCell
        className={cn(
          "text-right font-mono font-semibold",
          isIncome ? "text-emerald-600 dark:text-emerald-400" : "text-foreground",
        )}
      >
        {isIncome ? "+" : "-"}
        {formatCOP(tx.amount)}
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Más acciones">
                <MoreVertical className="h-4 w-4" aria-hidden="true" />
              </Button>
            }
          />
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="gap-2" onClick={() => setEditOpen(true)}>
              <Pencil className="h-4 w-4" aria-hidden="true" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              className="gap-2 text-destructive focus:text-destructive"
              disabled={pending}
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <TransactionFormDialog
          categories={categories}
          transaction={tx}
          open={editOpen}
          onOpenChange={setEditOpen}
        />
      </TableCell>
    </TableRow>
  )
}
