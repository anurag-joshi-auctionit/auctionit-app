import { useAuth } from "@auctionit/lib";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@auctionit/ui";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

// Shown once per session when the logged-in bidder has no active subscription —
// a dismissible reminder to renew (ports the legacy bidder-dashboard prompt).
const DISMISS_KEY = "subscription:reminderDismissed";

type Status = {
  active: boolean;
  activeFrom: string | null;
  activeUntil: string | null;
  currentTypeName: string | null;
};

export function SubscriptionsReminder() {
  const { api, user } = useAuth();
  const navigate = useNavigate();
  const linked = user?.bidderCompId != null;

  const [dismissed, setDismissed] = useState(
    () =>
      typeof sessionStorage !== "undefined" &&
      sessionStorage.getItem(DISMISS_KEY) === "1",
  );

  const query = useQuery({
    queryKey: ["subscriptions-status"],
    queryFn: () => api.get<{ status: Status }>("/subscriptions/status"),
    enabled: linked,
    staleTime: 5 * 60 * 1000,
  });

  const status = query.data?.status;
  const open = Boolean(linked && status && !status.active && !dismissed);

  const dismiss = () => {
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.setItem(DISMISS_KEY, "1");
    }
    setDismissed(true);
  };

  return (
    <Dialog open={open}>
      <DialogContent
        showCloseButton={false}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>You are not subscribed</DialogTitle>
          <DialogDescription>
            Your AuctionIt subscription is not active. Renew now to continue
            participating in auctions without interruption.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={dismiss}>
            Later
          </Button>
          <Button
            onClick={() => {
              dismiss();
              navigate("/subscriptions");
            }}
          >
            Renew now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
