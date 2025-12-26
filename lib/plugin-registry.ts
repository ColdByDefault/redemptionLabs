// Plugin Registry - Auto-detects installed plugins from node_modules
// This file scans for installed @coldbydefault plugins and registers them

import type { Plugin, PluginWithStatus } from "@/types/plugin";

export interface PluginManifest {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  iconName: string;
  route: string;
  category: string;
  isCore: boolean;
  isPremium: boolean;
  packageName: string;
}

// List of known plugin packages (checked for installation)
const KNOWN_PLUGINS: Plugin[] = [
  {
    id: "documents-hub",
    name: "Documents Hub",
    description: "Upload, organize, and manage your PDF documents securely.",
    iconName: "FileText",
    route: "/documents",
    category: "productivity",
    isCore: false,
    isPremium: false,
    packageName: "@coldbydefault/plugin-documents-hub",
  },
  {
    id: "analytics",
    name: "Analytics Dashboard",
    description: "Advanced analytics and insights for your financial data.",
    iconName: "BarChart3",
    route: "/analytics",
    category: "analytics",
    isCore: false,
    isPremium: true,
    packageName: "@coldbydefault/plugin-analytics",
  },
];

// Cache for installed plugins (populated at build time)
let installedPluginsCache: Map<string, PluginManifest> | null = null;

/**
 * Check if a plugin package is installed by trying to require its manifest
 */
function checkPluginInstalled(packageName: string): PluginManifest | null {
  try {
    // Try to require the manifest from the package
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const manifestModule = require(`${packageName}/manifest`);
    return manifestModule.manifest || manifestModule.default || null;
  } catch {
    return null;
  }
}

/**
 * Scan for all installed plugins and cache the results
 */
function scanInstalledPlugins(): Map<string, PluginManifest> {
  if (installedPluginsCache) {
    return installedPluginsCache;
  }

  installedPluginsCache = new Map();

  for (const plugin of KNOWN_PLUGINS) {
    if (plugin.packageName) {
      const manifest = checkPluginInstalled(plugin.packageName);
      if (manifest) {
        installedPluginsCache.set(plugin.id, manifest);
      }
    }
  }

  return installedPluginsCache;
}

/**
 * Get all known plugins with their installation status
 */
export function getAllPlugins(): (Plugin & { isInstalled: boolean })[] {
  const installed = scanInstalledPlugins();

  return KNOWN_PLUGINS.map((plugin) => ({
    ...plugin,
    isInstalled: installed.has(plugin.id),
  }));
}

/**
 * Get all plugins with their enabled status for a user
 */
export function getPluginsWithStatus(
  enabledPluginIds: string[]
): PluginWithStatus[] {
  const allPlugins = getAllPlugins();

  return allPlugins.map((plugin) => ({
    ...plugin,
    isEnabled: plugin.isInstalled && enabledPluginIds.includes(plugin.id),
  }));
}

/**
 * Get enabled plugins for navbar (only installed & enabled)
 */
export function getEnabledPluginsForNav(enabledPluginIds: string[]): Plugin[] {
  return getAllPlugins().filter(
    (p) => p.isInstalled && enabledPluginIds.includes(p.id)
  );
}

/**
 * Check if a plugin is installed
 */
export function isPluginInstalled(pluginId: string): boolean {
  const installed = scanInstalledPlugins();
  return installed.has(pluginId);
}

/**
 * Check if a plugin is enabled for a user (must be installed AND enabled)
 */
export function isPluginEnabled(
  pluginId: string,
  enabledPluginIds: string[]
): boolean {
  return isPluginInstalled(pluginId) && enabledPluginIds.includes(pluginId);
}

/**
 * Get plugin by ID
 */
export function getPluginById(id: string): Plugin | undefined {
  return KNOWN_PLUGINS.find((p) => p.id === id);
}

/**
 * Get plugin by route
 */
export function getPluginByRoute(route: string): Plugin | undefined {
  return KNOWN_PLUGINS.find((p) => p.route === route);
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
  return isPluginEnabled(plugin.id, enabledPluginIds);
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
 * Clear the plugin cache (call after installing/uninstalling plugins)
 */
export function clearPluginCache(): void {
  installedPluginsCache = null;
}

/**
 * Get install command for a plugin
 */
export function getInstallCommand(pluginId: string): string | null {
  const plugin = getPluginById(pluginId);
  if (!plugin?.packageName) return null;
  return `npm install ${plugin.packageName} --registry=https://npm.pkg.github.com`;
}

/**
 * Get uninstall command for a plugin
 */
export function getUninstallCommand(pluginId: string): string | null {
  const plugin = getPluginById(pluginId);
  if (!plugin?.packageName) return null;
  return `npm uninstall ${plugin.packageName}`;
}
