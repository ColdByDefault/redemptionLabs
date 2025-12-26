"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { ExpenseBreakdownData, ExpenseBreakdownItem } from "@/types/chart";
import { formatChartCurrency, formatChartPercentage } from "@/lib/chart";
import { useMounted } from "@/store";

interface ExpensePieChartProps {
  data: ExpenseBreakdownData;
  title?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: ExpenseBreakdownItem;
  }>;
}

// Type for recharts label render props with our custom data
interface LabelRenderProps {
  name?: string;
  percentage?: number;
  value?: number;
  cx?: number;
  cy?: number;
  midAngle?: number;
  innerRadius?: number;
  outerRadius?: number;
  index?: number;
}

function CustomTooltip({
  active,
  payload,
}: CustomTooltipProps): React.ReactElement | null {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const item = payload[0]?.payload;
  if (!item) return null;

  return (
    <div className="bg-popover border border-border rounded-md p-3 shadow-lg">
      <p className="font-medium text-foreground">{item.name}</p>
      <p className="text-sm text-muted-foreground">
        {formatChartCurrency(item.value)} (
        {formatChartPercentage(item.percentage)})
      </p>
    </div>
  );
}

function renderCustomLabel(props: LabelRenderProps): string {
  const { name, percentage } = props;
  if (!name || percentage === undefined) return "";
  return `${name}: ${formatChartPercentage(percentage)}`;
}

export function ExpensePieChart({
  data,
  title = "Expense Breakdown",
}: ExpensePieChartProps): React.ReactElement {
  const mounted = useMounted();

  // Convert data for recharts compatibility
  const chartData = data.items.map((item) => ({
    ...item,
    name: item.name,
    value: item.value,
    color: item.color,
    percentage: item.percentage,
  }));

  if (!mounted) {
    return (
      <div className="w-full h-80 flex items-center justify-center">
        <div className="animate-pulse bg-muted rounded-full w-48 h-48" />
      </div>
    );
  }

  if (data.items.length === 0) {
    return (
      <div className="w-full h-80 flex flex-col items-center justify-center text-muted-foreground">
        <p>No expense data available</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
              nameKey="name"
              label={renderCustomLabel}
              labelLine={false}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value) => (
                <span className="text-foreground text-sm">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 text-center">
        <p className="text-sm text-muted-foreground">
          Total:{" "}
          <span className="font-semibold text-foreground">
            {formatChartCurrency(data.total)}
          </span>
        </p>
      </div>
    </div>
  );
}
