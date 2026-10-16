"use client";

import * as React from "react";
import {
  Layers,
  Plus,
  Warehouse,
  Package,
  Calendar,
  AlertCircle,
  X,
  Edit,
  Trash2,
  CalendarCheck,
  CalendarX,
  AlertTriangle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, formatDate } from "@/lib/utils";
import type { ExistenciaResponse } from "../../existencia/types/existencia.types";
import type { ExistenciaPartidaResponse } from "../types/existencia-partida.types";
import { useExistenciasPartidas } from "../hooks/use-existencia-partida";
import { ExistenciaPartidaFormDialog } from "./existencia-partida-form-dialog";
import { ExistenciaPartidaDeleteDialog } from "./existencia-partida-delete-dialog";

interface ExistenciaPartidasModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existencia: ExistenciaResponse | null;
}

export function ExistenciaPartidasModal({
  open,
  onOpenChange,
  existencia,
}: ExistenciaPartidasModalProps) {
  const [formOpen, setFormOpen] = React.useState(false);
  const [partidaToEdit, setPartidaToEdit] =
    React.useState<ExistenciaPartidaResponse | null>(null);

  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [partidaToDelete, setPartidaToDelete] =
    React.useState<ExistenciaPartidaResponse | null>(null);

  const { data: partidasData, isLoading, refetch } = useExistenciasPartidas(
    existencia ? { existenciaId: existencia.id, pageSize: 100 } : undefined,
    { enabled: Boolean(existencia && open) }
  );

  const items = partidasData?.items ?? [];

  const totalFisicoPartidas = React.useMemo(
    () => items.reduce((acc, curr) => acc + (curr.cantidad || 0), 0),
    [items]
  );
  const totalDisponiblePartidas = React.useMemo(
    () => items.reduce((acc, curr) => acc + (curr.cantidadDisponible || 0), 0),
    [items]
  );

  const getVencimientoBadge = (fechaVencimiento?: string | null) => {
    if (!fechaVencimiento) {
      return (
        <span className="text-muted-foreground/60 text-[10px] flex items-center gap-1">
          <Calendar className="size-3 text-muted-foreground/40" />
          <span>Sin caducidad</span>
        </span>
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const parts = fechaVencimiento.split("-");
    let expDate = new Date(fechaVencimiento);
    if (parts.length === 3) {
      expDate = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    }
    expDate.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return (
        <Badge
          variant="destructive"
          className="text-[9px] px-1.5 py-0 gap-1 font-medium bg-destructive/15 text-destructive border border-destructive/30"
        >
          <CalendarX className="size-2.5" />
          <span>Vencido ({formatDate(fechaVencimiento)})</span>
        </Badge>
      );
    }

    if (diffDays <= 30) {
      return (
        <Badge
          variant="outline"
          className="text-[9px] px-1.5 py-0 gap-1 font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30"
        >
          <AlertTriangle className="size-2.5 text-amber-500" />
          <span>Vence en {diffDays}d</span>
        </Badge>
      );
    }

    return (
      <Badge
        variant="outline"
        className="text-[9px] px-1.5 py-0 gap-1 font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
      >
        <CalendarCheck className="size-2.5" />
        <span>Vigente ({formatDate(fechaVencimiento)})</span>
      </Badge>
    );
  };

  if (!existencia) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col p-6">
          <DialogHeader className="space-y-1 shrink-0 pb-3 border-b">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2 text-base font-bold">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Layers className="size-4.5" />
                </div>
                <span>Partidas y Lotes en Stock</span>
              </DialogTitle>
              <Button
                size="sm"
                onClick={() => {
                  setPartidaToEdit(null);
                  setFormOpen(true);
                }}
                className="h-7 text-xs gap-1.5 cursor-pointer"
              >
                <Plus className="size-3.5" />
                <span>Asignar Partida</span>
              </Button>
            </div>
            <DialogDescription className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap pt-1">
              <span className="font-semibold text-foreground">
                {existencia.productoNombre || `Producto #${existencia.productoId}`}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Warehouse className="size-3 text-muted-foreground" />
                {existencia.almacenNombre || `Almacén #${existencia.almacenId}`}
              </span>
              <span>•</span>
              <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-[11px] border border-border/40">
                Stock Total Almacén: <strong>{existencia.cantidad}</strong>
              </span>
            </DialogDescription>
          </DialogHeader>

          {/* KPI Summary */}
          <div className="grid grid-cols-3 gap-2 py-2 shrink-0">
            <div className="p-2.5 rounded-lg bg-muted/40 border border-border/50 text-center">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">
                Total en Partidas
              </span>
              <span className="font-mono font-bold text-sm text-foreground">
                {totalFisicoPartidas.toLocaleString()}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center">
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
                Disponible en Partidas
              </span>
              <span className="font-mono font-bold text-sm text-emerald-700 dark:text-emerald-400">
                {totalDisponiblePartidas.toLocaleString()}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-muted/40 border border-border/50 text-center">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">
                Partidas Asignadas
              </span>
              <span className="font-mono font-bold text-sm text-foreground">
                {items.length}
              </span>
            </div>
          </div>

          {/* List of partidas */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-3 border rounded-lg bg-card">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))
            ) : items.length === 0 ? (
              <div className="text-center py-8 border border-dashed rounded-lg bg-muted/20">
                <Layers className="size-8 mx-auto text-muted-foreground/50 mb-2" />
                <p className="text-xs font-semibold text-foreground">
                  No hay partidas registradas para esta existencia
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Asigne un número de partida / lote para llevar control detallado de vencimientos y costos.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setPartidaToEdit(null);
                    setFormOpen(true);
                  }}
                  className="mt-3 text-xs h-7 gap-1"
                >
                  <Plus className="size-3" />
                  <span>Asignar ahora</span>
                </Button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-lg border border-border/60 hover:border-primary/40 bg-card hover:bg-muted/20 transition-all flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-xs text-foreground bg-primary/5 text-primary px-1.5 py-0.5 rounded border border-primary/20">
                        Lote: {item.numeroPartida || `Partida #${item.partidaInventarioId}`}
                      </span>
                      {getVencimientoBadge(item.fechaVencimiento)}
                    </div>
                    <div className="text-[11px] text-muted-foreground flex items-center gap-2">
                      <span>
                        Costo: <strong className="font-mono text-foreground">${item.costoUnitario.toFixed(2)}</strong>
                      </span>
                      <span>•</span>
                      <span>
                        Valor Lote:{" "}
                        <strong className="font-mono text-primary">
                          ${(item.cantidad * item.costoUnitario).toFixed(2)}
                        </strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        Físico / Disp.
                      </div>
                      <div className="font-mono font-bold text-xs text-foreground flex items-center gap-1 justify-end">
                        <span>{item.cantidad}</span>
                        <span className="text-muted-foreground font-normal">/</span>
                        <span className="text-emerald-600 dark:text-emerald-400">
                          {item.cantidadDisponible}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 border-l pl-2 border-border/40">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 text-muted-foreground hover:text-foreground cursor-pointer"
                        onClick={() => {
                          setPartidaToEdit(item);
                          setFormOpen(true);
                        }}
                        title="Modificar Cantidad"
                      >
                        <Edit className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                        onClick={() => {
                          setPartidaToDelete(item);
                          setDeleteOpen(true);
                        }}
                        title="Desvincular Lote"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Form Dialog */}
      <ExistenciaPartidaFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        existenciaPartidaToEdit={partidaToEdit}
        preselectedExistencia={existencia}
        onSuccessCallback={() => refetch()}
      />

      {/* Delete Dialog */}
      <ExistenciaPartidaDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        existenciaPartidaToDelete={partidaToDelete}
        onSuccessCallback={() => refetch()}
      />
    </>
  );
}
