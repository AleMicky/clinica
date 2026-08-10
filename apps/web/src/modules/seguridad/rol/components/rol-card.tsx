"use client";

import * as React from "react";
import { Edit, Lock, MoreHorizontal, Shield, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { RolResponse } from "../types/rol.types";

interface RolCardProps {
  rol: RolResponse;
  onEdit: (rol: RolResponse) => void;
  onDelete: (rol: RolResponse) => void;
}

export function getRoleColorTheme(name: string) {
  const upper = name.toUpperCase();
  if (upper === "ADMINISTRADOR") {
    return {
      bg: "bg-red-500/10 dark:bg-red-500/15",
      border: "border-red-500/20 dark:border-red-500/30",
      text: "text-red-700 dark:text-red-400",
      iconBg: "bg-red-500/15 text-red-600 dark:text-red-400",
    };
  }
  if (upper.includes("MEDIC") || upper.includes("DOCTOR")) {
    return {
      bg: "bg-blue-500/10 dark:bg-blue-500/15",
      border: "border-blue-500/20 dark:border-blue-500/30",
      text: "text-blue-700 dark:text-blue-400",
      iconBg: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
    };
  }
  if (upper.includes("RECEPCION") || upper.includes("CAJA")) {
    return {
      bg: "bg-emerald-500/10 dark:bg-emerald-500/15",
      border: "border-emerald-500/20 dark:border-emerald-500/30",
      text: "text-emerald-700 dark:text-emerald-400",
      iconBg: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    };
  }
  if (upper.includes("FARMACIA") || upper.includes("ALMACEN")) {
    return {
      bg: "bg-purple-500/10 dark:bg-purple-500/15",
      border: "border-purple-500/20 dark:border-purple-500/30",
      text: "text-purple-700 dark:text-purple-400",
      iconBg: "bg-purple-500/15 text-purple-600 dark:text-purple-400",
    };
  }
  return {
    bg: "bg-primary/5 dark:bg-primary/10",
    border: "border-primary/15 dark:border-primary/20",
    text: "text-primary",
    iconBg: "bg-primary/10 text-primary",
  };
}

export function RolCard({ rol, onEdit, onDelete }: RolCardProps) {
  const esProtegido = rol.name.toUpperCase() === "ADMINISTRADOR";
  const theme = getRoleColorTheme(rol.name);

  return (
    <Card className="shadow-2xs hover:shadow-xs transition-all duration-150 border border-border/70 hover:border-primary/40 flex flex-col justify-between overflow-hidden group bg-card">
      <CardContent className="p-3 flex flex-col gap-2">
        {/* Header line */}
        <div className="flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-2 min-w-0">
            <div className={cn("flex size-7 shrink-0 items-center justify-center rounded-md font-medium transition-transform group-hover:scale-105", theme.iconBg)}>
              {esProtegido ? <Lock className="size-3.5" /> : <Shield className="size-3.5" />}
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-xs text-foreground group-hover:text-primary transition-colors truncate leading-tight">
                {rol.name}
              </h3>
              <span className="text-[10px] text-muted-foreground font-mono">
                ID #{rol.id}
              </span>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex size-6 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground text-muted-foreground transition-colors cursor-pointer shrink-0">
              <MoreHorizontal className="size-3.5" />
              <span className="sr-only">Opciones</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(rol)} className="text-xs">
                <Edit className="mr-2 size-3.5" />
                Editar
              </DropdownMenuItem>
              {!esProtegido && (
                <DropdownMenuItem
                  onClick={() => onDelete(rol)}
                  className="text-xs text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 size-3.5" />
                  Eliminar
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Descripción compacta */}
        <p className="text-[11px] text-muted-foreground line-clamp-1 leading-snug">
          {rol.descripcion || "Sin descripción asignada."}
        </p>

        {/* Bottom bar */}
        <div className="flex items-center justify-between pt-1 border-t border-border/40 text-[10px]">
          {esProtegido ? (
            <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[9px] gap-1 px-1.5 py-0 h-4 font-medium">
              <Lock className="size-2.5" />
              Sistema
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[9px] gap-1 px-1.5 py-0 h-4 font-medium">
              <Shield className="size-2.5" />
              Personalizado
            </Badge>
          )}

          <Button
            variant="ghost"
            size="sm"
            className="h-5 text-[10px] px-1.5 text-primary hover:text-primary hover:bg-primary/10"
            onClick={() => onEdit(rol)}
          >
            <Edit className="size-3 mr-0.5" />
            Editar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
