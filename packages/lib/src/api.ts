import type { SessionUser } from "./types";

export type OtpChannel = "email" | "sms";

export type OtpChallenge = {
  challengeId: string;
  channel: OtpChannel;
  destinationHint: string;
};

export type LoginResponse =
  | {
      requiresOtp: true;
      challengeId: string;
      channel: OtpChannel;
      destinationHint: string;
    }
  | {
      requiresOtp: false;
      user: SessionUser;
      sessionToken?: string;
    };

function apiErrorMessage(
  status: number,
  body: unknown,
  message?: string,
): string {
  if (message) return message;
  if (
    body &&
    typeof body === "object" &&
    "error" in body &&
    typeof (body as { error: unknown }).error === "string"
  ) {
    return (body as { error: string }).error;
  }
  return `API ${status}`;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public body: unknown,
    message?: string,
  ) {
    super(apiErrorMessage(status, body, message));
    this.name = "ApiError";
  }
}

export type ApiClientOptions = {
  baseUrl: string;
  /**
   * Called when a request (other than the auth endpoints) fails with a genuine
   * authentication failure — a 401, or any response flagged
   * `code: "session_invalid"`. Permission failures (a 403 without that code)
   * do NOT trigger it, so they can surface as in-app errors.
   */
  onUnauthorized?: () => void;
  /**
   * Identifies the calling app (e.g. "admin", "bidder"). Sent as the `X-App-Id`
   * header so the API scopes the session cookie per app (`session_<appId>`).
   * Without this, all apps on localhost share one `session` cookie and clobber
   * each other's sessions.
   */
  appId?: string;
};

type RequestOptions = {
  /** Skip the global onUnauthorized handler (used by the auth endpoints). */
  skipUnauthorized?: boolean;
};

export class ApiClient {
  constructor(private readonly options: ApiClientOptions) {}

  get baseUrl(): string {
    return this.options.baseUrl;
  }

  /**
   * The calling app's id (e.g. "bidder"). Append as an `app_id` query param on
   * URLs opened via top-level browser navigation (new tab / redirect endpoints),
   * where the `X-App-Id` header can't be set, so the API can still pick the
   * per-app session cookie.
   */
  get appId(): string | undefined {
    return this.options.appId;
  }

  /**
   * Headers that scope a request to this app (currently `X-App-Id`, which the
   * API uses to pick the per-app session cookie `session_<appId>`). Spread these
   * into any raw `fetch()` that bypasses request()/get()/post() — e.g. blob
   * downloads, multipart uploads, and SSE streams — otherwise the server can't
   * find the session cookie and rejects the call with 401.
   */
  appHeaders(): Record<string, string> {
    return this.options.appId ? { "x-app-id": this.options.appId } : {};
  }

  private async request<T>(
    path: string,
    init: RequestInit = {},
    opts: RequestOptions = {},
  ): Promise<T> {
    const res = await fetch(`${this.options.baseUrl}${path}`, {
      ...init,
      credentials: "include",
      headers: {
        ...(init.body ? { "content-type": "application/json" } : {}),
        ...(this.options.appId ? { "x-app-id": this.options.appId } : {}),
        ...(init.headers ?? {}),
      },
    });

    if (res.status === 204) return undefined as T;

    const body = await res.json().catch(() => null);
    if (!res.ok) {
      const sessionInvalid =
        res.status === 401 ||
        (body &&
          typeof body === "object" &&
          (body as { code?: unknown }).code === "session_invalid");
      if (sessionInvalid && !opts.skipUnauthorized) {
        this.options.onUnauthorized?.();
      }
      throw new ApiError(res.status, body);
    }
    return body as T;
  }

  get<T>(path: string): Promise<T> {
    return this.request<T>(path, { method: "GET" });
  }

  post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, {
      method: "POST",
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  }

  put<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, {
      method: "PUT",
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  }

  patch<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, {
      method: "PATCH",
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  }

  delete<T>(path: string): Promise<T> {
    return this.request<T>(path, { method: "DELETE" });
  }

  // Auth endpoints — these manage session state themselves, so a 401 here must
  // NOT trigger the global onUnauthorized handler (e.g. wrong login password).
  async login(userLoginName: string, password: string): Promise<LoginResponse> {
    return this.request<LoginResponse>(
      "/auth/login",
      { method: "POST", body: JSON.stringify({ userLoginName, password }) },
      { skipUnauthorized: true },
    );
  }

  async verifyLoginOtp(
    challengeId: string,
    otp: string,
  ): Promise<{ user: SessionUser }> {
    return this.request<{ user: SessionUser }>(
      "/auth/login/verify-otp",
      { method: "POST", body: JSON.stringify({ challengeId, otp }) },
      { skipUnauthorized: true },
    );
  }

  async resendLoginOtp(challengeId: string): Promise<OtpChallenge> {
    return this.request<OtpChallenge>(
      "/auth/login/resend-otp",
      { method: "POST", body: JSON.stringify({ challengeId }) },
      { skipUnauthorized: true },
    );
  }

  async forgotPassword(
    input: { email: string } | { userLoginName: string; phone: string },
  ): Promise<
    | {
        sent: true;
        challengeId: string;
        channel: OtpChannel;
        destinationHint: string;
      }
    | { sent: false }
  > {
    return this.request(
      "/auth/forgot-password",
      { method: "POST", body: JSON.stringify(input) },
      { skipUnauthorized: true },
    );
  }

  async resendForgotPasswordOtp(challengeId: string): Promise<OtpChallenge> {
    return this.request<OtpChallenge>(
      "/auth/forgot-password/resend-otp",
      { method: "POST", body: JSON.stringify({ challengeId }) },
      { skipUnauthorized: true },
    );
  }

  async verifyForgotPasswordOtp(
    challengeId: string,
    otp: string,
  ): Promise<{ resetToken: string }> {
    return this.request(
      "/auth/forgot-password/verify-otp",
      { method: "POST", body: JSON.stringify({ challengeId, otp }) },
      { skipUnauthorized: true },
    );
  }

  async changePasswordWithToken(input: {
    resetToken: string;
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<{ ok: true }> {
    return this.request(
      "/auth/forgot-password/change-password",
      { method: "POST", body: JSON.stringify(input) },
      { skipUnauthorized: true },
    );
  }

  async changePassword(input: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<{ user: SessionUser }> {
    return this.request("/auth/change-password", {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  async logout(): Promise<void> {
    await this.request<void>(
      "/auth/logout",
      { method: "POST" },
      { skipUnauthorized: true },
    );
  }

  async me(): Promise<SessionUser | null> {
    try {
      const data = await this.request<{ user: SessionUser }>(
        "/auth/me",
        { method: "GET" },
        { skipUnauthorized: true },
      );
      return data.user;
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) return null;
      throw err;
    }
  }
}
