import { EmdUiMessages } from "@auctionit/messages/emd";
import { Button, Card, CardContent, cn, copyToClipboard, Skeleton } from "@auctionit/ui";
import { Check, Copy01 } from "@untitledui/icons";
import { useEffect, useState } from "react";

/** Bidder's virtual account number for EMD deposits, with copy. */
export function VanCard({
  van,
  isLoading,
  className,
}: {
  van: string | null;
  isLoading?: boolean;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(t);
  }, [copied]);

  return (
    <Card className={cn("py-0", className)}>
      <CardContent className="flex flex-wrap items-center justify-between gap-3 p-5">
        <div className="min-w-0 space-y-1">
          <div className="text-muted-foreground text-xs tracking-wider uppercase">
            Virtual Account Number
          </div>
          {isLoading ? (
            <Skeleton className="h-7 w-48" />
          ) : van ? (
            <div className="text-xl font-semibold tracking-wide">{van}</div>
          ) : (
            <div className="text-muted-foreground text-sm">{EmdUiMessages.VAN_NOT_ASSIGNED}</div>
          )}
          {van ? (
            <p className="text-muted-foreground text-xs">{EmdUiMessages.VAN_HINT}</p>
          ) : null}
        </div>
        {van ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              void copyToClipboard(van).then((ok) => ok && setCopied(true));
            }}
          >
            {copied ? <Check className="size-4" /> : <Copy01 className="size-4" />}
            {copied ? "Copied" : "Copy"}
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
