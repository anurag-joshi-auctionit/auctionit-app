import { ApiError } from "@auctionit/lib";
import type {
  FieldErrors,
  FieldPath,
  FieldValues,
  UseFormReturn,
} from "react-hook-form";
import { toast } from "sonner";

export type ValidationErrorBody = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

/**
 * Prefer an explicit `fieldErrors` map on any status (auth OTP failures are
 * often 401). Fall back to treating 400/409 bodies as validation responses.
 */
const FIELD_ERROR_STATUSES = new Set([400, 409]);

export function getValidationErrorBody(
  err: unknown,
): ValidationErrorBody | null {
  if (!(err instanceof ApiError)) return null;
  const body = err.body as ValidationErrorBody;
  if (body?.fieldErrors) return body;
  if (FIELD_ERROR_STATUSES.has(err.status)) return body ?? null;
  return null;
}

export function applyApiValidationErrors<T extends FieldValues>(
  form: UseFormReturn<T>,
  fieldErrors: Record<string, string[]>,
  pathMap?: Record<string, FieldPath<T>>,
) {
  for (const [apiPath, messages] of Object.entries(fieldErrors)) {
    const name = (pathMap?.[apiPath] ?? apiPath) as FieldPath<T>;
    form.setError(name, { type: "server", message: messages[0] ?? "" });
  }
}

function isKnownFormField<T extends FieldValues>(
  form: UseFormReturn<T>,
  formPath: string,
): boolean {
  const top = formPath.split(".")[0] ?? formPath;
  return Object.prototype.hasOwnProperty.call(form.getValues(), top);
}

const FIELD_ERROR_META = new Set(["type", "message", "types", "ref"]);

/**
 * Collect dotted paths of leaf errors whose `type === "server"`.
 * Walks nested FieldErrors trees (e.g. location.locationId).
 */
export function collectServerErrorPaths(
  errors: FieldErrors<FieldValues>,
  prefix = "",
): string[] {
  const paths: string[] = [];
  for (const [key, value] of Object.entries(errors)) {
    if (value == null || typeof value !== "object") continue;
    const path = prefix ? `${prefix}.${key}` : key;
    const record = value as Record<string, unknown>;

    if (record.type === "server") {
      paths.push(path);
    }

    for (const [childKey, childVal] of Object.entries(record)) {
      if (FIELD_ERROR_META.has(childKey)) continue;
      if (childVal != null && typeof childVal === "object") {
        paths.push(
          ...collectServerErrorPaths(
            { [childKey]: childVal } as FieldErrors<FieldValues>,
            path,
          ),
        );
      }
    }
  }
  return paths;
}

/**
 * Clear only errors previously applied from the API (`type: "server"`).
 * Leaves `manual` / client validation errors alone.
 */
export function clearServerErrors<T extends FieldValues>(
  form: UseFormReturn<T>,
) {
  const paths = collectServerErrorPaths(
    form.formState.errors as FieldErrors<FieldValues>,
  );
  if (paths.length === 0) return;
  form.clearErrors(...(paths as FieldPath<T>[]));
}

/**
 * Apply server `fieldErrors` onto a react-hook-form instance (with optional
 * API→form path remapping). Toasts only when nothing can be shown under a field
 * (unmapped keys or non-validation failures) — mapped field errors stay quiet.
 *
 * When a 400/409 validation body is present, previous `type: "server"` errors
 * are cleared first so the response replaces (not unions) the displayed set.
 */
export function applyFormApiErrors<T extends FieldValues>(
  form: UseFormReturn<T>,
  err: unknown,
  opts: {
    /** API field name → form field path (may be a nested string path). */
    pathMap?: Record<string, string>;
    fallbackMessage: string;
  },
): boolean {
  const validation = getValidationErrorBody(err);
  if (!validation?.fieldErrors) {
    toast.error(err instanceof Error ? err.message : opts.fallbackMessage);
    return false;
  }

  clearServerErrors(form);

  const mappable: Record<string, string[]> = {};
  const unmappedMessages: string[] = [];
  const typedPathMap = opts.pathMap as
    | Record<string, FieldPath<T>>
    | undefined;

  for (const [apiPath, messages] of Object.entries(validation.fieldErrors)) {
    const formPath = String(opts.pathMap?.[apiPath] ?? apiPath);
    if (isKnownFormField(form, formPath)) {
      mappable[apiPath] = messages;
    } else {
      for (const message of messages) {
        if (message) unmappedMessages.push(message);
      }
    }
  }

  if (Object.keys(mappable).length > 0) {
    applyApiValidationErrors(form, mappable, typedPathMap);
  }

  if (unmappedMessages.length > 0) {
    toast.error(unmappedMessages[0]!);
    return Object.keys(mappable).length > 0;
  }

  if (Object.keys(mappable).length === 0) {
    toast.error(validation.error ?? opts.fallbackMessage);
    return false;
  }

  return true;
}
