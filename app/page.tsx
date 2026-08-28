import { getDashboardSummary } from "@/app/actions/transactions"
import { getCategories } from "@/app/actions/categories"
import { getGoals } from "@/app/actions/goals"
import { SummaryCards } from "@/components/dashboard/summary-cards"
import { MonthlyChart } from "@/components/dashboard/monthly-chart"
import { CategoryBreakdown } from "@/components/dashboard/category-breakdown"
import { PaymentMethodChart } from "@/components/dashboard/payment-method-chart"
import { RecentTransactions } from "@/components/dashboard/recent-transactions"
import { TransactionFormDialog } from "@/components/transactions/transaction-form-dialog"
import { GoalCard } from "@/components/goals/goal-card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export default async function DashboardPage() {
  const [summary, categories, goals] = await Promise.all([
    getDashboardSummary(),
    getCategories(),
    getGoals(),
  ])

  const activeGoals = goals.filter((g) => g.status === "active").slice(0, 3)

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 md:px-6 md:py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Un vistazo a tus finanzas de este mes.</p>
        </div>
        <TransactionFormDialog categories={categories} />
      </div>

      <SummaryCards
        incomeMonth={summary.incomeMonth}
        expenseMonth={summary.expenseMonth}
        balanceMonth={summary.balanceMonth}
        balanceTotal={summary.balanceTotal}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <MonthlyChart data={summary.monthlySeries} />
        </div>
        <PaymentMethodChart data={summary.byPaymentMethod} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentTransactions transactions={summary.recent} />
        </div>
        <CategoryBreakdown data={summary.byCategory} />
      </div>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold tracking-tight">Metas en progreso</h2>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5"
            nativeButton={false}
            render={
              <Link href="/metas">
                Ver todas
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            }
          />
        </div>
        {activeGoals.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border p-8 text-center">
            <p className="text-sm font-medium">Aún no tienes metas activas</p>
            <p className="text-sm text-muted-foreground">Crea una meta de ahorro para empezar a dar seguimiento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activeGoals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
