"use client";

import * as React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SearchInput,
  DataTablePagination,
} from "@/components/shared";
import {
  MoreVertical,
  Calendar,
  CreditCard,
  Ban,
  Receipt,
  Building2,
  Store,
  Wallet,
  ArrowRight,
  User,
} from "lucide-react";
import {
  EstadoCobro,
  type CobroResponse,
} from "../types/cobro.types";
import { CobroStatusBadge } from "./cobro-status-badge";
import { Skeleton } from "@/components/ui/skeleton";

interface CobroListProps {
  cobros: CobroResponse[];
  isLoading?: boolean;
  totalItems: number;
  currentPage: number;
  pageSize: number;
  searchTerm: string;
  selectedEstadoTab?: EstadoCobro;
  selectedCobroId?: number | null;
  onEstadoTabChange?: (tab: EstadoCobro) => void;
  onSearchChange: (term: string) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onSelectCobro: (cobro: CobroResponse) => void;
  onAnular: (cobro: CobroResponse) => void;
  onRefresh?: () => void;
}

export function CobroList({
  cobros,
  isLoading = false,
  totalItems,
  currentPage,
  pageSize,
  searchTerm,
  selectedEstadoTab = EstadoCobro.Registrado,
  selectedCobroId,
  onEstadoTabChange,
  onSearchChange,
  onPageChange,
  onPageSizeChange,
  onSelectCobro,
  onAnular,
}: CobroListProps) {
  const tabs: Array<{
    key: EstadoCobro;
    label: string;
    activeClasses: string;
  }> = [
    {
      key: EstadoCobro.Registrado,
      label: "Cobrados",
      activeClasses: "bg-emerald-600 text-white shadow-xs",
    },
    {
      key: EstadoCobro.Anulado,
      label: "Anulados",
      activeClasses: "bg-rose-600 text-white shadow-xs",
    },
    {
      key: EstadoCobro.DevueltoParcial,
      label: "Dev. Parcial",
      activeClasses: "bg-amber-600 text-white shadow-xs",
    },
    {
      key: EstadoCobro.Devuelto,
      label: "Devueltos",
      activeClasses: "bg-purple-600 text-white shadow-xs",
    },
  ];

  return (
    <div className="space-y-2.5 w-full">
      {/* FILTROS EN FORMATO BADGE Y BUSCADOR */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 px-0.5">
        {/* Badges interactivos de pestañas */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {tabs.map((t) => {
            const isActive = selectedEstadoTab === t.key;
            return (
              <button
                key={t.key.toString()}
                type="button"
                onClick={() => onEstadoTabChange?.(t.key)}
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer select-none ${
                  isActive
                    ? t.activeClasses
                    : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Buscador */}
        <div className="w-full md:w-64">
          <SearchInput
            value={searchTerm}
            onChange={onSearchChange}
            placeholder="Buscar por N° cobro, venta, paciente..."
            className="h-8 text-xs bg-background shadow-2xs"
          />
        </div>
      </div>

      {/* CONTENIDO DEL LISTADO */}
      <div className="space-y-1.5">
        {isLoading ? (
          <div className="space-y-1.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="p-3 rounded-xl border border-border/50 bg-card space-y-2"
              >
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-5 w-48" />
                <div className="flex items-center gap-3">
                  <Skeleton className="h-3.5 w-24" />
                  <Skeleton className="h-3.5 w-32" />
                  <Skeleton className="h-3.5 w-20 ml-auto" />
                </div>
              </div>
            ))}
          </div>
        ) : cobros.length === 0 ? (
          <div className="py-12 text-center border border-dashed border-border/60 rounded-xl bg-muted/10 space-y-2">
            <CreditCard className="size-8 text-muted-foreground/40 mx-auto" />
            <p className="font-bold text-xs text-foreground">
              No se encontraron registros de cobro
            </p>
            <p className="text-[11px] max-w-xs mx-auto text-muted-foreground">
              Los cobros enviados desde Ventas o generados en caja aparecerán automáticamente aquí.
            </p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {cobros.map((cobro) => {
              const isSelected = selectedCobroId === cobro.id;
              const isPendingPayment =
                cobro.estado === EstadoCobro.Registrado &&
                (cobro.total === 0 || (cobro.detalles && cobro.detalles.length === 0));

              const cajaNombre =
                cobro.turnoCaja?.caja?.nombre ||
                cobro.turnoCaja?.caja?.codigo ||
                (cobro.turnoCajaId ? `Caja #${cobro.turnoCajaId}` : "-");

              const pagadorMonto = cobro.ventaPagador?.monto ?? 0;
              const numDetalles = cobro.detalles?.length || 0;
              const pacienteNombre = cobro.ventaPagador?.pacienteNombreCompleto;

              return (
                <div
                  key={cobro.id}
                  onClick={() => onSelectCobro(cobro)}
                  className={`group cursor-pointer p-3 rounded-xl transition-all shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative ${
                    isSelected
                      ? "border-primary/80 bg-primary/5 dark:bg-primary/10 shadow-xs ring-1 ring-primary/40 border"
                      : "border border-border/50 bg-card hover:border-primary/40 hover:bg-muted/25"
                  }`}
                >
                  {/* Bloque Izquierdo: Icono + Cobro # + Paciente + Venta # + Convenio + Fecha + Caja */}
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div
                      className={`size-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 border mt-0.5 transition-colors ${
                        isPendingPayment
                          ? "bg-amber-500/10 text-amber-600 border-amber-500/20 group-hover:bg-amber-500 group-hover:text-white"
                          : "bg-primary/10 text-primary border-primary/20 group-hover:bg-primary group-hover:text-primary-foreground"
                      }`}
                    >
                      {isPendingPayment ? (
                        <Wallet className="size-4.5" />
                      ) : (
                        <Receipt className="size-4.5" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-xs text-primary bg-primary/10 px-1.5 py-0.2 rounded border border-primary/20">
                          #{cobro.numero}
                        </span>

                        {pacienteNombre && (
                          <span className="font-bold text-xs text-foreground flex items-center gap-1 group-hover:text-primary transition-colors">
                            <User className="size-3 text-muted-foreground shrink-0" />
                            {pacienteNombre}
                          </span>
                        )}

                        {cobro.ventaPagador?.ventaNumero ? (
                          <span className="text-[11px] font-medium text-muted-foreground">
                            (Venta #{cobro.ventaPagador.ventaNumero})
                          </span>
                        ) : (
                          <span className="font-bold text-xs text-foreground">
                            Cobro Directo
                          </span>
                        )}

                        {cobro.ventaPagador?.convenioNombre && (
                          <span className="text-[10px] text-blue-600 dark:text-blue-400 bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.2 rounded flex items-center gap-1 font-medium">
                            <Building2 className="size-2.5" />
                            {cobro.ventaPagador.convenioNombre}
                          </span>
                        )}
                      </div>

                      {/* Detalles secundarios en línea compacta */}
                      <div className="flex items-center gap-2.5 text-[11px] text-muted-foreground flex-wrap pt-0.5">
                        {cobro.ventaPagador?.pacienteDocumento && (
                          <>
                            <span>Doc: <strong className="text-foreground font-mono">{cobro.ventaPagador.pacienteDocumento}</strong></span>
                            <span className="text-muted-foreground/40">•</span>
                          </>
                        )}

                        <span className="flex items-center gap-1">
                          <Store className="size-3 text-muted-foreground/70 shrink-0" />
                          <span>{cajaNombre}</span>
                        </span>

                        <span className="text-muted-foreground/40">•</span>

                        <span className="flex items-center gap-1">
                          <Calendar className="size-3 text-muted-foreground/70 shrink-0" />
                          <span>
                            {new Date(cobro.fechaHora).toLocaleString("es-ES", {
                              dateStyle: "short",
                              timeStyle: "short",
                            })}
                          </span>
                        </span>

                        {numDetalles > 0 && (
                          <>
                            <span className="text-muted-foreground/40">•</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                              {cobro.detalles.map((d) => d.metodoPago?.nombre).filter(Boolean).join(", ") ||
                                `${numDetalles} pago${numDetalles !== 1 ? "s" : ""}`}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bloque Derecho: Monto, Estado & Acciones */}
                  <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/30">
                    <div className="flex flex-col items-start sm:items-end pr-0.5">
                      {isPendingPayment ? (
                        <>
                          <span className="text-xs font-extrabold text-amber-600 dark:text-amber-400 font-mono">
                            Por cobrar: Bs. {pagadorMonto.toFixed(2)}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            Pendiente en caja
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                            Bs. {Number(cobro.total).toFixed(2)}
                          </span>
                          {pagadorMonto > 0 && (
                            <span className="text-[10px] text-muted-foreground">
                              Asignado: Bs. {pagadorMonto.toFixed(2)}
                            </span>
                          )}
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <CobroStatusBadge cobro={cobro} />

                      {/* Menú de Acciones Rápidas */}
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          onClick={(e) => e.stopPropagation()}
                          className="size-7 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground inline-flex items-center justify-center transition-colors border border-border/60 cursor-pointer"
                        >
                          <MoreVertical className="size-3.5" />
                          <span className="sr-only">Opciones</span>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44 text-xs">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectCobro(cobro);
                            }}
                            className="gap-2 cursor-pointer font-medium"
                          >
                            <ArrowRight className="size-3.5 text-primary" />
                            {isPendingPayment ? "Abrir y Cobrar" : "Ver Detalle"}
                          </DropdownMenuItem>

                          {cobro.estado === EstadoCobro.Registrado && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onAnular(cobro);
                                }}
                                className="gap-2 text-rose-600 dark:text-rose-400 focus:text-rose-600 cursor-pointer"
                              >
                                <Ban className="size-3.5" />
                                Anular Cobro
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* PAGINACIÓN */}
        {totalItems > 10 && (
          <div className="pt-2 px-1">
            <DataTablePagination
              currentPage={currentPage}
              pageSize={pageSize}
              totalItems={totalItems}
              onPageChange={onPageChange}
              onPageSizeChange={onPageSizeChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}
