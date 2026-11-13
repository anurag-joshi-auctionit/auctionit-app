import { useAuth } from "@auctionit/lib";
import { LiveBidMessages } from "@auctionit/messages";
import { BidderPortalAuctionMessages } from "@auctionit/messages/auctions";
import { toast } from "@auctionit/ui";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import type { AcceptTncTarget } from "@/components/live-auction/accept-tnc-dialog";
import {
  ERROR_AUTO_DISMISS_MS,
  errMsg,
  localBidRejectReason,
  type LotOverlay,
} from "@/hooks/use-live-bid-utils";
import type {
  LivePlaceBidResponse,
  LiveSetProxyResponse,
  MergedLot,
} from "@/lib/use-live-auction";

export function useLiveBidMutations() {
  const { api } = useAuth();
  const queryClient = useQueryClient();

  const [bidReject, setBidReject] = useState<Record<number, string>>({});
  const [bidReset, setBidReset] = useState<Record<number, number>>({});
  const [proxyChecked, setProxyChecked] = useState<Record<number, boolean>>(
    {},
  );
  const [bidOverlays, setBidOverlays] = useState<Record<number, LotOverlay>>(
    {},
  );
  const [error, setError] = useState<{ id: number; message: string } | null>(
    null,
  );
  const [tncTarget, setTncTarget] = useState<AcceptTncTarget | null>(null);
  const errorSeq = useRef(0);

  const showError = useCallback((message: string) => {
    errorSeq.current += 1;
    setError({ id: errorSeq.current, message });
  }, []);

  useEffect(() => {
    if (!error) return;
    const t = window.setTimeout(() => setError(null), ERROR_AUTO_DISMISS_MS);
    return () => window.clearTimeout(t);
  }, [error]);

  function resetAmount(lotId: number) {
    setBidReset((p) => ({ ...p, [lotId]: (p[lotId] ?? 0) + 1 }));
  }

  function clearReject(lotId: number) {
    setBidReject((p) => {
      if (p[lotId] == null) return p;
      const n = { ...p };
      delete n[lotId];
      return n;
    });
  }

  function rejectLot(lotId: number, message: string) {
    setBidReject((p) => ({ ...p, [lotId]: message }));
  }

  const placeBid = useMutation({
    mutationFn: ({
      auctionId,
      lotId,
      amount,
    }: {
      auctionId: number;
      lotId: number;
      amount: number;
    }) =>
      api.post<LivePlaceBidResponse>(
        `/live/auctions/${auctionId}/lots/${lotId}/bid`,
        { amount },
      ),
    onSuccess: (data, { lotId }) => {
      resetAmount(lotId);
      clearReject(lotId);
      setBidOverlays((p) => ({
        ...p,
        [lotId]: {
          amount: data.finalAmount,
          status: data.yourStatus,
          pending: false,
          rev: data.rev,
          yourRank: data.yourRank,
          yourBid: data.yourBid,
        },
      }));
      queryClient.invalidateQueries({ queryKey: ["live-my-participation"] });
      queryClient.invalidateQueries({ queryKey: ["live-my-proxies-all"] });
    },
    onError: (err, { lotId }) => {
      rejectLot(lotId, errMsg(err, LiveBidMessages.PLACE_BID_FAILED));
      setBidOverlays((p) => {
        if (p[lotId] == null) return p;
        const next = { ...p };
        delete next[lotId];
        return next;
      });
    },
  });

  const setProxy = useMutation({
    mutationFn: ({
      auctionId,
      lotId,
      maxAmount,
    }: {
      auctionId: number;
      lotId: number;
      maxAmount: number;
    }) =>
      api.post<LiveSetProxyResponse>(
        `/live/auctions/${auctionId}/lots/${lotId}/proxy`,
        { maxAmount },
      ),
    onSuccess: (data, { lotId }) => {
      resetAmount(lotId);
      clearReject(lotId);
      setBidOverlays((p) => ({
        ...p,
        [lotId]: {
          amount: data.finalAmount,
          status: data.yourStatus,
          pending: false,
          rev: data.rev,
          yourRank: data.yourRank,
          yourBid: data.yourBid,
        },
      }));
      setProxyChecked((p) => {
        if (!p[lotId]) return p;
        const next = { ...p };
        delete next[lotId];
        return next;
      });
      queryClient.invalidateQueries({ queryKey: ["live-my-proxies-all"] });
      queryClient.invalidateQueries({ queryKey: ["live-my-participation"] });
    },
    onError: (err, { lotId }) => {
      rejectLot(lotId, errMsg(err, LiveBidMessages.SET_PROXY_FAILED));
      setBidOverlays((p) => {
        if (p[lotId] == null) return p;
        const next = { ...p };
        delete next[lotId];
        return next;
      });
    },
  });

  const acceptTnc = useMutation({
    mutationFn: (auctionId: number) =>
      api.post(`/auctions/me/${auctionId}/accept-tnc`, {}),
    onSuccess: () => {
      toast.success(BidderPortalAuctionMessages.TNC_ACCEPTED);
      setTncTarget(null);
      queryClient.invalidateQueries({ queryKey: ["live-auctions"] });
      queryClient.invalidateQueries({ queryKey: ["auctions"] });
      queryClient.invalidateQueries({ queryKey: ["auction"] });
    },
    onError: (err) =>
      showError(errMsg(err, BidderPortalAuctionMessages.TNC_ACCEPT_FAILED)),
  });

  function openTncDocument(auctionId: number) {
    const suffix = api.appId ? `?app_id=${encodeURIComponent(api.appId)}` : "";
    window.open(
      `${api.baseUrl}/auctions/me/${auctionId}/tnc${suffix}`,
      "_blank",
      "noopener",
    );
  }

  const toggleWatch = useMutation({
    mutationFn: ({ lotId, watch }: { lotId: number; watch: boolean }) =>
      watch
        ? api.post(`/live/lots/${lotId}/watch`, {})
        : api.delete(`/live/lots/${lotId}/watch`),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["live-watchlist"] }),
    onError: (err) =>
      showError(
        errMsg(err, BidderPortalAuctionMessages.WATCHLIST_UPDATE_FAILED),
      ),
  });

  const submit = (lot: MergedLot, typedAmount: number | null) => {
    if (typedAmount == null) {
      rejectLot(lot.id, LiveBidMessages.BID_GREATER_THAN_ZERO);
      return;
    }
    const amount = typedAmount;
    const localReason = localBidRejectReason(lot, amount);
    if (localReason) {
      rejectLot(lot.id, localReason);
      return;
    }
    clearReject(lot.id);
    if (proxyChecked[lot.id]) {
      setBidOverlays((p) => ({
        ...p,
        [lot.id]: { pending: true },
      }));
      setProxy.mutate({
        auctionId: lot.auctionId,
        lotId: lot.id,
        maxAmount: amount,
      });
    } else {
      setBidOverlays((p) => ({
        ...p,
        [lot.id]: { amount, pending: true },
      }));
      placeBid.mutate({ auctionId: lot.auctionId, lotId: lot.id, amount });
    }
  };

  return {
    bidReject,
    bidReset,
    proxyChecked,
    setProxyChecked,
    bidOverlays,
    setBidOverlays,
    error,
    setError,
    tncTarget,
    setTncTarget,
    showError,
    placeBid,
    setProxy,
    acceptTnc,
    openTncDocument,
    toggleWatch,
    submit,
    queryClient,
  };
}
