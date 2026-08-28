import { getTransactions } from "@/app/actions/transactions"
import { getCategories } from "@/app/actions/categories"
import { TransactionsTable } from "@/components/transactions/transactions-table"
import { TransactionsFilters } from "@/components/transactions/transactions-filters"
import { TransactionFormDialog } from "@/components/transactions/transaction-form-dialog"
import { CategoryFormDialog } from "@/components/transactions/category-form-dialog"
import { Suspense } from "react"

export default async function MovimientosPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; categoryId?: string; paymentMethod?: string }>
}) {
  const params = await searchParams
  const categories = await getCategories()

  const transactions = await getTransactions({
    type: params.type === "expense" || params.type === "income" ? params.type : undefined,
    categoryId: params.categoryId ? Number(params.categoryId) : undefined,
    paymentMethod: params.paymentMethod,
  })

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-5 sm:gap-6 sm:px-6 sm:py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Movimientos</h1>
          <p className="text-sm text-muted-foreground">Registra y consulta tus gastos e ingresos.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <CategoryFormDialog />
          <TransactionFormDialog categories={categories} />
        </div>
      </div>

      <Suspense>
        <TransactionsFilters categories={categories} />
      </Suspense>

      <TransactionsTable transactions={transactions} categories={categories} />
    </main>
  )
}
