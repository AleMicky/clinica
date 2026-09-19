"use client";

import * as React from "react";
import {
  Boxes,
  CalendarClock,
  Edit2,
  FileText,
  History,
  Info,
  Layers,
  PackageCheck,
  Scale,
  ShieldCheck,
  Tag,
  Trash2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LoteList } from "../../lote/components/lote-list";
import { LoteFormDialog } from "../../lote/components/lote-form-dialog";
import { LoteDeleteDialog } from "../../lote/components/lote-delete-dialog";
import { useLotes } from "../../lote/hooks/use-lote";
import type { LoteResponse } from "../../lote/types/lote.types";
import type { ProductoResponse } from "../types/producto.types";

interface ProductoDetailLotesViewProps {
  producto: ProductoResponse | null;
  onEditProducto: (producto: ProductoResponse) => void;
  onDeleteProducto: (producto: ProductoResponse) => void;
  onViewAuditProducto: (producto: ProductoResponse) => void;
  onViewAuditLote: (lote: LoteResponse) => void;
}

export function ProductoDetailLotesView({
  producto,
  onEditProducto,
  onDeleteProducto,
  onViewAuditProducto,
  onViewAuditLote,
}: ProductoDetailLotesViewProps) {
  // Lotes State
  const [loteSearch, setLoteSearch] = React.useState("");
  const [lotePage, setLotePage] = React.useState(1);
  const [lotePageSize, setLotePageSize] = React.useState(10);

  // Form & Delete Dialog for Lotes
  const [loteFormOpen, setLoteFormOpen] = React.useState(false);
  const [loteToEdit, setLoteToEdit] = React.useState<LoteResponse | null>(null);

  const [loteDeleteOpen, setLoteDeleteOpen] = React.useState(false);
  const [loteToDelete, setLoteToDelete] = React.useState<LoteResponse | null>(null);

  const {
    data: lotesData,
    isLoading: isLoadingLotes,
    refetch: refetchLotes,
  } = useLotes(
    {
      productoId: producto?.id ?? 0,
      search: loteSearch.trim() || undefined,
      page: lotePage,
      pageSize: lotePageSize,
    },
    { enabled: Boolean(producto?.id) }
  );

  const lotes = lotesData?.items ?? [];

  const handleOpenAddLote = () => {
    setLoteToEdit(null);
    setLoteFormOpen(true);
  };

  const handleOpenEditLote = (lote: LoteResponse) => {
    setLoteToEdit(lote);
    setLoteFormOpen(true);
  };

  const handleOpenDeleteLote = (lote: LoteResponse) => {
    setLoteToDelete(lote);
    setLoteDeleteOpen(true);
  };

  if (!producto) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center h-full bg-card rounded-xl border border-dashed border-border/70 min-h-[480px]">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-3">
          <Boxes className="size-7" />
        </div>
        <h3 className="text-sm font-bold text-foreground">Seleccione un Producto</h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm">
          Elija un producto del catálogo para ver su ficha técnica detallada y gestionar todos sus lotes registrados.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-card rounded-xl border border-border/40 shadow-2xs overflow-hidden">
      {/* 1. Header Card: Clean Product Hero */}
      <div className="p-4 border-b border-border/30 bg-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-2xs">
              <Boxes className="size-5" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-bold text-primary bg-primary/10 border border-primary/25 px-2 py-0.5 rounded-md">
                  {producto.codigo}
                </span>
                <h2 className="text-base font-bold text-foreground truncate">
                  {producto.nombre}
                </h2>
                <div className="flex items-center gap-1">
                  {producto.controlaLote && (
                    <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md border border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-400 font-medium">
                      <Layers className="size-2.5" /> Lote
                    </span>
                  )}
                  {producto.controlaVencimiento && (
                    <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400 font-medium">
                      <CalendarClock className="size-2.5" /> Vence
                    </span>
                  )}
                </div>
              </div>

              {/* Categoría & Unidad */}
              <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Tag className="size-3 text-muted-foreground/80" />
                  <span className="font-medium text-foreground text-[11px]">
                    {producto.categoriaProductoNombre || "Sin categoría"}
                  </span>
                </span>
                <span className="text-border">•</span>
                <span className="flex items-center gap-1">
                  <Scale className="size-3 text-muted-foreground/80" />
                  <span className="font-medium text-foreground text-[11px]">
                    {producto.unidadMedidaNombre || "Sin unidad"}{" "}
                    {producto.unidadMedidaSimbolo && `(${producto.unidadMedidaSimbolo})`}
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions Toolbar */}
          <div className="flex items-center gap-1 shrink-0 self-start sm:self-center">
            <TooltipProvider delay={200}>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewAuditProducto(producto)}
                      className="h-8 px-2.5 gap-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer rounded-lg"
                    >
                      <History className="size-3.5" />
                      <span>Auditoría</span>
                    </Button>
                  }
                />
                <TooltipContent side="top" className="text-xs">
                  Ver auditoría del producto
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditProducto(producto)}
                      className="h-8 px-2.5 gap-1.5 text-xs cursor-pointer border-border/50 rounded-lg shadow-2xs"
                    >
                      <Edit2 className="size-3.5" />
                      <span>Editar</span>
                    </Button>
                  }
                />
                <TooltipContent side="top" className="text-xs">
                  Editar datos del producto
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDeleteProducto(producto)}
                      className="h-8 px-2.5 gap-1.5 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30 cursor-pointer rounded-lg shadow-2xs"
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 pt-3 border-t border-border/30">
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
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Control Lote</span>
            <span className="text-xs font-semibold text-foreground mt-0.5">
              {producto.controlaLote ? "Habilitado" : "No aplica"}
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

      {/* 2. Main Tabbed Content Area */}
      <div className="p-3.5 flex-1 overflow-y-auto space-y-3">
        <Tabs defaultValue="lotes" className="w-full">
          <div className="flex items-center justify-between pb-2 border-b border-border/30">
            <TabsList className="h-8 bg-muted/40 p-0.5 rounded-lg">
              <TabsTrigger value="lotes" className="text-xs px-3 h-7 gap-1.5 cursor-pointer">
                <Layers className="size-3.5" />
                <span>Lotes</span>
                <Badge variant="secondary" className="text-[10px] px-1 py-0 font-mono font-bold bg-muted-foreground/10 text-foreground">
                  {lotesData?.totalItems ?? 0}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="ficha" className="text-xs px-3 h-7 gap-1.5 cursor-pointer">
                <FileText className="size-3.5" />
                <span>Ficha Técnica</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="lotes" className="mt-3">
            <LoteList
              lotes={lotes}
              isLoading={isLoadingLotes}
              totalItems={lotesData?.totalItems ?? 0}
              currentPage={lotePage}
              pageSize={lotePageSize}
              searchTerm={loteSearch}
              onSearchChange={(val) => {
                setLoteSearch(val);
                setLotePage(1);
              }}
              onPageChange={setLotePage}
              onPageSizeChange={(size) => {
                setLotePageSize(size);
                setLotePage(1);
              }}
              onAddLote={handleOpenAddLote}
              onEdit={handleOpenEditLote}
              onDelete={handleOpenDeleteLote}
              onViewAudit={onViewAuditLote}
              onRefresh={() => refetchLotes()}
            />
          </TabsContent>

          <TabsContent value="ficha" className="mt-3 space-y-3">
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
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/20 border border-border/30">
                  <span className="text-muted-foreground">Control de Lotes:</span>
                  <span className="font-semibold text-foreground">{producto.controlaLote ? "Sí (Exige número de lote)" : "No"}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/20 border border-border/30">
                  <span className="text-muted-foreground">Control de Vencimiento:</span>
                  <span className="font-semibold text-foreground">{producto.controlaVencimiento ? "Sí (Registra fecha de expiración)" : "No"}</span>
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
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs for Lotes */}
      <LoteFormDialog
        open={loteFormOpen}
        onOpenChange={setLoteFormOpen}
        loteToEdit={loteToEdit}
        producto={producto}
        onSuccessCallback={() => refetchLotes()}
      />

      <LoteDeleteDialog
        open={loteDeleteOpen}
        onOpenChange={setLoteDeleteOpen}
        loteToDelete={loteToDelete}
        onSuccessCallback={() => refetchLotes()}
      />
    </div>
  );
}

