"use client";

import * as React from "react";
import { Building2, Users, FileText, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ProveedorHeaderProps {
  totalItems?: number;
  totalWithNit?: number;
  totalWithContact?: number;
}

export function ProveedorHeader({
  totalItems = 0,
  totalWithNit = 0,
  totalWithContact = 0,
}: ProveedorHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 bg-card border border-border/60 rounded-lg p-3 shadow-2xs">
      <div className="flex items-center gap-2.5">
        <div className="size-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 shadow-2xs">
          <Building2 className="size-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm sm:text-base font-bold tracking-tight text-foreground">
              Proveedores de Compras
            </h1>
            <Badge
              variant="outline"
              className="text-[10px] h-4.5 px-1.5 font-semibold text-primary border-primary/30 bg-primary/5"
            >
              {totalItems} {totalItems === 1 ? "proveedor" : "proveedores"}
            </Badge>
          </div>
          <p className="text-[11px] text-muted-foreground leading-tight">
            Gestión del catálogo de proveedores, información fiscal, canales de contacto y acuerdos comerciales.
          </p>
        </div>
      </div>

      {/* KPI Badges */}
      <div className="flex items-center gap-2 flex-wrap shrink-0">
        <Badge
          variant="outline"
          className="text-xs font-normal py-1 px-2.5 gap-1.5 bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-400"
        >
          <Building2 className="size-3.5" />
          <span>Total: <strong className="font-semibold">{totalItems.toLocaleString()}</strong></span>
        </Badge>

        <Badge
          variant="outline"
          className="text-xs font-normal py-1 px-2.5 gap-1.5 bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400"
        >
          <FileText className="size-3.5" />
          <span>Con NIT/RUC: <strong className="font-semibold">{totalWithNit.toLocaleString()}</strong></span>
        </Badge>

        <Badge
          variant="outline"
          className="text-xs font-normal py-1 px-2.5 gap-1.5 bg-violet-500/10 border-violet-500/20 text-violet-700 dark:text-violet-400"
        >
          <Users className="size-3.5" />
          <span>Con Contacto: <strong className="font-semibold">{totalWithContact.toLocaleString()}</strong></span>
        </Badge>
      </div>
    </div>
  );
}
