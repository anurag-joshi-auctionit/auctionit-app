import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ApiClient, type OtpChallenge } from "./api";
import type { Role, SessionUser } from "./types";
import { hasRole } from "./types";

type AuthState =
  | { status: "loading"; user: null }
  | { status: "authenticated"; user: SessionUser }
  | { status: "unauthenticated"; user: null };

export type LoginStepResult =
  | { step: "authenticated"; user: SessionUser }
  | { step: "otp_required"; challenge: OtpChallenge };

type AuthContextValue = AuthState & {
  api: ApiClient;
  login: (userLoginName: string, password: string) => Promise<LoginStepResult>;
  verifyLoginOtp: (challengeId: string, otp: string) => Promise<SessionUser>;
  resendLoginOtp: (challengeId: string) => Promise<OtpChallenge>;
  changePassword: (input: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => Promise<SessionUser>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export type AuthProviderProps = {
  apiUrl: string;
  /** If set, login() rejects users who don't have this role. */
  requiredRole?: Role;
  /**
   * Extra eligibility check beyond the role. If set, a user for whom this
   * returns false is treated as not signed in (login throws
   * AccountNotEligibleError; an existing session is dropped on refresh). Used by
   * the bidder portal to require a linked bidder company, not just the role.
   */
  requireUser?: (user: SessionUser) => boolean;
  /**
   * Identifies this app so the API can scope the session cookie per app
   * (`session_<appId>`), preventing cross-app cookie clobbering on localhost.
   */
  appId?: string;
  /**
   * Called whenever the signed-in identity changes: on login, logout, and when
   * the server session expires (401). Use it to drop per-user client state such
   * as the React Query cache, so a new user never sees the previous user's data.
   */
  onSessionReset?: () => void;
  children: ReactNode;
};

export class WrongRoleError extends Error {
  constructor(public expected: Role, public user: SessionUser) {
    super(`Expected role ${expected}`);
    this.name = "WrongRoleError";
  }
}

/** The user has the right role but fails the app's extra `requireUser` check. */
export class AccountNotEligibleError extends Error {
  constructor(public user: SessionUser) {
    super("Account not eligible for this app");
    this.name = "AccountNotEligibleError";
  }
}

export function AuthProvider({
  apiUrl,
  requiredRole,
  requireUser,
  appId,
  onSessionReset,
  children,
}: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({ status: "loading", user: null });

  // Keep the latest callback in a ref so the memoized api/auth handlers don't
  // need to be rebuilt (and the ApiClient recreated) when it changes identity.
  const onSessionResetRef = useRef(onSessionReset);
  onSessionResetRef.current = onSessionReset;

  // When any API call returns 401, the server session is gone — drop the
  // client session so the route guards send the user back to login, and clear
  // any cached per-user data.
  const handleUnauthorized = useCallback(() => {
    onSessionResetRef.current?.();
    setState((prev) =>
      prev.status === "unauthenticated"
        ? prev
        : { status: "unauthenticated", user: null },
    );
  }, []);

  const api = useMemo(
    () =>
      new ApiClient({
        baseUrl: apiUrl,
        appId,
        onUnauthorized: handleUnauthorized,
      }),
    [apiUrl, appId, handleUnauthorized],
  );

  const assertEligible = useCallback(
    async (user: SessionUser) => {
      if (requiredRole && !hasRole(user, requiredRole)) {
        await api.logout().catch(() => {});
        throw new WrongRoleError(requiredRole, user);
      }
      if (requireUser && !requireUser(user)) {
        await api.logout().catch(() => {});
        throw new AccountNotEligibleError(user);
      }
    },
    [api, requiredRole, requireUser],
  );

  const establishSession = useCallback(
    async (user: SessionUser) => {
      await assertEligible(user);
      onSessionResetRef.current?.();
      setState({ status: "authenticated", user });
      return user;
    },
    [assertEligible],
  );

  const refresh = useCallback(async () => {
    const user = await api.me();
    if (
      !user ||
      (requiredRole && !hasRole(user, requiredRole)) ||
      (requireUser && !requireUser(user))
    ) {
      setState({ status: "unauthenticated", user: null });
    } else {
      setState({ status: "authenticated", user });
    }
  }, [api, requiredRole, requireUser]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const login = useCallback(
    async (userLoginName: string, password: string): Promise<LoginStepResult> => {
      const result = await api.login(userLoginName, password);
      if (result.requiresOtp) {
        return {
          step: "otp_required",
          challenge: {
            challengeId: result.challengeId,
            channel: result.channel,
            destinationHint: result.destinationHint,
          },
        };
      }
      const user = await establishSession(result.user);
      return { step: "authenticated", user };
    },
    [api, establishSession],
  );

  const verifyLoginOtp = useCallback(
    async (challengeId: string, otp: string) => {
      const { user } = await api.verifyLoginOtp(challengeId, otp);
      return establishSession(user);
    },
    [api, establishSession],
  );

  const resendLoginOtp = useCallback(
    async (challengeId: string) => api.resendLoginOtp(challengeId),
    [api],
  );

  const changePassword = useCallback(
    async (input: {
      currentPassword: string;
      newPassword: string;
      confirmPassword: string;
    }) => {
      const { user } = await api.changePassword(input);
      setState({ status: "authenticated", user });
      return user;
    },
    [api],
  );

  const logout = useCallback(async () => {
    await api.logout().catch(() => {});
    onSessionResetRef.current?.();
    setState({ status: "unauthenticated", user: null });
  }, [api]);

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      api,
      login,
      verifyLoginOtp,
      resendLoginOtp,
      changePassword,
      logout,
      refresh,
    }),
    [
      state,
      api,
      login,
      verifyLoginOtp,
      resendLoginOtp,
      changePassword,
      logout,
      refresh,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
