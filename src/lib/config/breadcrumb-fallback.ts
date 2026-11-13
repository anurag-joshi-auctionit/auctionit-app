import type { BreadcrumbConfigItem } from "@auctionit/ui";

/** Title-case unknown path segments when a role map has no explicit entry. */
export function fallbackBreadcrumbs(
  pathname: string,
): BreadcrumbConfigItem[] {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return [];
  return segments.map((segment, index) => {
    const href = `/${segments.slice(0, index + 1).join("/")}`;
    const label = segment
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
    return { label, href };
  });
}
