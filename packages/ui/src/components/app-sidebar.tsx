import React from "react";
import { NavLink } from "./nav-link";
import { useLocation } from "react-router-dom";
import { ChevronDown, ChevronRight } from "@untitledui/icons";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  useSidebar,
} from "./ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
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
import { BrandIcon } from "./brand-icon";

export type NavigationItem = {
  name: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
  items?: NavigationItem[];
  groups?: {
    label: string;
    items: NavigationItem[];
  }[];
  /** Optional permission key for nav filtering */
  permission?: string;
  anyPermission?: readonly string[];
  /** Only show for admin role / owner */
  adminOnly?: boolean;
  /** Accounts-team workflow (/accounts/*). Filtered out for role.isAdmin in filterNavigation. */
  accountsWorkflow?: boolean;
  /** Bidder external portal workflow. Filtered by role in filterNavigation. */
  bidderWorkflow?: boolean;
  /** Client external portal workflow. Filtered by role in filterNavigation. */
  clientWorkflow?: boolean;
};

export type NavigationConfig = {
  main: NavigationItem[];
  footer: NavigationItem[];
};

const sidebarDropdownContentClassName =
  "min-w-48 border-sidebar-border bg-sidebar text-sidebar-foreground";
const sidebarDropdownItemClassName =
  "text-sidebar-foreground focus:bg-sidebar-accent focus:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground [&_svg:not([class*='text-'])]:text-sidebar-accent-foreground";
const sidebarDropdownSubTriggerClassName =
  "text-sidebar-foreground focus:bg-sidebar-accent focus:text-sidebar-accent-foreground data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground [&_svg:not([class*='text-'])]:text-sidebar-accent-foreground";
const sidebarDropdownLabelClassName = "text-sidebar-foreground/70";
const sidebarDropdownSeparatorClassName = "bg-sidebar-border";

export function AppSidebar({ navigation }: { navigation: NavigationConfig }) {
  const { pathname } = useLocation();
  const { state } = useSidebar();

  const mainNavItems = navigation.main;
  const footerNavItems = navigation.footer;

  // Walk the whole navigation tree, collect every leaf href that prefix-matches
  // the current pathname, and pick the longest one. That's the single "active"
  // leaf — guarantees a sibling like "All clients" (/clients) doesn't light up
  // alongside "New client" (/clients/new) when the more specific route matches.
  const collectHrefs = (nodes: NavigationItem[], acc: string[]) => {
    for (const node of nodes) {
      if (node.href && node.href !== "#") acc.push(node.href);
      if (node.items?.length) collectHrefs(node.items, acc);
      if (node.groups?.length)
        node.groups.forEach((g) => collectHrefs(g.items, acc));
    }
  };
  const allHrefs: string[] = [];
  collectHrefs(mainNavItems, allHrefs);
  collectHrefs(footerNavItems, allHrefs);

  let activeHref: string | null = null;
  for (const href of allHrefs) {
    const matches = pathname === href || pathname?.startsWith(`${href}/`);
    if (matches && (!activeHref || href.length > activeHref.length)) {
      activeHref = href;
    }
  }

  const isActive = (href: string) => href !== "#" && href === activeHref;

  const hasChildren = (item: NavigationItem) =>
    (item.groups?.length ?? 0) > 0 || (item.items?.length ?? 0) > 0;

  const isItemOrDescendantActive = (item: NavigationItem): boolean => {
    if (item.href && isActive(item.href)) return true;

    if (item.groups?.length) {
      return item.groups.some((g) =>
        g.items.some((child) => isItemOrDescendantActive(child)),
      );
    }

    if (item.items?.length) {
      return item.items.some((child) => isItemOrDescendantActive(child));
    }

    return false;
  };

  const renderDropdownChildren = (parent: NavigationItem) => {
    const renderLeafOrSub = (child: NavigationItem) => {
      const childActive = isItemOrDescendantActive(child);

      if (hasChildren(child)) {
        return (
          <DropdownMenuSub key={child.name}>
            <DropdownMenuSubTrigger className={sidebarDropdownSubTriggerClassName}>
              {child.icon && <child.icon />}
              <span>{child.name}</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent
              sideOffset={4}
              className={sidebarDropdownContentClassName}
            >
              {renderDropdownChildren(child)}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        );
      }

      if (!child.href) return null;

      return (
        <DropdownMenuItem
          key={child.href}
          asChild
          data-active={childActive}
          className={sidebarDropdownItemClassName}
        >
          <NavLink href={child.href}>
            {child.icon && <child.icon />}
            <span>{child.name}</span>
          </NavLink>
        </DropdownMenuItem>
      );
    };

    if (parent.groups?.length) {
      return parent.groups.map((group, index) => (
        <React.Fragment key={group.label}>
          {index > 0 && (
            <DropdownMenuSeparator
              className={sidebarDropdownSeparatorClassName}
            />
          )}
          <DropdownMenuGroup>
            <DropdownMenuLabel className={sidebarDropdownLabelClassName}>
              {group.label}
            </DropdownMenuLabel>
            {group.items.map((child) => renderLeafOrSub(child))}
          </DropdownMenuGroup>
        </React.Fragment>
      ));
    }

    if (parent.items?.length) {
      return parent.items.map((child) => renderLeafOrSub(child));
    }

    return null;
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-12! border-b border-sidebar-border justify-center">
        <div className="flex items-center gap-2 px-1">
          <NavLink href="/" className="inline-flex shrink-0 rounded-md">
            <BrandIcon
              alt="AuctionIt"
              className="size-6 shrink-0 overflow-hidden object-cover object-left"
            />
          </NavLink>
          <div
            className={`overflow-hidden whitespace-nowrap text-lg font-semibold font-serif tracking-wider uppercase transition-[max-width,opacity] duration-200 ease-out ${
              state === "expanded"
                ? "max-w-40 opacity-100"
                : "max-w-0 opacity-0"
            }`}
            aria-hidden={state !== "expanded"}
          >
            Auction It
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Main Menu Items */}
              {mainNavItems.map((menu) => {
                const hasGroups = menu.groups && menu.groups.length > 0;
                const hasItems = menu.items && menu.items.length > 0;
                const isCollapsible = hasGroups || hasItems;

                if (!isCollapsible) {
                  // Simple non-collapsible item
                  if (!menu.href) return null;
                  return (
                    <SidebarMenuItem key={menu.name}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive(menu.href)}
                        tooltip={menu.name}
                      >
                        <NavLink href={menu.href}>
                          {menu.icon && <menu.icon />}
                          <span>{menu.name}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                }

                // Collapsible menu item: dropdown when collapsed, inline when expanded.
                if (state === "collapsed") {
                  // Collapsed: show submenus as dropdown (same group/label mapping as footer).
                  // The top-level button doesn't show an active highlight — only the leaf
                  // submenu items in the popover do, which is consistent with expanded mode.
                  return (
                    <SidebarMenuItem key={menu.name}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <SidebarMenuButton
                            tooltip={menu.name}
                            isActive={false}
                          >
                            {menu.icon && <menu.icon />}
                            <span>{menu.name}</span>
                            <ChevronDown className="ml-auto size-4" />
                          </SidebarMenuButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          side="right"
                          align="start"
                          sideOffset={4}
                          className={sidebarDropdownContentClassName}
                        >
                          {renderDropdownChildren(menu)}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </SidebarMenuItem>
                  );
                }

                // Expanded: inline collapsible with SidebarGroupLabel + SidebarMenuSub.
                // The parent button only opens the group; the active highlight lives on
                // the leaf submenu item below.
                const isOpen = isItemOrDescendantActive(menu);
                return (
                  <Collapsible key={menu.name} asChild defaultOpen={isOpen}>
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          tooltip={menu.name}
                          isActive={false}
                        >
                          {menu.icon && <menu.icon />}
                          <span>{menu.name}</span>
                          <ChevronDown className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        {hasGroups ? (
                          menu.groups!.map((group) => (
                            <div key={group.label}>
                              <SidebarGroupLabel className="px-2 py-1.5">
                                {group.label}
                              </SidebarGroupLabel>
                              <SidebarMenuSub>
                                {group.items.map((item) => {
                                  const active = isItemOrDescendantActive(item);

                                  if (!hasChildren(item)) {
                                    if (!item.href) return null;
                                    return (
                                      <SidebarMenuSubItem key={item.name}>
                                        <SidebarMenuSubButton
                                          asChild
                                          isActive={active}
                                        >
                                          <NavLink href={item.href}>
                                            {item.icon && <item.icon />}
                                            <span>{item.name}</span>
                                          </NavLink>
                                        </SidebarMenuSubButton>
                                      </SidebarMenuSubItem>
                                    );
                                  }

                                  return (
                                    <SidebarMenuSubItem key={item.name}>
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <SidebarMenuSubButton
                                            isActive={active}
                                          >
                                            {item.icon && <item.icon />}
                                            <span>{item.name}</span>
                                            <ChevronRight className="ml-auto size-4 opacity-70" />
                                          </SidebarMenuSubButton>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent
                                          side="right"
                                          align="start"
                                          sideOffset={4}
                                          className={sidebarDropdownContentClassName}
                                        >
                                          {renderDropdownChildren(item)}
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    </SidebarMenuSubItem>
                                  );
                                })}
                              </SidebarMenuSub>
                            </div>
                          ))
                        ) : (
                          <SidebarMenuSub>
                            {menu.items!.map((item) => {
                              const active = isItemOrDescendantActive(item);

                              if (!hasChildren(item)) {
                                if (!item.href) return null;
                                return (
                                  <SidebarMenuSubItem key={item.name}>
                                    <SidebarMenuSubButton
                                      asChild
                                      isActive={active}
                                    >
                                      <NavLink href={item.href}>
                                        {item.icon && <item.icon />}
                                        <span>{item.name}</span>
                                      </NavLink>
                                    </SidebarMenuSubButton>
                                  </SidebarMenuSubItem>
                                );
                              }

                              return (
                                <SidebarMenuSubItem key={item.name}>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <SidebarMenuSubButton isActive={active}>
                                        {item.icon && <item.icon />}
                                        <span>{item.name}</span>
                                        <ChevronRight className="ml-auto size-4 opacity-70" />
                                      </SidebarMenuSubButton>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                      side="right"
                                      align="start"
                                      sideOffset={4}
                                      className={sidebarDropdownContentClassName}
                                    >
                                      {renderDropdownChildren(item)}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </SidebarMenuSubItem>
                              );
                            })}
                          </SidebarMenuSub>
                        )}
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          {footerNavItems.map((item) => {
            const hasGroups = item.groups && item.groups.length > 0;
            const hasItems = item.items && item.items.length > 0;
            const isDropdown = hasGroups || hasItems;

            const isDropdownActive = isItemOrDescendantActive(item);

            if (isDropdown) {
              return (
                <SidebarMenuItem key={item.name}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <SidebarMenuButton
                        tooltip={item.name}
                        isActive={!!isDropdownActive}
                      >
                        {item.icon && <item.icon />}
                        <span>{item.name}</span>
                        <ChevronRight className="ml-auto size-4" />
                      </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      side="right"
                      align="start"
                      sideOffset={4}
                      className={sidebarDropdownContentClassName}
                    >
                      {renderDropdownChildren(item)}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </SidebarMenuItem>
              );
            }
            if (item.href) {
              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.href)}
                    tooltip={item.name}
                  >
                    <NavLink href={item.href}>
                      {item.icon && <item.icon />}
                      <span>{item.name}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            }
            return null;
          })}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
