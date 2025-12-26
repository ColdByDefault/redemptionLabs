import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Marketplace } from "@/components/marketplace";
import { getPluginsWithStatus } from "@/lib/plugin";
import { getUserById } from "@/lib/auth";

export default async function MarketplacePage(): Promise<React.ReactElement> {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Fetch fresh plugin data from database (not from session cache)
  const user = await getUserById(session.user.id);
  if (!user) {
    redirect("/login");
  }

  const plugins = getPluginsWithStatus(user.enabledPlugins);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Plugin Marketplace
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          Enable or disable plugins to customize your experience
        </p>
      </div>

      <Marketplace plugins={plugins} />
    </div>
  );
}
