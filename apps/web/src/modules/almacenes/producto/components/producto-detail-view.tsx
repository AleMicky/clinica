"use client";

import * as React from "react";
import {
  Package,
  CalendarClock,
  ShieldCheck,
  FileText,
  Info,
  Clock,
  Edit,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ProductoResponse } from "../types/producto.types";

interface ProductoDetailViewProps {
  producto: ProductoResponse | null;
  onEditProducto?: (producto: ProductoResponse) => void;
  onDeleteProducto?: (producto: ProductoResponse) => void;
  onViewAuditProducto?: (producto: ProductoResponse) => void;
}

export function ProductoDetailView({
  producto,
  onEditProducto,
  onDeleteProducto,
  onViewAuditProducto,
}: ProductoDetailViewProps) {
  if (!producto) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-border/40 bg-card/60 min-h-[460px]">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-muted/40 text-muted-foreground mb-3">
          <Package className="size-7 stroke-1" />
        </div>
        <p className="text-sm font-semibold text-foreground">Selecciona un producto</p>
        <p className="text-xs text-muted-foreground mt-1 max-w-xs">
          Haz clic en cualquier producto de la lista izquierda para consultar sus detalles técnicos y parámetros.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col rounded-2xl border border-border/40 bg-card overflow-hidden shadow-2xs min-h-[460px]">
      {/* 1. Header Ficha del Producto */}
      <div className="p-4 bg-muted/20 border-b border-border/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
              <Package className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                  {producto.codigo}
                </span>
                {producto.categoriaProductoNombre && (
                  <Badge variant="outline" className="text-xs font-normal border-border/60">
                    {producto.categoriaProductoNombre}
                  </Badge>
                )}
                {producto.marcaNombre && (
                  <Badge variant="secondary" className="text-xs font-normal">
                    {producto.marcaNombre}
                  </Badge>
                )}
              </div>
              <h2 className="text-base font-bold text-foreground mt-1 leading-snug">
                {producto.nombre}
              </h2>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewAuditProducto?.(producto)}
                      className="h-8 px-2.5 text-xs gap-1.5 border-border/60 hover:bg-muted cursor-pointer"
                    >
                      <Clock className="size-3.5 text-muted-foreground" />
                      <span className="hidden sm:inline">Auditoría</span>
                    </Button>
                  }
                />
                <TooltipContent side="top" className="text-xs">
                  Historial de creación y cambios
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditProducto?.(producto)}
                      className="h-8 px-2.5 text-xs gap-1.5 border-border/60 hover:bg-muted cursor-pointer"
                    >
                      <Edit className="size-3.5 text-muted-foreground" />
                      <span>Editar</span>
                    </Button>
                  }
                />
                <TooltipContent side="top" className="text-xs">
                  Modificar datos del producto
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDeleteProducto?.(producto)}
                      className="h-8 px-2.5 text-xs gap-1.5 border-border/60 hover:border-destructive/30 hover:bg-destructive/10 text-destructive cursor-pointer"
                    >
                      <Trash2 className="size-3.5" />
                      <span>Eliminar</span>
                    </Button>
                  }
                />
                <TooltipContent side="top" className="text-xs">
                  Eliminar este producto
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Quick KPI Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3 pt-3 border-t border-border/30">
          <div className="flex flex-col p-2 rounded-lg bg-muted/20 border border-border/30">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Stock Mínimo</span>
            <span className="font-mono text-sm font-bold text-foreground mt-0.5">{producto.stockMinimo}</span>
          </div>
          <div className="flex flex-col p-2 rounded-lg bg-muted/20 border border-border/30">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Stock Máximo</span>
            <span className="font-mono text-sm font-bold text-foreground mt-0.5">
              {producto.stockMaximo !== null && producto.stockMaximo !== undefined ? producto.stockMaximo : "Sin límite"}
            </span>
          </div>
          <div className="flex flex-col p-2 rounded-lg bg-muted/20 border border-border/30">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Control Vencimiento</span>
            <span className="text-xs font-semibold text-foreground mt-0.5">
              {producto.controlaVencimiento ? "Habilitado" : "No aplica"}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Main Content Area */}
      <div className="p-4 flex-1 overflow-y-auto space-y-4">
        {/* Descripción */}
        <div className="p-3.5 rounded-xl border border-border/40 bg-card space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
            <Info className="size-3.5 text-primary" />
            <span>Descripción General</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {producto.descripcion || "Sin descripción detallada registrada."}
          </p>
        </div>

        {/* Ficha de Especificaciones */}
        <div className="p-3.5 rounded-xl border border-border/40 bg-card space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
            <ShieldCheck className="size-3.5 text-primary" />
            <span>Configuración y Parámetros</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/20 border border-border/30">
              <span className="text-muted-foreground">Categoría Principal:</span>
              <span className="font-semibold text-foreground">{producto.categoriaProductoNombre || "—"}</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/20 border border-border/30">
              <span className="text-muted-foreground">Unidad de Medida:</span>
              <span className="font-semibold text-foreground">
                {producto.unidadMedidaNombre || "—"}{" "}
                {producto.unidadMedidaSimbolo ? `(${producto.unidadMedidaSimbolo})` : ""}
              </span>
            </div>
            {producto.marcaNombre && (
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/20 border border-border/30">
                <span className="text-muted-foreground">Marca:</span>
                <span className="font-semibold text-foreground">{producto.marcaNombre}</span>
              </div>
            )}
            {producto.proveedorRazonSocial && (
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/20 border border-border/30">
                <span className="text-muted-foreground">Proveedor Habitual:</span>
                <span className="font-semibold text-foreground">{producto.proveedorRazonSocial}</span>
              </div>
            )}
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/20 border border-border/30">
              <span className="text-muted-foreground">Control de Vencimiento:</span>
              <span className="font-semibold text-foreground">
                {producto.controlaVencimiento ? "Sí (Registra fecha de expiración)" : "No"}
              </span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/20 border border-border/30">
              <span className="text-muted-foreground">Umbral de Stock Mínimo:</span>
              <span className="font-mono font-bold text-foreground">{producto.stockMinimo} unidades</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/20 border border-border/30">
              <span className="text-muted-foreground">Umbral de Stock Máximo:</span>
              <span className="font-mono font-bold text-foreground">
                {producto.stockMaximo !== null && producto.stockMaximo !== undefined ? `${producto.stockMaximo} unidades` : "Sin límite"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
