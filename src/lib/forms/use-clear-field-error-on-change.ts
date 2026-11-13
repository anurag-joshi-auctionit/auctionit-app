import { useEffect } from "react";
import type { FieldPath, FieldValues, UseFormReturn } from "react-hook-form";

/**
 * Clears a field's error as soon as the user edits it (type / select / change).
 *
 * Used by server-only editors: API errors via `applyFormApiErrors` (`type: "server"`).
 * Does not re-run validation — errors only return on the next submit.
 */
export function useClearFieldErrorOnChange<T extends FieldValues>(
  form: UseFormReturn<T>,
) {
  useEffect(() => {
    const sub = form.watch((_, info) => {
      if (info.type !== "change" || !info.name) return;
      const name = info.name as FieldPath<T>;
      const { error } = form.getFieldState(name);
      if (error) {
        form.clearErrors(name);
      }
    });
    return () => sub.unsubscribe();
  }, [form]);
}
