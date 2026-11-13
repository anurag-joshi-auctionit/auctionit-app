import type { ComponentType } from "react";
import { cn } from "../../lib/utils";

export type FilterButtonOption<T extends string> = {
  value: T;
  label: string;
  /** Optional leading icon (e.g. a "live" indicator). */
  icon?: ComponentType<{ className?: string }>;
  /** Optional count rendered after the label. */
  count?: number;
};

export type FilterButtonsProps<T extends string> = {
  options: FilterButtonOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
};

/**
 * A row of pill-shaped "named filter" buttons — one active at a time.
 * A lighter-weight alternative to tabs for status/quick filters.
 */
export function FilterButtons<T extends string>({
  options,
  value,
  onChange,
  className,
}: FilterButtonsProps<T>) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {options.map((opt) => {
        const active = opt.value === value;
        const Icon = opt.icon;
        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              "inline-flex h-9 items-center gap-1.5 rounded-md border px-3 text-sm transition-colors",
              active
                ? "border-foreground bg-muted text-foreground font-medium"
                : "border-border text-muted-foreground hover:bg-muted/50 hover:text-foreground",
            )}
          >
            {Icon ? <Icon className="size-3.5" /> : null}
            {opt.label}
            {opt.count !== undefined ? (
              <span
                className={cn(
                  "text-xs",
                  active ? "text-foreground" : "text-muted-foreground/80",
                )}
              >
                {opt.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
