"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { PiggyBank } from "lucide-react"
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
import { addGoalContribution } from "@/app/actions/goals"

export function ContributeDialog({ goalId, goalName }: { goalId: number; goalName: string }) {
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
        await addGoalContribution(goalId, parsed, occurredAt)
        toast.success("Aporte registrado")
        setAmount("")
        setOpen(false)
        router.refresh()
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "No se pudo registrar el aporte")
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm" variant="secondary" className="gap-2">
            <PiggyBank className="h-4 w-4" aria-hidden="true" />
            Aportar
          </Button>
        }
      />
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Aportar a {goalName}</DialogTitle>
          <DialogDescription>Registra un abono hacia esta meta de ahorro.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="contribution-amount">Monto (COP)</Label>
            <Input
              id="contribution-amount"
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
            <Label htmlFor="contribution-date">Fecha</Label>
            <Input
              id="contribution-date"
              type="date"
              value={occurredAt}
              onChange={(e) => setOccurredAt(e.target.value)}
              required
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Guardando..." : "Confirmar aporte"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
