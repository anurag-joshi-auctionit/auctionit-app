export const AuthValidationMessages = {
  USERNAME_REQUIRED: "Username is required",
  EMAIL_REQUIRED: "Email is required",
  PHONE_REQUIRED: "Phone number is required",
  INVALID_EMAIL: "Enter a valid email address",
  INVALID_PHONE: "Enter a valid 10-digit phone number",
  PASSWORD_REQUIRED: "Password is required",
  CURRENT_PASSWORD_REQUIRED: "Current password is required",
  NEW_PASSWORD_REQUIRED: "New password is required",
  CONFIRM_PASSWORD_REQUIRED: "Confirm password is required",
  PASSWORD_MIN_LENGTH: "Password must be at least 8 characters",
  PASSWORD_MAX_LENGTH: "Password must be at most 50 characters",
  PASSWORD_COMPLEXITY:
    "Password must include at least one uppercase letter, one lowercase letter, and one special character",
  PASSWORD_HINT:
    "Must be 8–50 characters with at least one uppercase letter, one lowercase letter, and one special character.",
  PASSWORD_MISMATCH: "New password and confirm password must match",
  OTP_REQUIRED: "Enter the OTP",
  OTP_INVALID_LENGTH: "Enter the 6-digit OTP",
  VERIFY_OTP_REQUIRES_SEND: "Send an OTP first",
  SEND_OTP_USE_RESEND: "Use Resend OTP to request another code.",
  RESET_TOKEN_REQUIRED: "Reset session expired. Request a new OTP.",
} as const;

export const AuthErrorMessages = {
  INVALID_CREDENTIALS: "Invalid username or password.",
  WRONG_ROLE: "This account can't sign in here. Use the app for your role.",
  ACCOUNT_NOT_ELIGIBLE:
    "This account isn't linked to a bidder company. Please contact support.",
  GENERIC: "Login failed. Please try again.",
  OTP_INVALID: "Invalid or expired OTP.",
  OTP_EXPIRED: "This OTP has expired. Request a new one.",
  OTP_LOCKED: "Too many incorrect attempts. Sign in again.",
  OTP_MISSING_EMAIL:
    "No email is on file for this account. Contact support to enable sign-in.",
  OTP_MISSING_PHONE:
    "No phone number is on file for this account. Contact support to enable sign-in.",
  OTP_DELIVERY_FAILED: "Could not send the OTP. Please try again.",
  OTP_RESEND_FAILED: "Could not resend the OTP. Please try again.",
  OTP_RESEND_TOO_SOON: "Please wait before requesting another OTP.",
  LOGIN_RATE_LIMITED:
    "Too many failed sign-in attempts. Please wait a few minutes and try again.",
  TEMP_PASSWORD_EMAIL_FAILED:
    "Password was updated, but the temporary password email could not be sent.",
  CURRENT_PASSWORD_INVALID: "Current password is incorrect.",
  PASSWORD_SAME_AS_CURRENT:
    "New password must be different from the current password.",
  PASSWORD_RESET_TOKEN_INVALID:
    "This password reset session is invalid or has expired. Request a new OTP.",
  FORGOT_PASSWORD_FAILED: "Could not start password reset. Please try again.",
  FORGOT_ACCOUNT_NOT_FOUND_EMAIL: "No account found with this email.",
  FORGOT_ACCOUNT_NOT_FOUND_PHONE: "No account found with this phone number.",
  FORGOT_ACCOUNT_NOT_FOUND_USERNAME_PHONE:
    "No account found for this username and phone number.",
  CHANGE_PASSWORD_FAILED: "Could not change password. Please try again.",
} as const;

export const AuthSuccessMessages = {
  SIGNED_IN: "Signed in successfully.",
  OTP_SENT_EMAIL: "An OTP was sent to your email.",
  OTP_SENT_SMS: "An OTP was sent to your phone.",
  OTP_RESENT: "A new OTP was sent.",
  PASSWORD_CHANGED: "Password changed successfully.",
  TEMP_PASSWORD_SENT:
    "A temporary password was sent to your email. Use it below as the current password.",
  FORGOT_OTP_SENT_EMAIL:
    "We've sent an OTP to your registered email address.",
  FORGOT_OTP_SENT_SMS:
    "We've sent an OTP to your registered phone number.",
  ADMIN_PASSWORD_RESET: "Password reset. Temporary password emailed to the user.",
} as const;
