import { AlertTriangle } from "@untitledui/icons";
import { Button } from "./button";
import { cn } from "../../lib/utils";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "./empty";

export type DataPanelErrorProps = {
  /** Heading shown above the description, e.g. "Could not load users". */
  title?: string;
  /** Human-readable failure description. */
  message: string;
  /** When provided, renders a "Try again" action. */
  onRetry?: () => void;
  className?: string;
};

/**
 * Dedicated error UI for query-backed panels, mirroring the `Empty`-based
 * fallbacks used with React error boundaries.
 */
export function DataPanelError({
  title = "Something went wrong",
  message,
  onRetry,
  className,
}: DataPanelErrorProps) {
  return (
    <Empty className={cn("min-h-[240px] rounded-md border", className)}>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <AlertTriangle className="text-destructive" />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{message}</EmptyDescription>
      </EmptyHeader>
      {onRetry ? (
        <EmptyContent>
          <Button type="button" onClick={onRetry}>
            Try again
          </Button>
        </EmptyContent>
      ) : null}
    </Empty>
  );
}
