"use client"

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { MONTH_LABELS_ES, formatCOP } from "@/lib/constants"

const chartConfig: ChartConfig = {
  income: {
    label: "Ingresos",
    color: "var(--chart-2)",
  },
  expense: {
    label: "Gastos",
    color: "var(--chart-5)",
  },
}

export function MonthlyChart({
  data,
}: {
  data: { month: string; income: number; expense: number }[]
}) {
  const formatted = data.map((d) => {
    const [, monthNum] = d.month.split("-")
    return {
      ...d,
      label: MONTH_LABELS_ES[Number(monthNum) - 1],
    }
  })

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Rendimiento mensual</CardTitle>
        <CardDescription>Ingresos y gastos de los últimos 6 meses</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[280px] w-full">
          <AreaChart data={formatted} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
            <defs>
              <linearGradient id="fillIncome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-income)" stopOpacity={0.35} />
                <stop offset="95%" stopColor="var(--color-income)" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="fillExpense" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-expense)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--color-expense)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={48}
              tickFormatter={(value) => `${Math.round(value / 1000)}k`}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value) => formatCOP(Number(value))}
                  labelFormatter={(label) => label as string}
                />
              }
            />
            <Area
              dataKey="income"
              type="monotone"
              fill="url(#fillIncome)"
              stroke="var(--color-income)"
              strokeWidth={2}
            />
            <Area
              dataKey="expense"
              type="monotone"
              fill="url(#fillExpense)"
              stroke="var(--color-expense)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
