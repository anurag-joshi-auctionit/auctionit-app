export const UsersValidationMessages = {
  VALIDATION_FAILED: "Please check the form and try again.",
  NAME_REQUIRED: "Name is required",
  USERNAME_REQUIRED: "Username is required",
  DESIGNATION_REQUIRED: "Designation is required",
  EMAIL_REQUIRED: "Email is required",
  INVALID_EMAIL: "Invalid email",
  PHONE_REQUIRED: "Phone number is required",
  INVALID_PHONE: "Phone number must be exactly 10 digits",
  PASSWORD_REQUIRED: "Password is required",
  PASSWORD_MIN_LENGTH: "Password must be at least 8 characters",
  ROLE_REQUIRED: "Role is required",
  ROLE_INVALID: "Selected role is not allowed",
  BIDDER_REQUIRED: "Bidder company is required",
  CLIENTS_REQUIRED: "Select at least one client company",
} as const;

export const UsersSuccessMessages = {
  USER_CREATED: "User created",
  USER_UPDATED: "User updated",
  USER_MARKED_INACTIVE: "User marked inactive",
  USER_MARKED_ACTIVE: "User marked active",
} as const;

export const UsersErrorMessages = {
  FAILED_TO_SAVE: "Failed to save user",
  FAILED_TO_UPDATE_STATUS: "Failed to update user status",
  LOGIN_TAKEN: "A user with that login already exists",
  ROLE_NOT_FOUND: "Role not found",
  BIDDER_USER_EXISTS: "This bidder already has a user",
  INVALID_USER_ID: "Invalid user id",
  USER_NOT_FOUND: "User not found",
  ROLE_CODE_NOT_FOUND: (code: string) => `Role ${code} not found`,
} as const;
