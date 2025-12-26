import Link from "next/link";
import { navLinks } from "@/data/navbar";
import { getDashboardData } from "@/actions/finance";
import { Dashboard } from "@/components/dashboard";

export default async function Home(): Promise<React.ReactElement> {
  const dashboardData = await getDashboardData();

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
