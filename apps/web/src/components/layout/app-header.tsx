"use client";

import * as React from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { AppBreadcrumbs } from "@/components/layout/app-breadcrumbs";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { NotificationsPopover } from "@/components/layout/notifications-popover";

export function AppHeader() {
  return (
    <header className="flex h-12 shrink-0 items-center justify-between gap-2 border-b px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 bg-background">
      <div className="flex items-center gap-2 min-w-0">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4"
        />
        <AppBreadcrumbs />
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <NotificationsPopover />
        <ThemeToggle />
      </div>
    </header>
  );
}
