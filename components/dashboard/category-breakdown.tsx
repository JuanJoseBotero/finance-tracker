import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { formatCOP, getCategoryIcon } from "@/lib/constants"

export function CategoryBreakdown({
  data,
}: {
  data: { categoryId: number; name: string; icon: string; total: number }[]
}) {
  const max = Math.max(...data.map((d) => d.total), 1)

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Gastos por categoría</CardTitle>
        <CardDescription>Este mes</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {data.length === 0 && (
          <p className="text-sm text-muted-foreground">Aún no registras gastos este mes.</p>
        )}
        {data.slice(0, 6).map((item) => {
          const Icon = getCategoryIcon(item.icon)
          const pct = Math.round((item.total / max) * 100)
          return (
            <div key={item.categoryId} className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <div className="flex-1">
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <span className="text-sm font-medium">{item.name}</span>
                  <span className="font-mono text-sm text-muted-foreground">{formatCOP(item.total)}</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                </div>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
