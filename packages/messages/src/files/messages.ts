export const FilesValidationMessages = {
  FILE_EMPTY: "Empty file",
  FILE_TYPE_INVALID: (types: string) =>
    `File type not allowed. Accepted: ${types}`,
  FILE_TOO_LARGE: (mb: number) => `File exceeds ${mb} MB`,
  UPLOAD_HINT: (mb: number, types: string) =>
    `Upload files to Cloudflare R2. Up to ${mb} MB each. Allowed types: ${types}.`,
  COULD_NOT_READ_FILE: "Could not read file",
  INVALID_BASE64: "Invalid base64 data",
} as const;

export const FilesSuccessMessages = {
  FILE_UPLOADED: "File uploaded",
} as const;

export const FilesErrorMessages = {
  DOWNLOAD_FAILED: "Download failed",
  UPLOAD_FAILED: "Upload failed",
  INVALID_FILE_ID: "Invalid file id",
  FILE_NOT_FOUND: "File not found",
} as const;
