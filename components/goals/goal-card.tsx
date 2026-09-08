"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { CheckCircle2, MoreVertical, Pencil, Trash2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatCOP, formatDate, getCategoryIcon } from "@/lib/constants"
import { deleteGoal } from "@/app/actions/goals"
import { GoalFormDialog } from "./goal-form-dialog"
import { ContributeDialog } from "./contribute-dialog"

type Goal = {
  id: number
  name: string
  targetAmount: string
  currentAmount: string
  deadline: string | null
  icon: string
  status: string
}

export function GoalCard({ goal }: { goal: Goal }) {
  const [editOpen, setEditOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const router = useRouter()
  const Icon = getCategoryIcon(goal.icon)
  const target = Number(goal.targetAmount)
  const current = Number(goal.currentAmount)
  const pct = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0
  const isCompleted = goal.status === "completed"

  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteGoal(goal.id)
        toast.success("Meta eliminada")
        router.refresh()
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "No se pudo eliminar")
      }
    })
  }

  return (
    <Card className="shadow-sm">
      <CardContent className="flex flex-col gap-4 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                isCompleted ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-primary/10 text-primary"
              }`}
            >
              {isCompleted ? <CheckCircle2 className="h-5 w-5" aria-hidden="true" /> : <Icon className="h-5 w-5" aria-hidden="true" />}
            </span>
            <div>
              <p className="font-medium leading-tight">{goal.name}</p>
              {goal.deadline && (
                <p className="text-xs text-muted-foreground">
                  Meta: {formatDate(goal.deadline)}
                </p>
              )}
            </div>
          </div>

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

          <GoalFormDialog goal={goal} open={editOpen} onOpenChange={setEditOpen} />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between">
            <span className="font-mono text-lg font-semibold">{formatCOP(current)}</span>
            <span className="text-sm text-muted-foreground">de {formatCOP(target)}</span>
          </div>
          <Progress value={pct} className="h-2" />
          <span className="text-xs text-muted-foreground">{pct}% completado</span>
        </div>

        <div className="flex items-center gap-2">
          {isCompleted ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
              Meta cumplida
            </span>
          ) : (
            <ContributeDialog goalId={goal.id} goalName={goal.name} />
          )}
        </div>
      </CardContent>
    </Card>
  )
}
