"use client";

import { useState, useTransition } from "react";
import { Pencil, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

import type { EntityType, FieldConfig } from "@/types/editor";
import {
  getFieldsForEntity,
  getEntityDisplayName,
  validateFormData,
  formatValueForInput,
  parseFormValue,
} from "@/lib/editor";
import { updateEntity, deleteEntity } from "@/app/actions/entity";

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

interface EntityEditorProps<T extends Record<string, unknown>> {
  entity: T;
  entityType: EntityType;
  fields?: FieldConfig[];
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

export function EntityEditor<T extends Record<string, unknown>>({
  entity,
  entityType,
  fields: customFields,
  onSuccess,
  trigger,
}: EntityEditorProps<T>): React.ReactNode {
  const [open, setOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fields = customFields ?? getFieldsForEntity(entityType);
  const displayName = getEntityDisplayName(entityType);

  const [formData, setFormData] = useState<Record<string, unknown>>(() => {
    const data: Record<string, unknown> = {};
    for (const field of fields) {
      data[field.name] = entity[field.name];
    }
    return data;
  });

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
      const result = await updateEntity(
        entityType,
        entity.id as string,
        formData
      );
      if (result.success) {
        toast.success(result.message);
        setOpen(false);
        onSuccess?.();
      } else {
        toast.error(result.message);
      }
    });
  }

  function handleDelete(): void {
    startTransition(async () => {
      const result = await deleteEntity(entityType, entity.id as string);
      if (result.success) {
        toast.success(result.message);
        setDeleteDialogOpen(false);
        setOpen(false);
        onSuccess?.();
      } else {
        toast.error(result.message);
      }
    });
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
                <span className="text-destructive ml-1">*</span>
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
                <span className="text-destructive ml-1">*</span>
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
                <span className="text-destructive ml-1">*</span>
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
                <span className="text-destructive ml-1">*</span>
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
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {trigger ?? (
            <Button variant="ghost" size="icon">
              <Pencil className="h-4 w-4" />
              <span className="sr-only">Edit {displayName}</span>
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit {displayName}</DialogTitle>
            <DialogDescription>
              Make changes to the {displayName.toLowerCase()}. Click save when
              done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">{fields.map(renderField)}</div>
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="destructive"
              onClick={() => setDeleteDialogOpen(true)}
              disabled={isPending}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
            <div className="flex flex-1 justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="button" onClick={handleSubmit} disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete {displayName}</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this {displayName.toLowerCase()}?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isPending}
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
