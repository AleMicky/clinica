"use client";

import * as React from "react";
import {
  Search,
  MoreVertical,
  Eye,
  CheckCircle2,
  PackageCheck,
  Ban,
  Clock,
  Pill,
  CreditCard,
  User,
  RefreshCw,
  Building2,
  Stethoscope,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTablePagination } from "@/components/shared";
import { cn, formatDate } from "@/lib/utils";
import type {
  DispensacionResponse,
  EstadoDispensacion,
} from "../types/dispensacion.types";
import type { AlmacenResponse } from "@/modules/almacenes/almacen/types/almacen.types";

interface DispensacionListProps {
  dispensaciones: DispensacionResponse[];
  almacenes?: AlmacenResponse[];
  isLoading?: boolean;
  totalItems?: number;
  currentPage?: number;
  pageSize?: number;
  searchTerm?: string;
  selectedAlmacenId?: number | null;
  selectedEstado?: EstadoDispensacion | null;
  onSearchChange?: (val: string) => void;
  onAlmacenChange?: (id: number | null) => void;
  onEstadoChange?: (estado: EstadoDispensacion | null) => void;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  onViewDetail?: (item: DispensacionResponse) => void;
  onCobrar?: (item: DispensacionResponse) => void;
  onEntregar?: (item: DispensacionResponse) => void;
  onAnular?: (item: DispensacionResponse) => void;
  onViewAudit?: (item: DispensacionResponse) => void;
  onRefresh?: () => void;
}

export function DispensacionList({
  dispensaciones,
  almacenes = [],
  isLoading = false,
  totalItems = 0,
  currentPage = 1,
  pageSize = 10,
  searchTerm = "",
  selectedAlmacenId = null,
  selectedEstado = null,
  onSearchChange,
  onAlmacenChange,
  onEstadoChange,
  onPageChange,
  onPageSizeChange,
  onViewDetail,
  onCobrar,
  onEntregar,
  onAnular,
  onViewAudit,
  onRefresh,
}: DispensacionListProps) {
  const getEstadoBadge = (estado: EstadoDispensacion) => {
    switch (estado) {
      case "PendientePago":
        return (
          <Badge
            variant="outline"
            className="text-[10px] h-4.5 px-1.5 font-bold text-amber-700 dark:text-amber-400 border-amber-500/30 bg-amber-500/10 gap-1"
          >
            <Clock className="size-2.5" /> Pendiente Caja
          </Badge>
        );
      case "Pagado":
        return (
          <Badge
            variant="outline"
            className="text-[10px] h-4.5 px-1.5 font-bold text-blue-700 dark:text-blue-400 border-blue-500/30 bg-blue-500/10 gap-1"
          >
            <CheckCircle2 className="size-2.5" /> Pagado (Listo)
          </Badge>
        );
      case "Entregado":
        return (
          <Badge
            variant="outline"
            className="text-[10px] h-4.5 px-1.5 font-bold text-emerald-700 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10 gap-1"
          >
            <PackageCheck className="size-2.5" /> Entregado
          </Badge>
        );
      case "Anulado":
        return (
          <Badge
            variant="outline"
            className="text-[10px] h-4.5 px-1.5 font-bold text-rose-700 dark:text-rose-400 border-rose-500/30 bg-rose-500/10 gap-1"
          >
            <Ban className="size-2.5" /> Anulado
          </Badge>
        );
      default:
        return null;
    }
  };

  const getTipoBadge = (tipo: string) => {
    switch (tipo) {
      case "VentaAmbulatoria":
        return (
          <Badge variant="secondary" className="text-[9px] h-4 px-1 text-muted-foreground font-medium">
            Venta Mostrador
          </Badge>
        );
      case "Hospitalaria":
        return (
          <Badge variant="secondary" className="text-[9px] h-4 px-1 text-blue-600 dark:text-blue-400 font-medium">
            Hospitalización
          </Badge>
        );
      case "Urgencia":
        return (
          <Badge variant="secondary" className="text-[9px] h-4 px-1 text-orange-600 dark:text-orange-400 font-medium">
            Urgencias
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Controls & Filter bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1">
          {/* Warehouse Selector */}
          <select
            value={selectedAlmacenId ?? ""}
            onChange={(e) => {
              const val = e.target.value;
              onAlmacenChange?.(val ? Number(val) : null);
            }}
            className="h-8 px-2.5 text-xs rounded-md border border-border/60 bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary w-full sm:w-52 cursor-pointer"
          >
            <option value="">Todos los almacenes</option>
            {almacenes.map((alm) => (
              <option key={alm.id} value={alm.id}>
                {alm.nombre} ({alm.codigo})
              </option>
            ))}
          </select>

          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Buscar por N° ticket, paciente, C.I. o documento..."
              value={searchTerm}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="pl-8 text-xs h-8 bg-background border-border/60"
            />
          </div>
        </div>

        {onRefresh && (
          <Button
            variant="outline"
            size="icon"
            onClick={onRefresh}
            disabled={isLoading}
            className="size-8 self-end sm:self-auto shrink-0 border-border/60"
            title="Recargar lista"
          >
            <RefreshCw className={cn("size-3.5", isLoading && "animate-spin")} />
          </Button>
        )}
      </div>

      {/* Status Tabs */}
      <Tabs
        value={selectedEstado ?? "TODOS"}
        onValueChange={(val) => {
          onEstadoChange?.(val === "TODOS" ? null : (val as EstadoDispensacion));
        }}
        className="w-full"
      >
        <TabsList className="h-7 p-0.5 bg-muted/60">
          <TabsTrigger value="TODOS" className="text-xs px-2.5 h-6">
            Todas
          </TabsTrigger>
          <TabsTrigger value="PendientePago" className="text-xs px-2.5 h-6">
            Pendientes en Caja
          </TabsTrigger>
          <TabsTrigger value="Pagado" className="text-xs px-2.5 h-6">
            Pagadas
          </TabsTrigger>
          <TabsTrigger value="Entregado" className="text-xs px-2.5 h-6">
            Entregadas
          </TabsTrigger>
          <TabsTrigger value="Anulado" className="text-xs px-2.5 h-6">
            Anuladas
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* List Content */}
      <div className="flex flex-col gap-2">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="p-3.5 rounded-lg border border-border/50 bg-card space-y-2"
            >
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-3 w-48" />
            </div>
          ))
        ) : dispensaciones.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-border/60 rounded-lg bg-card/40">
            <div className="size-10 rounded-full bg-teal-500/10 text-teal-600 flex items-center justify-center mb-2">
              <Pill className="size-5" />
            </div>
            <p className="text-xs font-semibold text-foreground">
              No se encontraron dispensaciones o ventas de farmacia
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Crea una nueva orden de farmacia para iniciar la preventa o dispensación.
            </p>
          </div>
        ) : (
          dispensaciones.map((item) => {
            const pacienteNombre =
              item.pacienteNombre || item.clienteNombre || "Cliente Particular";
            const documento =
              item.pacienteDocumento || item.clienteDocumento || "S/D";

            return (
              <div
                key={item.id}
                className="p-3 rounded-lg border border-border/60 bg-card hover:bg-muted/20 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xs"
              >
                {/* Left section: Ticket & Patient Info */}
                <div className="flex items-start gap-3 flex-1">
                  <div className="size-8 rounded-lg bg-teal-500/10 text-teal-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Pill className="size-4" />
                  </div>

                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-foreground">
                        {item.numero}
                      </span>
                      {getTipoBadge(item.tipo)}
                      {getEstadoBadge(item.estado)}
                      {item.comprobanteCobro && (
                        <Badge
                          variant="outline"
                          className="text-[9px] h-4 px-1.5 font-mono text-teal-700 dark:text-teal-400 border-teal-500/30 bg-teal-500/5"
                          title={`Método: ${item.metodoPago || "Caja"}`}
                        >
                          Recibo: {item.comprobanteCobro}
                        </Badge>
                      )}
                      {item.admisionNumero && (
                        <Badge
                          variant="outline"
                          className="text-[9px] h-4 px-1.5 font-mono text-blue-700 dark:text-blue-400 border-blue-500/30 bg-blue-500/5"
                        >
                          Adm: {item.admisionNumero}
                        </Badge>
                      )}
                      {item.movimientoInventarioId ? (
                        <Badge
                          variant="outline"
                          className="text-[9px] h-4 px-1.5 font-mono text-emerald-700 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/5"
                          title="Movimiento de salida confirmado en Kárdex"
                        >
                          Mov: {item.movimientoInventarioNumero || `#${item.movimientoInventarioId}`}
                        </Badge>
                      ) : item.estado === "PendientePago" || item.estado === "Pagado" ? (
                        <Badge
                          variant="outline"
                          className="text-[9px] h-4 px-1.5 font-medium text-amber-700 dark:text-amber-400 border-amber-500/25 bg-amber-500/5"
                          title="Stock reservado en almacén hasta su entrega"
                        >
                          Stock Reservado
                        </Badge>
                      ) : null}
                      <span className="text-[11px] text-muted-foreground">
                        • {formatDate(item.fecha)} • {item.almacenNombre}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-medium text-foreground">
                      <User className="size-3 text-muted-foreground" />
                      <span>{pacienteNombre}</span>
                      <span className="text-[10px] text-muted-foreground">
                        (Doc: {documento})
                      </span>
                      {item.medicoNombre && (
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1 pl-2 border-l border-border/60">
                          <Stethoscope className="size-3 text-primary" />
                          {item.medicoNombre}
                        </span>
                      )}
                    </div>

                    {/* Medicines pills preview */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                      {item.detalles.slice(0, 3).map((d) => (
                        <span
                          key={d.id}
                          className="text-[10px] px-1.5 py-0.5 bg-muted/60 text-muted-foreground rounded border border-border/40 font-mono"
                        >
                          {d.cantidad}x {d.productoNombre}
                        </span>
                      ))}
                      {item.detalles.length > 3 && (
                        <span className="text-[10px] text-muted-foreground">
                          +{item.detalles.length - 3} más
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right section: Total & Action Buttons */}
                <div className="flex items-center gap-3 self-end md:self-center shrink-0">
                  <div className="text-right">
                    <div className="text-[10px] text-muted-foreground uppercase font-semibold">
                      Total a Pagar
                    </div>
                    <div className="font-mono text-sm font-bold text-foreground">
                      Bs. {item.total.toFixed(2)}
                    </div>
                  </div>

                  {/* Primary Context Actions */}
                  {item.estado === "PendientePago" && onCobrar && (
                    <Button
                      size="sm"
                      onClick={() => onCobrar(item)}
                      className="h-7 text-xs px-2.5 gap-1.5 bg-amber-600 hover:bg-amber-700 text-white cursor-pointer"
                      title="Registrar cobro en Caja"
                    >
                      <CreditCard className="size-3" />
                      <span>Cobrar</span>
                    </Button>
                  )}

                  {item.estado === "Pagado" && onEntregar && (
                    <Button
                      size="sm"
                      onClick={() => onEntregar(item)}
                      className="h-7 text-xs px-2.5 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                      title="Entregar fármacos y descontar stock"
                    >
                      <PackageCheck className="size-3" />
                      <span>Entregar</span>
                    </Button>
                  )}

                  {/* 3-dots Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      className="inline-flex size-7 items-center justify-center rounded-md hover:bg-accent text-muted-foreground transition-colors cursor-pointer"
                      aria-label="Acciones de dispensación"
                    >
                      <MoreVertical className="size-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      {onViewDetail && (
                        <DropdownMenuItem
                          onClick={() => onViewDetail(item)}
                          className="gap-2 text-xs cursor-pointer"
                        >
                          <Eye className="size-3.5 text-primary" /> Ver Ticket / Detalle
                        </DropdownMenuItem>
                      )}
                      {item.estado === "PendientePago" && onCobrar && (
                        <DropdownMenuItem
                          onClick={() => onCobrar(item)}
                          className="gap-2 text-xs cursor-pointer text-amber-600"
                        >
                          <CreditCard className="size-3.5" /> Registrar Cobro
                        </DropdownMenuItem>
                      )}
                      {item.estado === "Pagado" && onEntregar && (
                        <DropdownMenuItem
                          onClick={() => onEntregar(item)}
                          className="gap-2 text-xs cursor-pointer text-emerald-600"
                        >
                          <PackageCheck className="size-3.5" /> Entregar Medicamentos
                        </DropdownMenuItem>
                      )}
                      {onViewAudit && (
                        <DropdownMenuItem
                          onClick={() => onViewAudit(item)}
                          className="gap-2 text-xs cursor-pointer"
                        >
                          <Clock className="size-3.5" /> Ver Auditoría
                        </DropdownMenuItem>
                      )}
                      {item.estado !== "Anulado" && onAnular && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onAnular(item)}
                            className="gap-2 text-xs text-destructive focus:text-destructive cursor-pointer"
                          >
                            <Ban className="size-3.5" /> Anular Orden
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination Footer */}
      {totalItems > pageSize && (
        <DataTablePagination
          totalItems={totalItems}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={onPageChange ?? (() => {})}
          onPageSizeChange={onPageSizeChange ?? (() => {})}
        />
      )}
    </div>
  );
}
