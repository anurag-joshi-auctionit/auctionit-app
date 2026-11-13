import { useAuth } from "@auctionit/lib";
import { BiddersErrorMessages } from "@auctionit/messages/bidders";
import { BidderAccountMessages } from "@auctionit/messages/emd";
import {
  Badge,
  Button,
  Card,
  CardContent,
  IllustratedEmpty,
  PageHeader,
  Skeleton,
} from "@auctionit/ui";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { BankAccountUpdateEditor } from "@/components/bank-account/bank-account-update-editor";
import { BankAccountHistoryTable } from "@/components/bank-account/bank-account-history-table";

type BankAccount = {
  bankAccount: string | null;
  bankName: string | null;
  bankIfsc: string | null;
  cancelledCheckUrl: string | null;
  isVerified: boolean;
};

type PendingRequest = {
  id: number;
  bankAccount: string;
  bankName: string;
  bankIfsc: string;
  cancelledChequeUrl: string | null;
  isVerified: boolean | null;
  requestedAt: string;
};

type BankAccountSummary = {
  account: BankAccount | null;
  pendingRequest: PendingRequest | null;
};

type BankFields = {
  bankAccount: string | null;
  bankName: string | null;
  bankIfsc: string | null;
  chequeUrl: string | null;
};

function EmptyValue() {
  return <span className="text-muted-foreground">—</span>;
}

function CancelledChequePreview({ url }: { url: string | null }) {
  return (
    <div>
      <div className="text-muted-foreground mb-2 text-xs">Cancelled Cheque</div>
      {url ? (
        <a href={url} target="_blank" rel="noreferrer" className="inline-block">
          <img
            src={url}
            alt="Cancelled cheque"
            className="max-h-64 rounded-md border object-contain"
          />
        </a>
      ) : (
        <p className="text-muted-foreground text-sm">
          No cancelled cheque uploaded
        </p>
      )}
    </div>
  );
}

function BankDetailsCard({
  fields,
  showCheque = false,
}: {
  fields: BankFields;
  showCheque?: boolean;
}) {
  return (
    <Card className="bg-secondary/50">
      <CardContent className="space-y-6">
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-muted-foreground mb-1 text-xs">
              Account Number
            </dt>
            <dd className="text-sm">{fields.bankAccount ?? <EmptyValue />}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground mb-1 text-xs">Bank Name</dt>
            <dd className="text-sm">{fields.bankName ?? <EmptyValue />}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground mb-1 text-xs">IFSC Code</dt>
            <dd className="text-sm uppercase">
              {fields.bankIfsc ?? <EmptyValue />}
            </dd>
          </div>
        </dl>
        {showCheque ? <CancelledChequePreview url={fields.chequeUrl} /> : null}
      </CardContent>
    </Card>
  );
}

export function BankAccountPage() {
  const { api, user } = useAuth();
  const linked = user?.bidderCompId != null;
  const [sheetOpen, setSheetOpen] = useState(false);

  const query = useQuery({
    queryKey: ["bank-account-me"],
    queryFn: () => api.get<BankAccountSummary>("/bank-account/me"),
    enabled: linked,
  });

  const account = query.data?.account ?? null;
  const pending = query.data?.pendingRequest ?? null;
  const canRequestUpdate =
    linked && !query.isLoading && !query.isError && pending == null;

  return (
    <div className="space-y-6 p-4">
      <PageHeader
        title="Bank Account"
        description="Submit updated bank details with a cancelled cheque. Changes apply only after admin verification."
      />

      {!linked ? (
        <IllustratedEmpty
          title={BidderAccountMessages.UNLINKED_TITLE}
          description={BidderAccountMessages.UNLINKED_BANK_ACCOUNT_DESCRIPTION}
          className="border-0"
        />
      ) : (
        <>
          {query.isLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : query.isError ? (
            <div className="space-y-3">
              <p className="text-destructive text-sm">
                {BiddersErrorMessages.FAILED_TO_LOAD_BANK_ACCOUNT}
              </p>
              <Button variant="outline" onClick={() => void query.refetch()}>
                Retry
              </Button>
            </div>
          ) : (
            <>
              <section className="space-y-3">
                <div className="flex min-h-8 items-start justify-between gap-3">
                  <div className="text-lg font-medium">
                    Current Bank Details
                  </div>
                  {account?.isVerified ? (
                    <Badge color="green">
                      {BidderAccountMessages.BANK_UPDATE_STATUS_VERIFIED}
                    </Badge>
                  ) : null}
                </div>
                {account?.isVerified ? (
                  <BankDetailsCard
                    fields={{
                      bankAccount: account.bankAccount,
                      bankName: account.bankName,
                      bankIfsc: account.bankIfsc,
                      chequeUrl: account.cancelledCheckUrl,
                    }}
                  />
                ) : (
                  <IllustratedEmpty
                    title={BidderAccountMessages.CURRENT_BANK_EMPTY_TITLE}
                    description={
                      BidderAccountMessages.CURRENT_BANK_EMPTY_DESCRIPTION
                    }
                  />
                )}
              </section>

              <section className="space-y-3">
                <div className="flex min-h-8 items-start justify-between gap-3">
                  <div>
                    <div className="text-lg font-medium">Update Request</div>
                    <p className="text-muted-foreground text-sm">
                      {pending
                        ? BidderAccountMessages.BANK_UPDATE_PENDING_HINT
                        : BidderAccountMessages.BANK_UPDATE_SECTION_DESCRIPTION}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {pending ? (
                      <Badge color="yellow">
                        {BidderAccountMessages.BANK_UPDATE_STATUS_PENDING}
                      </Badge>
                    ) : null}
                    {canRequestUpdate ? (
                      <Button type="button" onClick={() => setSheetOpen(true)}>
                        Request
                      </Button>
                    ) : null}
                  </div>
                </div>
                {pending ? (
                  <BankDetailsCard
                    showCheque
                    fields={{
                      bankAccount: pending.bankAccount,
                      bankName: pending.bankName,
                      bankIfsc: pending.bankIfsc,
                      chequeUrl: pending.cancelledChequeUrl,
                    }}
                  />
                ) : null}
              </section>
            </>
          )}

          <BankAccountHistoryTable enabled />
        </>
      )}

      <BankAccountUpdateEditor open={sheetOpen} onOpenChange={setSheetOpen} />
    </div>
  );
}
