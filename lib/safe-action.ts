import { z } from "zod";

// ============================================================
// TYPES
// ============================================================

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export type ValidationError = {
  field: string;
  message: string;
};

export type ActionResultWithValidation<T> =
  | { success: true; data: T }
  | { success: false; error: string; validationErrors?: ValidationError[] };

// ============================================================
// SAFE ACTION WRAPPER
// ============================================================

/**
 * Wraps a server action with try-catch error handling
 * Returns a typed result object instead of throwing
 */
export async function safeAction<T>(
  action: () => Promise<T>
): Promise<ActionResult<T>> {
  try {
    const data = await action();
    return { success: true, data };
  } catch (error) {
    console.error("[SafeAction Error]:", error);

    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: "An unexpected error occurred" };
  }
}

// ============================================================
// VALIDATED ACTION WRAPPER
// ============================================================

/**
 * Wraps a server action with Zod validation and error handling
 * Validates input before executing the action
 */
export async function validatedAction<TInput, TOutput>(
  schema: z.ZodSchema<TInput>,
  input: unknown,
  action: (validatedInput: TInput) => Promise<TOutput>
): Promise<ActionResultWithValidation<TOutput>> {
  // Validate input
  const parseResult = schema.safeParse(input);

  if (!parseResult.success) {
    const validationErrors: ValidationError[] = parseResult.error.issues.map(
      (issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })
    );

    return {
      success: false,
      error: "Validation failed",
      validationErrors,
    };
  }

  // Execute action with validated input
  try {
    const data = await action(parseResult.data);
    return { success: true, data };
  } catch (error) {
    console.error("[ValidatedAction Error]:", error);

    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: "An unexpected error occurred" };
  }
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Type guard to check if result is successful
 */
export function isSuccess<T>(
  result: ActionResult<T> | ActionResultWithValidation<T>
): result is { success: true; data: T } {
  return result.success === true;
}

/**
 * Type guard to check if result has validation errors
 */
export function hasValidationErrors<T>(
  result: ActionResultWithValidation<T>
): result is {
  success: false;
  error: string;
  validationErrors: ValidationError[];
} {
  return (
    result.success === false &&
    "validationErrors" in result &&
    Array.isArray(result.validationErrors)
  );
}

/**
 * Extract error message from result
 */
export function getErrorMessage<T>(
  result: ActionResult<T> | ActionResultWithValidation<T>
): string | null {
  if (result.success) return null;
  return result.error;
}

/**
 * Extract validation errors as a record for form integration
 */
export function getFieldErrors<T>(
  result: ActionResultWithValidation<T>
): Record<string, string> {
  if (result.success || !("validationErrors" in result)) return {};

  const errors: Record<string, string> = {};
  for (const err of result.validationErrors ?? []) {
    errors[err.field] = err.message;
  }
  return errors;
}
