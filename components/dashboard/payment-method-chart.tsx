"use client"

import { Cell, Pie, PieChart } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { formatCOP, getPaymentMethodLabel } from "@/lib/constants"

const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)"]

export function PaymentMethodChart({
  data,
}: {
  data: { paymentMethod: string; total: number }[]
}) {
  const chartData = data.map((d, i) => ({
    name: getPaymentMethodLabel(d.paymentMethod),
    value: d.total,
    fill: COLORS[i % COLORS.length],
  }))

  const chartConfig: ChartConfig = chartData.reduce((acc, d, i) => {
    acc[d.name] = { label: d.name, color: COLORS[i % COLORS.length] }
    return acc
  }, {} as ChartConfig)

  const total = chartData.reduce((sum, d) => sum + d.value, 0)

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Gastos por método de pago</CardTitle>
        <CardDescription>Este mes</CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aún no registras gastos este mes.</p>
        ) : (
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <ChartContainer config={chartConfig} className="h-[180px] w-[180px] shrink-0">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent formatter={(value) => formatCOP(Number(value))} />} />
                <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={70} strokeWidth={2}>
                  {chartData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="flex w-full flex-col gap-2">
              {chartData.map((d) => (
                <div key={d.name} className="flex items-center justify-between gap-2 text-sm">
                  <span className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.fill }} />
                    {d.name}
                  </span>
                  <span className="font-mono text-muted-foreground">
                    {total > 0 ? Math.round((d.value / total) * 100) : 0}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
