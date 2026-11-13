import { AuthzRouteMessages } from "@auctionit/messages/authz";
import { RouteStatusPage } from "@auctionit/ui";

export function ForbiddenPage() {
  return (
    <RouteStatusPage
      title={AuthzRouteMessages.FORBIDDEN_TITLE}
      description={AuthzRouteMessages.FORBIDDEN_DESCRIPTION}
    />
  );
}

export function NotFoundPage() {
  return (
    <RouteStatusPage
      title={AuthzRouteMessages.NOT_FOUND_TITLE}
      description={AuthzRouteMessages.NOT_FOUND_DESCRIPTION}
    />
  );
}
