import { ArrowDownRight, ArrowUpRight, Scale, Wallet } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { formatCOP } from "@/lib/constants"
import { cn } from "@/lib/utils"

export function SummaryCards({
  incomeMonth,
  expenseMonth,
  balanceMonth,
  balanceTotal,
}: {
  incomeMonth: number
  expenseMonth: number
  balanceMonth: number
  balanceTotal: number
}) {
  const cards = [
    {
      label: "Ingresos del mes",
      value: incomeMonth,
      icon: ArrowUpRight,
      tone: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Gastos del mes",
      value: expenseMonth,
      icon: ArrowDownRight,
      tone: "text-rose-600 dark:text-rose-400",
      bg: "bg-rose-500/10",
    },
    {
      label: "Balance del mes",
      value: balanceMonth,
      icon: Scale,
      tone: balanceMonth >= 0 ? "text-primary" : "text-rose-600 dark:text-rose-400",
      bg: balanceMonth >= 0 ? "bg-primary/10" : "bg-rose-500/10",
    },
    {
      label: "Balance total",
      value: balanceTotal,
      icon: Wallet,
      tone: balanceTotal >= 0 ? "text-primary" : "text-rose-600 dark:text-rose-400",
      bg: balanceTotal >= 0 ? "bg-primary/10" : "bg-rose-500/10",
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.label} className="shadow-sm">
          <CardContent className="flex items-center justify-between gap-4 p-5">
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">{card.label}</span>
              <span className={cn("font-mono text-2xl font-semibold tracking-tight", card.tone)}>
                {formatCOP(card.value)}
              </span>
            </div>
            <span className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl", card.bg)}>
              <card.icon className={cn("h-5 w-5", card.tone)} aria-hidden="true" />
            </span>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
