"use client";

import * as React from "react";
import {
  User,
  Phone,
  MapPin,
  Calendar,
  Heart,
  Edit,
  Trash2,
  CreditCard,
  Eye,
  Users,
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
import type { PersonaResponse } from "../types/persona.types";

interface PersonaCardProps {
  persona: PersonaResponse;
  viewMode?: "grid" | "list";
  onEdit?: (persona: PersonaResponse) => void;
  onDelete?: (id: number) => void;
}

export function getPersonaFullName(persona: PersonaResponse): string {
  const parts = [persona.nombres, persona.apellidoPaterno, persona.apellidoMaterno].filter(
    Boolean
  );
  return parts.join(" ");
}

export function getPersonaDocument(persona: PersonaResponse): string {
  const ext = persona.extensionDocumento ? ` ${persona.extensionDocumento}` : "";
  const comp = persona.complementoDocumento ? `-${persona.complementoDocumento}` : "";
  return `${persona.tipoDocumento || "DOC"}: ${persona.numeroDocumento || ""}${comp}${ext}`;
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
  return age > 0 ? `${age}a` : null;
}

export function PersonaCard({
  persona,
  viewMode = "grid",
  onEdit,
  onDelete,
}: PersonaCardProps) {
  const [detailsOpen, setDetailsOpen] = React.useState(false);

  const nombreCompleto = getPersonaFullName(persona);
  const initials = (
    (persona.nombres[0] || "") + (persona.apellidoPaterno[0] || "")
  ).toUpperCase();
  const docFormatted = getPersonaDocument(persona);
  const edad = getEdad(persona.fechaNacimiento);

  return (
    <>
      {viewMode === "list" ? (
        // Compact Horizontal List Row View
        <div className="group relative flex flex-col sm:flex-row sm:items-center justify-between p-2 sm:p-2.5 rounded-lg border border-border/60 hover:border-primary/40 bg-card hover:shadow-xs transition-all duration-200 gap-2">
          {/* Left: Avatar + Details */}
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="relative shrink-0">
              <Avatar className="h-8 w-8 border border-border/80">
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-[11px]">
                  {initials || "PER"}
                </AvatarFallback>
              </Avatar>
              <span
                className={cn(
                  "absolute -bottom-0.5 -right-0.5 size-2 rounded-full ring-2 ring-background",
                  persona.activo ? "bg-emerald-500" : "bg-muted-foreground/40"
                )}
              />
            </div>

            <div className="flex flex-col min-w-0 flex-1 leading-tight">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-bold text-xs text-foreground group-hover:text-primary transition-colors">
                  {nombreCompleto}
                </span>
                <span className="font-mono text-[10px] bg-muted/60 px-1 py-0 rounded border border-border/30">
                  {docFormatted}
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">
                  #{persona.id}
                </span>
              </div>

              <div className="flex items-center gap-2 text-[10px] text-muted-foreground flex-wrap mt-0.5">
                {persona.telefono && (
                  <span className="flex items-center gap-0.5">
                    <Phone className="size-2.5 shrink-0" />
                    {persona.telefono}
                  </span>
                )}
                {persona.fechaNacimiento && (
                  <span className="flex items-center gap-0.5">
                    <Calendar className="size-2.5 shrink-0" />
                    {persona.fechaNacimiento} {edad ? `(${edad})` : ""}
                  </span>
                )}
                {persona.genero && (
                  <span className="flex items-center gap-0.5 capitalize">
                    {persona.genero}
                  </span>
                )}
                {persona.estadoCivil && (
                  <span className="flex items-center gap-0.5 capitalize">
                    <Heart className="size-2.5 shrink-0" />
                    {persona.estadoCivil}
                  </span>
                )}
                {persona.direccion && (
                  <span className="flex items-center gap-0.5 truncate max-w-[180px]">
                    <MapPin className="size-2.5 shrink-0" />
                    {persona.direccion}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Status & Actions */}
          <div className="flex items-center gap-2 shrink-0 justify-end">
            <StatusBadge active={persona.activo} />
            <div className="flex items-center gap-0.5 border-l border-border/50 pl-1.5">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDetailsOpen(true)}
                title="Ver detalle completo"
                className="size-6 cursor-pointer hover:bg-muted text-muted-foreground rounded"
              >
                <Eye className="size-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit?.(persona)}
                title="Editar persona"
                className="size-6 cursor-pointer hover:bg-primary/10 hover:text-primary rounded"
              >
                <Edit className="size-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete?.(persona.id)}
                title="Eliminar persona"
                className="size-6 text-destructive hover:bg-destructive/10 cursor-pointer rounded"
              >
                <Trash2 className="size-3" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        // Ultra-Compact Grid Card View
        <Card className="group relative flex flex-col justify-between overflow-hidden border border-border/60 hover:border-primary/40 bg-card hover:shadow-xs transition-all duration-200 rounded-lg">
          {/* Top Accent Indicator */}
          <div
            className={cn(
              "h-0.5 w-full",
              persona.activo ? "bg-emerald-500" : "bg-destructive/60"
            )}
          />

          <CardContent className="p-3 flex flex-col gap-2">
            {/* Header: Avatar + Name + Status */}
            <div className="flex items-start justify-between gap-1.5">
              <div className="flex items-center gap-2 min-w-0">
                <div className="relative shrink-0">
                  <Avatar className="h-8 w-8 border border-border/80 shadow-2xs">
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-[11px]">
                      {initials || "PER"}
                    </AvatarFallback>
                  </Avatar>
                  <span
                    className={cn(
                      "absolute -bottom-0.5 -right-0.5 size-2 rounded-full ring-2 ring-background",
                      persona.activo ? "bg-emerald-500" : "bg-muted-foreground/40"
                    )}
                  />
                </div>
                <div className="flex flex-col leading-tight min-w-0">
                  <span className="font-bold text-xs text-foreground truncate group-hover:text-primary transition-colors">
                    {nombreCompleto}
                  </span>
                  <span className="font-mono text-[10px] text-muted-foreground truncate">
                    {docFormatted}
                  </span>
                </div>
              </div>
              <StatusBadge active={persona.activo} />
            </div>

            {/* Persona Details Container */}
            <div className="flex flex-col gap-1 bg-muted/40 p-2 rounded-md border border-border/30 text-[10px] text-muted-foreground">
              <div className="grid grid-cols-2 gap-x-1.5 gap-y-0.5">
                {persona.telefono ? (
                  <span className="flex items-center gap-1 truncate text-foreground/90 font-medium">
                    <Phone className="size-2.5 shrink-0 text-muted-foreground" />
                    {persona.telefono}
                  </span>
                ) : (
                  <span className="italic text-muted-foreground/60">Sin teléfono</span>
                )}

                {persona.fechaNacimiento ? (
                  <span className="flex items-center gap-1 truncate">
                    <Calendar className="size-2.5 shrink-0 text-muted-foreground" />
                    {persona.fechaNacimiento} {edad ? `(${edad})` : ""}
                  </span>
                ) : (
                  <span className="italic text-muted-foreground/60">Sin fecha nac.</span>
                )}

                {persona.genero && (
                  <span className="flex items-center gap-1 truncate capitalize">
                    <Users className="size-2.5 shrink-0 text-muted-foreground" />
                    {persona.genero}
                  </span>
                )}

                {persona.estadoCivil && (
                  <span className="flex items-center gap-1 truncate capitalize">
                    <Heart className="size-2.5 shrink-0 text-muted-foreground" />
                    {persona.estadoCivil}
                  </span>
                )}

                {persona.direccion && (
                  <span className="flex items-center gap-1 truncate col-span-2 text-foreground/80 pt-0.5">
                    <MapPin className="size-2.5 shrink-0 text-muted-foreground" />
                    <span className="truncate">{persona.direccion}</span>
                  </span>
                )}
              </div>
            </div>
          </CardContent>

          {/* Footer */}
          <CardFooter className="px-3 py-1.5 bg-muted/20 border-t border-border/30 flex items-center justify-between h-7">
            <span className="text-[9px] font-mono text-muted-foreground">
              ID #{persona.id}
            </span>
            <div className="flex items-center gap-0.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDetailsOpen(true)}
                title="Ver detalle"
                className="h-6 px-1.5 text-[10px] gap-1 cursor-pointer hover:bg-muted text-muted-foreground rounded"
              >
                <Eye className="size-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit?.(persona)}
                className="h-6 px-2 text-[10px] gap-1 cursor-pointer hover:bg-primary/10 hover:text-primary rounded font-medium"
              >
                <Edit className="size-3" />
                Editar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete?.(persona.id)}
                className="h-6 px-1.5 text-[10px] text-destructive hover:bg-destructive/10 cursor-pointer rounded"
              >
                <Trash2 className="size-3" />
              </Button>
            </div>
          </CardFooter>
        </Card>
      )}

      {/* Details Dialog Modal */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <User className="size-4 text-primary" />
              Ficha Filiatoria de Persona
            </DialogTitle>
            <DialogDescription className="text-xs">
              Información de identidad, nacimiento y contacto registrada.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 text-xs pt-2">
            <div className="space-y-2 bg-muted/30 p-3 rounded-lg border border-border/50">
              <div className="font-semibold text-foreground text-xs border-b pb-1 flex items-center justify-between">
                <span>Identificación Personal</span>
                <StatusBadge active={persona.activo} />
              </div>
              <div className="grid grid-cols-2 gap-2 text-muted-foreground pt-1">
                <div className="col-span-2">
                  <span className="font-medium block text-foreground">Nombre Completo</span>
                  <span className="text-foreground font-semibold">{nombreCompleto}</span>
                </div>
                <div>
                  <span className="font-medium block text-foreground">Documento</span>
                  <span className="font-mono">{docFormatted}</span>
                </div>
                <div>
                  <span className="font-medium block text-foreground">ID Registro</span>
                  <span className="font-mono">#{persona.id}</span>
                </div>
                <div>
                  <span className="font-medium block text-foreground">Fecha Nacimiento</span>
                  <span>{persona.fechaNacimiento || "-"} {edad ? `(${edad})` : ""}</span>
                </div>
                <div>
                  <span className="font-medium block text-foreground">Teléfono</span>
                  <span>{persona.telefono || "-"}</span>
                </div>
                <div>
                  <span className="font-medium block text-foreground">Género</span>
                  <span className="capitalize">{persona.genero || "-"}</span>
                </div>
                <div>
                  <span className="font-medium block text-foreground">Estado Civil</span>
                  <span className="capitalize">{persona.estadoCivil || "-"}</span>
                </div>
                <div className="col-span-2">
                  <span className="font-medium block text-foreground">Dirección</span>
                  <span>{persona.direccion || "-"}</span>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
