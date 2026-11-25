import {
  Badge,
  Button,
  Card,
  CardContent,
  formatDateTime,
} from "@auctionit/ui";
import { Link } from "react-router-dom";
import { useSealedWindowAuctions } from "@/hooks/use-sealed-bids";
import { auctionDisplayLabel } from "@/lib/portal-display-labels";

/**
 * Open sealed-bid windows the bidder is mapped to. Sealed-bids are placed on
 * their own page — the live feed never shows them.
 */
export function SealedBidWindowsBidder() {
  const { data } = useSealedWindowAuctions();
  if (!data || data.length === 0) return null;

  return (
    <div className="space-y-2">
      <div>
        <h2 className="text-sm font-medium">Sealed-bid Windows</h2>
        <p className="text-muted-foreground text-xs">
          Submit sealed-bids before the window closes. Only your own bid is
          shown.
        </p>
      </div>
      <Card>
        <CardContent>
          <ul className="divide-border divide-y">
          {data.map((a) => (
            <li
              key={a.id}
              className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {auctionDisplayLabel(a.auctionNumber)}
                  </span>
                  <Badge variant="green">Sealed-bid</Badge>
                </div>
                <div className="text-muted-foreground text-xs">
                  {a.clientName ?? "—"} · {a.lotCount} lots · Closes{" "}
                  {formatDateTime(a.windowEndsAt)}
                </div>
              </div>
              <Button asChild size="sm">
                <Link to={`/auctions/sealed/${a.id}`}>Place Sealed-bids</Link>
              </Button>
            </li>
          ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
