import { BidderRaStagesStatusMessages } from "@auctionit/messages/bidder-ra-stages";
import {
  Badge,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  formatDateTime,
} from "@auctionit/ui";
import { useNavigate } from "react-router-dom";
import { type RaStageKey, type RaStageWindow } from "@/hooks/use-ra-stage-windows";
import { auctionDisplayLabel } from "@/lib/portal-display-labels";
import {
  AuctionGroupAccordion,
} from "@/components/auctions/auction-groups-shared";

const STAGE_LABEL: Record<RaStageKey, string> = {
  rfi: "RFI",
  rfp: "RFP",
  rfq: "RFQ",
};

type GroupedWindow = RaStageWindow & { clientId: null };

function groupByClient(data: RaStageWindow[]): { key: string; name: string; clientId: null; rows: GroupedWindow[] }[] {
  const map = new Map<string, { name: string; rows: GroupedWindow[] }>();
  for (const w of data) {
    const name = w.clientName ?? "Unknown company";
    const key = `n${name}`;
    const g = map.get(key);
    const row: GroupedWindow = { ...w, clientId: null };
    if (g) g.rows.push(row);
    else map.set(key, { name, rows: [row] });
  }
  return [...map.entries()].map(([key, g]) => ({ key, clientId: null as null, ...g }));
}

const RESPONSE_STATUS_LABEL: Record<RaStageWindow["responseStatus"], string> = {
  invited: "Invited",
  draft: "Draft",
  submitted: "Submitted",
};

function ResponseStatusBadge({ status }: { status: RaStageWindow["responseStatus"] }) {
  const color = status === "submitted" ? "green" : status === "draft" ? "yellow" : "blue";
  return <Badge color={color}>{RESPONSE_STATUS_LABEL[status]}</Badge>;
}

function ReviewStatusBadge({ w }: { w: RaStageWindow }) {
  if (w.responseStatus !== "submitted") return <span className="text-muted-foreground">—</span>;
  if (w.isShortlisted === true) return <Badge color="green">{BidderRaStagesStatusMessages.SHORTLISTED}</Badge>;
  if (w.isShortlisted === false) return <Badge color="red">{BidderRaStagesStatusMessages.REJECTED}</Badge>;
  return <Badge color="yellow">{BidderRaStagesStatusMessages.UNDER_REVIEW}</Badge>;
}

function ActionCell({ w }: { w: RaStageWindow }) {
  const navigate = useNavigate();
  const label = STAGE_LABEL[w.stageKey];
  const windowOpen =
    w.stageStatus === "published" &&
    (!w.startsAt || new Date(w.startsAt) <= new Date()) &&
    (!w.endsAt || new Date(w.endsAt) > new Date());

  const go = () =>
    navigate(`/auctions/ra-stages/${w.stageKey}`, { state: { auctionId: w.auctionId } });

  if (w.responseStatus === "submitted") {
    return <Button size="sm" onClick={go}>View {label}</Button>;
  }
  if (windowOpen && (w.responseStatus === "invited" || w.responseStatus === "draft")) {
    return (
      <Button size="sm" onClick={go}>
        {w.responseStatus === "draft" ? `Continue ${label}` : `Submit ${label}`}
      </Button>
    );
  }
  return null;
}

export function RaStageWindowsBidder({ data }: { data: RaStageWindow[] }) {
  if (data.length === 0) return null;

  const groups = groupByClient(data);

  return (
    <AuctionGroupAccordion
      groups={groups}
      countLabel="stage"
      renderContent={(g) => (
        <Table className="table-fixed">
          <TableHeader>
            <TableRow>
              <TableHead>Auction Details</TableHead>
              <TableHead className="w-24">Stage</TableHead>
              <TableHead className="w-44">Starts At</TableHead>
              <TableHead className="w-44">Ends At</TableHead>
              <TableHead className="w-36">Response Status</TableHead>
              <TableHead className="w-36">Review Status</TableHead>
              <TableHead className="w-36"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {g.rows.map((w) => (
              <TableRow key={`${w.auctionId}-${w.stageKey}`}>
                <TableCell className="whitespace-normal">
                  <span className="font-medium">{auctionDisplayLabel(w.auctionNumber)}</span>
                </TableCell>
                <TableCell>
                  <Badge>{STAGE_LABEL[w.stageKey]}</Badge>
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {w.startsAt ? formatDateTime(w.startsAt) ?? w.startsAt : "—"}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {w.endsAt ? formatDateTime(w.endsAt) ?? w.endsAt : "—"}
                </TableCell>
                <TableCell>
                  <ResponseStatusBadge status={w.responseStatus} />
                </TableCell>
                <TableCell>
                  <ReviewStatusBadge w={w} />
                </TableCell>
                <TableCell>
                  <ActionCell w={w} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    />
  );
}
