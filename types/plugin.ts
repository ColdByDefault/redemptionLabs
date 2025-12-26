export type PluginId = "documents-hub" | "analytics" | "crm";

export type PluginCategory =
  | "productivity"
  | "finance"
  | "analytics"
  | "communication";

export type PluginIconName = "FileText" | "BarChart3" | "Users";

export interface Plugin {
  id: PluginId;
  name: string;
  description: string;
  iconName: PluginIconName;
  route: string;
  category: PluginCategory;
  isCore: boolean;
  isPremium: boolean;
  packageName?: string; // npm package name for installable plugins
}

export interface PluginWithStatus extends Plugin {
  isEnabled: boolean;
  isInstalled?: boolean;
}
