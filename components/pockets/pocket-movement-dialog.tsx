"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ArrowDownToLine, ArrowUpFromLine } from "lucide-react"
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
import { addPocketMovement } from "@/app/actions/pockets"
import { cn } from "@/lib/utils"

type MovementType = "deposit" | "withdrawal"

export function PocketMovementDialog({ pocketId, pocketName }: { pocketId: number; pocketName: string }) {
  const [open, setOpen] = useState(false)
  const [type, setType] = useState<MovementType>("deposit")
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
        await addPocketMovement(pocketId, type, parsed, occurredAt)
        toast.success(type === "deposit" ? "Dinero metido al bolsillo" : "Dinero retirado del bolsillo")
        setAmount("")
        setOpen(false)
        router.refresh()
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "No se pudo registrar el movimiento")
      }
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) setType("deposit")
      }}
    >
      <DialogTrigger
        render={
          <Button size="sm" variant="secondary" className="gap-2">
            <ArrowDownToLine className="h-4 w-4" aria-hidden="true" />
            Mover dinero
          </Button>
        }
      />
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{pocketName}</DialogTitle>
          <DialogDescription>
            Meter dinero lo aparta de tu balance libre en cuenta. Retirarlo lo devuelve.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setType("deposit")}
              aria-pressed={type === "deposit"}
              className={cn(
                "flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors",
                type === "deposit"
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:bg-accent",
              )}
            >
              <ArrowDownToLine className="h-4 w-4" aria-hidden="true" />
              Meter
            </button>
            <button
              type="button"
              onClick={() => setType("withdrawal")}
              aria-pressed={type === "withdrawal"}
              className={cn(
                "flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors",
                type === "withdrawal"
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:bg-accent",
              )}
            >
              <ArrowUpFromLine className="h-4 w-4" aria-hidden="true" />
              Retirar
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="movement-amount">Monto (COP)</Label>
            <Input
              id="movement-amount"
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
            <Label htmlFor="movement-date">Fecha</Label>
            <Input
              id="movement-date"
              type="date"
              value={occurredAt}
              onChange={(e) => setOccurredAt(e.target.value)}
              required
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Guardando..." : type === "deposit" ? "Confirmar depósito" : "Confirmar retiro"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
