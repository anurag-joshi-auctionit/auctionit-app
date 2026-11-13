import type { PermissionKey } from "./permission-keys.js";

export function can(
  permissions: readonly string[] | undefined | null,
  key: PermissionKey | string,
): boolean {
  if (!permissions?.length) return false;
  return permissions.includes(key);
}

export function canAny(
  permissions: readonly string[] | undefined | null,
  keys: readonly (PermissionKey | string)[],
): boolean {
  if (!permissions?.length || keys.length === 0) return false;
  const set = new Set(permissions);
  return keys.some((k) => set.has(k));
}

export function canAll(
  permissions: readonly string[] | undefined | null,
  keys: readonly (PermissionKey | string)[],
): boolean {
  if (!permissions?.length || keys.length === 0) return false;
  const set = new Set(permissions);
  return keys.every((k) => set.has(k));
}
