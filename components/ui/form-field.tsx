import * as React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

// ============================================================
// TYPES
// ============================================================

interface FormFieldBaseProps {
  label: string;
  error?: string;
  description?: string;
  required?: boolean;
}

interface FormInputFieldProps
  extends FormFieldBaseProps,
    Omit<React.ComponentProps<"input">, "className"> {
  inputClassName?: string;
}

interface FormTextareaFieldProps
  extends FormFieldBaseProps,
    Omit<React.ComponentProps<"textarea">, "className"> {
  textareaClassName?: string;
}

// ============================================================
// FORM FIELD WRAPPER
// ============================================================

interface FormFieldWrapperProps {
  label: string;
  error?: string | undefined;
  description?: string | undefined;
  required?: boolean | undefined;
  htmlFor?: string | undefined;
  children: React.ReactNode;
}

function FormFieldWrapper({
  label,
  error,
  description,
  required,
  htmlFor,
  children,
}: FormFieldWrapperProps): React.ReactElement {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor} className={cn(error && "text-destructive")}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {children}
      {description && !error && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

// ============================================================
// FORM INPUT FIELD
// ============================================================

function FormInputField({
  label,
  error,
  description,
  required,
  inputClassName,
  id,
  ...inputProps
}: FormInputFieldProps): React.ReactElement {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <FormFieldWrapper
      label={label}
      error={error}
      description={description}
      required={required}
      htmlFor={inputId}
    >
      <Input
        id={inputId}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : undefined}
        className={inputClassName}
        {...inputProps}
      />
    </FormFieldWrapper>
  );
}

// ============================================================
// FORM TEXTAREA FIELD
// ============================================================

function FormTextareaField({
  label,
  error,
  description,
  required,
  textareaClassName,
  id,
  ...textareaProps
}: FormTextareaFieldProps): React.ReactElement {
  const textareaId = id ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <FormFieldWrapper
      label={label}
      error={error}
      description={description}
      required={required}
      htmlFor={textareaId}
    >
      <Textarea
        id={textareaId}
        aria-invalid={!!error}
        aria-describedby={error ? `${textareaId}-error` : undefined}
        className={textareaClassName}
        {...textareaProps}
      />
    </FormFieldWrapper>
  );
}

// ============================================================
// FORM ERROR MESSAGE (standalone)
// ============================================================

interface FormErrorMessageProps {
  error?: string;
  className?: string;
}

function FormErrorMessage({
  error,
  className,
}: FormErrorMessageProps): React.ReactElement | null {
  if (!error) return null;

  return <p className={cn("text-xs text-destructive", className)}>{error}</p>;
}

// ============================================================
// FORM DESCRIPTION (standalone)
// ============================================================

interface FormDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

function FormDescription({
  children,
  className,
}: FormDescriptionProps): React.ReactElement {
  return (
    <p className={cn("text-xs text-muted-foreground", className)}>{children}</p>
  );
}

// ============================================================
// EXPORTS
// ============================================================

export {
  FormFieldWrapper,
  FormInputField,
  FormTextareaField,
  FormErrorMessage,
  FormDescription,
};
