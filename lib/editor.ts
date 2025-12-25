import type { EntityType, FieldConfig, SelectOption } from "@/types/editor";
import type { AccountProvider } from "@/types/account";
import type {
  BillingCycle,
  SubscriptionStatus,
  SubscriptionCategory,
} from "@/types/subscription";
import type {
  TransactionType,
  TransactionFrequency,
  TransactionCategory,
} from "@/types/finance";

// Helper to create select options from union types
function createOptions<T extends string>(values: readonly T[]): SelectOption[] {
  return values.map((value) => ({
    value,
    label: value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, " "),
  }));
}

// Account field options
const accountProviders: AccountProvider[] = [
  "google",
  "icloud",
  "microsoft",
  "github",
];

// Subscription field options
const billingCycles: BillingCycle[] = [
  "monthly",
  "yearly",
  "weekly",
  "one_time",
];
const subscriptionStatuses: SubscriptionStatus[] = [
  "active",
  "cancelled",
  "paused",
  "trial",
];
const subscriptionCategories: SubscriptionCategory[] = [
  "streaming",
  "software",
  "gaming",
  "cloud",
  "productivity",
  "other",
];

// Transaction field options
const transactionTypes: TransactionType[] = ["income", "expense"];
const transactionFrequencies: TransactionFrequency[] = [
  "monthly",
  "yearly",
  "one_time",
];
const transactionCategories: TransactionCategory[] = [
  "salary",
  "freelance",
  "investment",
  "rent",
  "utilities",
  "insurance",
  "food",
  "transport",
  "entertainment",
  "healthcare",
  "education",
  "shopping",
  "other",
];

// Field configurations for each entity type
export function getFieldsForEntity(entityType: EntityType): FieldConfig[] {
  switch (entityType) {
    case "account":
      return getAccountFields();
    case "subscription":
      return getSubscriptionFields();
    case "transaction":
      return getTransactionFields();
  }
}

function getAccountFields(): FieldConfig[] {
  return [
    {
      name: "email",
      label: "Email",
      type: "email",
      required: true,
      placeholder: "user@example.com",
    },
    {
      name: "provider",
      label: "Provider",
      type: "select",
      required: true,
      options: createOptions(accountProviders),
    },
    {
      name: "label",
      label: "Label",
      type: "text",
      required: true,
      placeholder: "e.g., Personal, Work",
    },
    {
      name: "isPrimary",
      label: "Primary Account",
      type: "checkbox",
    },
    {
      name: "notes",
      label: "Notes",
      type: "textarea",
      placeholder: "Additional notes...",
    },
  ];
}

function getSubscriptionFields(): FieldConfig[] {
  return [
    {
      name: "name",
      label: "Name",
      type: "text",
      required: true,
      placeholder: "e.g., Netflix, Spotify",
    },
    {
      name: "cost",
      label: "Cost",
      type: "number",
      required: true,
      min: 0,
      step: 0.01,
      placeholder: "9.99",
    },
    {
      name: "billingCycle",
      label: "Billing Cycle",
      type: "select",
      required: true,
      options: createOptions(billingCycles),
    },
    {
      name: "nextDueDate",
      label: "Next Due Date",
      type: "date",
      required: true,
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      required: true,
      options: createOptions(subscriptionStatuses),
    },
    {
      name: "category",
      label: "Category",
      type: "select",
      required: true,
      options: createOptions(subscriptionCategories),
    },
    {
      name: "notes",
      label: "Notes",
      type: "textarea",
      placeholder: "Additional notes...",
    },
  ];
}

function getTransactionFields(): FieldConfig[] {
  return [
    {
      name: "name",
      label: "Name",
      type: "text",
      required: true,
      placeholder: "e.g., Monthly Salary",
    },
    {
      name: "amount",
      label: "Amount",
      type: "number",
      required: true,
      min: 0,
      step: 0.01,
      placeholder: "1000.00",
    },
    {
      name: "type",
      label: "Type",
      type: "select",
      required: true,
      options: createOptions(transactionTypes),
    },
    {
      name: "frequency",
      label: "Frequency",
      type: "select",
      required: true,
      options: createOptions(transactionFrequencies),
    },
    {
      name: "category",
      label: "Category",
      type: "select",
      required: true,
      options: createOptions(transactionCategories),
    },
    {
      name: "dueDay",
      label: "Due Day",
      type: "number",
      required: true,
      min: 1,
      max: 31,
      placeholder: "1-31",
    },
    {
      name: "isActive",
      label: "Active",
      type: "checkbox",
    },
    {
      name: "notes",
      label: "Notes",
      type: "textarea",
      placeholder: "Additional notes...",
    },
  ];
}

// Get entity display name
export function getEntityDisplayName(entityType: EntityType): string {
  switch (entityType) {
    case "account":
      return "Account";
    case "subscription":
      return "Subscription";
    case "transaction":
      return "Transaction";
  }
}

// Validate form data
export function validateFormData(
  data: Record<string, unknown>,
  fields: FieldConfig[]
): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  for (const field of fields) {
    const value = data[field.name];

    if (field.required) {
      if (value === undefined || value === null || value === "") {
        errors[field.name] = `${field.label} is required`;
        continue;
      }
    }

    if (value !== undefined && value !== null && value !== "") {
      switch (field.type) {
        case "email":
          if (typeof value === "string" && !isValidEmail(value)) {
            errors[field.name] = "Invalid email address";
          }
          break;
        case "number":
          const numValue = Number(value);
          if (isNaN(numValue)) {
            errors[field.name] = "Must be a number";
          } else {
            if (field.min !== undefined && numValue < field.min) {
              errors[field.name] = `Must be at least ${field.min}`;
            }
            if (field.max !== undefined && numValue > field.max) {
              errors[field.name] = `Must be at most ${field.max}`;
            }
          }
          break;
      }
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Format value for display in form
export function formatValueForInput(
  value: unknown,
  fieldType: FieldConfig["type"]
): string {
  if (value === undefined || value === null) return "";

  if (fieldType === "date" && value instanceof Date) {
    const dateStr = value.toISOString().split("T")[0];
    return dateStr ?? "";
  }

  if (fieldType === "checkbox") {
    return String(Boolean(value));
  }

  return String(value);
}

// Parse form value to correct type
export function parseFormValue(
  value: string,
  fieldType: FieldConfig["type"]
): unknown {
  switch (fieldType) {
    case "number":
      return value === "" ? 0 : parseFloat(value);
    case "checkbox":
      return value === "true";
    case "date":
      return value ? new Date(value) : null;
    default:
      return value;
  }
}
