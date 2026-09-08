import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { getPockets } from "@/app/actions/pockets"
import { PocketCard } from "@/components/pockets/pocket-card"
import { PocketFormDialog } from "@/components/pockets/pocket-form-dialog"
import { formatCOP } from "@/lib/constants"
import { Card, CardContent } from "@/components/ui/card"
import { PiggyBank } from "lucide-react"

export default async function BolsillosPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect("/sign-in")

  const pockets = await getPockets()
  const totalSaved = pockets.reduce((sum, p) => sum + Number(p.currentAmount), 0)

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-5 sm:gap-6 sm:px-6 sm:py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Bolsillos</h1>
          <p className="text-sm text-muted-foreground">
            Aparta dinero que ya tienes en tu cuenta, sin sacarlo del banco.
          </p>
        </div>
        <PocketFormDialog />
      </div>

      <Card className="shadow-sm">
        <CardContent className="flex items-center gap-3 p-4 sm:p-5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <PiggyBank className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm text-muted-foreground">Total apartado en bolsillos</p>
            <p className="font-mono text-xl font-semibold">{formatCOP(totalSaved)}</p>
          </div>
        </CardContent>
      </Card>

      {pockets.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border p-10 text-center">
          <p className="text-sm font-medium">Aún no tienes bolsillos</p>
          <p className="text-sm text-muted-foreground">
            Crea uno para apartar dinero de tu balance libre en cuenta y ahorrarlo.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pockets.map((pocket) => (
            <PocketCard key={pocket.id} pocket={pocket} />
          ))}
        </div>
      )}
    </main>
  )
}
