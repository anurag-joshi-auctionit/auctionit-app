"use client";

import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";

export type PageTransitionProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Wraps route content and re-keys by pathname so the wrapper remounts on
 * navigation. Resets component state between routes. The actual visual
 * transition is driven by the browser's View Transitions API (enabled via
 * `viewTransition` on individual <Link>s).
 */
export function PageTransition({ children, className }: PageTransitionProps) {
  const { pathname } = useLocation();
  return (
    <div key={pathname} className={className}>
      {children}
    </div>
  );
}
