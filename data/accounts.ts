import type { Account } from "@/types/account";

export const accounts: Account[] = [
  {
    id: "1",
    email: "personal@gmail.com",
    provider: "google",
    label: "Personal",
    isPrimary: true,
    usages: [
      {
        service: "YouTube",
        category: "personal",
        description: "Main YouTube account",
      },
      {
        service: "Google Drive",
        category: "storage",
        description: "Personal documents",
      },
      { service: "Gmail", category: "email", description: "Primary email" },
      {
        service: "Netflix",
        category: "authentication",
        description: "Login with Google",
      },
    ],
    notes: "Main personal account",
  },
  {
    id: "2",
    email: "work@gmail.com",
    provider: "google",
    label: "Work",
    isPrimary: false,
    usages: [
      {
        service: "Google Workspace",
        category: "work",
        description: "Company workspace",
      },
      {
        service: "Slack",
        category: "authentication",
        description: "Work Slack login",
      },
      {
        service: "Notion",
        category: "authentication",
        description: "Work Notion",
      },
    ],
    notes: "Work-related services only",
  },
  {
    id: "3",
    email: "user@icloud.com",
    provider: "icloud",
    label: "Apple",
    isPrimary: true,
    usages: [
      {
        service: "iCloud Drive",
        category: "storage",
        description: "Apple ecosystem storage",
      },
      {
        service: "iCloud Backup",
        category: "backup",
        description: "iPhone/iPad backups",
      },
      {
        service: "Apple Music",
        category: "personal",
        description: "Music subscription",
      },
      {
        service: "App Store",
        category: "personal",
        description: "App purchases",
      },
    ],
    notes: "Apple ecosystem account",
  },
  {
    id: "4",
    email: "dev@gmail.com",
    provider: "google",
    label: "Development",
    isPrimary: false,
    usages: [
      {
        service: "Firebase",
        category: "development",
        description: "Dev projects",
      },
      {
        service: "Google Cloud",
        category: "development",
        description: "GCP services",
      },
      {
        service: "Android Dev",
        category: "development",
        description: "Play Store publishing",
      },
    ],
    notes: "Development and API services",
  },
];
