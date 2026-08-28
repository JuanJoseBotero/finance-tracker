import { getGoals } from "@/app/actions/goals"
import { GoalCard } from "@/components/goals/goal-card"
import { GoalFormDialog } from "@/components/goals/goal-form-dialog"
import { formatCOP } from "@/lib/constants"
import { Card, CardContent } from "@/components/ui/card"
import { Target, CheckCircle2, PiggyBank } from "lucide-react"

export default async function MetasPage() {
  const goals = await getGoals()
  const active = goals.filter((g) => g.status === "active")
  const completed = goals.filter((g) => g.status === "completed")
  const totalSaved = goals.reduce((sum, g) => sum + Number(g.currentAmount), 0)

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 md:px-6 md:py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Metas</h1>
          <p className="text-sm text-muted-foreground">Define objetivos de ahorro y sigue tu progreso.</p>
        </div>
        <GoalFormDialog />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="shadow-sm">
          <CardContent className="flex items-center gap-3 p-5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Target className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm text-muted-foreground">Metas activas</p>
              <p className="text-xl font-semibold">{active.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="flex items-center gap-3 p-5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm text-muted-foreground">Metas cumplidas</p>
              <p className="text-xl font-semibold">{completed.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="flex items-center gap-3 p-5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
              <PiggyBank className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm text-muted-foreground">Total ahorrado</p>
              <p className="font-mono text-xl font-semibold">{formatCOP(totalSaved)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {goals.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border p-10 text-center">
          <p className="text-sm font-medium">Aún no tienes metas</p>
          <p className="text-sm text-muted-foreground">Crea tu primera meta de ahorro para empezar a dar seguimiento.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {active.length > 0 && (
            <section className="flex flex-col gap-4">
              <h2 className="text-sm font-medium text-muted-foreground">En progreso</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {active.map((goal) => (
                  <GoalCard key={goal.id} goal={goal} />
                ))}
              </div>
            </section>
          )}
          {completed.length > 0 && (
            <section className="flex flex-col gap-4">
              <h2 className="text-sm font-medium text-muted-foreground">Cumplidas</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {completed.map((goal) => (
                  <GoalCard key={goal.id} goal={goal} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </main>
  )
}
