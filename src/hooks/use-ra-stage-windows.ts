import { useAuth } from "@auctionit/lib";
import { useQuery } from "@tanstack/react-query";

export type RaStageKey = "rfi" | "rfp" | "rfq";

export type RaStageWindow = {
  auctionId: number;
  auctionNumber: string | null;
  clientName: string | null;
  stageKey: RaStageKey;
  stageStatus: "draft" | "published" | "closed";
  startsAt: string | null;
  endsAt: string | null;
  responseStatus: "invited" | "submitted";
  isShortlisted: boolean | null;
};

export function useRaStageWindows() {
  const { api } = useAuth();
  return useQuery({
    queryKey: ["ra-stage-windows"],
    queryFn: () => api.get<RaStageWindow[]>("/bidder-ra-stages/my-stages"),
    refetchInterval: 60_000,
    refetchIntervalInBackground: false,
  });
}
