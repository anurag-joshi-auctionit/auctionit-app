export const RolesValidationMessages = {
  VALIDATION_FAILED: "Please check the form and try again.",
  NAME_REQUIRED: "Name is required.",
  NAME_TOO_LONG: "Name must be at most 100 characters.",
  CODE_REQUIRED: "Code is required.",
  CODE_TOO_LONG: "Code must be at most 64 characters.",
  CODE_INVALID:
    "Code must use lowercase letters, numbers, and underscores only.",
  CODE_EXISTS: "A role with that code already exists.",
  DESCRIPTION_TOO_LONG: "Description must be at most 500 characters.",
  INVALID_ROLE_ID: "Invalid role id.",
} as const;

export const RolesSuccessMessages = {
  ROLE_CREATED: "Role created",
  ROLE_UPDATED: "Role updated",
} as const;

export const RolesErrorMessages = {
  FORBIDDEN: "You do not have permission for this action",
  FAILED_TO_LOAD: "Failed to load roles.",
  LOAD_TITLE: "Could not load roles",
  FAILED_TO_CREATE: "Failed to create role",
  FAILED_TO_UPDATE: "Failed to update role",
  ROLE_NOT_FOUND: "Role not found",
  CREATE_FAILED: "Could not create role.",
  GENERIC: "Something went wrong.",
} as const;
