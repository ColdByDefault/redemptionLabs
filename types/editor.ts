// Field types supported by the EntityEditor
export type FieldType =
  | "text"
  | "number"
  | "email"
  | "textarea"
  | "select"
  | "checkbox"
  | "date";

// Configuration for a single form field
export interface FieldConfig {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  options?: SelectOption[]; // For select fields
  min?: number; // For number fields
  max?: number; // For number fields
  step?: number; // For number fields
}

// Option for select fields
export interface SelectOption {
  value: string;
  label: string;
}

// Entity type identifiers
export type EntityType = "account" | "subscription" | "transaction";

// Result of a server action
export interface ActionResult {
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
}

// Props for the EntityEditor component
export interface EntityEditorProps<T extends Record<string, unknown>> {
  entity: T;
  entityType: EntityType;
  fields: FieldConfig[];
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}
