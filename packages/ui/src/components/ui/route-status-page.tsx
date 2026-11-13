import { Link } from "react-router-dom";
import { Button } from "./button";
import { IllustratedEmpty } from "./illustrated-empty";
import { cn } from "../../lib/utils";

export type RouteStatusPageProps = {
  title: string;
  description: string;
  /** Destination for the primary action. Defaults to `/`. */
  homeHref?: string;
  /** Label for the primary action. Defaults to "Back to Dashboard". */
  homeLabel?: string;
  className?: string;
};

/**
 * Full-width status page for route-level 403 / 404 inside the app shell.
 * Matches the illustrated empty-state layout used elsewhere in the app.
 */
export function RouteStatusPage({
  title,
  description,
  homeHref = "/",
  homeLabel = "Back to Dashboard",
  className,
}: RouteStatusPageProps) {
  return (
    <IllustratedEmpty
      title={title}
      description={description}
      className={cn("min-h-[min(28rem,calc(100vh-8rem))] sm:mt-8", className)}
    >
      <Button asChild>
        <Link to={homeHref}>{homeLabel}</Link>
      </Button>
    </IllustratedEmpty>
  );
}
