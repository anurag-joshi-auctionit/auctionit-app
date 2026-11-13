import { filterNavigation, hasRole, useAuth } from "@auctionit/lib";
import {
  AppHeader,
  AppSidebar,
  PageTransition,
  SidebarInset,
  SidebarProvider,
} from "@auctionit/ui";
import { Lock01 } from "@untitledui/icons";
import { useCallback, useMemo, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { ChangePasswordDialog } from "@/components/auth/change-password-dialog";
import { getBidderBreadcrumbConfig } from "@/lib/config/breadcrumb-config-bidder";
import { getClientBreadcrumbConfig } from "@/lib/config/breadcrumb-config-client";
import { bidderNavigationConfig } from "@/lib/config/navigation-config-bidder";
import { clientNavigationConfig } from "@/lib/config/navigation-config-client";
import { SubscriptionsReminder } from "@/components/subscriptions-reminder";

export function AppLayout() {
  const auth = useAuth();
  const navigate = useNavigate();
  const user = auth.user;
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  const isClient = user != null && hasRole(user, "client");

  const navigation = useMemo(() => {
    const config = isClient ? clientNavigationConfig : bidderNavigationConfig;
    if (!user) return config;
    return filterNavigation(config, user.permissions);
  }, [isClient, user]);

  const getBreadcrumbConfig = useCallback(
    (pathname: string, searchParams?: URLSearchParams) =>
      isClient
        ? getClientBreadcrumbConfig(pathname, searchParams)
        : getBidderBreadcrumbConfig(pathname, searchParams),
    [isClient],
  );

  return (
    <SidebarProvider defaultOpen>
      <AppSidebar navigation={navigation} />
      <SidebarInset className="h-screen overflow-hidden">
        {user ? (
          <AppHeader
            user={{
              name: user.name,
              userLoginName: user.userLoginName,
              roleName: user.role.name.toUpperCase(),
              company: user.bidderCompanyName,
              van: hasRole(user, "bidder") ? user.bidderVan : null,
            }}
            getBreadcrumbConfig={getBreadcrumbConfig}
            menuItems={[
              {
                label: "Change Password",
                icon: Lock01,
                onSelect: () => setChangePasswordOpen(true),
              },
            ]}
            onLogout={async () => {
              await auth.logout();
              navigate("/login", { replace: true });
            }}
          />
        ) : null}
        <main className="flex flex-1 flex-col overflow-y-auto">
          <PageTransition>
            <Outlet />
          </PageTransition>
        </main>
        {user && hasRole(user, "bidder") ? <SubscriptionsReminder /> : null}
      </SidebarInset>
      <ChangePasswordDialog
        open={changePasswordOpen}
        onOpenChange={setChangePasswordOpen}
      />
    </SidebarProvider>
  );
}
