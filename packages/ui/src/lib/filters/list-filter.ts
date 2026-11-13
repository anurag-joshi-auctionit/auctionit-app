export type FilterOperator = "is" | "is_not" | "contains";

export type Filter = {
  field: string;
  operator: FilterOperator;
  value: string;
};

export type FilterFieldDef = {
  key: string;
  label: string;
  type: "text" | "boolean";
  trueLabel?: string;
  falseLabel?: string;
};

export const OPERATOR_LABEL: Record<FilterOperator, string> = {
  is: "is",
  is_not: "is not",
  contains: "contains",
};

export const TEXT_OPERATORS: FilterOperator[] = ["is", "is_not", "contains"];
export const BOOLEAN_OPERATORS: FilterOperator[] = ["is", "is_not"];

export function getOperatorsForField(
  def?: FilterFieldDef,
): FilterOperator[] {
  return def?.type === "boolean" ? BOOLEAN_OPERATORS : TEXT_OPERATORS;
}

export function getFieldLabel(
  fields: FilterFieldDef[],
  key: string,
): string {
  return fields.find((f) => f.key === key)?.label ?? key;
}

export function getValueLabel(
  def: FilterFieldDef | undefined,
  val: string,
): string {
  if (def?.type === "boolean") {
    return val === "true"
      ? (def.trueLabel ?? "Yes")
      : (def.falseLabel ?? "No");
  }
  return val;
}
