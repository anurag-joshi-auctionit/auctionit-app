import type { ReactNode } from "react";

export function DashboardSectionHeader({
  id,
  title,
  actions,
}: {
  id: string;
  title: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h2
        id={id}
        className="scroll-mt-24 text-lg font-semibold tracking-tight"
      >
        {title}
      </h2>
      {actions != null ? (
        <div className="flex flex-wrap items-center justify-end gap-3">
          {actions}
        </div>
      ) : null}
    </div>
  );
}
