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
  const primaryRole = user?.roles?.[0] || "Personal Médico";

  async function handleLogout() {
    try {
      await logoutMutation.mutateAsync();
    } finally {
      window.location.href = "/login";
    }
  }

  return (
    <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border/50 bg-background/80 px-4 sm:px-6 backdrop-blur-md transition-all duration-200">
      {/* SECCIÓN IZQUIERDA: TRIGGER SIDEBAR + BREADCRUMBS */}
      <div className="flex items-center gap-2.5 min-w-0">
        <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded-lg transition-colors" />
        <Separator
          orientation="vertical"
          className="h-4 bg-border/60"
        />
        <AppBreadcrumbs />
      </div>

      {/* SECCIÓN DERECHA: HERRAMIENTAS Y MENÚ DE USUARIO */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Notificaciones */}
        <NotificationsPopover />

        {/* Alternador de Tema */}
        <ThemeToggle />

        <Separator orientation="vertical" className="h-4 mx-0.5 bg-border/60" />

        {/* Menú de Perfil de Usuario */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                className="relative h-9 w-9 rounded-full p-0 ring-1 ring-border/50 hover:ring-primary/40 hover:bg-accent transition-all"
              >
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                {/* Punto verde de conexión activa */}
                <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-emerald-500 ring-2 ring-background" />
              </Button>
            }
          />
          <DropdownMenuContent className="w-60 p-1.5" align="end">
            <DropdownMenuLabel className="font-normal p-2">
              <div className="flex flex-col space-y-1.5">
                <p className="text-sm font-semibold leading-none text-foreground">{displayName}</p>
                <p className="text-xs leading-none text-muted-foreground truncate">{displayEmail}</p>
                <div className="pt-1 flex items-center gap-1.5">
                  <Badge variant="secondary" className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary font-medium border-primary/20">
                    <Shield className="size-3 mr-1 text-primary" />
                    {primaryRole}
                  </Badge>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator className="my-1" />

            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() => router.push("/dashboard/perfil")}
                className="cursor-pointer text-xs font-medium py-2 rounded-md"
              >
                <User className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Mi Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push("/dashboard/perfil?tab=password")}
                className="cursor-pointer text-xs font-medium py-2 rounded-md"
              >
                <KeyRound className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Cambiar Contraseña</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator className="my-1" />

            <DropdownMenuItem
              className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer text-xs font-medium py-2 rounded-md"
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
