import { Link, useLocation } from "react-router-dom";
import { useEffect, useState, type ComponentProps } from "react";

type NavLinkProps = Omit<ComponentProps<typeof Link>, "to"> & {
  href: string;
};

/** Link that exposes `data-pending` while navigating (sidebar active feedback). */
export function NavLink({ href, onClick, ...props }: NavLinkProps) {
  const { pathname } = useLocation();
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  const isPending = pendingHref === href;

  useEffect(() => {
    if (!pendingHref) return;
    if (pathname === pendingHref || pathname.startsWith(`${pendingHref}/`)) {
      setPendingHref(null);
    }
  }, [pathname, pendingHref]);

  return (
    <Link
      to={href}
      data-pending={isPending ? "" : undefined}
      onClick={(e) => {
        setPendingHref(href);
        onClick?.(e);
      }}
      {...props}
    />
  );
}
