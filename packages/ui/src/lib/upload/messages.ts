export const UploadValidationMessages = {
  MAX_FILES_ALLOWED: (max: number) =>
    `Maximum ${max} file${max > 1 ? "s" : ""} allowed`,
  GENERIC_VALIDATION_ERROR: "An error occurred while validating the file.",
} as const;

export const UploadSuccessMessages = {
  FILES_UPLOADED_SUCCESSFULLY: (count: number) =>
    `${count} file${count > 1 ? "s" : ""} uploaded successfully`,
} as const;
