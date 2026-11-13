import {
  Button,
  Checkbox,
  HammerIcon,
  InputGroup,
  InputGroupButton,
  InputGroupInput,
  Label,
  Spinner,
} from "@auctionit/ui";
import {
  bidDirectionFor,
  lotStartLeft,
  maxBidFor,
  minBidFor,
  rankBoundsLot,
  useSharedSecondTick,
  type MergedLot,
} from "@/lib/use-live-auction";
import { Minus, Plus } from "@untitledui/icons";
import { useState, type PointerEvent } from "react";

export type BidCellProps = {
  lot: MergedLot;
  tncRequired: boolean;
  /** Bumped by the page once a bid or proxy settles, to drop the draft. */
  resetKey: number;
  proxyOn: boolean;
  onProxyToggle: (v: boolean) => void;
  /** `null` when the bidder cleared the field or typed a non-number. */
  onSubmit: (amount: number | null) => void;
  submitting: boolean;
};

function parseAmount(text: string): number | null {
  const n = Number.parseFloat(text.trim());
  return Number.isFinite(n) ? n : null;
}

function paise(n: number) {
  return Math.round(n * 100);
}

function formatAmount(n: number) {
  return String(Math.round(n * 100) / 100);
}

function isBidText(value: string) {
  if (!/^\d*\.?\d*$/.test(value)) return false;
  const dot = value.indexOf(".");
  return dot === -1 || value.length - dot - 1 <= 2;
}

export function BidCell({
  lot,
  tncRequired,
  resetKey,
  proxyOn,
  onProxyToggle,
  onSubmit,
  submitting,
}: BidCellProps) {
  useSharedSecondTick();

  // `null` follows the live next bid. A string is the bidder's own draft, set
  // either by typing or by the steppers, and is never overwritten by winning-price moves.
  const [draft, setDraft] = useState<string | null>(null);
  const [stepped, setStepped] = useState(false);
  const [seenReset, setSeenReset] = useState(resetKey);

  if (seenReset !== resetKey) {
    setSeenReset(resetKey);
    setDraft(null);
    setStepped(false);
  }

  // Withheld from bidders during the sealed-bid phase — nothing to bid live on.
  const startBidPrice = lot.startBidPrice;
  if (startBidPrice == null) {
    return <span className="text-muted-foreground">—</span>;
  }

  const direction = bidDirectionFor(lot.auctionType);
  const lotBounds = {
    bidIncrement: lot.bidIncrement,
    startBidPrice,
    sbpPlusIncrement: lot.sbpPlusIncrement,
    bidLimit: lot.bidLimit ?? null,
    auctionType: lot.auctionType,
  };
  // Rank-based: next bid steps from the bidder's own best bid (SBP rule before
  // their first), since the winning price is withheld.
  const boundsLot = lot.isRankBased
    ? rankBoundsLot(lotBounds, lot.yourBid ?? null)
    : {
        ...lotBounds,
        bidCount: lot.bidCount,
        currentBid: lot.currentBid ?? startBidPrice,
      };
  const nextBid = minBidFor(boundsLot, direction);
  const extreme = maxBidFor(boundsLot, direction);
  const notStarted = lotStartLeft(lot, lot.receivedAt) > 0;
  // Server-confirmed only: `lot.closed` never flips while a no-bid extension
  // is pending, so gating on the local countdown as well would lock bidders
  // out exactly when a trailing bid is most likely to trigger that extension.
  const closed = lot.closed;

  if (tncRequired || notStarted || closed) {
    return <span className="text-muted-foreground">—</span>;
  }

  const typing = draft != null && !stepped;
  const draftAmount = draft != null ? parseAmount(draft) : null;
  // Untouched (`draft === null`) follows nextBid. Cleared / unparseable draft
  // yields null so submit rejects instead of silently using nextBid.
  // Stepped drafts clamp to the live bound when the standing price moves.
  const submitAmount: number | null =
    draft == null
      ? nextBid
      : draftAmount == null
        ? null
        : stepped
          ? direction === 1
            ? Math.max(draftAmount, nextBid)
            : Math.min(draftAmount, nextBid)
          : draftAmount;
  const amount = submitAmount ?? nextBid;
  const display = typing && draft != null ? draft : formatAmount(amount);

  // Minus moves toward the extreme (less aggressive for reverse = toward
  // higher amounts? No: minus always decreases the number.
  // Forward: minus bottoms at nextBid (floor). Plus increases toward extreme.
  // Reverse: minus decreases toward extreme (floor); plus tops out at nextBid.
  const minusDisabled =
    submitting ||
    (direction === 1
      ? !typing && paise(amount) <= paise(nextBid)
      : !typing && paise(amount) <= paise(extreme));
  const plusDisabled =
    submitting ||
    (direction === -1
      ? !typing && paise(amount) >= paise(nextBid)
      : false);

  const step = (dir: 1 | -1) => {
    const increment = lot.bidIncrement;
    if (!(increment > 0)) return;
    // A typed draft is discarded: the steppers always start from the next bid.
    const base = typing ? nextBid : amount;
    let next = base + dir * increment;
    if (direction === 1) {
      next = Math.max(nextBid, Math.min(extreme, next));
    } else {
      next = Math.min(nextBid, Math.max(extreme, next));
    }
    setDraft(formatAmount(next));
    setStepped(true);
  };

  // Stepping on pointerdown (instead of click) keeps focus in the input, which
  // otherwise blurs first and drops the click on WebKit.
  const onStep = (dir: 1 | -1) => (e: PointerEvent<HTMLButtonElement>) => {
    if (e.button !== 0) return;
    e.preventDefault();
    step(dir);
  };

  return (
    <div className="flex w-full flex-col gap-1.5">
      <InputGroup className="h-8 w-full outline-none has-[[data-slot=input-group-control]:focus-visible]:border-input!">
        <InputGroupButton
          size="icon-sm"
          type="button"
          variant="secondary"
          aria-label="Decrease"
          disabled={minusDisabled}
          onPointerDown={onStep(-1)}
        >
          <Minus className="size-4" />
        </InputGroupButton>
        <InputGroupInput
          inputMode="decimal"
          autoComplete="off"
          aria-label="Bid amount"
          value={display}
          onChange={(e) => {
            const next = e.target.value;
            if (!isBidText(next)) return;
            setDraft(next);
            setStepped(false);
          }}
          onKeyDown={(e) => e.stopPropagation()}
          className="h-8 flex-1 rounded-none border-0 bg-transparent px-1 text-center tabular-nums shadow-none outline-none focus-visible:ring-0 dark:bg-transparent"
        />
        <InputGroupButton
          size="icon-sm"
          type="button"
          variant="secondary"
          aria-label="Increase"
          disabled={plusDisabled}
          onPointerDown={onStep(1)}
        >
          <Plus className="size-4" />
        </InputGroupButton>
      </InputGroup>

      <div className="flex w-full items-center gap-4">
        <Label className="cursor-pointer shrink-0 gap-1">
          <Checkbox
            checked={proxyOn}
            onCheckedChange={(v) => onProxyToggle(v === true)}
          />
          Proxy
        </Label>

        <Button
          type="button"
          size="sm"
          className="min-w-0 flex-1"
          loading={submitting}
          onClick={() => onSubmit(submitAmount)}
        >
          {submitting ? (
            <Spinner className="size-4" />
          ) : (
            <HammerIcon className="size-4" />
          )}
          {proxyOn ? "Set Proxy" : "Place Bid"}
        </Button>
      </div>
    </div>
  );
}
