import { useAuth } from "@auctionit/lib";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import type { LiveAuctionListItem } from "@/lib/use-live-auction";

export function useLiveBidderQueries(linked: boolean) {
  const { api } = useAuth();

  const listQuery = useQuery({
    queryKey: ["live-auctions"],
    queryFn: () => api.get<LiveAuctionListItem[]>("/live/auctions"),
    // Upcoming → live flip; keep client/auction dropdowns current.
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
  });
  const auctions = useMemo(() => listQuery.data ?? [], [listQuery.data]);

  const watchlistQuery = useQuery({
    queryKey: ["live-watchlist"],
    queryFn: () => api.get<number[]>("/live/watchlist"),
    enabled: linked,
  });
  const watched = useMemo(
    () => new Set(watchlistQuery.data ?? []),
    [watchlistQuery.data],
  );

  const proxiesQuery = useQuery({
    queryKey: ["live-my-proxies-all"],
    queryFn: () => api.get<Record<number, number>>("/live/my-proxies"),
    enabled: linked,
  });
  const proxyAmounts = proxiesQuery.data ?? {};

  const participationQuery = useQuery({
    queryKey: ["live-my-participation"],
    queryFn: () => api.get<number[]>("/live/my-participation"),
    enabled: linked,
  });
  const participated = useMemo(
    () => new Set(participationQuery.data ?? []),
    [participationQuery.data],
  );

  return {
    listQuery,
    auctions,
    watched,
    proxyAmounts,
    participated,
  };
}
