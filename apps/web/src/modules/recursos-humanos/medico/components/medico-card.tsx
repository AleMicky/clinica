"use client";

import * as React from "react";
import {
  Stethoscope,
  Edit,
  Trash2,
  FileBadge,
  UserCheck,
  CreditCard,
  FolderKanban,
} from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/shared";
import { cn } from "@/lib/utils";
import type { MedicoResponse } from "../types/medico.types";

interface MedicoCardProps {
  medico: MedicoResponse;
  viewMode?: "grid" | "list";
  onEdit?: (medico: MedicoResponse) => void;
  onManageExpediente?: (medico: MedicoResponse) => void;
  onDelete?: (medico: MedicoResponse) => void;
}

export function MedicoCard({
  medico,
  viewMode = "list",
  onEdit,
  onManageExpediente,
  onDelete,
}: MedicoCardProps) {
  const nombreCompleto =
    medico.empleado?.nombreCompleto ||
    [
      medico.empleado?.persona?.nombres,
      medico.empleado?.persona?.apellidoPaterno,
      medico.empleado?.persona?.apellidoMaterno,
    ]
      .filter(Boolean)
      .join(" ") ||
    `Empleado #${medico.empleadoId}`;

  const codigoEmpleado = medico.empleado?.codigoEmpleado || `EMP-${medico.empleadoId}`;

  const initials = nombreCompleto
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "MD";

  if (viewMode === "list") {
    return (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-border/60 hover:border-primary/40 bg-card hover:bg-muted/10 transition-all duration-200 shadow-2xs">
        {/* Left: Avatar & Main Info */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="relative shrink-0">
            <Avatar className="h-10 w-10 border border-primary/20 bg-primary/10 text-primary">
              <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span
              className={cn(
                "absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full ring-2 ring-background",
                medico.activo ? "bg-emerald-500" : "bg-muted-foreground/40"
              )}
            />
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-xs sm:text-sm text-foreground truncate">
                {nombreCompleto}
              </span>
              <span className="font-mono text-[11px] text-muted-foreground bg-muted/50 px-1.5 py-0.2 rounded border border-border/40">
                {codigoEmpleado}
              </span>
            </div>

            <div className="flex items-center gap-3 text-[11px] text-muted-foreground flex-wrap mt-0.5">
              <span className="font-mono flex items-center gap-1 font-medium text-foreground/80">
                <CreditCard className="size-3 text-muted-foreground/70" />
                Matrícula: {medico.matriculaProfesional}
              </span>

              {medico.registroMinisterioSalud ? (
                <span className="font-mono flex items-center gap-1 text-muted-foreground">
                  <FileBadge className="size-3 text-sky-500" />
                  Minsal: {medico.registroMinisterioSalud}
                </span>
              ) : (
                <span className="italic text-muted-foreground/50">Sin Minsal</span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Single Expediente Button, Status & Actions */}
        <div className="flex items-center gap-2 shrink-0 justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-border/40">
          <StatusBadge active={medico.activo} activeLabel="Activo" inactiveLabel="Inactivo" />

          <div className="flex items-center gap-1 border-l border-border/50 pl-2">
            {onManageExpediente && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onManageExpediente(medico)}
                title="Gestionar expediente, especialidades y acuerdos"
                className="h-8 px-2.5 text-xs gap-1.5 cursor-pointer font-medium hover:bg-primary/10 hover:text-primary hover:border-primary/40 rounded-lg shadow-2xs"
              >
                <Stethoscope className="size-3.5 text-primary" />
                <span>Expediente</span>
              </Button>
            )}

            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(medico)}
                title="Editar médico"
                className="size-8 text-muted-foreground hover:text-foreground cursor-pointer rounded-md"
              >
                <Edit className="size-3.5" />
              </Button>
            )}

            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(medico)}
                title="Inhabilitar médico"
                className="size-8 text-destructive hover:bg-destructive/10 cursor-pointer rounded-md"
              >
                <Trash2 className="size-3.5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Grid View Mode
  return (
    <Card className="flex flex-col justify-between hover:shadow-sm transition-all duration-200 border-border/80 bg-card overflow-hidden rounded-xl">
      <div className="p-4 pb-3 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar className="size-10 border border-primary/20 bg-primary/10 text-primary shrink-0">
              <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-foreground truncate leading-tight">
                {nombreCompleto}
              </h3>
              <p className="text-[11px] font-mono text-muted-foreground flex items-center gap-1 mt-0.5">
                <UserCheck className="size-3 text-muted-foreground/70" />
                {codigoEmpleado}
              </p>
            </div>
          </div>
          <StatusBadge active={medico.activo} activeLabel="Activo" inactiveLabel="Inactivo" />
        </div>

        <div className="grid grid-cols-2 gap-2 bg-muted/30 p-2.5 rounded-lg border border-border/50 text-xs">
          <div>
            <span className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground/80 block mb-0.5">
              Matrícula Prof.
            </span>
            <Badge variant="outline" className="font-mono text-[11px] bg-background font-semibold">
              {medico.matriculaProfesional}
            </Badge>
          </div>

          <div>
            <span className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground/80 block mb-0.5">
              Reg. Min. Salud
            </span>
            {medico.registroMinisterioSalud ? (
              <span className="font-mono text-[11px] text-foreground font-medium flex items-center gap-1">
                <FileBadge className="size-3 text-sky-500 shrink-0" />
                {medico.registroMinisterioSalud}
              </span>
            ) : (
              <span className="text-[11px] italic text-muted-foreground/60">Sin registro</span>
            )}
          </div>
        </div>
      </div>

      <CardFooter className="p-2.5 bg-muted/20 border-t flex items-center justify-between gap-1.5">
        {onManageExpediente && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onManageExpediente(medico)}
            className="h-8 text-xs px-3 gap-1.5 font-medium hover:text-primary hover:border-primary/40 cursor-pointer shadow-2xs w-full justify-start"
          >
            <Stethoscope className="size-3.5 text-primary" />
            <span>Expediente Completo</span>
          </Button>
        )}

        <div className="flex items-center gap-0.5 shrink-0">
          {onEdit && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(medico)}
              title="Editar médico"
              className="size-8 text-muted-foreground hover:text-foreground cursor-pointer rounded-md"
            >
              <Edit className="size-3.5" />
            </Button>
          )}

          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(medico)}
              title="Inhabilitar médico"
              className="size-8 text-destructive hover:bg-destructive/10 cursor-pointer rounded-md"
            >
              <Trash2 className="size-3.5" />
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
