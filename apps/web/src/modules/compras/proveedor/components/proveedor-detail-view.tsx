"use client";

import * as React from "react";
import { Building2, Phone, Mail, MapPin, User, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ProveedorResponse } from "../types/proveedor.types";

interface ProveedorDetailViewProps {
  proveedor: ProveedorResponse | null;
  className?: string;
}

export function ProveedorDetailView({
  proveedor,
  className,
}: ProveedorDetailViewProps) {
  if (!proveedor) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground border rounded-lg border-dashed">
        <Building2 className="size-8 stroke-1 mb-2 opacity-50" />
        <p className="text-xs">No hay información de proveedor seleccionada</p>
      </div>
    );
  }

  const phone = proveedor.celular || proveedor.telefono;

  return (
    <div className={cn("flex flex-col gap-4 bg-card border border-border/60 rounded-lg p-4 shadow-2xs", className)}>
      {/* Header Info */}
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
          <Building2 className="size-5" />
        </div>
        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs font-bold text-foreground bg-muted/80 px-2 py-0.5 rounded border border-border/40">
              {proveedor.codigo}
            </span>
            <h3 className="text-sm font-bold text-foreground truncate">
              {proveedor.razonSocial}
            </h3>
          </div>
          {proveedor.nombreComercial && (
            <p className="text-xs text-muted-foreground italic mt-0.5">
              {proveedor.nombreComercial}
            </p>
          )}
        </div>
      </div>

      {/* Fiscal & Contact Info Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="flex flex-col gap-1 p-2.5 rounded-md bg-muted/20 border border-border/40">
          <span className="text-[10px] text-muted-foreground uppercase font-semibold">Identificación Fiscal</span>
          <div className="flex items-center gap-1.5 font-mono font-medium text-foreground">
            <FileText className="size-3.5 text-muted-foreground" />
            <span>{proveedor.nit || "Sin NIT registrado"}</span>
          </div>
        </div>

        <div className="flex flex-col gap-1 p-2.5 rounded-md bg-muted/20 border border-border/40">
          <span className="text-[10px] text-muted-foreground uppercase font-semibold">Persona de Contacto</span>
          <div className="flex items-center gap-1.5 font-medium text-foreground truncate">
            <User className="size-3.5 text-muted-foreground" />
            <span className="truncate">{proveedor.contacto || "Sin contacto directo"}</span>
          </div>
        </div>

        <div className="flex flex-col gap-1 p-2.5 rounded-md bg-muted/20 border border-border/40">
          <span className="text-[10px] text-muted-foreground uppercase font-semibold">Teléfono / Celular</span>
          <div className="flex items-center gap-1.5 font-mono text-foreground">
            <Phone className="size-3.5 text-emerald-600 dark:text-emerald-400" />
            {phone ? (
              <a href={`tel:${phone}`} className="hover:underline">
                {phone}
              </a>
            ) : (
              <span className="text-muted-foreground">No registrado</span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1 p-2.5 rounded-md bg-muted/20 border border-border/40">
          <span className="text-[10px] text-muted-foreground uppercase font-semibold">Correo Electrónico</span>
          <div className="flex items-center gap-1.5 text-foreground truncate">
            <Mail className="size-3.5 text-blue-600 dark:text-blue-400" />
            {proveedor.email ? (
              <a href={`mailto:${proveedor.email}`} className="hover:underline truncate">
                {proveedor.email}
              </a>
            ) : (
              <span className="text-muted-foreground">No registrado</span>
            )}
          </div>
        </div>
      </div>

      {proveedor.direccion && (
        <div className="flex items-start gap-2 p-2.5 rounded-md bg-muted/20 border border-border/40 text-xs">
          <MapPin className="size-3.5 text-muted-foreground shrink-0 mt-0.5" />
          <div>
            <span className="text-[10px] text-muted-foreground uppercase font-semibold block">Dirección</span>
            <span className="text-foreground">{proveedor.direccion}</span>
          </div>
        </div>
      )}

      {proveedor.observacion && (
        <div className="flex items-start gap-2 p-2.5 rounded-md bg-muted/20 border border-border/40 text-xs">
          <FileText className="size-3.5 text-muted-foreground shrink-0 mt-0.5" />
          <div>
            <span className="text-[10px] text-muted-foreground uppercase font-semibold block">Observaciones</span>
            <span className="text-foreground">{proveedor.observacion}</span>
          </div>
        </div>
      )}
    </div>
  );
}
