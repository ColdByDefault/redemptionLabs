import { PluginCard } from "./PluginCard";
import type { PluginWithStatus } from "@/types/plugin";

interface MarketplaceProps {
  plugins: PluginWithStatus[];
}

export function Marketplace({ plugins }: MarketplaceProps): React.ReactElement {
  const freePlugins = plugins.filter((p) => !p.isPremium);
  const premiumPlugins = plugins.filter((p) => p.isPremium);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Free Plugins
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {freePlugins.map((plugin) => (
            <PluginCard key={plugin.id} plugin={plugin} />
          ))}
        </div>
      </div>

      {premiumPlugins.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Premium Plugins
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {premiumPlugins.map((plugin) => (
              <PluginCard key={plugin.id} plugin={plugin} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
