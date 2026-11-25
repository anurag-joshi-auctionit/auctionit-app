import {
  PageHeader,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  cn,
} from "@auctionit/ui";
import { LiveTransportMessages } from "@auctionit/messages/auctions";
import { useCallback, useState } from "react";
import {
  LiveLotsPanelBidder,
  type LiveLotsPanelBidderStatus,
} from "@/components/auctions/live-lots-panel-bidder";
import { formatAgo } from "@/lib/live-auction-url";
import { TickProvider, useSharedSecondTick } from "@/lib/use-live-auction";

function LiveAuctionsHeader({
  status,
}: {
  status: LiveLotsPanelBidderStatus | null;
}) {
  useSharedSecondTick();
  // A feed on the SSE/polling fallback is still correct and still bid-able, so
  // it reads as amber rather than the red-flag "Reconnecting".
  const healthy = status?.connected === true;
  const tone =
    healthy && !status.degraded
      ? "text-green-foreground"
      : "text-yellow-foreground";
  const dot =
    healthy && !status.degraded
      ? "bg-green-foreground"
      : "bg-yellow-foreground";
  return (
    <PageHeader
      title="Live Auctions"
      description="Place bids in real time. Prices and timers update live."
      actions={
        status?.watching ? (
          <>
            <div className="text-muted-foreground text-xs tabular-nums">
              Updated {formatAgo(status.lastRefreshedAt, Date.now())}
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    "inline-flex items-center gap-1.5 text-xs",
                    tone,
                  )}
                >
                  <span className="relative flex size-2">
                    <span
                      className={cn(
                        "absolute inline-flex size-full animate-ping rounded-full opacity-75",
                        dot,
                      )}
                    />
                    <span
                      className={cn(
                        "relative inline-flex size-2 rounded-full",
                        dot,
                      )}
                    />
                  </span>
                  {healthy
                    ? status.degraded
                      ? "Live (fallback)"
                      : "Live"
                    : "Reconnecting"}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                {healthy && status.degraded
                  ? LiveTransportMessages.DEGRADED_HINT
                  : "Live updates are streaming."}
              </TooltipContent>
            </Tooltip>
          </>
        ) : null
      }
    />
  );
}

export function LiveAuctionsPageBidder() {
  const [status, setStatus] = useState<LiveLotsPanelBidderStatus | null>(null);
  const onStatusChange = useCallback((next: LiveLotsPanelBidderStatus) => {
    setStatus(next);
  }, []);

  return (
    <TickProvider>
      <div className="space-y-6 p-4">
        <LiveAuctionsHeader status={status} />
        <LiveLotsPanelBidder onStatusChange={onStatusChange} />
      </div>
    </TickProvider>
  );
}
