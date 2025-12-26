// Plugin manifest - describes the plugin for the registry
export const manifest = {
  id: "documents-hub",
  name: "Documents Hub",
  description: "Upload, organize, and manage your PDF documents securely.",
  version: "1.0.0",
  author: "ColdByDefault",
  iconName: "FileText" as const,
  route: "/documents",
  category: "productivity" as const,
  isCore: false,
  isPremium: false,
  packageName: "@coldbydefault/plugin-documents-hub",
};

export type PluginManifest = typeof manifest;
