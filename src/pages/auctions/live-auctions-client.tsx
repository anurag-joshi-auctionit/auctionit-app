import { PageHeader, cn } from "@auctionit/ui";
import { useCallback, useState } from "react";
import { LiveLotsPanelClient } from "@/components/auctions/live-lots-panel-client";
import { formatAgo } from "@/lib/live-auction-url";
import {
  TickProvider,
  useSharedSecondTick,
  type LiveTransportKind,
} from "@/lib/use-live-auction";

type Status = {
  connected: boolean;
  lastRefreshedAt: number;
  watching: boolean;
  transport: LiveTransportKind;
  degraded: boolean;
};

function LiveAuctionsHeader({ status }: { status: Status | null }) {
  useSharedSecondTick();
  return (
    <PageHeader
      title="Live Auctions"
      description="Real-time view of live auction lots (read-only)."
      actions={
        status?.watching ? (
          <>
            <div className="text-muted-foreground text-xs tabular-nums">
              Updated {formatAgo(status.lastRefreshedAt, Date.now())}
            </div>
            <div
              className={cn(
                "inline-flex items-center gap-1.5 text-xs",
                status.connected
                  ? "text-green-foreground"
                  : "text-yellow-foreground",
              )}
            >
              <span className="relative flex size-2">
                <span
                  className={cn(
                    "absolute inline-flex size-full animate-ping rounded-full opacity-75",
                    status.connected
                      ? "bg-green-foreground"
                      : "bg-yellow-foreground",
                  )}
                />
                <span
                  className={cn(
                    "relative inline-flex size-2 rounded-full",
                    status.connected
                      ? "bg-green-foreground"
                      : "bg-yellow-foreground",
                  )}
                />
              </span>
              {status.connected ? "Live" : "Reconnecting"}
            </div>
          </>
        ) : null
      }
    />
  );
}

export function LiveAuctionsPageClient() {
  const [status, setStatus] = useState<Status | null>(null);
  const onStatusChange = useCallback((next: Status) => {
    setStatus(next);
  }, []);

  return (
    <TickProvider>
      <div className="space-y-6 p-4">
        <LiveAuctionsHeader status={status} />
        <LiveLotsPanelClient onStatusChange={onStatusChange} />
      </div>
    </TickProvider>
  );
}
