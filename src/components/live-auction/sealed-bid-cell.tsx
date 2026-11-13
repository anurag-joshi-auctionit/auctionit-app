import { Button, HammerIcon, InputCurrency, Spinner } from "@auctionit/ui";
import { useState } from "react";

export type SealedBidCellProps = {
  disabled: boolean;
  /** Bumped by the page once a bid is accepted, to clear the field. */
  resetKey: number;
  onSubmit: (amount: number | null) => void;
  submitting: boolean;
};

/**
 * Sealed-bid counterpart of BidCell: same footprint, but a plain amount field —
 * no −/+ stepper (there is no increment grid) and no proxy.
 */
export function SealedBidCell(props: SealedBidCellProps) {
  // Remount on reset so a successful bid clears the field.
  return <SealedBidCellInner key={props.resetKey} {...props} />;
}

function SealedBidCellInner({
  disabled,
  onSubmit,
  submitting,
}: SealedBidCellProps) {
  const [amount, setAmount] = useState<number | null>(null);
  const submit = () => {
    if (disabled || submitting) return;
    onSubmit(amount);
  };

  return (
    <div className="flex w-full flex-col gap-1.5">
      <InputCurrency
        allowEmptyAsZero={false}
        value={amount}
        onChange={setAmount}
        disabled={disabled || submitting}
        aria-label="Bid amount"
        autoComplete="off"
        className="h-8 tabular-nums"
        onKeyDown={(e) => {
          e.stopPropagation();
          if (e.key === "Enter") submit();
        }}
      />
      <Button
        type="button"
        size="sm"
        className="w-full"
        disabled={disabled}
        loading={submitting}
        onClick={submit}
      >
        {submitting ? (
          <Spinner className="size-4" />
        ) : (
          <HammerIcon className="size-4" />
        )}
        Place Bid
      </Button>
    </div>
  );
}
