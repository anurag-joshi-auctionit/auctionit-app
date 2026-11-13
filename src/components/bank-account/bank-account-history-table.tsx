import { BiddersErrorMessages } from "@auctionit/messages/bidders";
import { BidderAccountMessages } from "@auctionit/messages/emd";
import {
  Badge,
  Button,
  ListDataTable,
  Skeleton,
  formatDateTime,
  type ColumnDef,
} from "@auctionit/ui";
import { useAuth } from "@auctionit/lib";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

export type BankAccountHistoryItem = {
  id: number;
  bankAccount: string;
  bankName: string;
  bankIfsc: string;
  isVerified: boolean | null;
  requestedAt: string;
  reviewedAt: string | null;
};

type ListResult = { items: BankAccountHistoryItem[] };

function StatusBadge({ isVerified }: { isVerified: boolean | null }) {
  if (isVerified === true) {
    return (
      <Badge color="green">
        {BidderAccountMessages.BANK_UPDATE_STATUS_ACCEPTED}
      </Badge>
    );
  }
  if (isVerified === false) {
    return (
      <Badge color="red">
        {BidderAccountMessages.BANK_UPDATE_STATUS_REJECTED}
      </Badge>
    );
  }
  return (
    <Badge color="yellow">
      {BidderAccountMessages.BANK_UPDATE_STATUS_PENDING}
    </Badge>
  );
}

const columns: ColumnDef<BankAccountHistoryItem>[] = [
  {
    accessorKey: "bankAccount",
    header: "Account No.",
    enableHiding: false,
    cell: ({ row }) => (
      <span className="text-sm">{row.original.bankAccount}</span>
    ),
  },
  {
    accessorKey: "bankName",
    header: "Bank",
    enableHiding: false,
    cell: ({ row }) => (
      <span className="text-sm">{row.original.bankName}</span>
    ),
  },
  {
    accessorKey: "bankIfsc",
    header: "IFSC",
    enableHiding: false,
    cell: ({ row }) => (
      <span className="text-sm uppercase">{row.original.bankIfsc}</span>
    ),
  },
  {
    id: "status",
    header: "Status",
    enableHiding: false,
    cell: ({ row }) => <StatusBadge isVerified={row.original.isVerified} />,
  },
  {
    id: "requestedAt",
    accessorKey: "requestedAt",
    header: "Requested At",
    enableHiding: false,
    cell: ({ row }) => (
      <span className="text-sm">
        {formatDateTime(row.original.requestedAt) || "—"}
      </span>
    ),
  },
  {
    id: "reviewedAt",
    accessorKey: "reviewedAt",
    header: "Reviewed At",
    enableHiding: false,
    cell: ({ row }) => (
      <span className="text-sm">
        {row.original.reviewedAt
          ? formatDateTime(row.original.reviewedAt)
          : "—"}
      </span>
    ),
  },
];

export function BankAccountHistoryTable({ enabled }: { enabled: boolean }) {
  const { api } = useAuth();

  const query = useQuery({
    queryKey: ["bank-account-me", "logs"],
    queryFn: () => api.get<ListResult>("/bank-account/me/logs"),
    enabled,
  });

  const items = useMemo(() => query.data?.items ?? [], [query.data?.items]);

  return (
    <section className="space-y-3">
      <div className="text-lg font-medium">Change History</div>

      {query.isLoading ? (
        <Skeleton className="h-48 w-full" />
      ) : query.isError ? (
        <div className="space-y-3">
          <p className="text-destructive text-sm">
            {BiddersErrorMessages.FAILED_TO_LOAD_BANK_HISTORY}
          </p>
          <Button variant="outline" onClick={() => void query.refetch()}>
            Retry
          </Button>
        </div>
      ) : (
        <ListDataTable
          columns={columns}
          data={items}
          getRowId={(row) => String(row.id)}
          initialState={{
            sorting: [{ id: "requestedAt", desc: true }],
          }}
          showPagination
          emptyTitle="No update requests yet"
          emptyDescription="Your bank account change requests will appear here."
        />
      )}
    </section>
  );
}
