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
      <div className="relative flex min-h-screen w-full bg-background text-foreground antialiased selection:bg-primary/10 selection:text-primary">
        <AppSidebar variant="inset" />
        <SidebarInset className="flex flex-col flex-1 min-w-0 border border-border/60 bg-muted/15 shadow-sm rounded-xl overflow-hidden transition-all duration-200">
          <AppHeader />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto w-full max-w-7xl mx-auto transition-all animate-in fade-in-50 duration-300">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

