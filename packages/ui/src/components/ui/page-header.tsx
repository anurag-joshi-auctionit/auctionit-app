import * as React from "react";

import { cn } from "../../lib/utils";

export type PageHeaderProps = {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  titleAs?: "h1" | "h2";
};

function PageHeader({
  title,
  description,
  actions,
  className,
  titleAs = "h1",
}: PageHeaderProps) {
  const Title = titleAs;
  return (
    <div
      data-slot="page-header"
      className={cn(
        "flex flex-wrap items-center justify-between gap-4",
        className,
      )}
    >
      <div className="min-w-0">
        <Title
          className={cn(
            titleAs === "h2"
              ? "mb-0.5 text-lg font-medium"
              : "text-3xl font-bold",
          )}
        >
          {title}
        </Title>
        {description != null ? (
          <div className="text-muted-foreground mt-2 text-sm">
            {description}
          </div>
        ) : null}
      </div>
      {actions != null ? (
        <div className="flex items-center gap-3">{actions}</div>
      ) : null}
    </div>
  );
}

export { PageHeader };
