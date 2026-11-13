import React from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./ui/breadcrumb";
import { Skeleton } from "./ui/skeleton";

export type BreadcrumbConfigItem = {
  label: string;
  href: string;
};

export function BreadcrumbSuspense() {
  return (
    <div className="flex items-center gap-1.5">
      <Skeleton className="h-4 w-12" />
      <Skeleton className="h-3 w-3 rounded-full" />
      <Skeleton className="h-4 w-24" />
    </div>
  );
}

export function AppBreadcrumb({
  getBreadcrumbConfig,
}: {
  getBreadcrumbConfig: (
    pathname: string,
    searchParams?: URLSearchParams,
  ) => BreadcrumbConfigItem[];
}) {
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const breadcrumbs = getBreadcrumbConfig(pathname || "", searchParams);

  if (breadcrumbs.length === 0) {
    return null;
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;

          // Use index in the key — two crumbs in the same trail can legitimately
          // share an href (e.g. an Approvals parent crumb pointing at the same
          // page as its child leaf), and duplicate keys make React's reconciler
          // leak previously-rendered crumbs across route changes.
          return (
            <React.Fragment key={`${index}-${crumb.href}`}>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={crumb.href}>{crumb.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
