import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { can, canAny } from "./authz";
import { useAuth } from "./auth";

export type RequireAuthProps = {
  loginPath?: string;
  fallback?: ReactNode;
  children: ReactNode;
};

export function RequireAuth({
  loginPath = "/login",
  fallback = null,
  children,
}: RequireAuthProps) {
  const auth = useAuth();
  const location = useLocation();

  if (auth.status === "loading") return <>{fallback}</>;
  if (auth.status === "unauthenticated") {
    return (
      <Navigate
        to={loginPath}
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
  }
  return <>{children}</>;
}

export type RequirePasswordChangedProps = {
  changePasswordPath?: string;
  fallback?: ReactNode;
  children: ReactNode;
};

/** Redirect to change-password when the signed-in user must update a reset password. */
export function RequirePasswordChanged({
  changePasswordPath = "/change-password",
  fallback = null,
  children,
}: RequirePasswordChangedProps) {
  const auth = useAuth();
  const location = useLocation();

  if (auth.status === "loading") return <>{fallback}</>;
  if (auth.status !== "authenticated" || !auth.user) return <>{children}</>;

  const mustChange = auth.user.passwordChanged === false;
  const onChangePage = location.pathname === changePasswordPath;
  if (mustChange && !onChangePage) {
    return <Navigate to={changePasswordPath} replace />;
  }
  if (!mustChange && onChangePage) {
    // Voluntary change is allowed; do not bounce away.
  }
  return <>{children}</>;
}

export type RedirectIfAuthedProps = {
  to: string;
  fallback?: ReactNode;
  children: ReactNode;
};

export function RedirectIfAuthed({
  to,
  fallback = null,
  children,
}: RedirectIfAuthedProps) {
  const auth = useAuth();
  if (auth.status === "loading") return <>{fallback}</>;
  if (auth.status === "authenticated") return <Navigate to={to} replace />;
  return <>{children}</>;
}

export type RequirePermissionProps = {
  /** Require this single permission key. */
  permission?: string;
  /** Require any of these permission keys. */
  anyPermission?: readonly string[];
  /** Require role.isAdmin or isOwner (matches nav `adminOnly`). */
  adminOnly?: boolean;
  /** Shown while auth status is loading. */
  fallback?: ReactNode;
  /** Shown when the signed-in user lacks access (typically a 403 page). */
  forbidden?: ReactNode;
  children: ReactNode;
};

/**
 * Block a route when the signed-in user lacks the required permission(s).
 * Unauthenticated users are sent to login. Callers should pass a page-wide
 * `forbidden` UI (403); without it, nothing is rendered.
 */
export function RequirePermission({
  permission,
  anyPermission,
  adminOnly = false,
  fallback = null,
  forbidden = null,
  children,
}: RequirePermissionProps) {
  const auth = useAuth();
  const location = useLocation();

  if (auth.status === "loading") return <>{fallback}</>;
  if (auth.status === "unauthenticated" || !auth.user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
  }

  const { user } = auth;
  if (adminOnly && !(user.role.isAdmin || user.isOwner)) {
    return <>{forbidden}</>;
  }
  if (permission && !can(user.permissions, permission)) {
    return <>{forbidden}</>;
  }
  if (anyPermission?.length && !canAny(user.permissions, anyPermission)) {
    return <>{forbidden}</>;
  }
  return <>{children}</>;
}

export type RequirePortalPermissionProps = {
  permission: string;
  fallback?: ReactNode;
  forbidden?: ReactNode;
  children: ReactNode;
};

/** Portal alias of {@link RequirePermission} for a single permission key. */
export function RequirePortalPermission({
  permission,
  fallback = null,
  forbidden = null,
  children,
}: RequirePortalPermissionProps) {
  return (
    <RequirePermission
      permission={permission}
      fallback={fallback}
      forbidden={forbidden}
    >
      {children}
    </RequirePermission>
  );
}
