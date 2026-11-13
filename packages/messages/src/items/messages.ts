export const ItemsValidationMessages = {
  VALIDATION_FAILED: "Please check the form and try again.",
  NAME_REQUIRED: "Item name is required.",
  NAME_MAX: "Item name must be at most 1000 characters.",
  CLIENT_REQUIRED: "Client is required.",
  MATERIAL_REQUIRED: "Material is required.",
  MATERIAL_NOT_FOUND: "Material not found.",
  BENCHMARK_MATERIAL_NOT_FOUND: "Benchmark material not found.",
  ITEM_NAME_EXISTS: "An item with this name already exists for this client.",
} as const;

export const ItemsSuccessMessages = {
  ITEM_CREATED: "Item created",
  ITEM_UPDATED: "Item updated",
  ITEM_DEACTIVATED: "Item deactivated",
} as const;

export const ItemsErrorMessages = {
  ITEM_NOT_FOUND: "Item not found",
  INVALID_ITEM_ID: "Invalid item id",
  CLIENT_NOT_FOUND: "Client not found",
  EXPORT_FAILED: "Failed to export items",
} as const;
