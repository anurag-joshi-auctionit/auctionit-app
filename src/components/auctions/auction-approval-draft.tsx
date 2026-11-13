import {
  createContext,
  useContext,
  type ReactNode,
} from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@auctionit/ui";
import type {
  ApprovalDraftContextValue,
  ApprovalStatusValue,
  LotDraft,
  PortalApprovalLot,
} from "@/components/auctions/auction-approval-types";

export const EMPTY_DRAFT: LotDraft = { status: "pending" };

const ApprovalDraftContext = createContext<ApprovalDraftContextValue | null>(
  null,
);

export function ApprovalDraftProvider({
  value,
  children,
}: {
  value: ApprovalDraftContextValue;
  children: ReactNode;
}) {
  return (
    <ApprovalDraftContext.Provider value={value}>
      {children}
    </ApprovalDraftContext.Provider>
  );
}

export function useApprovalDraft(): ApprovalDraftContextValue {
  const ctx = useContext(ApprovalDraftContext);
  if (!ctx) {
    throw new Error("Approval draft context missing");
  }
  return ctx;
}

export function StatusCell({ lot }: { lot: PortalApprovalLot }) {
  const ctx = useApprovalDraft();
  const draft = ctx.getDraft(lot.lotId);
  return (
    <Select
      value={draft.status}
      onValueChange={(next) =>
        ctx.setStatus(lot.lotId, next as ApprovalStatusValue)
      }
      disabled={ctx.disabled}
    >
      <SelectTrigger size="sm" className="w-32">
        <SelectValue placeholder="Pending" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="pending">Pending</SelectItem>
        <SelectItem value="approved">Approve</SelectItem>
        <SelectItem value="rejected">Reject</SelectItem>
      </SelectContent>
    </Select>
  );
}
