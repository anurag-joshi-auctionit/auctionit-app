import { ClientDashboardMessages } from "@auctionit/messages/client-dashboard";
import { DataPanelError } from "@auctionit/ui";
import { useQueryClient } from "@tanstack/react-query";
import type { FallbackProps } from "react-error-boundary";
import { dashboardKeys } from "@/components/dashboard/query-keys";

export function DashboardClientsError({
  error,
  resetErrorBoundary,
}: FallbackProps) {
  const queryClient = useQueryClient();
  return (
    <DataPanelError
      title={ClientDashboardMessages.CLIENTS_LOAD_ERROR_TITLE}
      message={
        error instanceof Error
          ? error.message
          : ClientDashboardMessages.CLIENTS_LOAD_ERROR_DESCRIPTION
      }
      onRetry={() => {
        void queryClient.resetQueries({ queryKey: dashboardKeys.clients() });
        resetErrorBoundary();
      }}
      className="min-h-0 border-0 p-0"
    />
  );
}
