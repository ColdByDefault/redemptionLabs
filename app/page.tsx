import Link from "next/link";
import { navLinks } from "@/data/navbar";
import { getDashboardData, getChartData } from "@/actions/finance";
import { Dashboard } from "@/components/dashboard";
import { FinanceCharts } from "@/components/charts";

export default async function Home(): Promise<React.ReactElement> {
  const [dashboardData, chartData] = await Promise.all([
    getDashboardData(),
    getChartData(),
  ]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Welcome to Redemption</h1>
          <p className="text-muted-foreground mt-1">
            Your HomeLab management dashboard
          </p>
        </div>

        {/* Dashboard */}
        <Dashboard data={dashboardData} />

        {/* Charts Section */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-6">Financial Analytics</h2>
          <FinanceCharts
            incomes={chartData.incomes}
            expenses={chartData.recurringExpenses}
            banks={chartData.banks}
          />
        </div>

        {/* Quick Links */}
        <div className="mt-8 flex gap-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
