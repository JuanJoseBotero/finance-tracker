import { Banknote, CreditCard, Landmark } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { CreditCardPaymentDialog } from "@/components/dashboard/credit-card-payment-dialog"
import { formatCOP } from "@/lib/constants"
import { cn } from "@/lib/utils"

export function MethodBalanceCards({
  cashBalance,
  accountBalance,
  creditBalance,
}: {
  cashBalance: number
  accountBalance: number
  creditBalance: number
}) {
  const cards = [
    {
      key: "cash",
      label: "Balance en efectivo",
      value: cashBalance,
      icon: Banknote,
    },
    {
      key: "account",
      label: "Balance libre en la cuenta",
      value: accountBalance,
      icon: Landmark,
      hint: "Sin contar lo apartado en bolsillos",
    },
    {
      key: "credit",
      label: "Balance tarjeta de crédito",
      value: creditBalance,
      icon: CreditCard,
    },
  ]

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold tracking-tight">Balance por método de pago</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {cards.map((card) => {
          const tone = card.value >= 0 ? "text-primary" : "text-rose-600 dark:text-rose-400"
          const bg = card.value >= 0 ? "bg-primary/10" : "bg-rose-500/10"
          return (
            <Card key={card.key} className="shadow-sm">
              <CardContent className="flex flex-col gap-3 p-4 sm:p-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm text-muted-foreground">{card.label}</span>
                    <span className={cn("font-mono text-2xl font-semibold tracking-tight", tone)}>
                      {formatCOP(card.value)}
                    </span>
                    {card.hint && <span className="text-xs text-muted-foreground">{card.hint}</span>}
                  </div>
                  <span className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl", bg)}>
                    <card.icon className={cn("h-5 w-5", tone)} aria-hidden="true" />
                  </span>
                </div>
                {card.key === "credit" && (
                  <div>
                    <CreditCardPaymentDialog />
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
