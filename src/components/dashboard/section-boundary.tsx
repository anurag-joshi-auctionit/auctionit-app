import type { ComponentType, ReactNode } from "react";
import { Suspense } from "react";
import {
  ErrorBoundary,
  type FallbackProps,
} from "react-error-boundary";

export function DashboardSectionBoundary({
  children,
  fallback,
  FallbackComponent,
}: {
  children: ReactNode;
  fallback: ReactNode;
  FallbackComponent: ComponentType<FallbackProps>;
}) {
  return (
    <ErrorBoundary FallbackComponent={FallbackComponent}>
      <Suspense fallback={fallback}>{children}</Suspense>
    </ErrorBoundary>
  );
}
