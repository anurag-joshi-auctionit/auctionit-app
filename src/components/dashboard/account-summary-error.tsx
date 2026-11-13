import { ClientDashboardMessages } from "@auctionit/messages/client-dashboard";
import { DataPanelError } from "@auctionit/ui";
import { useQueryClient } from "@tanstack/react-query";
import type { FallbackProps } from "react-error-boundary";
import { dashboardKeys } from "@/components/dashboard/query-keys";

export function AccountSummaryError({
  error,
  resetErrorBoundary,
}: FallbackProps) {
  const queryClient = useQueryClient();
  return (
    <DataPanelError
      title={ClientDashboardMessages.SUMMARY_LOAD_ERROR_TITLE}
      message={
        error instanceof Error
          ? error.message
          : ClientDashboardMessages.SUMMARY_LOAD_ERROR_DESCRIPTION
      }
      onRetry={() => {
        void queryClient.resetQueries({
          queryKey: [...dashboardKeys.all, "summary"],
        });
        resetErrorBoundary();
      }}
    />
  );
}
