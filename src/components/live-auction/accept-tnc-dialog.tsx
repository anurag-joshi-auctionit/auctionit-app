import {
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@auctionit/ui";
import { useEffect, useState } from "react";
import { auctionDisplayLabel } from "@/lib/portal-display-labels";

export type AcceptTncTarget = {
  auctionId: number;
  auctionNumber: string | null;
  clientName: string | null;
};

export function AcceptTncDialog({
  target,
  pending,
  onClose,
  onAccept,
  onViewTnc,
}: {
  target: AcceptTncTarget | null;
  pending: boolean;
  onClose: () => void;
  onAccept: () => void;
  onViewTnc: () => void;
}) {
  const [checked, setChecked] = useState(false);
  const auctionNumber = target
    ? auctionDisplayLabel(target.auctionNumber)
    : "";

  useEffect(() => {
    setChecked(false);
  }, [target?.auctionId]);

  return (
    <Dialog
      open={target != null}
      onOpenChange={(open) => {
        if (!open && !pending) onClose();
      }}
    >
      <DialogContent className="sm:max-w-lg bg-muted">
        <DialogHeader>
          <DialogTitle>Accept Terms & Conditions</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="min-w-0">
            <div className="text-muted-foreground text-xs">Client</div>
            <div className="mt-1 font-semibold break-all">
              {target?.clientName ?? "—"}
            </div>
          </div>
          <div className="min-w-0">
            <div className="text-muted-foreground text-xs">Auction Number</div>
            <div className="mt-1 font-semibold break-all">
              {auctionNumber || "—"}
            </div>
          </div>
        </div>

        <div className="bg-yellow-background border border-yellow-foreground/20 text-yellow-foreground rounded-md p-3">
          <label className="flex cursor-pointer items-start gap-2 text-sm">
            <Checkbox
              checked={checked}
              onCheckedChange={(v) => setChecked(v === true)}
              disabled={pending}
              className="mt-0.5 border-yellow-foreground bg-transparent dark:bg-transparent data-[state=checked]:border-yellow-foreground data-[state=checked]:bg-yellow-foreground data-[state=checked]:text-yellow-background dark:data-[state=checked]:bg-yellow-foreground"
            />
            <span>
              I Accept the{" "}
              <Button
                type="button"
                variant="link"
                className="h-auto px-0"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onViewTnc();
                }}
              >
                Terms & Conditions
              </Button>
              {" for "}
              {auctionNumber}
            </span>
          </label>
        </div>

        <DialogFooter>
          <Button
            onClick={onAccept}
            disabled={!checked || pending || target == null}
          >
            {pending ? "Accepting…" : "Accept"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
