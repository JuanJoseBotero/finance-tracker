import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardAction } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatCOP, getCategoryIcon, getPaymentMethodLabel } from "@/lib/constants"
import { cn } from "@/lib/utils"

type Transaction = {
  id: number
  type: string
  amount: string
  description: string
  categoryName: string
  categoryIcon: string
  paymentMethod: string
  occurredAt: string
}

export function RecentTransactions({ transactions }: { transactions: Transaction[] }) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Movimientos recientes</CardTitle>
        <CardAction>
          <Button
            variant="ghost"
            size="sm"
            nativeButton={false}
            render={<Link href="/movimientos">Ver todos</Link>}
          />
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-1">
        {transactions.length === 0 && (
          <p className="text-sm text-muted-foreground">Aún no tienes movimientos registrados.</p>
        )}
        {transactions.map((tx) => {
          const Icon = getCategoryIcon(tx.categoryIcon)
          const isIncome = tx.type === "income"
          return (
            <div key={tx.id} className="flex items-center gap-3 rounded-xl px-2 py-2.5 hover:bg-accent/50">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium">{tx.description || tx.categoryName}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {tx.categoryName} · {getPaymentMethodLabel(tx.paymentMethod)} ·{" "}
                  {new Date(tx.occurredAt).toLocaleDateString("es-CO", { day: "2-digit", month: "short" })}
                </p>
              </div>
              <span
                className={cn(
                  "shrink-0 font-mono text-sm font-semibold",
                  isIncome ? "text-emerald-600 dark:text-emerald-400" : "text-foreground",
                )}
              >
                {isIncome ? "+" : "-"}
                {formatCOP(tx.amount)}
              </span>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
