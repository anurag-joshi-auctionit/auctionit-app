/** Shared authz / permission-denied copy used by API middleware. */
export const AuthzErrorMessages = {
  FORBIDDEN: "You do not have permission for this action",
  ADMIN_ONLY: "Admin only",
  UNAUTHENTICATED: "Unauthenticated",
  SESSION_INVALID: "Invalid or expired session",
  OWNER_GRANT_ONLY: "Only the owner can grant owner status.",
  OWNER_REVOKE_ONLY: "Only the owner can revoke owner status.",
  OWNER_REQUIRES_ADMIN: "Owner status requires an admin role.",
  OWNER_MANAGE_ONLY: "Only the owner can manage the owner user.",
  USER_NOT_FOUND: "User not found.",
} as const;

/** Route-level access / not-found pages (admin + portal). */
export const AuthzRouteMessages = {
  FORBIDDEN_TITLE: "Access denied",
  FORBIDDEN_DESCRIPTION:
    "You do not have permission to view this page. Contact an administrator if you need access.",
  NOT_FOUND_TITLE: "Page not found",
  NOT_FOUND_DESCRIPTION:
    "The page you are looking for does not exist or may have been moved.",
} as const;
