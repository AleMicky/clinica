"use client";

import * as React from "react";
import {
  Building2,
  FileText,
  Phone,
  Mail,
  MapPin,
  User,
  Clock,
  ExternalLink,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ProveedorResponse } from "../types/proveedor.types";

interface ProveedorCardProps {
  proveedor: ProveedorResponse;
  onEdit?: (proveedor: ProveedorResponse) => void;
  onDelete?: (proveedor: ProveedorResponse) => void;
  onViewAudit?: (proveedor: ProveedorResponse) => void;
  className?: string;
  compact?: boolean;
}

export function ProveedorCard({
  proveedor,
  onEdit,
  onDelete,
  onViewAudit,
  className,
  compact = false,
}: ProveedorCardProps) {
  const phone = proveedor.celular || proveedor.telefono;

  return (
    <div
      className={cn(
        "group relative border border-border/60 hover:border-primary/40 bg-card hover:bg-muted/10 rounded-lg p-3.5 transition-all shadow-2xs hover:shadow-xs flex flex-col justify-between gap-3",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex items-start gap-3 min-w-0">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary text-xs font-semibold">
            <Building2 className="size-4.5" />
          </div>

          <div className="flex flex-col gap-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-mono text-[11px] font-bold text-foreground bg-muted/80 px-1.5 py-0.5 rounded border border-border/40 shrink-0">
                {proveedor.codigo}
              </span>
              <span className="font-semibold text-xs text-foreground truncate">
                {proveedor.razonSocial}
              </span>
            </div>

            {proveedor.nombreComercial && (
              <p className="text-[11px] text-muted-foreground italic truncate">
                {proveedor.nombreComercial}
              </p>
            )}

            {proveedor.nit && (
              <div>
                <Badge
                  variant="outline"
                  className="text-[10px] font-mono h-4 px-1.5 py-0 bg-secondary/50 text-secondary-foreground border-border/50"
                >
                  NIT: {proveedor.nit}
                </Badge>
              </div>
            )}
          </div>
        </div>
      </div>

      {!compact && (
        <div className="flex flex-col gap-1.5 pt-2 border-t border-border/30 text-[11px] text-muted-foreground">
          {proveedor.contacto && (
            <div className="flex items-center gap-1.5 truncate">
              <User className="size-3 shrink-0 text-muted-foreground" />
              <span className="truncate">{proveedor.contacto}</span>
            </div>
          )}

          {phone && (
            <div className="flex items-center gap-1.5">
              <Phone className="size-3 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <a
                href={`tel:${phone}`}
                className="hover:underline text-foreground font-mono"
              >
                {phone}
              </a>
            </div>
          )}

          {proveedor.email && (
            <div className="flex items-center gap-1.5 truncate">
              <Mail className="size-3 shrink-0 text-blue-600 dark:text-blue-400" />
              <a
                href={`mailto:${proveedor.email}`}
                className="hover:underline text-foreground truncate"
              >
                {proveedor.email}
              </a>
            </div>
          )}

          {proveedor.direccion && (
            <div className="flex items-center gap-1.5 truncate" title={proveedor.direccion}>
              <MapPin className="size-3 shrink-0 text-muted-foreground" />
              <span className="truncate">{proveedor.direccion}</span>
            </div>
          )}
        </div>
      )}

      {(onEdit || onDelete || onViewAudit) && (
        <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-border/30">
          {onViewAudit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewAudit(proveedor)}
              className="h-6 px-2 text-[10px] text-muted-foreground hover:text-foreground"
            >
              <Clock className="size-3 mr-1" />
              Auditoría
            </Button>
          )}
          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(proveedor)}
              className="h-6 px-2 text-[10px]"
            >
              Editar
            </Button>
          )}
          {onDelete && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(proveedor)}
              className="h-6 px-2 text-[10px]"
            >
              Eliminar
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
