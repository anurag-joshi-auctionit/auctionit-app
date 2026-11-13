import { Label } from "@auctionit/ui";
import type { ReactNode } from "react";
import type { PortalAuction } from "@/components/auctions/auction-groups-client";

export type PortalApprovalLot = {
  lotId: number;
  lotNumber: string | null;
  quantity: number | null;
  uom: string | null;
  startBidPrice: number | null;
  winningPrice: number | null;
  winnerBidderId: number | null;
  winnerBidderName: string | null;
  bidCount: number;
  bidderCount: number;
  gstPercentage: number | null;
  tcsPercentage: number | null;
  isApproved: boolean | null;
  remark: string | null;
  reviewedAt: string | null;
  reviewedByName: string | null;
  plantLocationName: string | null;
  itemName: string | null;
};

export type ApprovalLotsResponse = {
  auctionId: number;
  auctionNumber: string | null;
  auctionType: string | null;
  clientName: string | null;
  auctionDate: string | null;
  lots: PortalApprovalLot[];
};

export type ApprovalStatusValue = "pending" | "approved" | "rejected";
export type LotDraft = { status: ApprovalStatusValue };

export type ApprovalDraftContextValue = {
  getDraft: (lotId: number) => LotDraft;
  setStatus: (lotId: number, status: ApprovalStatusValue) => void;
  disabled: boolean;
};

export type AuctionApprovalTableClientProps = {
  auctionId: number;
  clientName: string | null;
  auctionDate: string | null;
  auctions: PortalAuction[];
  onAuctionChange: (auctionId: string) => void;
};

export function serverStatus(lot: PortalApprovalLot): ApprovalStatusValue {
  return lot.isApproved === true
    ? "approved"
    : lot.isApproved === false
      ? "rejected"
      : "pending";
}

export function statusToIsApproved(
  status: ApprovalStatusValue,
): boolean | null {
  if (status === "approved") return true;
  if (status === "rejected") return false;
  return null;
}

export function FieldRow({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <Label htmlFor={htmlFor} className="text-muted-foreground font-normal">
        {label}
      </Label>
      {children}
    </div>
  );
}
