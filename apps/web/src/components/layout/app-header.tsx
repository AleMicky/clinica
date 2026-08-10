"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { User, KeyRound, LogOut, LoaderCircle, Shield } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { AppBreadcrumbs } from "@/components/layout/app-breadcrumbs";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { NotificationsPopover } from "@/components/layout/notifications-popover";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/providers/auth-provider";
import { useLogout } from "@/modules/auth/hooks/use-logout";

function getInitials(name?: string | null): string {
  if (!name || !name.trim()) return "US";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function AppHeader() {
  const router = useRouter();
  const { user } = useAuth();
  const logoutMutation = useLogout();

  const displayName = user?.nombreCompleto || user?.userName || "Usuario";
  const displayEmail = user?.email || "usuario@clinica.com";
  const initials = getInitials(displayName);
  const primaryRole = user?.roles?.[0] || "Usuario";

  async function handleLogout() {
    try {
      await logoutMutation.mutateAsync();
    } finally {
      window.location.href = "/login";
    }
  }

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
        <Separator orientation="vertical" className="h-4 mx-1" />
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon-sm" className="relative h-8 w-8 rounded-full p-0">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            }
          />
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{displayName}</p>
                <p className="text-xs leading-none text-muted-foreground">{displayEmail}</p>
                <div className="pt-1 flex items-center gap-1">
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                    <Shield className="size-2.5 mr-1" />
                    {primaryRole}
                  </Badge>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => router.push("/dashboard/perfil")}>
                <User className="mr-2 h-4 w-4" />
                <span>Mi Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/dashboard/perfil?tab=password")}>
                <KeyRound className="mr-2 h-4 w-4" />
                <span>Cambiar Contraseña</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
              disabled={logoutMutation.isPending}
              onClick={handleLogout}
            >
              {logoutMutation.isPending ? (
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="mr-2 h-4 w-4" />
              )}
              <span>Cerrar Sesión</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

