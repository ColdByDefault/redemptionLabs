"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { IncomeVsExpensesData } from "@/types/chart";
import { formatChartCurrency, CHART_COLORS } from "@/lib/chart";
import { useMounted } from "@/store";

interface IncomeExpensesLineChartProps {
  data: IncomeVsExpensesData;
  title?: string;
  showNet?: boolean;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    dataKey: string;
    value: number;
    color: string;
  }>;
  label?: string;
}

function CustomTooltip({
  active,
  payload,
  label,
}: CustomTooltipProps): React.ReactElement | null {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  return (
    <div className="bg-popover border border-border rounded-md p-3 shadow-lg">
      <p className="font-medium text-foreground mb-2">{label}</p>
      {payload.map((entry) => (
        <p
          key={entry.dataKey}
          className="text-sm"
          style={{ color: entry.color }}
        >
          {entry.dataKey.charAt(0).toUpperCase() + entry.dataKey.slice(1)}:{" "}
          {formatChartCurrency(entry.value)}
        </p>
      ))}
    </div>
  );
}

export function IncomeExpensesLineChart({
  data,
  title = "Income vs Expenses",
  showNet = true,
}: IncomeExpensesLineChartProps): React.ReactElement {
  const mounted = useMounted();

  if (!mounted) {
    return (
      <div className="w-full h-80 flex items-center justify-center">
        <div className="animate-pulse bg-muted rounded-md w-full h-64" />
      </div>
    );
  }

  if (data.points.length === 0) {
    return (
      <div className="w-full h-80 flex flex-col items-center justify-center text-muted-foreground">
        <p>No financial data available</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data.points}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#6b7280"
              opacity={0.3}
            />
            <XAxis
              dataKey="month"
              tick={{ fill: "#9ca3af", fontSize: 12 }}
              tickLine={{ stroke: "#6b7280" }}
              axisLine={{ stroke: "#6b7280" }}
            />
            <YAxis
              tickFormatter={formatChartCurrency}
              tick={{ fill: "#9ca3af", fontSize: 12 }}
              tickLine={{ stroke: "#6b7280" }}
              axisLine={{ stroke: "#6b7280" }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              formatter={(value) => (
                <span className="text-foreground text-sm capitalize">
                  {value}
                </span>
              )}
            />
            <Line
              type="monotone"
              dataKey="income"
              stroke={CHART_COLORS.income}
              strokeWidth={2}
              dot={{ fill: CHART_COLORS.income, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="expenses"
              stroke={CHART_COLORS.expenses}
              strokeWidth={2}
              dot={{ fill: CHART_COLORS.expenses, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
            {showNet && (
              <Line
                type="monotone"
                dataKey="net"
                stroke={CHART_COLORS.net}
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: CHART_COLORS.net, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 flex justify-center gap-8 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Avg Income:</span>
          <span className="font-semibold text-green-500">
            {formatChartCurrency(data.averageIncome)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Avg Expenses:</span>
          <span className="font-semibold text-red-500">
            {formatChartCurrency(data.averageExpenses)}
          </span>
        </div>
      </div>
    </div>
  );
}
