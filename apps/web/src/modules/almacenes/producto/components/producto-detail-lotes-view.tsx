"use client";

import * as React from "react";
import {
  Boxes,
  CalendarClock,
  Edit2,
  History,
  Layers,
  Scale,
  Tag,
  Trash2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
    <div className="flex flex-col h-full bg-card rounded-xl border border-border/60 shadow-2xs overflow-hidden">
      {/* 1. Header Card: Selected Product Info */}
      <div className="p-4 sm:p-5 border-b border-border/40 bg-muted/10">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-3.5 min-w-0 flex-1">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-2xs">
              <Boxes className="size-5" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded">
                  {producto.codigo}
                </span>
                <h2 className="text-base font-bold text-foreground truncate">
                  {producto.nombre}
                </h2>
                <div className="flex items-center gap-1">
                  {producto.controlaLote && (
                    <Badge
                      variant="outline"
                      className="text-[10px] px-1.5 py-0 border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-400 gap-1 font-medium"
                    >
                      <Layers className="size-2.5" /> Lote
                    </Badge>
                  )}
                  {producto.controlaVencimiento && (
                    <Badge
                      variant="outline"
                      className="text-[10px] px-1.5 py-0 border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400 gap-1 font-medium"
                    >
                      <CalendarClock className="size-2.5" /> Vence
                    </Badge>
                  )}
                </div>
              </div>

              {/* Categoría & Unidad de Medida */}
              <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Tag className="size-3.5 text-primary" />
                  <span className="font-medium text-foreground">
                    {producto.categoriaProductoNombre || "Sin categoría"}
                  </span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Scale className="size-3.5 text-primary" />
                  <span>
                    {producto.unidadMedidaNombre}{" "}
                    {producto.unidadMedidaSimbolo && `(${producto.unidadMedidaSimbolo})`}
                  </span>
                </span>
              </div>

              {/* Stock Range Cards */}
              <div className="flex items-center gap-2.5 mt-3">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-background border border-border/50 text-xs">
                  <TrendingDown className="size-3.5 text-amber-500" />
                  <span className="text-muted-foreground text-[11px]">Mín:</span>
                  <span className="font-mono font-bold text-foreground">{producto.stockMinimo}</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-background border border-border/50 text-xs">
                  <TrendingUp className="size-3.5 text-emerald-500" />
                  <span className="text-muted-foreground text-[11px]">Máx:</span>
                  <span className="font-mono font-bold text-foreground">
                    {producto.stockMaximo !== null && producto.stockMaximo !== undefined
                      ? producto.stockMaximo
                      : "Sin límite"}
                  </span>
                </div>
              </div>

              {producto.descripcion && (
                <div className="mt-3 p-2.5 rounded-lg bg-background/80 border border-border/40 text-xs text-muted-foreground leading-relaxed">
                  {producto.descripcion}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 shrink-0 self-start">
            <TooltipProvider delay={200}>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewAuditProducto(producto)}
                      className="h-8 px-2.5 gap-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer border-border/60"
                    >
                      <History className="size-3.5" />
                      <span>Auditoría</span>
                    </Button>
                  }
                />
                <TooltipContent side="top" className="text-[11px]">
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
                      className="h-8 px-2.5 gap-1.5 text-xs cursor-pointer border-border/60"
                    >
                      <Edit2 className="size-3.5" />
                      <span>Editar</span>
                    </Button>
                  }
                />
                <TooltipContent side="top" className="text-[11px]">
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
                      className="h-8 px-2.5 gap-1.5 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30 cursor-pointer"
                    >
                      <Trash2 className="size-3.5" />
                      <span>Eliminar</span>
                    </Button>
                  }
                />
                <TooltipContent side="top" className="text-[11px]">
                  Eliminar este producto
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>

      {/* 2. Detail Section: Management of Lotes */}
      <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-primary/10 text-primary">
              <Layers className="size-3.5" />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Lotes Registrados
            </h3>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-mono">
              {lotesData?.totalItems ?? 0}
            </Badge>
          </div>
        </div>

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
