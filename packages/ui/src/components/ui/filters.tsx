import { FilterFunnel02 } from "@untitledui/icons";
import { useMemo, useState } from "react";
import {
  getFieldLabel,
  getOperatorsForField,
  getValueLabel,
  OPERATOR_LABEL,
  type Filter,
  type FilterFieldDef,
  type FilterOperator,
} from "../../lib/filters/list-filter";
import { cn } from "../../lib/utils";
import { Button } from "./button";
import { InputGroup, InputGroupInput, InputGroupSelect } from "./input-group";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { SelectItem } from "./select";
import { Tag } from "./tag";

export type {
  Filter,
  FilterFieldDef,
  FilterOperator,
} from "../../lib/filters/list-filter";

export type FiltersProps = {
  fields: FilterFieldDef[];
  value: Filter[];
  onChange: (filters: Filter[]) => void;
  className?: string;
  addLabel?: string;
  filterLabel?: string;
  applyLabel?: string;
  cancelLabel?: string;
};

const inputGroupSegmentClass =
  "h-9 w-full min-w-0 rounded-none border-0 bg-transparent px-3 py-1 text-sm shadow-none focus-visible:ring-0";

export function Filters({
  fields,
  value,
  onChange,
  className,
  addLabel = "Add Filters",
  filterLabel = "Filter",
  applyLabel = "Apply",
  cancelLabel = "Cancel",
}: FiltersProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {value.map((f, i) => {
        const def = fields.find((x) => x.key === f.field);
        return (
          <Tag
            key={`${f.field}-${i}`}
            variant="secondary"
            className="h-9"
            removable
            onRemove={() => onChange(value.filter((_, j) => j !== i))}
          >
            <span className="text-sm">{getFieldLabel(fields, f.field)}</span>
            <span className="text-muted-foreground text-sm">
              {OPERATOR_LABEL[f.operator]}
            </span>
            <span className="text-sm mr-1.5">
              {getValueLabel(def, f.value)}
            </span>
          </Tag>
        );
      })}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline">
            <FilterFunnel02 className="size-4" />
            {value.length === 0 ? addLabel : filterLabel}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-[min(100vw-2rem,36rem)] p-3">
          <AddFilterForm
            fields={fields}
            applyLabel={applyLabel}
            cancelLabel={cancelLabel}
            onCancel={() => setOpen(false)}
            onApply={(filter) => {
              onChange([...value, filter]);
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

function AddFilterForm({
  fields,
  onApply,
  onCancel,
  applyLabel,
  cancelLabel,
}: {
  fields: FilterFieldDef[];
  onApply: (f: Filter) => void;
  onCancel: () => void;
  applyLabel: string;
  cancelLabel: string;
}) {
  const [selectedField, setSelectedField] = useState(fields[0]?.key ?? "");
  const def = useMemo(
    () => fields.find((f) => f.key === selectedField),
    [fields, selectedField],
  );
  const allowedOperators = getOperatorsForField(def);
  const [operator, setOperator] = useState<FilterOperator>(
    allowedOperators[0] ?? "is",
  );
  const [val, setVal] = useState(def?.type === "boolean" ? "true" : "");

  function selectField(fieldKey: string) {
    const field = fields.find((f) => f.key === fieldKey);
    if (!field) return;
    setSelectedField(field.key);
    setVal(field.type === "boolean" ? "true" : "");
    const ops = getOperatorsForField(field);
    setOperator(ops[0] ?? "is");
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!def) return;
        const trimmed = def.type === "text" ? val.trim() : val;
        if (!trimmed) return;
        onApply({ field: def.key, operator, value: trimmed });
      }}
      className="flex flex-col gap-4"
    >
      <InputGroup
        className={cn(
          "h-auto grid grid-cols-1 sm:grid-cols-3 divide-input divide-y divide-x-0 sm:divide-x sm:divide-y-0",
        )}
      >
        <InputGroupSelect
          id="filter-field"
          aria-label="Field"
          value={selectedField}
          onValueChange={selectField}
          className={cn(inputGroupSegmentClass, "sm:min-w-0")}
          disabled={fields.length === 0}
        >
          {fields.map((f) => (
            <SelectItem key={f.key} value={f.key}>
              {f.label}
            </SelectItem>
          ))}
        </InputGroupSelect>

        <InputGroupSelect
          id="filter-operator"
          aria-label="Operator"
          value={operator}
          onValueChange={(v) => setOperator(v as FilterOperator)}
          className={inputGroupSegmentClass}
          disabled={!def}
        >
          {allowedOperators.map((op) => (
            <SelectItem key={op} value={op}>
              {OPERATOR_LABEL[op]}
            </SelectItem>
          ))}
        </InputGroupSelect>

        {def?.type === "boolean" ? (
          <InputGroupSelect
            id="filter-value"
            aria-label="Value"
            value={val}
            onValueChange={setVal}
            className={inputGroupSegmentClass}
          >
            <SelectItem value="true">{def.trueLabel ?? "Yes"}</SelectItem>
            <SelectItem value="false">{def.falseLabel ?? "No"}</SelectItem>
          </InputGroupSelect>
        ) : (
          <InputGroupInput
            id="filter-value"
            aria-label="Value"
            value={val}
            onChange={(e) => setVal(e.target.value)}
            placeholder="Value"
            className="min-w-0"
          />
        )}
      </InputGroup>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          {cancelLabel}
        </Button>
        <Button type="submit" size="sm">
          {applyLabel}
        </Button>
      </div>
    </form>
  );
}
