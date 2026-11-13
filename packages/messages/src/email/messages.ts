export const EmailValidationMessages = {
  RECIPIENT_REQUIRED: "At least one recipient is required",
  INVALID_RECIPIENT: (addrs: string) => `Invalid email address: ${addrs}`,
  SUBJECT_REQUIRED: "Subject is required.",
  BODY_REQUIRED: "Message body is required.",
  ENTER_RECIPIENT: "Enter at least one recipient.",
} as const;

export const EmailErrorMessages = {
  NOT_CONFIGURED: "Email sending is not configured",
  ENQUEUE_FAILED: "Failed to queue email",
  SEND_FAILED: "Failed to send email",
} as const;

export const EmailSuccessMessages = {
  QUEUED: "Email queued",
} as const;
