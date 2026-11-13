/** Trigger a file download from a Blob in a browser-safe way. */
export function triggerBlobDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  // Defer revoke so the browser has time to start the download.
  window.setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
}

export function filenameFromContentDisposition(
  disposition: string | null,
  fallback: string,
): string {
  if (!disposition) return fallback;
  const match = disposition.match(/filename="([^"]+)"/);
  return match?.[1] ?? fallback;
}
