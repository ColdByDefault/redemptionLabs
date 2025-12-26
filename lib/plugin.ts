// Re-export from plugin registry for backward compatibility
export {
  getAllPlugins,
  getPluginsWithStatus,
  getEnabledPluginsForNav,
  isPluginInstalled,
  isPluginEnabled,
  getPluginById,
  getPluginByRoute,
  hasPluginAccess,
  getCategoryLabel,
  clearPluginCache,
  getInstallCommand,
  getUninstallCommand,
} from "@/lib/plugin-registry";
