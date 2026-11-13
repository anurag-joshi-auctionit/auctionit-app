import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@auctionit/ui";
import { useState, type ReactNode } from "react";

export type AuctionClientGroup<T> = {
  key: string;
  clientId: number | null;
  name: string;
  rows: T[];
};

/** Group list rows by client (same keying as client/bidder auction lists). */
export function groupAuctionsByClient<
  T extends { clientId: number | null; clientName: string | null },
>(rows: T[]): AuctionClientGroup<T>[] {
  const map = new Map<
    string,
    { clientId: number | null; name: string; rows: T[] }
  >();
  for (const a of rows) {
    const key = a.clientId != null ? `c${a.clientId}` : `n${a.clientName}`;
    const name = a.clientName ?? "Unknown company";
    const g = map.get(key);
    if (g) g.rows.push(a);
    else map.set(key, { clientId: a.clientId, name, rows: [a] });
  }
  return [...map.entries()].map(([key, g]) => ({ key, ...g }));
}

/**
 * Shared company accordion chrome for portal auction lists.
 * Open-state: when `defaultCollapsed`, track keys that are open; otherwise
 * track keys that the user has closed (everything else starts open).
 */
export function AuctionGroupAccordion<T>({
  groups,
  defaultCollapsed = false,
  countLabel = "auctions",
  renderContent,
}: {
  groups: AuctionClientGroup<T>[];
  defaultCollapsed?: boolean;
  /** Singular noun for the count badge (e.g. "auction" → "1 auction" / "2 auctions"). */
  countLabel?: string;
  renderContent: (group: AuctionClientGroup<T>) => ReactNode;
}) {
  const [openKeys, setOpenKeys] = useState<Set<string>>(() => new Set());
  const [closedKeys, setClosedKeys] = useState<Set<string>>(() => new Set());

  const value = defaultCollapsed
    ? groups.map((g) => g.key).filter((key) => openKeys.has(key))
    : groups.map((g) => g.key).filter((key) => !closedKeys.has(key));

  return (
    <Accordion
      type="multiple"
      value={value}
      onValueChange={(next) => {
        const open = new Set(next);
        if (defaultCollapsed) {
          setOpenKeys(open);
          return;
        }
        setClosedKeys(
          new Set(groups.map((g) => g.key).filter((key) => !open.has(key))),
        );
      }}
      className="space-y-4"
    >
      {groups.map((g) => (
        <AccordionItem
          key={g.key}
          value={g.key}
          className="border-border bg-secondary/50 overflow-hidden rounded-lg border last:border-b"
        >
          <AccordionTrigger className="hover:bg-muted/40 items-center rounded-none px-4 py-3 hover:no-underline">
            <span className="flex min-w-0 flex-1 items-center justify-between gap-3">
              <span className="flex min-w-0 flex-wrap items-center gap-2">
                <span className="font-medium">{g.name}</span>
              </span>
              <span className="text-muted-foreground shrink-0 text-xs font-normal">
                {g.rows.length}{" "}
                {g.rows.length === 1 ? countLabel : `${countLabel}s`}
              </span>
            </span>
          </AccordionTrigger>
          <AccordionContent className="pb-0">
            <div className="border-border bg-background border-t">
              {renderContent(g)}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
