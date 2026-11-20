"use client";

import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Check, ChevronDown, Search } from "lucide-react";
import { useMemo, useState } from "react";
import type { SelectFieldProps } from "./SimpleSelectField";

/** Click to open a list with a search box. Same props as `SimpleSelectField`. */
export function SearchSelectField({
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
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const items = useMemo(
    () =>
      options.map((o) => ({
        value: String(o[valueKey] ?? ""),
        label: String(o[labelKey] ?? ""),
      })),
    [options, valueKey, labelKey],
  );
  const current = value == null ? undefined : String(value);
  const selected = items.find((i) => i.value === current);
  const q = query.trim().toLowerCase();
  const shown = q ? items.filter((i) => i.label.toLowerCase().includes(q)) : items;

  return (
    <div className={cn("grid w-full gap-1", wrapperClassName)}>
      {label && (
        <Label htmlFor={id} className={cn(disabled && "text-muted-foreground")}>
          {label}
        </Label>
      )}
      <Popover
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          if (!o) setQuery("");
        }}
      >
        <PopoverTrigger
          id={id}
          disabled={disabled}
          aria-invalid={!!error}
          className={cn(
            "flex h-8 w-full items-center justify-between gap-1.5 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive dark:bg-input/30",
            !selected && "text-muted-foreground",
            className,
          )}
        >
          <span className="truncate">{selected?.label ?? placeholder}</span>
          <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-(--anchor-width) min-w-48 gap-1 p-1"
        >
          <div className="flex items-center gap-2 border-b px-2 pb-1">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search…"
              className="h-8 w-full bg-transparent text-sm outline-none"
            />
          </div>
          <ul className="max-h-60 overflow-y-auto">
            {shown.length === 0 && (
              <li className="px-2 py-3 text-center text-sm text-muted-foreground">
                No results
              </li>
            )}
            {shown.map((i) => (
              <li key={i.value}>
                <button
                  type="button"
                  onClick={() => {
                    onChange?.(i.value);
                    setOpen(false);
                  }}
                  className="flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                >
                  <span className="truncate">{i.label}</span>
                  {i.value === current && <Check className="size-4 shrink-0" />}
                </button>
              </li>
            ))}
          </ul>
        </PopoverContent>
      </Popover>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
