import type { Plugin } from "@/types/plugin";

export const plugins: Plugin[] = [
  {
    id: "documents-hub",
    name: "Documents Hub",
    description: "Upload, organize, and manage your PDF documents securely.",
    iconName: "FileText",
    route: "/documents",
    category: "productivity",
    isCore: false,
    isPremium: false,
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
  },
  {
    id: "crm",
    name: "Contact Manager",
    description: "Manage your contacts and relationships in one place.",
    iconName: "Users",
    route: "/contacts",
    category: "communication",
    isCore: false,
    isPremium: true,
  },
];

export function getPluginById(id: string): Plugin | undefined {
  return plugins.find((p) => p.id === id);
}

export function getEnabledPlugins(enabledIds: string[]): Plugin[] {
  return plugins.filter((p) => enabledIds.includes(p.id));
}

export function getAvailablePlugins(): Plugin[] {
  return plugins.filter((p) => !p.isCore);
}
