import { ApiError, type ApiClient } from "./api";
import {
  filenameFromContentDisposition,
  triggerBlobDownload,
} from "./download-blob";

export type DownloadAuthenticatedBlobOptions = {
  /** Fallback filename when Content-Disposition is missing. */
  fallbackFilename?: string;
  /** Defaults to GET. */
  method?: "GET" | "POST";
  /** Sent as JSON (POST only). */
  body?: unknown;
};

export type AuthenticatedBlob = { blob: Blob; filename: string };

/**
 * Authenticated request that returns the response body as a file, without saving it.
 * Uses credentials + app headers (same pattern as EMD / import-template downloads).
 * Non-2xx responses throw `ApiError` carrying the API's `{ error }` body when present.
 */
export async function fetchAuthenticatedBlob(
  api: ApiClient,
  path: string,
  options: DownloadAuthenticatedBlobOptions = {},
): Promise<AuthenticatedBlob> {
  const method = options.method ?? "GET";
  const hasBody = method !== "GET" && options.body !== undefined;
  const res = await fetch(`${api.baseUrl}${path}`, {
    method,
    credentials: "include",
    headers: {
      ...(hasBody ? { "content-type": "application/json" } : {}),
      ...api.appHeaders(),
    },
    body: hasBody ? JSON.stringify(options.body) : undefined,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiError(res.status, body, body ? undefined : `Download failed (${res.status})`);
  }
  const blob = await res.blob();
  const filename = filenameFromContentDisposition(
    res.headers.get("Content-Disposition"),
    options.fallbackFilename ?? "download.xlsx",
  );
  return { blob, filename };
}

/** Like `fetchAuthenticatedBlob`, then saves the file. */
export async function downloadAuthenticatedBlob(
  api: ApiClient,
  path: string,
  options: DownloadAuthenticatedBlobOptions = {},
): Promise<void> {
  const { blob, filename } = await fetchAuthenticatedBlob(api, path, options);
  triggerBlobDownload(blob, filename);
}
