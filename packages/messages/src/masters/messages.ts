export const MastersValidationMessages = {
  UOM_CODE_EXISTS: "A UOM with this code already exists.",
  UOM_ID_RANGE_EXHAUSTED: "UOM id range exhausted.",
  DOCUMENT_TYPE_NAME_EXISTS: "A document type with this name already exists.",
  PAYMENT_TYPE_NAME_EXISTS: "A payment type with this name already exists.",
  DISPOSITION_LABEL_EXISTS: "A row with this label already exists.",
  OPEN_DISPOSITION_DEACTIVATE: "Cannot deactivate OPEN disposition",
  BENCHMARK_MATERIAL_NAME_EXISTS: "A benchmark material with this name already exists.",
  BENCHMARK_LOCATION_NAME_EXISTS: "A benchmark location with this name already exists.",
} as const;

export const MastersErrorMessages = {
  INVALID_UOM_ID: "Invalid UOM id",
  INVALID_DOCUMENT_TYPE_ID: "Invalid document type id",
  INVALID_PAYMENT_TYPE_ID: "Invalid payment type id",
  INVALID_BENCHMARK_MATERIAL_ID: "Invalid benchmark material id",
  INVALID_BENCHMARK_LOCATION_ID: "Invalid benchmark location id",
  UOM_NOT_FOUND: (id: number | string) => `UOM not found: ${id}`,
  AUCTION_DOCUMENT_TYPE_NOT_FOUND: (id: number | string) =>
    `Auction document type not found: ${id}`,
  BIDDER_DOCUMENT_TYPE_NOT_FOUND: (id: number | string) =>
    `Bidder document type not found: ${id}`,
  CLIENT_DOCUMENT_TYPE_NOT_FOUND: (id: number | string) =>
    `Client document type not found: ${id}`,
  PAYMENT_TYPE_NOT_FOUND: (id: number | string) =>
    `Payment type not found: ${id}`,
  MASTER_ROW_NOT_FOUND: (id: number | string) => `Master row not found: ${id}`,
  BENCHMARK_MATERIAL_NOT_FOUND: (id: number | string) =>
    `Benchmark material not found: ${id}`,
  BENCHMARK_LOCATION_NOT_FOUND: (id: number | string) =>
    `Benchmark location not found: ${id}`,
  UOM_CREATE_FAILED: "Failed to create UOM",
  AUCTION_DOCUMENT_TYPE_CREATE_FAILED: "Failed to create auction document type",
  BIDDER_DOCUMENT_TYPE_CREATE_FAILED: "Failed to create bidder document type",
  CLIENT_DOCUMENT_TYPE_CREATE_FAILED: "Failed to create client document type",
  PAYMENT_TYPE_CREATE_FAILED: "Failed to create payment type.",
  PAYMENT_TYPE_UPDATE_FAILED: "Failed to update payment type.",
  BENCHMARK_MATERIAL_CREATE_FAILED: "Failed to create benchmark material",
  BENCHMARK_LOCATION_CREATE_FAILED: "Failed to create benchmark location",
} as const;

export const MaterialsValidationMessages = {
  PARENT_NOT_FOUND: "Parent does not exist",
  SELF_PARENT: "A material cannot be its own parent",
  DESCENDANT_PARENT: "Cannot move a material under one of its descendants",
} as const;

export const MaterialsErrorMessages = {
  INVALID_MATERIAL_ID: "Invalid material id",
  MATERIAL_NOT_FOUND: (id: number | string) => `Material not found: ${id}`,
  CREATE_FAILED: "Failed to create material",
  EXPORT_FAILED: "Failed to export materials",
} as const;
