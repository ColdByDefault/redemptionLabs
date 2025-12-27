import { plugins } from "@/data/plugins";
import type { Plugin, PluginWithStatus } from "@/types/plugin";

/**
 * Get all plugins with their enabled status for a user
 */
export function getPluginsWithStatus(
  enabledPluginIds: string[]
): PluginWithStatus[] {
  return plugins.map((plugin) => ({
    ...plugin,
    isEnabled: enabledPluginIds.includes(plugin.id),
  }));
}

/**
 * Get enabled plugins for navbar
 */
export function getEnabledPluginsForNav(enabledPluginIds: string[]): Plugin[] {
  return plugins.filter((p) => enabledPluginIds.includes(p.id));
}

/**
 * Check if a plugin is enabled for a user
 */
export function isPluginEnabled(
  pluginId: string,
  enabledPluginIds: string[]
): boolean {
  return enabledPluginIds.includes(pluginId);
}

/**
 * Get plugin category label
 */
export function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    productivity: "Productivity",
    finance: "Finance",
    analytics: "Analytics",
    communication: "Communication",
  };
  return labels[category] || category;
}

/**
 * Get plugin by route
 */
export function getPluginByRoute(route: string): Plugin | undefined {
  return plugins.find((p) => p.route === route);
}

/**
 * Validate user has access to a plugin route
 */
export function hasPluginAccess(
  route: string,
  enabledPluginIds: string[]
): boolean {
  const plugin = getPluginByRoute(route);
  if (!plugin) return true; // Not a plugin route
  return enabledPluginIds.includes(plugin.id);
}
