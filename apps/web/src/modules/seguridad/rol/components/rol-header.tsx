"use client";

import { Key, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RolHeaderProps {
  onNew: () => void;
}

export function RolHeader({ onNew }: RolHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <h1 className="flex items-center gap-2 text-lg font-bold tracking-tight text-foreground">
          <Key className="size-5 text-primary" />
          Gestión de Roles
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Configuración y administración de perfiles de acceso de usuarios.
        </p>
      </div>
      <Button onClick={onNew} size="sm" className="shrink-0 gap-1.5 h-8 text-xs font-medium">
        <Plus className="size-3.5" />
        <span>Nuevo Rol</span>
      </Button>
    </div>
  );
}
