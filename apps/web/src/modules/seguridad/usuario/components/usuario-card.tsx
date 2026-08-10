"use client";

import * as React from "react";
import {
  Mail,
  User,
  Phone,
  MapPin,
  Calendar,
  Heart,
  Edit,
  Trash2,
  KeyRound,
  Shield,
  CreditCard,
  Eye,
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
import type { UsuarioResponse, UsuarioPersonaResponse } from "../types/usuario.types";
import type { PersonaResponse } from "../../persona/types/persona.types";

interface UsuarioCardProps {
  usuario: UsuarioResponse;
  viewMode?: "grid" | "list";
  onEdit?: (usuario: UsuarioResponse) => void;
  onDelete?: (id: number) => void;
}

export function getPersonaFullName(
  persona?: UsuarioPersonaResponse | PersonaResponse | null
): string {
  if (!persona) return "Sin persona vinculada";
  const parts = [persona.nombres, persona.apellidoPaterno, persona.apellidoMaterno].filter(
    Boolean
  );
  return parts.join(" ");
}

export function getPersonaDocument(
  persona?: UsuarioPersonaResponse | PersonaResponse | null
): string {
  if (!persona) return "";
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

export function getRoleBadgeVariant(roleName: string) {
  const upper = roleName.toUpperCase();
  if (upper.includes("ADMIN"))
    return "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800";
  if (upper.includes("MEDIC") || upper.includes("DOCTOR"))
    return "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800";
  if (upper.includes("ENFERM") || upper.includes("RECEPCION"))
    return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
  return "bg-secondary/70 text-secondary-foreground border-border/60";
}

export function UsuarioCard({
  usuario,
  viewMode = "grid",
  onEdit,
  onDelete,
}: UsuarioCardProps) {
  const [detailsOpen, setDetailsOpen] = React.useState(false);
  const initials = (
    usuario.userName ? usuario.userName.substring(0, 2) : "US"
  ).toUpperCase();

  const persona = usuario.persona;
  const personaNombre = getPersonaFullName(persona);
  const personaDoc = getPersonaDocument(persona);
  const edad = persona?.fechaNacimiento ? getEdad(persona.fechaNacimiento) : null;

  return (
    <>
      {viewMode === "list" ? (
        // Ultra-Compact Horizontal List Row View
        <div className="group relative flex flex-col sm:flex-row sm:items-center justify-between p-2 sm:p-2.5 rounded-lg border border-border/60 hover:border-primary/40 bg-card hover:shadow-xs transition-all duration-200 gap-2">
          {/* Left: Avatar + User & Persona Details */}
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="relative shrink-0">
              <Avatar className="h-8 w-8 border border-border/80">
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-[11px]">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span
                className={cn(
                  "absolute -bottom-0.5 -right-0.5 size-2 rounded-full ring-2 ring-background",
                  usuario.activo ? "bg-emerald-500" : "bg-muted-foreground/40"
                )}
              />
            </div>

            <div className="flex flex-col min-w-0 flex-1 leading-tight">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-bold text-xs text-foreground group-hover:text-primary transition-colors">
                  @{usuario.userName}
                </span>
                <span className="text-[11px] text-muted-foreground flex items-center gap-0.5 truncate">
                  <Mail className="size-2.5 shrink-0" />
                  {usuario.email}
                </span>
                {usuario.debeCambiarPassword && (
                  <Badge
                    variant="outline"
                    className="text-[9px] px-1 py-0 h-3.5 bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 gap-0.5 font-medium"
                  >
                    <KeyRound className="size-2" /> Clave pendiente
                  </Badge>
                )}
              </div>

              {/* Persona Metadata Strip */}
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground flex-wrap mt-0.5">
                <span className="font-semibold text-foreground/80 flex items-center gap-1">
                  <User className="size-2.5 text-primary shrink-0" />
                  {personaNombre}
                </span>

                {personaDoc && (
                  <span className="flex items-center gap-0.5 font-mono text-[10px] bg-muted/60 px-1 py-0 rounded border border-border/30">
                    <CreditCard className="size-2.5 shrink-0 text-muted-foreground" />
                    {personaDoc}
                  </span>
                )}

                {persona?.telefono && (
                  <span className="flex items-center gap-0.5 text-[10px]">
                    <Phone className="size-2.5 shrink-0" />
                    {persona.telefono}
                  </span>
                )}

                {persona?.fechaNacimiento && (
                  <span className="flex items-center gap-0.5 text-[10px]">
                    <Calendar className="size-2.5 shrink-0" />
                    {persona.fechaNacimiento} {edad ? `(${edad})` : ""}
                  </span>
                )}

                {persona?.genero && (
                  <span className="flex items-center gap-0.5 text-[10px] capitalize">
                    {persona.genero}
                  </span>
                )}

                {persona?.estadoCivil && (
                  <span className="flex items-center gap-0.5 text-[10px] capitalize">
                    <Heart className="size-2.5 shrink-0" />
                    {persona.estadoCivil}
                  </span>
                )}

                {persona?.direccion && (
                  <span className="flex items-center gap-0.5 text-[10px] truncate max-w-[160px]">
                    <MapPin className="size-2.5 shrink-0" />
                    {persona.direccion}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Middle: Roles */}
          <div className="flex items-center gap-1 shrink-0 flex-wrap sm:max-w-xs">
            {usuario.roles && usuario.roles.length > 0 ? (
              usuario.roles.map((rol, i) => (
                <Badge
                  key={i}
                  variant="outline"
                  className={cn(
                    "text-[9px] px-1.5 py-0 h-4 font-medium rounded",
                    getRoleBadgeVariant(rol)
                  )}
                >
                  {rol}
                </Badge>
              ))
            ) : (
              <Badge
                variant="outline"
                className="text-[9px] px-1.5 py-0 h-4 text-muted-foreground"
              >
                Sin rol
              </Badge>
            )}
          </div>

          {/* Right: Status & Actions */}
          <div className="flex items-center gap-2 shrink-0 justify-end">
            <StatusBadge active={usuario.activo} />
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
                onClick={() => onEdit?.(usuario)}
                title="Editar usuario"
                className="size-6 cursor-pointer hover:bg-primary/10 hover:text-primary rounded"
              >
                <Edit className="size-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete?.(usuario.id)}
                title="Eliminar usuario"
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
              usuario.activo ? "bg-emerald-500" : "bg-destructive/60"
            )}
          />

          <CardContent className="p-3 flex flex-col gap-2">
            {/* Header: Avatar + Username/Email + Status */}
            <div className="flex items-start justify-between gap-1.5">
              <div className="flex items-center gap-2 min-w-0">
                <div className="relative shrink-0">
                  <Avatar className="h-8 w-8 border border-border/80 shadow-2xs">
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-[11px]">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span
                    className={cn(
                      "absolute -bottom-0.5 -right-0.5 size-2 rounded-full ring-2 ring-background",
                      usuario.activo ? "bg-emerald-500" : "bg-muted-foreground/40"
                    )}
                  />
                </div>
                <div className="flex flex-col leading-tight min-w-0">
                  <span className="font-bold text-xs text-foreground truncate group-hover:text-primary transition-colors">
                    @{usuario.userName}
                  </span>
                  <span className="text-[11px] text-muted-foreground truncate flex items-center gap-1">
                    <Mail className="size-2.5 shrink-0" />
                    {usuario.email}
                  </span>
                </div>
              </div>
              <StatusBadge active={usuario.activo} />
            </div>

            {/* Security Alert */}
            {usuario.debeCambiarPassword && (
              <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-300 text-[10px] font-medium border border-amber-500/20">
                <KeyRound className="size-3 shrink-0" />
                <span>Debe cambiar su contraseña</span>
              </div>
            )}

            {/* Rich Persona Info Block */}
            <div className="flex flex-col gap-1 bg-muted/40 p-2 rounded-md border border-border/30 text-[11px]">
              <div className="flex items-center justify-between gap-1">
                <span className="font-semibold text-foreground truncate flex items-center gap-1">
                  <User className="size-3 text-primary shrink-0" />
                  {personaNombre}
                </span>
                {persona?.genero && (
                  <span className="text-[9px] text-muted-foreground capitalize bg-background/60 px-1 rounded border border-border/20">
                    {persona.genero}
                  </span>
                )}
              </div>

              {persona ? (
                <div className="grid grid-cols-2 gap-x-1.5 gap-y-0.5 text-[10px] text-muted-foreground pt-1 border-t border-border/20">
                  {personaDoc && (
                    <span className="font-mono flex items-center gap-1 truncate col-span-2 sm:col-span-1">
                      <CreditCard className="size-2.5 shrink-0 text-muted-foreground/70" />
                      {personaDoc}
                    </span>
                  )}

                  {persona.telefono && (
                    <span className="flex items-center gap-1 truncate">
                      <Phone className="size-2.5 shrink-0 text-muted-foreground/70" />
                      {persona.telefono}
                    </span>
                  )}

                  {persona.fechaNacimiento && (
                    <span className="flex items-center gap-1 truncate">
                      <Calendar className="size-2.5 shrink-0 text-muted-foreground/70" />
                      {persona.fechaNacimiento} {edad ? `(${edad})` : ""}
                    </span>
                  )}

                  {persona.estadoCivil && (
                    <span className="flex items-center gap-1 truncate capitalize">
                      <Heart className="size-2.5 shrink-0 text-muted-foreground/70" />
                      {persona.estadoCivil}
                    </span>
                  )}

                  {persona.direccion && (
                    <span className="flex items-center gap-1 truncate col-span-2 text-foreground/80 pt-0.5">
                      <MapPin className="size-2.5 shrink-0 text-muted-foreground/70" />
                      <span className="truncate">{persona.direccion}</span>
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-[10px] text-muted-foreground italic">
                  Sin persona asociada
                </span>
              )}
            </div>

            {/* Roles Section */}
            <div className="flex flex-wrap items-center gap-1">
              {usuario.roles && usuario.roles.length > 0 ? (
                usuario.roles.map((rol, i) => (
                  <Badge
                    key={i}
                    variant="outline"
                    className={cn(
                      "text-[9px] px-1.5 py-0 h-4 font-medium rounded",
                      getRoleBadgeVariant(rol)
                    )}
                  >
                    <Shield className="size-2 mr-0.5" />
                    {rol}
                  </Badge>
                ))
              ) : (
                <Badge
                  variant="outline"
                  className="text-[9px] px-1.5 py-0 h-4 text-muted-foreground"
                >
                  Sin rol
                </Badge>
              )}
            </div>
          </CardContent>

          {/* Footer */}
          <CardFooter className="px-3 py-1.5 bg-muted/20 border-t border-border/30 flex items-center justify-between h-7">
            <span className="text-[9px] font-mono text-muted-foreground">
              ID #{usuario.id}
            </span>
            <div className="flex items-center gap-0.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDetailsOpen(true)}
                title="Ver detalles"
                className="h-6 px-1.5 text-[10px] gap-1 cursor-pointer hover:bg-muted text-muted-foreground rounded"
              >
                <Eye className="size-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit?.(usuario)}
                className="h-6 px-2 text-[10px] gap-1 cursor-pointer hover:bg-primary/10 hover:text-primary rounded font-medium"
              >
                <Edit className="size-3" />
                Editar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete?.(usuario.id)}
                className="h-6 px-1.5 text-[10px] text-destructive hover:bg-destructive/10 cursor-pointer rounded"
              >
                <Trash2 className="size-3" />
              </Button>
            </div>
          </CardFooter>
        </Card>
      )}

      {/* User Details Dialog Modal */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <User className="size-4 text-primary" />
              Detalles del Usuario
            </DialogTitle>
            <DialogDescription className="text-xs">
              Información completa del usuario y su persona vinculada.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 text-xs pt-2">
            {/* Cuenta de Usuario */}
            <div className="space-y-2 bg-muted/30 p-3 rounded-lg border border-border/50">
              <div className="font-semibold text-foreground text-xs border-b pb-1 flex items-center justify-between">
                <span>Cuenta de Acceso</span>
                <StatusBadge active={usuario.activo} />
              </div>
              <div className="grid grid-cols-2 gap-2 text-muted-foreground pt-1">
                <div>
                  <span className="font-medium block text-foreground">Nombre de Usuario</span>
                  <span>@{usuario.userName}</span>
                </div>
                <div>
                  <span className="font-medium block text-foreground">Correo Electrónico</span>
                  <span>{usuario.email}</span>
                </div>
                <div>
                  <span className="font-medium block text-foreground">Clave Pendiente</span>
                  <span>{usuario.debeCambiarPassword ? "Sí (Debe cambiar)" : "No"}</span>
                </div>
                <div>
                  <span className="font-medium block text-foreground">ID Registro</span>
                  <span className="font-mono">#{usuario.id}</span>
                </div>
              </div>
              <div className="pt-1">
                <span className="font-medium block text-foreground mb-1">Roles Asignados</span>
                <div className="flex flex-wrap gap-1">
                  {usuario.roles && usuario.roles.length > 0 ? (
                    usuario.roles.map((r, i) => (
                      <Badge key={i} variant="outline" className={getRoleBadgeVariant(r)}>
                        {r}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-muted-foreground italic">Sin roles asignados</span>
                  )}
                </div>
              </div>
            </div>

            {/* Persona Vinculada */}
            <div className="space-y-2 bg-muted/30 p-3 rounded-lg border border-border/50">
              <div className="font-semibold text-foreground text-xs border-b pb-1">
                Datos Personales
              </div>
              {persona ? (
                <div className="grid grid-cols-2 gap-2 text-muted-foreground pt-1">
                  <div className="col-span-2">
                    <span className="font-medium block text-foreground">Nombre Completo</span>
                    <span className="text-foreground font-semibold">{personaNombre}</span>
                  </div>
                  <div>
                    <span className="font-medium block text-foreground">Documento</span>
                    <span className="font-mono">{personaDoc || "-"}</span>
                  </div>
                  <div>
                    <span className="font-medium block text-foreground">Fecha de Nacimiento</span>
                    <span>{persona.fechaNacimiento || "-"} {edad ? `(${edad})` : ""}</span>
                  </div>
                  <div>
                    <span className="font-medium block text-foreground">Teléfono / Celular</span>
                    <span>{persona.telefono || "-"}</span>
                  </div>
                  <div>
                    <span className="font-medium block text-foreground">Género / Estado Civil</span>
                    <span className="capitalize">{persona.genero || "-"} / {persona.estadoCivil || "-"}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="font-medium block text-foreground">Dirección</span>
                    <span>{persona.direccion || "-"}</span>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground italic py-1">Sin información personal vinculada.</p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
