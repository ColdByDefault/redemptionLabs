"use client";

import { useState, useTransition } from "react";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

import type { EntityType, FieldConfig } from "@/types/editor";
import {
  getFieldsForEntity,
  getEntityDisplayName,
  validateFormData,
  formatValueForInput,
  parseFormValue,
} from "@/lib/editor";
import { createEntity } from "@/app/actions/entity";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface EntityCreatorProps {
  entityType: EntityType;
  fields?: FieldConfig[];
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

function getDefaultValues(fields: FieldConfig[]): Record<string, unknown> {
  const data: Record<string, unknown> = {};
  for (const field of fields) {
    switch (field.type) {
      case "checkbox":
        data[field.name] = false;
        break;
      case "number":
        data[field.name] = field.min ?? 0;
        break;
      case "date":
        data[field.name] = new Date();
        break;
      case "select":
        data[field.name] = field.options?.[0]?.value ?? "";
        break;
      default:
        data[field.name] = "";
    }
  }
  return data;
}

export function EntityCreator({
  entityType,
  fields: customFields,
  onSuccess,
  trigger,
}: EntityCreatorProps): React.ReactNode {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fields = customFields ?? getFieldsForEntity(entityType);
  const displayName = getEntityDisplayName(entityType);

  const [formData, setFormData] = useState<Record<string, unknown>>(() =>
    getDefaultValues(fields)
  );

  function resetForm(): void {
    setFormData(getDefaultValues(fields));
    setErrors({});
  }

  function handleFieldChange(
    name: string,
    value: unknown,
    fieldType: FieldConfig["type"]
  ): void {
    const parsedValue =
      fieldType === "checkbox"
        ? value
        : parseFormValue(String(value), fieldType);
    setFormData((prev) => ({ ...prev, [name]: parsedValue }));
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
  }

  function handleSubmit(): void {
    const validation = validateFormData(formData, fields);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    startTransition(async () => {
      const result = await createEntity(entityType, formData);
      if (result.success) {
        toast.success(result.message);
        setOpen(false);
        resetForm();
        onSuccess?.();
      } else {
        toast.error(result.message);
      }
    });
  }

  function handleOpenChange(newOpen: boolean): void {
    setOpen(newOpen);
    if (!newOpen) {
      resetForm();
    }
  }

  function renderField(field: FieldConfig): React.ReactNode {
    const value = formData[field.name];
    const error = errors[field.name];

    switch (field.type) {
      case "text":
      case "email":
      case "number":
        return (
          <div key={field.name} className="grid gap-2">
            <Label htmlFor={field.name}>
              {field.label}
              {field.required && (
                <span className="ml-1 text-destructive">*</span>
              )}
            </Label>
            <Input
              id={field.name}
              type={field.type === "number" ? "number" : field.type}
              value={formatValueForInput(value, field.type)}
              onChange={(e) =>
                handleFieldChange(field.name, e.target.value, field.type)
              }
              placeholder={field.placeholder}
              min={field.min}
              max={field.max}
              step={field.step}
              className={error ? "border-destructive" : ""}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        );

      case "date":
        return (
          <div key={field.name} className="grid gap-2">
            <Label htmlFor={field.name}>
              {field.label}
              {field.required && (
                <span className="ml-1 text-destructive">*</span>
              )}
            </Label>
            <Input
              id={field.name}
              type="date"
              value={formatValueForInput(value, field.type)}
              onChange={(e) =>
                handleFieldChange(field.name, e.target.value, field.type)
              }
              className={error ? "border-destructive" : ""}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        );

      case "textarea":
        return (
          <div key={field.name} className="grid gap-2">
            <Label htmlFor={field.name}>
              {field.label}
              {field.required && (
                <span className="ml-1 text-destructive">*</span>
              )}
            </Label>
            <Textarea
              id={field.name}
              value={formatValueForInput(value, field.type)}
              onChange={(e) =>
                handleFieldChange(field.name, e.target.value, field.type)
              }
              placeholder={field.placeholder}
              className={error ? "border-destructive" : ""}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        );

      case "select":
        return (
          <div key={field.name} className="grid gap-2">
            <Label htmlFor={field.name}>
              {field.label}
              {field.required && (
                <span className="ml-1 text-destructive">*</span>
              )}
            </Label>
            <Select
              value={String(value ?? "")}
              onValueChange={(newValue) =>
                handleFieldChange(field.name, newValue, field.type)
              }
            >
              <SelectTrigger className={error ? "border-destructive" : ""}>
                <SelectValue
                  placeholder={`Select ${field.label.toLowerCase()}`}
                />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        );

      case "checkbox":
        return (
          <div key={field.name} className="flex items-center gap-2">
            <input
              id={field.name}
              type="checkbox"
              checked={Boolean(value)}
              onChange={(e) =>
                handleFieldChange(field.name, e.target.checked, field.type)
              }
              className="h-4 w-4 rounded border-input"
            />
            <Label htmlFor={field.name} className="cursor-pointer">
              {field.label}
            </Label>
          </div>
        );

      default:
        return null;
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add {displayName}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create {displayName}</DialogTitle>
          <DialogDescription>
            Fill in the details to create a new {displayName.toLowerCase()}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">{fields.map(renderField)}</div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create {displayName}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
