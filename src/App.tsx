import { type ReactNode, Suspense, lazy } from "react";
import {
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
  useParams,
} from "react-router-dom";
import {
  can,
  hasRole,
  RequireAuth,
  RequirePasswordChanged,
  RequirePortalPermission,
  useAuth,
} from "@auctionit/lib";
import { Skeleton } from "@auctionit/ui";
import { LoginPage } from "@/pages/login";
import { SignupPage } from "@/pages/signup";
import { ChangePasswordPage } from "@/pages/change-password";
import { ForbiddenPage, NotFoundPage } from "@/pages/route-status";
import { AppLayout } from "@/components/app-layout";

const DashboardPage = lazy(() =>
  import("@/pages/dashboard").then((m) => ({ default: m.DashboardPage })),
);
const DashboardPageClient = lazy(() =>
  import("@/pages/client/dashboard").then((m) => ({
    default: m.DashboardPageClient,
  })),
);
const AuctionDetailPageClient = lazy(() =>
  import("@/pages/auctions/auction-detail-client").then((m) => ({
    default: m.AuctionDetailPageClient,
  })),
);
const AuctionApprovalPageClient = lazy(() =>
  import("@/pages/auctions/auction-approval-client").then((m) => ({
    default: m.AuctionApprovalPageClient,
  })),
);
const ClosedAuctionsPageClient = lazy(() =>
  import("@/pages/auctions/closed-auctions-client").then((m) => ({
    default: m.ClosedAuctionsPageClient,
  })),
);
const FutureAuctionsPageClient = lazy(() =>
  import("@/pages/auctions/future-auctions-client").then((m) => ({
    default: m.FutureAuctionsPageClient,
  })),
);
const LiveAuctionsPageClient = lazy(() =>
  import("@/pages/auctions/live-auctions-client").then((m) => ({
    default: m.LiveAuctionsPageClient,
  })),
);
const TodaysAuctionsPageClient = lazy(() =>
  import("@/pages/auctions/todays-auctions-client").then((m) => ({
    default: m.TodaysAuctionsPageClient,
  })),
);
const BidOverviewReportPage = lazy(() =>
  import("@/pages/reports/bid-overview").then((m) => ({
    default: m.BidOverviewReportPage,
  })),
);
const BidDetailsReportPage = lazy(() =>
  import("@/pages/reports/bid-details").then((m) => ({
    default: m.BidDetailsReportPage,
  })),
);
const EmdPage = lazy(() =>
  import("@/pages/emd").then((m) => ({ default: m.EmdPage })),
);
const SubscriptionsPage = lazy(() =>
  import("@/pages/subscriptions").then((m) => ({
    default: m.SubscriptionsPage,
  })),
);
const SubscriptionsReturnPage = lazy(() =>
  import("@/pages/subscriptions-return").then((m) => ({
    default: m.SubscriptionsReturnPage,
  })),
);
const SealedBidPageBidder = lazy(() =>
  import("@/pages/auctions/sealed-bid-bidder").then((m) => ({
    default: m.SealedBidPageBidder,
  })),
);
const LiveAuctionsPageBidder = lazy(() =>
  import("@/pages/auctions/live-auctions-bidder").then((m) => ({
    default: m.LiveAuctionsPageBidder,
  })),
);
const AuctionDetailPageBidder = lazy(() =>
  import("@/pages/bidder/auction-detail").then((m) => ({
    default: m.AuctionDetailPageBidder,
  })),
);
const RaStageResponsePageBidder = lazy(() =>
  import("@/pages/ra-stages/ra-stage-response-bidder").then((m) => ({
    default: m.RaStageResponsePageBidder,
  })),
);
const ClosedAuctionsPageBidder = lazy(() =>
  import("@/pages/auctions/closed-auctions-bidder").then((m) => ({
    default: m.ClosedAuctionsPageBidder,
  })),
);
const FutureAuctionsPageBidder = lazy(() =>
  import("@/pages/auctions/future-auctions-bidder").then((m) => ({
    default: m.FutureAuctionsPageBidder,
  })),
);
const TodaysAuctionsPageBidder = lazy(() =>
  import("@/pages/auctions/todays-auctions-bidder").then((m) => ({
    default: m.TodaysAuctionsPageBidder,
  })),
);
const BankAccountPage = lazy(() =>
  import("@/pages/bank-account").then((m) => ({ default: m.BankAccountPage })),
);

function RouteFallback() {
  return (
    <div className="space-y-4 p-4">
      <Skeleton className="h-9 w-64" />
      <Skeleton className="h-5 w-96 max-w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

function PortalPermission({
  permission,
  children,
}: {
  permission: string;
  children: ReactNode;
}) {
  return (
    <RequirePortalPermission
      permission={permission}
      forbidden={<ForbiddenPage />}
    >
      {children}
    </RequirePortalPermission>
  );
}

function HomeRedirect() {
  const auth = useAuth();
  if (auth.status !== "authenticated" || !auth.user) return null;

  if (
    hasRole(auth.user, "client") &&
    can(auth.user.permissions, "module.portal-client-dashboard")
  ) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <PortalPermission permission="module.portal-bidder-dashboard">
      <DashboardPage />
    </PortalPermission>
  );
}

function LegacyLiveRedirect() {
  const location = useLocation();
  return <Navigate to={`/auctions/live${location.search}`} replace />;
}

function LegacyAuctionDetailRedirect() {
  const { auctionId } = useParams();
  return <Navigate to={`/auctions/${auctionId ?? ""}`} replace />;
}

function LegacySubscriptionReturnRedirect() {
  const location = useLocation();
  return (
    <Navigate to={`/subscriptions/return${location.search}`} replace />
  );
}

/** Client-only shell: non-clients get a 403 instead of the page. */
function ClientOnlyRoute({
  permission,
  children,
}: {
  permission: string;
  children: ReactNode;
}) {
  const auth = useAuth();
  if (auth.status !== "authenticated" || !auth.user) return null;
  if (!hasRole(auth.user, "client")) {
    return <ForbiddenPage />;
  }
  return (
    <PortalPermission permission={permission}>{children}</PortalPermission>
  );
}

/** Client-only auction approval (not shared with bidder portal). */
function ClientAuctionApprovalRoute() {
  return (
    <ClientOnlyRoute permission="module.portal-client-auctions">
      <AuctionApprovalPageClient />
    </ClientOnlyRoute>
  );
}

/** Client-only reports module. */
function ClientReportsRoute({ children }: { children: ReactNode }) {
  return (
    <ClientOnlyRoute permission="module.portal-client-reports">
      {children}
    </ClientOnlyRoute>
  );
}

/** Client and bidder share these paths; nav already switches by role. */
function PortalAuctionListRoute({
  client,
  bidder,
  clientPermission = "module.portal-client-auctions",
  bidderPermission = "module.portal-bidder-auctions",
}: {
  client: ReactNode;
  bidder: ReactNode;
  clientPermission?: string;
  bidderPermission?: string;
}) {
  const auth = useAuth();
  if (auth.status !== "authenticated" || !auth.user) return null;
  if (hasRole(auth.user, "client")) {
    return (
      <PortalPermission permission={clientPermission}>{client}</PortalPermission>
    );
  }
  return (
    <PortalPermission permission={bidderPermission}>{bidder}</PortalPermission>
  );
}

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/change-password" element={<ChangePasswordPage />} />
      {/* Public Instamojo return — emailed payment links may land here logged-out. */}
      <Route
        path="/subscriptions/return"
        element={
          <Suspense fallback={<RouteFallback />}>
            <SubscriptionsReturnPage />
          </Suspense>
        }
      />
      <Route
        path="/subscription/return"
        element={<LegacySubscriptionReturnRedirect />}
      />
      <Route
        element={
          <RequireAuth fallback={<RouteFallback />}>
            <Outlet />
          </RequireAuth>
        }
      >
        <Route
          element={
            <RequirePasswordChanged>
              <AppLayout />
            </RequirePasswordChanged>
          }
        >
          <Route
            element={
              <Suspense fallback={<RouteFallback />}>
                <Outlet />
              </Suspense>
            }
          >
            <Route index element={<HomeRedirect />} />
            <Route
              path="dashboard"
              element={
                <ClientOnlyRoute permission="module.portal-client-dashboard">
                  <DashboardPageClient />
                </ClientOnlyRoute>
              }
            />
            <Route
              path="dashboard/material"
              element={<Navigate to="/dashboard#material-details" replace />}
            />
            <Route
              path="dashboard/lifting"
              element={<Navigate to="/dashboard#lifting-details" replace />}
            />
            <Route
              path="dashboard/bidder"
              element={<Navigate to="/dashboard#bidder-details" replace />}
            />
            <Route
              path="overview"
              element={<Navigate to="/dashboard" replace />}
            />
            <Route
              path="overview/material"
              element={<Navigate to="/dashboard#material-details" replace />}
            />
            <Route
              path="overview/lifting"
              element={<Navigate to="/dashboard#lifting-details" replace />}
            />
            <Route
              path="overview/bidder"
              element={<Navigate to="/dashboard#bidder-details" replace />}
            />
            <Route
              path="auctions/today"
              element={
                <PortalAuctionListRoute
                  client={<TodaysAuctionsPageClient />}
                  bidder={<TodaysAuctionsPageBidder />}
                />
              }
            />
            <Route
              path="auctions/live"
              element={
                <PortalAuctionListRoute
                  client={<LiveAuctionsPageClient />}
                  bidder={<LiveAuctionsPageBidder />}
                  bidderPermission="module.portal-bidder-live"
                />
              }
            />
            <Route
              path="auctions/sealed/:auctionId"
              element={
                <PortalAuctionListRoute
                  client={<Navigate to="/auctions/live" replace />}
                  bidder={<SealedBidPageBidder />}
                  bidderPermission="module.portal-bidder-live"
                />
              }
            />
            <Route
              path="auctions/future"
              element={
                <PortalAuctionListRoute
                  client={<FutureAuctionsPageClient />}
                  bidder={<FutureAuctionsPageBidder />}
                />
              }
            />
            <Route
              path="auctions/closed"
              element={
                <PortalAuctionListRoute
                  client={<ClosedAuctionsPageClient />}
                  bidder={<ClosedAuctionsPageBidder />}
                />
              }
            />
            <Route
              path="auctions/approval"
              element={<ClientAuctionApprovalRoute />}
            />
            <Route
              path="reports"
              element={<Navigate to="/reports/bid-overview" replace />}
            />
            <Route
              path="reports/bid-overview"
              element={
                <ClientReportsRoute>
                  <BidOverviewReportPage />
                </ClientReportsRoute>
              }
            />
            <Route
              path="reports/bid-details"
              element={
                <ClientReportsRoute>
                  <BidDetailsReportPage />
                </ClientReportsRoute>
              }
            />
            <Route
              path="auctions/upcoming"
              element={<Navigate to="/auctions/today" replace />}
            />
            <Route
              path="auctions/closed/:auctionId"
              element={<LegacyAuctionDetailRedirect />}
            />
            <Route
              path="auctions/upcoming/:auctionId"
              element={<LegacyAuctionDetailRedirect />}
            />
            <Route
              path="auctions/:auctionId"
              element={
                <PortalAuctionListRoute
                  client={<AuctionDetailPageClient />}
                  bidder={<AuctionDetailPageBidder />}
                />
              }
            />
            <Route
              path="ra-stages/:auctionId/:stageKey"
              element={
                <PortalPermission permission="module.portal-bidder-auctions">
                  <RaStageResponsePageBidder />
                </PortalPermission>
              }
            />
            <Route path="live" element={<LegacyLiveRedirect />} />
            <Route
              path="auctions"
              element={<Navigate to="/auctions/today" replace />}
            />
            <Route
              path="emd"
              element={
                <PortalPermission permission="module.portal-bidder-emd">
                  <EmdPage />
                </PortalPermission>
              }
            />
            <Route
              path="emd/overview"
              element={<Navigate to="/emd" replace />}
            />
            <Route
              path="emd/passbook"
              element={<Navigate to="/emd?tab=passbook" replace />}
            />
            <Route
              path="emd/refunds"
              element={<Navigate to="/emd?tab=refunds" replace />}
            />
            <Route
              path="emd/request-refund"
              element={<Navigate to="/emd?tab=refunds" replace />}
            />
            <Route
              path="bank-account"
              element={
                <PortalPermission permission="module.portal-bidder-emd">
                  <BankAccountPage />
                </PortalPermission>
              }
            />
            <Route
              path="subscriptions"
              element={
                <PortalPermission permission="module.portal-bidder-subscriptions">
                  <SubscriptionsPage />
                </PortalPermission>
              }
            />
            <Route
              path="subscription"
              element={<Navigate to="/subscriptions" replace />}
            />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}
