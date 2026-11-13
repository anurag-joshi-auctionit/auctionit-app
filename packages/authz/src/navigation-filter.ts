import { can, canAny } from "./can.js";
import type { PermissionKey } from "./permission-keys.js";

export type NavPermissionItem = {
  name: string;
  href?: string;
  permission?: PermissionKey | string;
  /** Require any of these permissions (in addition to optional single permission). */
  anyPermission?: readonly (PermissionKey | string)[];
  /** Only show for role.isAdmin or isOwner actors. */
  adminOnly?: boolean;
  /** Accounts-team workflow (/accounts/*). Hidden when role.isAdmin — those users use admin routes. */
  accountsWorkflow?: boolean;
  /** Bidder external portal workflow. */
  bidderWorkflow?: boolean;
  /** Client external portal workflow. */
  clientWorkflow?: boolean;
  items?: NavPermissionItem[];
  groups?: { label: string; items: NavPermissionItem[] }[];
  [key: string]: unknown;
};

export type NavPermissionConfig = {
  main: NavPermissionItem[];
  footer: NavPermissionItem[];
};

function itemVisible(
  item: NavPermissionItem,
  permissions: readonly string[],
  opts: {
    isAdmin: boolean;
    isOwner: boolean;
    accountsPortalOnly: boolean;
    bidderPortalOnly: boolean;
    clientPortalOnly: boolean;
  },
): boolean {
  if (opts.accountsPortalOnly && !item.accountsWorkflow) return false;
  if (opts.bidderPortalOnly && !item.bidderWorkflow) return false;
  if (opts.clientPortalOnly && !item.clientWorkflow) return false;
  if (item.adminOnly && !(opts.isAdmin || opts.isOwner)) return false;
  if (item.accountsWorkflow && opts.isAdmin) return false;
  if (item.permission && !can(permissions, item.permission)) return false;
  if (item.anyPermission?.length && !canAny(permissions, item.anyPermission)) {
    return false;
  }
  return true;
}

function filterItems(
  items: NavPermissionItem[] | undefined,
  permissions: readonly string[],
  opts: {
    isAdmin: boolean;
    isOwner: boolean;
    accountsPortalOnly: boolean;
    bidderPortalOnly: boolean;
    clientPortalOnly: boolean;
  },
): NavPermissionItem[] {
  if (!items?.length) return [];
  const out: NavPermissionItem[] = [];
  for (const item of items) {
    if (!itemVisible(item, permissions, opts)) continue;
    const next: NavPermissionItem = { ...item };
    if (item.items) {
      next.items = filterItems(item.items, permissions, opts);
    }
    if (item.groups) {
      next.groups = item.groups
        .map((g) => ({
          ...g,
          items: filterItems(g.items, permissions, opts),
        }))
        .filter((g) => g.items.length > 0);
    }
    const hasChildren =
      (next.items?.length ?? 0) > 0 || (next.groups?.length ?? 0) > 0;
    if (next.href || hasChildren) {
      out.push(next);
    }
  }
  return out;
}

/** Filter navigation by permission keys. Admins are filtered by their matrix like any role. */
export function filterNavigation<T extends NavPermissionConfig>(
  navigation: T,
  permissions: readonly string[],
  opts: {
    isAdmin?: boolean;
    isOwner?: boolean;
    /** When true (account role portal), only /accounts/* nav items are shown. */
    accountsPortalOnly?: boolean;
    /** When true (bidder role portal), only bidder portal nav items are shown. */
    bidderPortalOnly?: boolean;
    /** When true (client role portal), only client portal nav items are shown. */
    clientPortalOnly?: boolean;
  } = {},
): T {
  const flags = {
    isAdmin: opts.isAdmin ?? false,
    isOwner: opts.isOwner ?? false,
    accountsPortalOnly: opts.accountsPortalOnly ?? false,
    bidderPortalOnly: opts.bidderPortalOnly ?? false,
    clientPortalOnly: opts.clientPortalOnly ?? false,
  };
  return {
    ...navigation,
    main: filterItems(navigation.main, permissions, flags),
    footer: filterItems(navigation.footer, permissions, flags),
  } as T;
}
