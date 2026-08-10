"use client";

import * as React from "react";
import {
  Phone,
  MapPin,
  Calendar,
  Edit,
  Trash2,
  Eye,
  HeartPulse,
  Handshake,
} from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { StatusBadge } from "@/components/shared";
import { cn } from "@/lib/utils";
import type { PacienteResponse } from "../types/paciente.types";

interface PacienteCardProps {
  paciente: PacienteResponse;
  viewMode?: "grid" | "list";
  onEdit?: (paciente: PacienteResponse) => void;
  onDelete?: (id: number) => void;
  onManageConvenios?: (paciente: PacienteResponse) => void;
}

export function getPacienteFullName(paciente: PacienteResponse): string {
  if (!paciente.persona) return "Sin Datos";
  const { nombres, apellidoPaterno, apellidoMaterno } = paciente.persona;
  const parts = [nombres, apellidoPaterno, apellidoMaterno].filter(Boolean);
  return parts.join(" ");
}

export function getPacienteDocument(paciente: PacienteResponse): string {
  if (!paciente.persona) return "-";
  const p = paciente.persona;
  const ext = p.extensionDocumento ? ` ${p.extensionDocumento}` : "";
  const comp = p.complementoDocumento ? `-${p.complementoDocumento}` : "";
  return `${p.tipoDocumento || "CI"}: ${p.numeroDocumento || ""}${comp}${ext}`;
}

export function getEdad(fechaNacimiento?: string | null): string | null {
  if (!fechaNacimiento) return null;
  const birthDate = new Date(fechaNacimiento);
  if (isNaN(birthDate.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age > 0 ? `${age} años` : "Menor de 1 año";
}

export function PacienteCard({
  paciente,
  viewMode = "grid",
  onEdit,
  onDelete,
  onManageConvenios,
}: PacienteCardProps) {
  const [detailsOpen, setDetailsOpen] = React.useState(false);

  const persona = paciente.persona;
  const nombreCompleto = getPacienteFullName(paciente);
  const initials = persona
    ? ((persona.nombres[0] || "") + (persona.apellidoPaterno[0] || "")).toUpperCase()
    : "PAC";
  const docFormatted = getPacienteDocument(paciente);
  const edad = persona ? getEdad(persona.fechaNacimiento) : null;

  return (
    <>
      {viewMode === "list" ? (
        // List Row View
        <div className="group relative flex flex-col sm:flex-row sm:items-center justify-between p-2.5 sm:p-3 rounded-lg border border-border/60 hover:border-primary/40 bg-card hover:shadow-xs transition-all duration-200 gap-2.5">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="relative shrink-0">
              <Avatar className="h-9 w-9 border border-border/80">
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span
                className={cn(
                  "absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full ring-2 ring-background",
                  paciente.activo ? "bg-emerald-500" : "bg-muted-foreground/40"
                )}
              />
            </div>

            <div className="flex flex-col min-w-0 flex-1 leading-tight">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge
                  variant="outline"
                  className="bg-primary/5 text-primary border-primary/20 text-[10px] px-1.5 py-0 h-4 font-mono font-bold"
                >
                  {paciente.numeroHistoriaClinica}
                </Badge>
                <span className="font-semibold text-sm text-foreground truncate">
                  {nombreCompleto}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5 flex-wrap">
                <span>{docFormatted}</span>
                {edad && (
                  <span className="hidden sm:inline-flex items-center gap-1">
                    <Calendar className="size-3 text-muted-foreground/70" />
                    {edad}
                  </span>
                )}
                {persona?.telefono && (
                  <span className="hidden md:inline-flex items-center gap-1">
                    <Phone className="size-3 text-muted-foreground/70" />
                    {persona.telefono}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
            <StatusBadge active={paciente.activo} className="mr-1 text-[11px]" />

            {onManageConvenios && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onManageConvenios(paciente)}
                className="h-8 w-8 text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-950/30"
                title="Convenios / Cobertura"
              >
                <Handshake className="size-4" />
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDetailsOpen(true)}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              title="Ver detalle"
            >
              <Eye className="size-4" />
            </Button>

            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(paciente)}
                className="h-8 w-8 text-muted-foreground hover:text-primary"
                title="Editar paciente"
              >
                <Edit className="size-4" />
              </Button>
            )}

            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(paciente.id)}
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                title="Eliminar paciente"
              >
                <Trash2 className="size-4" />
              </Button>
            )}
          </div>
        </div>
      ) : (
        // Grid Card View
        <Card className="group relative flex flex-col justify-between overflow-hidden border border-border/60 hover:border-primary/40 transition-all duration-200 hover:shadow-md bg-card">
          <CardContent className="p-4 space-y-3">
            {/* Top row: HC Badge & Actions */}
            <div className="flex items-start justify-between gap-2">
              <Badge
                variant="outline"
                className="bg-primary/5 text-primary border-primary/20 text-xs px-2 py-0.5 font-mono font-bold"
              >
                <HeartPulse className="size-3 mr-1" />
                {paciente.numeroHistoriaClinica}
              </Badge>
              <StatusBadge active={paciente.activo} className="text-[10px]" />
            </div>

            {/* Avatar & Patient Name */}
            <div className="flex items-center gap-3 pt-1">
              <Avatar className="h-10 w-10 border border-primary/20 shrink-0">
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <div className="flex flex-col min-w-0">
                <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors truncate">
                  {nombreCompleto}
                </h3>
                <span className="text-xs text-muted-foreground truncate">{docFormatted}</span>
              </div>
            </div>

            {/* Patient Info Grid */}
            <div className="grid grid-cols-2 gap-1.5 pt-2 text-xs text-muted-foreground border-t border-border/40">
              <div className="flex items-center gap-1.5 truncate">
                <Calendar className="size-3.5 text-primary/70 shrink-0" />
                <span className="truncate">{edad || "Sin fecha nac."}</span>
              </div>
              <div className="flex items-center gap-1.5 truncate">
                <Phone className="size-3.5 text-primary/70 shrink-0" />
                <span className="truncate">{persona?.telefono || "Sin teléfono"}</span>
              </div>
              <div className="flex items-center gap-1.5 col-span-2 truncate">
                <MapPin className="size-3.5 text-primary/70 shrink-0" />
                <span className="truncate">{persona?.direccion || "Sin dirección registrada"}</span>
              </div>
            </div>
          </CardContent>

          {/* Footer Actions */}
          <CardFooter className="p-2.5 bg-muted/20 border-t border-border/40 flex items-center justify-between gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onManageConvenios?.(paciente)}
              className="h-7 text-xs font-medium text-purple-700 dark:text-purple-400 bg-purple-500/5 hover:bg-purple-500/10 border-purple-200 dark:border-purple-900/50"
            >
              <Handshake className="size-3.5 mr-1" />
              Convenios
            </Button>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDetailsOpen(true)}
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
              >
                <Eye className="size-3.5" />
              </Button>
              {onEdit && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(paciente)}
                  className="h-7 w-7 text-muted-foreground hover:text-primary"
                >
                  <Edit className="size-3.5" />
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(paciente.id)}
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
      )}

      {/* Details Modal */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <HeartPulse className="size-5 text-primary" />
              <span>Ficha Clínica del Paciente</span>
            </DialogTitle>
            <DialogDescription>
              Información detallada del expediente de la persona y su historia clínica.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
              <Avatar className="h-12 w-12 border border-primary/20">
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-base">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-sm text-foreground">{nombreCompleto}</span>
                <span className="font-mono text-xs font-semibold text-primary">
                  {paciente.numeroHistoriaClinica}
                </span>
                <span className="text-xs text-muted-foreground">{docFormatted}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-0.5">
                <span className="text-muted-foreground font-medium">Fecha Nacimiento</span>
                <p className="font-semibold">{persona?.fechaNacimiento?.split("T")[0] || "-"}</p>
              </div>
              <div className="space-y-0.5">
                <span className="text-muted-foreground font-medium">Edad</span>
                <p className="font-semibold">{edad || "-"}</p>
              </div>
              <div className="space-y-0.5">
                <span className="text-muted-foreground font-medium">Género</span>
                <p className="font-semibold">{persona?.genero || "-"}</p>
              </div>
              <div className="space-y-0.5">
                <span className="text-muted-foreground font-medium">Estado Civil</span>
                <p className="font-semibold">{persona?.estadoCivil || "-"}</p>
              </div>
              <div className="space-y-0.5">
                <span className="text-muted-foreground font-medium">Teléfono</span>
                <p className="font-semibold">{persona?.telefono || "-"}</p>
              </div>
              <div className="space-y-0.5">
                <span className="text-muted-foreground font-medium">Estado del Paciente</span>
                <div>
                  <StatusBadge active={paciente.activo} className="text-[10px]" />
                </div>
              </div>
              <div className="col-span-2 space-y-0.5">
                <span className="text-muted-foreground font-medium">Dirección</span>
                <p className="font-semibold">{persona?.direccion || "-"}</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
