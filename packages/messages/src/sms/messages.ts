export const SmsValidationMessages = {
  MOBILE_INVALID: "Mobile must be 10–15 digits",
  MISSING_VALUES: (fields: string) => `Missing values for: ${fields}`,
} as const;

export const SmsErrorMessages = {
  TEMPLATE_NOT_FOUND: "Template not found",
  GATEWAY_REJECTED: "SMS gateway rejected the request",
  GATEWAY_REJECTED_DETAIL: (detail: string) =>
    `SMS gateway rejected the request: ${detail}`,
} as const;
