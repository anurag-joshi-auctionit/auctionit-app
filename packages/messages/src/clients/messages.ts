export const ClientsValidationMessages = {
  VALIDATION_FAILED: "Please check the form and try again.",
  REQUIRED: "Required",
  COMPANY_NAME_REQUIRED: "Company name is required.",
  ADDRESS_REQUIRED: "Address is required.",
  ADDRESS_MAX: "Address must be at most 200 characters.",
  LOCATION_REQUIRED: "Location is required.",
  PLANT_NAME_REQUIRED: "Plant name is required.",
  MATERIAL_NAME_REQUIRED: "Material name is required.",
  KAM_REQUIRED: "KAM is required.",
  PINCODE_REQUIRED: "Pincode is required.",
  PHONE_REQUIRED: "Phone is required.",
  EMAIL_REQUIRED: "Email is required.",
  PAN_REQUIRED: "PAN is required.",
  GSTIN_REQUIRED: "GSTIN is required.",
  PLANT_LOCATION_REQUIRED: "At least one plant location is required.",
  MATERIALS_REQUIRED: "At least one material is required.",
  POC_NAME_REQUIRED: "Point of contact name is required.",
  POC_EMAIL_REQUIRED: "Point of contact email is required.",
  POC_PHONE_REQUIRED: "Point of contact phone is required.",
  BILLING_NAME_REQUIRED: "Billing name is required.",
  BILLING_EMAIL_TO_REQUIRED: "Billing email (To) is required.",
  SERVICE_FEE_TYPE_REQUIRED: "Service fee type is required.",
  SERVICE_FEE_VALUE_REQUIRED: "Service fee value is required.",
  AUCTION_PREFIX_REQUIRED: "Auction prefix is required.",
  INVALID_EMAIL: "Invalid email",
  INVALID_WEBSITE: "Enter a valid website (e.g. company.com)",
  INVALID_PHONE: "Phone number must be exactly 10 digits",
  INVALID_PINCODE: "Pincode must be 6 digits",
  INVALID_PAN: "PAN must match format ABCDE1234F",
  INVALID_TAN: "TAN must match format ABCD12345E",
  INVALID_GSTIN: "GSTIN format is invalid",
  EXTEND_WINDOW_RANGE:
    "Last bid window must be a whole number between 0 and 120",
  EXTEND_INTERVAL_RANGE:
    "Extension interval must be a whole number of 0 or greater",
  EXTEND_FREQUENCY_RANGE:
    "Maximum extensions must be a whole number of 0 or greater",
  LAST_BID_EXTENSION_TRIPLE:
    "Last bid window, extension interval, and maximum extensions must all be 0, or all greater than 0",
  STAGGER_INTERVAL_RANGE:
    "Stagger interval must be a whole number of 0 or greater",
  STAGGER_INTERVAL_REQUIRED:
    "Stagger interval must be greater than 0 when staggering is enabled",
  SERVICE_FEE_PERCENTAGE_INVALID:
    "Service fee percentage must be between 0 and 5.000 with up to 3 decimal places",
  SERVICE_FEE_VALUE_POSITIVE: "Service fee value must be 0 or greater.",
  DOCUMENT_TYPE_REQUIRED: "Document type is required.",
  DOCUMENT_FILE_REQUIRED: "File is required.",
  DOCUMENT_FILE_INVALID:
    "File type is not supported. Use PDF, Word, Excel, or image files (JPEG, PNG, WebP). Video files are not supported.",
  DOCUMENT_FILE_TOO_LARGE: "File must be at most 10 MB.",
  DOCUMENT_FILE_HINT:
    "PDF, Word, Excel, or images (JPEG, PNG, WebP), max 10 MB.",
  DOCUMENT_TNC_FILE_INVALID: "Only PDF and DOCX files are allowed for Terms & Conditions.",
  DOCUMENT_TNC_FILE_TOO_LARGE: "Terms & Conditions file must be at most 5 MB.",
  DOCUMENT_TNC_FILE_HINT: "PDF or DOCX, max 5 MB.",
  DUPLICATE_DOCUMENT_TYPE: "Each document type can only be selected once.",
  ADDITIONAL_FIELD_LABEL_REQUIRED: "Label is required.",
  ADDITIONAL_FIELD_LABEL_MAX: "Label must be at most 100 characters.",
  ADDITIONAL_FIELD_SCOPE_REQUIRED: "Scope is required.",
  ADDITIONAL_FIELD_TYPE_REQUIRED: "Type is required.",
  ADDITIONAL_FIELD_DISPLAY_ORDER_RANGE:
    "Display order must be a whole number between 0 and 9999.",
  ADDITIONAL_FIELD_LABEL_TAKEN:
    "A field with this label already exists for this scope (it may be inactive — reactivate it instead).",
  ADDITIONAL_FIELD_SCOPE_LOCKED:
    "Scope cannot be changed because this field already has values.",
  ADDITIONAL_FIELD_TYPE_LOCKED:
    "Type cannot be changed because this field already has values.",
} as const;

export const ClientsSuccessMessages = {
  CLIENT_CREATED: "Client created",
  COMPANY_INFO_SAVED: "Company information saved",
  AUCTION_SETTINGS_SAVED: "Auction settings saved",
  PLANT_LOCATION_ADDED: "Plant location added",
  PLANT_LOCATION_SAVED: "Plant location saved",
  MATERIAL_LOCATION_ADDED: "Material location added",
  MATERIAL_LOCATION_SAVED: "Material location saved",
  PLANT_LOCATION_DEACTIVATED: "Plant location deactivated",
  PLANT_LOCATION_REACTIVATED: "Plant location reactivated",
  MATERIAL_LOCATION_DEACTIVATED: "Material location deactivated",
  MATERIAL_LOCATION_REACTIVATED: "Material location reactivated",
  CLIENT_DEACTIVATED: "Client deactivated",
  CLIENT_REACTIVATED: "Client reactivated",
  DOCUMENTS_UPLOADED: "Documents uploaded",
  ADDITIONAL_FIELD_ADDED: "Additional field added",
  ADDITIONAL_FIELD_SAVED: "Additional field saved",
  ADDITIONAL_FIELD_DEACTIVATED: "Additional field deactivated",
  ADDITIONAL_FIELD_REACTIVATED: "Additional field reactivated",
} as const;

export const ClientsErrorMessages = {
  FAILED_TO_CREATE: "Failed to create client",
  FAILED_TO_SAVE: "Something went wrong",
  FAILED_TO_LOAD_CLIENT: "Failed to load client.",
  FAILED_TO_LOAD_CLIENTS: "Failed to load clients.",
  FAILED_TO_LOAD_STATS: "Failed to load client statistics.",
  FAILED_TO_LOAD_KAM_USERS: "Failed to load KAM users.",
  INVALID_CLIENT_ID: "Invalid client id",
  CLIENT_NOT_FOUND: "Client not found",
  NOT_MIGRATED: "Not yet migrated to Postgres",
  LOCATION_NOT_FOUND: "Location not found",
  INVALID_LOCATION_ID: "Invalid location id",
  KAM_USER_NOT_FOUND: "KAM user not found or inactive",
  LAST_PLANT_LOCATION_REQUIRED:
    "Client must keep at least one active plant location.",
  PAN_FORMAT_INVALID: "PAN must match format ABCDE1234F",
  GSTIN_FORMAT_INVALID: "GSTIN format is invalid",
  TAN_FORMAT_INVALID: "TAN must match format ABCD12345E",
  SERVICE_FEE_PERCENTAGE_INVALID:
    "Service fee percentage must be between 0 and 5.000 with up to 3 decimal places",
  SERVICE_FEE_VALUE_POSITIVE: "Service fee value must be 0 or greater.",
  FAILED_TO_LOAD_MAPPED_BIDDERS: "Failed to load mapped bidders.",
  FAILED_TO_LOAD_DOCUMENTS: "Failed to load documents.",
  FAILED_TO_LOAD_DOCUMENT_HISTORY: "Failed to load document history.",
  FAILED_TO_UPLOAD_DOCUMENT: "Failed to upload document.",
  DOCUMENT_UPLOAD_NETWORK_FAILED:
    "Upload was blocked before reaching the API (network error or reverse-proxy body limit). Client documents allow up to 10 MB (TnC 5 MB); the API proxy must allow at least 25 MB (nginx: client_max_body_size 25m).",
  DOCUMENT_UPLOAD_PROXY_TOO_LARGE:
    "Upload rejected by the reverse proxy (413 Request Entity Too Large). Raise the API proxy body limit to at least 25 MB (nginx: client_max_body_size 25m).",
  FAILED_TO_LOAD_DOCUMENT_TYPES: "Failed to load document types.",
  DOCUMENT_TYPE_NOT_FOUND: "Document type not found.",
  INVALID_DOCUMENT_FILE: "File is invalid or unsupported.",
  AUCTION_SETTINGS_EDIT_REQUIRES_NO_LIVE:
    "Auction settings cannot be changed while an auction for this client is live",
  INVALID_ADDITIONAL_FIELD_ID: "Invalid additional field id",
  ADDITIONAL_FIELD_NOT_FOUND: "Additional field not found",
  FAILED_TO_LOAD_ADDITIONAL_FIELDS: "Failed to load additional fields.",
  FAILED_TO_UPDATE_ADDITIONAL_FIELD_STATUS:
    "Failed to update additional field status.",
} as const;

export * from "./service-fee.js";
export * from "./additional-fields.js";
