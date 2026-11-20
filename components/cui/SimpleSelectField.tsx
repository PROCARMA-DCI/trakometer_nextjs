"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type SelectOption = Record<string, unknown>;

export interface SelectFieldProps {
  id?: string;
  label?: string;
  placeholder?: string;
  /** Items to choose from. Use `valueKey` / `labelKey` to match your shape. */
  options: SelectOption[];
  value?: string | number | null;
  onChange?: (value: string) => void;
  error?: string | null;
  disabled?: boolean;
  className?: string;
  wrapperClassName?: string;
  valueKey?: string;
  labelKey?: string;
}

/** Shadcn select in one tag: `<SimpleSelectField options={...} value onChange />`. */
export function SimpleSelectField({
  id,
  label,
  placeholder = "Select…",
  options,
  value,
  onChange,
  error,
  disabled,
  className,
  wrapperClassName,
  valueKey = "value",
  labelKey = "label",
}: SelectFieldProps) {
  const items = options.map((o) => ({
    value: String(o[valueKey] ?? ""),
    label: String(o[labelKey] ?? ""),
  }));

  return (
    <div className={cn("grid w-full gap-1", wrapperClassName)}>
      {label && (
        <Label htmlFor={id} className={cn(disabled && "text-muted-foreground")}>
          {label}
        </Label>
      )}
      <Select
        items={items}
        value={value == null ? null : String(value)}
        onValueChange={(v) => onChange?.(v == null ? "" : String(v))}
        disabled={disabled}
      >
        <SelectTrigger
          id={id}
          aria-invalid={!!error}
          className={cn("w-full", className)}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent alignItemWithTrigger={false}>
          {items.map((i) => (
            <SelectItem key={i.value} value={i.value}>
              {i.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
