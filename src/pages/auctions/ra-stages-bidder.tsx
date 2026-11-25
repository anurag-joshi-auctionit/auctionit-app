import {
  IllustratedEmpty,
  PageHeader,
  SelectSearchMulti,
  SelectSearchMultiCommand,
  SelectSearchMultiContent,
  SelectSearchMultiEmpty,
  SelectSearchMultiGroup,
  SelectSearchMultiInput,
  SelectSearchMultiItem,
  SelectSearchMultiList,
  SelectSearchMultiTrigger,
  SelectSearchMultiValue,
} from "@auctionit/ui";
import { useMemo, useState } from "react";
import { RaStageWindowsBidder } from "@/components/auctions/ra-stage-windows-bidder";
import { useRaStageWindows } from "@/hooks/use-ra-stage-windows";

export function RaStagesPageBidder() {
  const { data = [] } = useRaStageWindows();

  const [clientFilters, setClientFilters] = useState<string[]>([]);
  const [auctionFilters, setAuctionFilters] = useState<string[]>([]);

  const clients = useMemo(() => {
    const seen = new Set<string>();
    return data
      .flatMap((w) => (w.clientName ? [w.clientName] : []))
      .filter((c) => { if (seen.has(c)) return false; seen.add(c); return true; });
  }, [data]);

  const auctions = useMemo(() => {
    const seen = new Set<number>();
    return data
      .filter((w) => clientFilters.length === 0 || (w.clientName != null && clientFilters.includes(w.clientName)))
      .flatMap((w) =>
        seen.has(w.auctionId)
          ? []
          : (seen.add(w.auctionId), [{ id: w.auctionId, label: w.auctionNumber ?? String(w.auctionId) }]),
      );
  }, [data, clientFilters]);

  const filtered = useMemo(() => {
    return data.filter((w) => {
      if (clientFilters.length > 0 && (w.clientName == null || !clientFilters.includes(w.clientName))) return false;
      if (auctionFilters.length > 0 && !auctionFilters.includes(String(w.auctionId))) return false;
      return true;
    });
  }, [data, clientFilters, auctionFilters]);

  const hasData = data.length > 0;

  return (
    <div className="space-y-6 p-4">
      <PageHeader
        title="RA Stages"
        description="Complete questionnaires for each stage within the open window."
      />

      {hasData ? (
        <div className="flex flex-wrap gap-3">
          <SelectSearchMulti
            value={clientFilters}
            onValueChange={(next) => {
              setClientFilters(next);
              setAuctionFilters([]);
            }}
            clearable
          >
            <SelectSearchMultiTrigger className="w-48">
              <SelectSearchMultiValue placeholder="Clients" />
            </SelectSearchMultiTrigger>
            <SelectSearchMultiContent>
              <SelectSearchMultiCommand>
                <SelectSearchMultiInput placeholder="Search clients…" />
                <SelectSearchMultiList>
                  <SelectSearchMultiEmpty emptyText="No clients found." />
                  <SelectSearchMultiGroup>
                    {clients.map((c) => (
                      <SelectSearchMultiItem key={c} value={c} label={c}>
                        {c}
                      </SelectSearchMultiItem>
                    ))}
                  </SelectSearchMultiGroup>
                </SelectSearchMultiList>
              </SelectSearchMultiCommand>
            </SelectSearchMultiContent>
          </SelectSearchMulti>

          <SelectSearchMulti
            value={auctionFilters}
            onValueChange={setAuctionFilters}
            clearable
          >
            <SelectSearchMultiTrigger className="w-56">
              <SelectSearchMultiValue placeholder="Auctions" />
            </SelectSearchMultiTrigger>
            <SelectSearchMultiContent>
              <SelectSearchMultiCommand>
                <SelectSearchMultiInput placeholder="Search auctions…" />
                <SelectSearchMultiList>
                  <SelectSearchMultiEmpty emptyText="No auctions found." />
                  <SelectSearchMultiGroup>
                    {auctions.map((a) => (
                      <SelectSearchMultiItem key={a.id} value={String(a.id)} label={a.label}>
                        {a.label}
                      </SelectSearchMultiItem>
                    ))}
                  </SelectSearchMultiGroup>
                </SelectSearchMultiList>
              </SelectSearchMultiCommand>
            </SelectSearchMultiContent>
          </SelectSearchMulti>
        </div>
      ) : null}

      {!hasData || filtered.length === 0 ? (
        <IllustratedEmpty
          title="No active RA stage invitations"
          description="Stages you are invited to or shortlisted into will appear here."
        />
      ) : (
        <RaStageWindowsBidder data={filtered} />
      )}
    </div>
  );
}
