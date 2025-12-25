---
applyTo: "**"
---

# Project Instructions

## Architecture: Separation of Concerns

When creating new features (tables, components, modules), follow this structure:

### 1. Types (`types/`)

Define all TypeScript interfaces and type aliases.

- Use union types for fixed values (e.g., `"active" | "inactive"`)
- Export all types for reuse
- No business logic, only type definitions

```typescript
// types/example.ts
export type ExampleStatus = "active" | "inactive";

export interface Example {
  id: string;
  name: string;
  status: ExampleStatus;
}
```

### 2. Data (`data/`)

Store static/mock data separately from components.

- Import types from `@/types`
- Export typed arrays or objects
- Keep data pure, no transformations

```typescript
// data/example.ts
import type { Example } from "@/types/example";

export const examples: Example[] = [
  { id: "1", name: "Item", status: "active" },
];
```

### 3. Business Logic (`lib/`)

All calculations, transformations, and helper functions.

- Pure functions only
- Import types from `@/types`
- Export utility functions for formatting, calculations, filtering
- Badge variant mappers go here

```typescript
// lib/example.ts
import type { Example, ExampleStatus } from "@/types/example";

export function getActiveCount(items: Example[]): number {
  return items.filter((i) => i.status === "active").length;
}

export function getStatusVariant(
  status: ExampleStatus
): "default" | "secondary" | "destructive" | "outline" {
  return status === "active" ? "default" : "outline";
}
```

### 4. UI Components (`components/<feature>/`)

Split into logical pieces:

#### Container Component (`Feature.tsx`)

- Imports data and child components
- Composes the full feature UI
- Minimal logic, delegates to lib functions

#### Table Component (`FeatureTable.tsx`)

- Receives data via props
- Uses shadcn/ui Table components
- Calls lib functions for formatting/variants

#### Summary Component (`FeatureSummary.tsx`)

- Displays aggregated stats
- Receives data via props
- Calls lib functions for calculations

#### Barrel Export (`index.ts`)

- Re-exports all public components

```typescript
// components/example/index.ts
export { Example } from "./Example";
export { ExampleTable } from "./ExampleTable";
export { ExampleSummary } from "./ExampleSummary";
```

## Component Guidelines

### Props Interfaces

- Define props interface above component
- Use descriptive names: `FeatureTableProps`, `FeatureSummaryProps`

### shadcn/ui Only

- Use only shadcn/ui components (Table, Badge, Button, etc.)
- No custom colors or styles outside Tailwind defaults
- Use Tailwind's built-in classes (e.g., `max-w-50` not `max-w-[200px]`)

### Type Safety

- Zero tolerance for `any` or `unknown`
- All functions must have explicit return types
- Use `type` imports: `import type { X } from "..."`

### Scalability

- Components receive data via props (not direct imports)
- Container component handles data fetching/imports
- Easy to swap static data for API calls later

## File Naming

| Layer      | Location                | Naming             |
| ---------- | ----------------------- | ------------------ |
| Types      | `types/<feature>.ts`    | lowercase singular |
| Data       | `data/<feature>.ts`     | lowercase plural   |
| Logic      | `lib/<feature>.ts`      | lowercase plural   |
| Components | `components/<feature>/` | PascalCase         |
