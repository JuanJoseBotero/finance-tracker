"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { CreditCard } from "lucide-react"
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
import { payCreditCard } from "@/app/actions/credit-card"

export function CreditCardPaymentDialog() {
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState("")
  const [occurredAt, setOccurredAt] = useState(new Date().toISOString().slice(0, 10))
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const parsed = Number.parseFloat(amount)
    if (!parsed || parsed <= 0) {
      toast.error("Ingresa un monto válido")
      return
    }
    startTransition(async () => {
      try {
        await payCreditCard(parsed, occurredAt)
        toast.success("Pago registrado")
        setAmount("")
        setOpen(false)
        router.refresh()
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "No se pudo registrar el pago")
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm" variant="secondary" className="gap-2">
            <CreditCard className="h-4 w-4" aria-hidden="true" />
            Pagar
          </Button>
        }
      />
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Pagar tarjeta de crédito</DialogTitle>
          <DialogDescription>
            Registra cuánto pagaste para reducir tu deuda. Esto no afecta ningún otro balance.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="credit-payment-amount">Monto pagado (COP)</Label>
            <Input
              id="credit-payment-amount"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="font-mono"
              autoFocus
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="credit-payment-date">Fecha</Label>
            <Input
              id="credit-payment-date"
              type="date"
              value={occurredAt}
              onChange={(e) => setOccurredAt(e.target.value)}
              required
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Guardando..." : "Confirmar pago"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
