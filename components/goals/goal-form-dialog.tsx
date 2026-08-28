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
import { GOAL_ICONS, getCategoryIcon } from "@/lib/constants"
import { createGoal, updateGoal } from "@/app/actions/goals"
import { cn } from "@/lib/utils"

type Goal = {
  id: number
  name: string
  targetAmount: string
  deadline: string | null
  icon: string
}

export function GoalFormDialog({
  goal,
  open: openProp,
  onOpenChange,
}: {
  goal?: Goal
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const isEdit = Boolean(goal)
  const [openState, setOpenState] = useState(false)
  const isControlled = openProp !== undefined
  const open = isControlled ? openProp : openState
  const setOpen = isControlled ? (onOpenChange ?? (() => {})) : setOpenState
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  const [name, setName] = useState(goal?.name ?? "")
  const [targetAmount, setTargetAmount] = useState(goal?.targetAmount ?? "")
  const [deadline, setDeadline] = useState(goal?.deadline ?? "")
  const [icon, setIcon] = useState(goal?.icon ?? "target")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const parsed = Number.parseFloat(targetAmount)
    if (!name.trim()) {
      toast.error("Ingresa un nombre para la meta")
      return
    }
    if (!parsed || parsed <= 0) {
      toast.error("Ingresa un monto objetivo válido")
      return
    }

    startTransition(async () => {
      try {
        const input = { name, targetAmount: parsed, deadline: deadline || null, icon }
        if (isEdit && goal) {
          await updateGoal(goal.id, input)
          toast.success("Meta actualizada")
        } else {
          await createGoal(input)
          toast.success("Meta creada")
          setName("")
          setTargetAmount("")
          setDeadline("")
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
              Nueva meta
            </Button>
          }
        />
      )}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar meta" : "Nueva meta"}</DialogTitle>
          <DialogDescription>Define un objetivo de ahorro y da seguimiento a tu progreso.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="goal-name">Nombre de la meta</Label>
            <Input
              id="goal-name"
              placeholder="Ej. Viaje a Cartagena"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="goal-target">Monto objetivo (COP)</Label>
            <Input
              id="goal-target"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              placeholder="0"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              className="font-mono"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="goal-deadline">Fecha límite (opcional)</Label>
            <Input
              id="goal-deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Ícono</Label>
            <div className="flex flex-wrap gap-2">
              {GOAL_ICONS.map((iconName) => {
                const Icon = getCategoryIcon(iconName)
                const selected = icon === iconName
                return (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => setIcon(iconName)}
                    aria-pressed={selected}
                    aria-label={`Ícono ${iconName}`}
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-xl border transition-colors",
                      selected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-transparent text-muted-foreground hover:bg-accent",
                    )}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </button>
                )
              })}
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={pending} className="gap-2">
              {isEdit ? <Pencil className="h-4 w-4" aria-hidden="true" /> : <Plus className="h-4 w-4" aria-hidden="true" />}
              {pending ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear meta"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
