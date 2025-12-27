"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, FileText, BarChart3, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { togglePluginAction } from "@/actions/plugin";
import { toast } from "sonner";
import type { PluginWithStatus, PluginIconName } from "@/types/plugin";
import type { LucideIcon } from "lucide-react";

const iconMap: Record<PluginIconName, LucideIcon> = {
  FileText,
  BarChart3,
  Users,
};

interface PluginCardProps {
  plugin: PluginWithStatus;
}

export function PluginCard({ plugin }: PluginCardProps): React.ReactElement {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const Icon = iconMap[plugin.iconName];

  async function handleToggle() {
    setIsLoading(true);

    const result = await togglePluginAction(plugin.id, !plugin.isEnabled);

    if (result.success) {
      toast.success(
        plugin.isEnabled ? `${plugin.name} disabled` : `${plugin.name} enabled`
      );
      router.refresh();
    } else {
      toast.error(result.error);
    }

    setIsLoading(false);
  }

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-900">
            <Icon className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-zinc-900 dark:text-zinc-100">
                {plugin.name}
              </h3>
              {plugin.isPremium && <Badge variant="secondary">Premium</Badge>}
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {plugin.category}
            </p>
          </div>
        </div>

        <Button
          variant={plugin.isEnabled ? "outline" : "default"}
          size="sm"
          onClick={handleToggle}
          disabled={isLoading || plugin.isPremium}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : plugin.isEnabled ? (
            <>
              <Check className="mr-1 h-4 w-4" />
              Enabled
            </>
          ) : (
            "Enable"
          )}
        </Button>
      </div>

      <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-300">
        {plugin.description}
      </p>
    </div>
  );
}
