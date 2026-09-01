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
    <SidebarProvider defaultOpen={true} className="h-screen max-h-screen overflow-hidden">
      <div className="relative flex h-screen max-h-screen w-full bg-sidebar/50 text-foreground antialiased overflow-hidden selection:bg-primary/10 selection:text-primary">
        <AppSidebar variant="inset" />
        <SidebarInset className="flex flex-col flex-1 min-w-0 h-[calc(100vh-1rem)] max-h-[calc(100vh-1rem)] border border-border/50 bg-background/95 shadow-sm rounded-2xl overflow-hidden transition-all duration-200 my-2 mr-2">
          <AppHeader />
          <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 lg:p-8 w-full transition-all animate-in fade-in-50 duration-300">
            {children}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
