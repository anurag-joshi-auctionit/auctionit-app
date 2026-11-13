export const PermissionsValidationMessages = {
  VALIDATION_FAILED: "Please check the form and try again.",
  ADMIN_GOVERNANCE_LOCKED:
    "Roles and permissions access cannot be turned off for an admin role.",
  INVALID_ROLE_ID: "Invalid role id.",
  PERMISSIONS_REQUIRED: "Permissions payload is required.",
} as const;

export const PermissionsSuccessMessages = {
  PERMISSIONS_SAVED: "Permissions saved",
} as const;

export const PermissionsErrorMessages = {
  FORBIDDEN: "You do not have permission for this action",
  FAILED_TO_LOAD: "Failed to load permissions.",
  LOAD_TITLE: "Could not load permissions",
  ROLE_NOT_FOUND: "Role not found",
  SAVE_FAILED: "Could not save permissions.",
  GENERIC: "Something went wrong.",
} as const;

export const PermissionsEmptyMessages = {
  NO_ROLES_TITLE: "No roles available",
  NO_ROLES_DESCRIPTION: "No roles are available to configure.",
  NO_CONFIGURABLE_ROLES_TITLE: "No configurable roles",
  NO_CONFIGURABLE_ROLES_DESCRIPTION:
    "No configurable roles are available.",
} as const;
