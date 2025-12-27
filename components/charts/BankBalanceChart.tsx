"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { BankBalanceHistoryData } from "@/types/chart";
import { formatChartCurrency, CHART_COLORS } from "@/lib/chart";
import { useMounted } from "@/store";

interface BankBalanceChartProps {
  data: BankBalanceHistoryData;
  title?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: {
      date: string;
      balance: number;
    };
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

  const data = payload[0];
  if (!data) return null;

  return (
    <div className="bg-popover border border-border rounded-md p-3 shadow-lg">
      <p className="font-medium text-foreground">{label}</p>
      <p className="text-sm" style={{ color: CHART_COLORS.balance }}>
        Balance: {formatChartCurrency(data.value)}
      </p>
    </div>
  );
}

export function BankBalanceChart({
  data,
  title = "Bank Balance History",
}: BankBalanceChartProps): React.ReactElement {
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
        <p>No balance history available</p>
      </div>
    );
  }

  // Calculate nice Y-axis domain with padding
  const minBalance = data.lowestBalance;
  const maxBalance = data.highestBalance;
  const padding = (maxBalance - minBalance) * 0.1;
  const yDomain = [Math.max(0, minBalance - padding), maxBalance + padding];

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data.points}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <defs>
              <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={CHART_COLORS.balance}
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor={CHART_COLORS.balance}
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#6b7280"
              opacity={0.3}
            />
            <XAxis
              dataKey="date"
              tick={{ fill: "#9ca3af", fontSize: 12 }}
              tickLine={{ stroke: "#6b7280" }}
              axisLine={{ stroke: "#6b7280" }}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={yDomain}
              tickFormatter={formatChartCurrency}
              tick={{ fill: "#9ca3af", fontSize: 12 }}
              tickLine={{ stroke: "#6b7280" }}
              axisLine={{ stroke: "#6b7280" }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="balance"
              stroke={CHART_COLORS.balance}
              strokeWidth={2}
              fill="url(#balanceGradient)"
              dot={false}
              activeDot={{
                fill: CHART_COLORS.balance,
                strokeWidth: 2,
                r: 6,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 flex justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Current:</span>
          <span className="font-semibold text-foreground">
            {formatChartCurrency(data.currentBalance)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Low:</span>
          <span className="font-semibold text-red-500">
            {formatChartCurrency(data.lowestBalance)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">High:</span>
          <span className="font-semibold text-green-500">
            {formatChartCurrency(data.highestBalance)}
          </span>
        </div>
      </div>
    </div>
  );
}
