export const BenchmarksValidationMessages = {
  VALIDATION_FAILED: "Please check the form and try again.",
  MATERIAL_REQUIRED: "Benchmark material is required.",
  MATERIAL_MAX: "Benchmark material must be at most 500 characters.",
  LOCATION_REQUIRED: "Benchmark location is required.",
  LOCATION_MAX: "Benchmark location must be at most 100 characters.",
  DUPLICATE_COMBO: "A benchmark with this material and location already exists.",
  DATE_REQUIRED: "Benchmark date is required.",
  PRICE_REQUIRED: "Price is required.",
  PRICE_INVALID: "Price must be a positive number.",
  AT_LEAST_ONE_PRICE: "At least one price is required.",
  AT_LEAST_ONE_VALID_PRICE: "Enter at least one valid price before saving.",
  CURRENCY_INVALID: "Currency must be INR or USD.",
} as const;

export const BenchmarksSuccessMessages = {
  COMBO_CREATED: "Benchmark created",
  COMBO_UPDATED: "Benchmark updated",
  PRICES_SAVED: "Benchmark prices saved",
} as const;

export const BenchmarksErrorMessages = {
  COMBO_NOT_FOUND: "Benchmark not found",
  INVALID_COMBO_ID: "Invalid benchmark id",
  COMBO_CREATE_FAILED: "Failed to create benchmark",
  PRICE_NOT_FOUND: "Benchmark price not found",
  FX_RATE_UNAVAILABLE:
    "Exchange rate for this date is unavailable. Try again later.",
  COMBO_SAVE_FAILED: "Failed to save benchmark",
  PRICES_SAVE_FAILED: "Failed to save benchmark prices",
} as const;
