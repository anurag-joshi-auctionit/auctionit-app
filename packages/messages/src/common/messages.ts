export const UiSelectMessages = {
  SELECT_ALL_TRUNCATED: (max: number) =>
    `Selected the first ${max} matches. Refine your search to narrow results.`,
} as const;

export const CommonValidationMessages = {
  AT_LEAST_ONE_FIELD_REQUIRED: "At least one field is required",
} as const;
