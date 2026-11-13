export type Role = "admin" | "account" | "bidder" | "client";

export type SessionRole = {
  id: number;
  code: string;
  name: string;
  isAdmin: boolean;
};

export type SessionUser = {
  userId: number;
  userLoginName: string;
  name: string | null;
  emailId: string | null;
  bidderCompId: number | null;
  bidderCompanyName: string | null;
  /** Virtual account number for EMD deposits (bidders only). */
  bidderVan: string | null;
  isOwner: boolean;
  /** False after admin reset until the user changes their password. */
  passwordChanged: boolean;
  permissions: string[];
  role: SessionRole;
};

const PORTAL_OR_ACCOUNT_CODES = new Set([
  "account",
  "bidder",
  "client",
  "client_limited",
]);

export function roleFor(user: SessionUser): Role | null {
  if (user.role.code === "account") return "account";
  if (user.role.isAdmin) return "admin";
  if (user.role.code === "bidder") return "bidder";
  if (user.role.code === "client" || user.role.code === "client_limited") {
    return "client";
  }
  // kam + custom staff roles classify as admin-app users
  if (!PORTAL_OR_ACCOUNT_CODES.has(user.role.code)) return "admin";
  return null;
}

export function hasRole(user: SessionUser, role: Role): boolean {
  switch (role) {
    case "admin":
      // Admin SPA: isAdmin, kam, or any custom staff role (not account/portal)
      return (
        user.role.isAdmin ||
        user.role.code === "kam" ||
        !PORTAL_OR_ACCOUNT_CODES.has(user.role.code)
      );
    case "account":
      return user.role.code === "account";
    case "bidder":
      return user.role.code === "bidder";
    case "client":
      return (
        user.role.code === "client" || user.role.code === "client_limited"
      );
  }
}
