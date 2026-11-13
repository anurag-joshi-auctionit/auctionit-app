import { Suspense, useEffect, useState, type ComponentType } from "react";
import { useTheme } from "next-themes";
import { SidebarTrigger } from "./ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  AvatarInitials,
} from "./ui/avatar";
import {
  AppBreadcrumb,
  BreadcrumbSuspense,
  type BreadcrumbConfigItem,
} from "./app-breadcrumb";
import { Badge } from "./ui/badge";
import { getRoleNameLabel } from "../lib/label";
import { copyToClipboard } from "../lib/utils/clipboard";
import {
  Check,
  Copy01,
  Sun,
  Moon01,
  Monitor01,
  LogOut01,
} from "@untitledui/icons";
import { Separator } from "./ui/separator";

export type AppHeaderMenuItem = {
  label: string;
  icon?: ComponentType<{ className?: string }>;
  onSelect: () => void;
};

export interface AppHeaderProps {
  user: {
    name: string | null;
    /** Login name shown under the display name. */
    userLoginName: string;
    /** Role label shown as a badge. Omit to hide the badge. */
    roleName?: string;
    /** Optional company/organization line shown under the login name. */
    company?: string | null;
    /** Bidder virtual account number for EMD deposits; shown with a copy button. */
    van?: string | null;
  };
  onLogout: () => void | Promise<void>;
  getBreadcrumbConfig: (
    pathname: string,
    searchParams?: URLSearchParams,
  ) => BreadcrumbConfigItem[];
  /** Extra items shown above Theme (e.g. bidder portal actions). */
  menuItems?: AppHeaderMenuItem[];
}

export function AppHeader({
  user,
  onLogout,
  getBreadcrumbConfig,
  menuItems,
}: AppHeaderProps) {
  const { setTheme } = useTheme();
  const displayName = user.name || user.userLoginName || "User";

  return (
    <header className="h-12! border-b border-sidebar-border">
      <div className="flex h-full items-center justify-between px-4 gap-2 sm:gap-4">
        <SidebarTrigger />
        <Separator orientation="vertical" className="h-4!" />
        <Suspense fallback={<BreadcrumbSuspense />}>
          <AppBreadcrumb getBreadcrumbConfig={getBreadcrumbConfig} />
        </Suspense>
        <div className="ml-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="size-8 hover:opacity-80 transition-opacity cursor-pointer border">
                <AvatarImage alt={displayName} />
                <AvatarFallback className="bg-muted">
                  <AvatarInitials name={displayName} />
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-60" align="end" sideOffset={5}>
              <DropdownMenuLabel className="px-2 py-1.5">
                <div className="flex items-start gap-2">
                  <Avatar className="size-10 border">
                    <AvatarImage alt={displayName} />
                    <AvatarFallback className="bg-muted">
                      <AvatarInitials name={displayName} className="text-sm" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1 flex flex-col overflow-hidden">
                    <p className="text-sm text-primary truncate">
                      {displayName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user.userLoginName}
                    </p>
                    {user.company ? (
                      <p className="text-xs text-muted-foreground truncate">
                        {user.company}
                      </p>
                    ) : null}
                    {user.van ? <VanLine van={user.van} /> : null}
                    {user.roleName ? (
                      <Badge className="mt-2">
                        {getRoleNameLabel(user.roleName)}
                      </Badge>
                    ) : null}
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {menuItems && menuItems.length > 0 ? (
                <>
                  <DropdownMenuGroup>
                    {menuItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <DropdownMenuItem
                          key={item.label}
                          onSelect={item.onSelect}
                        >
                          {Icon ? <Icon className="size-4" /> : null}
                          <span>{item.label}</span>
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                </>
              ) : null}
              <DropdownMenuGroup>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Monitor01 className="size-4" />
                    <span>Theme</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem onClick={() => setTheme("light")}>
                      <Sun className="size-4" />
                      <span>Light</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme("dark")}>
                      <Moon01 className="size-4" />
                      <span>Dark</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme("system")}>
                      <Monitor01 className="size-4" />
                      <span>System</span>
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => void onLogout()}
                variant="destructive"
              >
                <LogOut01 className="size-4" />
                <span>Log Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

function VanLine({ van }: { van: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(t);
  }, [copied]);

  return (
    <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
      <span className="truncate">
        VAN <span className="text-foreground">{van}</span>
      </span>
      <button
        type="button"
        aria-label="Copy VAN"
        className="shrink-0 rounded p-0.5 hover:bg-muted hover:text-foreground"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          void copyToClipboard(van).then((ok) => ok && setCopied(true));
        }}
      >
        {copied ? <Check className="size-3.5" /> : <Copy01 className="size-3.5" />}
      </button>
    </div>
  );
}
