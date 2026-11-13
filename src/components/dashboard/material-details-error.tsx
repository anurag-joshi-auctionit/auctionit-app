import { ClientDashboardMessages } from "@auctionit/messages/client-dashboard";
import { DataPanelError } from "@auctionit/ui";
import { useQueryClient } from "@tanstack/react-query";
import type { FallbackProps } from "react-error-boundary";
import { dashboardKeys } from "@/components/dashboard/query-keys";

export function MaterialDetailsError({
  error,
  resetErrorBoundary,
}: FallbackProps) {
  const queryClient = useQueryClient();
  return (
    <DataPanelError
      title={ClientDashboardMessages.MATERIAL_LOAD_ERROR_TITLE}
      message={
        error instanceof Error
          ? error.message
          : ClientDashboardMessages.MATERIAL_LOAD_ERROR_DESCRIPTION
      }
      onRetry={() => {
        void queryClient.resetQueries({
          queryKey: [...dashboardKeys.all, "material"],
        });
        void queryClient.resetQueries({
          queryKey: [...dashboardKeys.all, "material-filters"],
        });
        resetErrorBoundary();
      }}
    />
  );
}
