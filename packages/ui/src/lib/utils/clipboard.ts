/**
 * Copies text to the clipboard. Falls back to a hidden textarea + execCommand when the async
 * Clipboard API is unavailable (non-HTTPS origins) or rejects (permissions, unfocused document).
 * Resolves to whether the copy succeeded; never throws.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (typeof navigator !== "undefined" && navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through to the legacy path
  }

  if (typeof document === "undefined") return false;
  const previous = document.activeElement as HTMLElement | null;
  // Mount next to the focused element so modal focus traps (menus, dialogs) don't steal focus.
  const host = previous?.parentElement ?? document.body;
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.top = "0";
  textarea.style.left = "0";
  textarea.style.opacity = "0";
  host.appendChild(textarea);
  try {
    textarea.focus({ preventScroll: true });
    textarea.select();
    textarea.setSelectionRange(0, text.length);
    return document.execCommand("copy");
  } catch {
    return false;
  } finally {
    host.removeChild(textarea);
    previous?.focus?.({ preventScroll: true });
  }
}
