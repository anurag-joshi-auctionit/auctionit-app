import type {
  EmdBlockStatus,
  EmdRefundRejectionStage,
  EmdRefundStatus,
  EmdSettlementJobStatus,
  EmdTxnType,
  EmdType,
} from "@auctionit/messages/emd";

export type EmdPage<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

export type MyEmdSummary = {
  van: string | null;
  available: number;
  blocked: number;
  refundPending: number;
  forfeited: number;
  total: number;
  settlementPendingCount: number;
};

export type MyEmdPassbookEntry = {
  id: number;
  emdType: EmdType;
  txnType: EmdTxnType;
  credit: number;
  debit: number;
  runningBalance: number;
  narration: string;
  auctionId: number | null;
  auctionNumber: string | null;
  lots: string[];
  txnRefNo: string | null;
  valueDate: string | null;
  createdAt: string;
  isForfeited: boolean;
};

export type MyEmdPassbook = EmdPage<MyEmdPassbookEntry> & { balance: number };

export type MyEmdBlocked = {
  auctionId: number;
  auctionNumber: string | null;
  clientName: string | null;
  blocked: number;
  blockStatus: EmdBlockStatus | null;
  blockedAt: string | null;
  settlementStatus: EmdSettlementJobStatus | null;
};

export type MyEmdRefund = {
  id: number;
  amount: number;
  status: EmdRefundStatus;
  requestedAt: string;
  requestedRemarks: string | null;
  rejectedStage: EmdRefundRejectionStage | null;
  rejectionReason: string | null;
};

export type MyEmdForfeiture = {
  id: number;
  auctionNumber: string | null;
  amount: number;
  dispositionLabel: string | null;
  reviewedAt: string | null;
};
