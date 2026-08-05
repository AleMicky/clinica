"use client";

import type { ReactNode } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { AppHeader } from "./app-header";

type DashboardLayoutWrapperProps = {
  children: ReactNode;
};

export function DashboardLayoutWrapper({ children }: DashboardLayoutWrapperProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar variant="inset" />
      <SidebarInset className="flex flex-col flex-1 min-w-0 border border-sidebar-border overflow-hidden">
        <AppHeader />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
