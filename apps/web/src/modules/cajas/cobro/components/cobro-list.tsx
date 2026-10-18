"use client";

import { type ReactNode } from "react";
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
  Vault,
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
  isCompact?: boolean;
  totalItems: number;
  currentPage: number;
  pageSize: number;
  searchTerm: string;
  selectedEstadoTab?: EstadoCobro | "TODOS";
  selectedCobroId?: number | null;
  onEstadoTabChange?: (tab: EstadoCobro | "TODOS") => void;
  onSearchChange: (term: string) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onSelectCobro: (cobro: CobroResponse) => void;
  onAnular: (cobro: CobroResponse) => void;
}

function formatCurrency(amount?: number | null): string {
  return `Bs. ${Number(amount || 0).toLocaleString("es-BO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function CobroList({
  cobros,
  isLoading = false,
  isCompact = false,
  totalItems,
  currentPage,
  pageSize,
  searchTerm,
  selectedEstadoTab = "TODOS",
  selectedCobroId,
  onEstadoTabChange,
  onSearchChange,
  onPageChange,
  onPageSizeChange,
  onSelectCobro,
  onAnular,
}: Readonly<CobroListProps>) {
  const tabs: Array<{
    key: EstadoCobro | "TODOS";
    label: string;
    dotColor?: string;
  }> = [
    {
      key: "TODOS",
      label: "Todos",
    },
    {
      key: EstadoCobro.Registrado,
      label: "Por Cobrar",
      dotColor: "bg-amber-500",
    },
    {
      key: EstadoCobro.Confirmado,
      label: "Cobrados",
      dotColor: "bg-emerald-500",
    },
    {
      key: EstadoCobro.Anulado,
      label: "Anulados",
      dotColor: "bg-rose-500",
    },
  ];

  let content: ReactNode;
  if (isLoading) {
    content = (
      <div className={isCompact ? "space-y-1" : "space-y-1.5"}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton
            key={i}
            className={`${isCompact ? "h-12" : "h-16"} w-full rounded-lg`}
          />
        ))}
      </div>
    );
  } else if (cobros.length === 0) {
    content = (
      <div className="py-8 text-center border border-dashed border-border/60 rounded-xl bg-muted/10 space-y-1.5">
        <CreditCard className="size-6 text-muted-foreground/40 mx-auto" />
        <p className="font-bold text-xs text-foreground">
          No se encontraron registros de cobro
        </p>
        <p className="text-[11px] max-w-xs mx-auto text-muted-foreground">
          Los cobros enviados desde Ventas o generados en caja aparecerán automáticamente aquí.
        </p>
      </div>
    );
  } else {
    content = (
      <div className={isCompact ? "space-y-1" : "space-y-1.5"}>
        {cobros.map((cobro) => {
          const isSelected = selectedCobroId === cobro.id;
          const isPendingPayment = cobro.estado === EstadoCobro.Registrado;

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
              className={`group transition-all rounded-lg relative flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                isCompact ? "p-2 px-2.5" : "p-2.5 sm:p-3"
              } ${
                isSelected
                  ? "border-primary/80 bg-primary/5 dark:bg-primary/10 shadow-2xs border ring-1 ring-primary/30"
                  : "border border-border/60 bg-card hover:border-primary/40 hover:bg-muted/20"
              }`}
            >
              {/* Botón nativo accesible para selección del cobro */}
              <button
                type="button"
                onClick={() => onSelectCobro(cobro)}
                className="absolute inset-0 size-full rounded-lg cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                aria-label={`Seleccionar cobro #${cobro.numero}${pacienteNombre ? ` de ${pacienteNombre}` : ""}`}
              />

              {/* Bloque Izquierdo: Icono + Cobro # + Paciente + Venta # + Convenio + Fecha + Caja */}
              <div className="flex items-center gap-2.5 min-w-0 flex-1 pointer-events-none relative">
                <div
                  className={`rounded-md flex items-center justify-center font-bold shrink-0 border transition-colors ${
                    isCompact ? "size-7 text-[10px]" : "size-8 text-xs"
                  } ${
                    isPendingPayment
                      ? "bg-amber-500/10 text-amber-600 border-amber-500/20 group-hover:bg-amber-500 group-hover:text-white"
                      : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-white"
                  }`}
                >
                  {isPendingPayment ? (
                    <Wallet className={isCompact ? "size-3.5" : "size-4"} />
                  ) : (
                    <Receipt className={isCompact ? "size-3.5" : "size-4"} />
                  )}
                </div>

                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-mono font-bold text-[11px] text-primary bg-primary/10 px-1.5 py-0.2 rounded border border-primary/20 shrink-0">
                      #{cobro.numero}
                    </span>

                    {pacienteNombre && (
                      <span className="font-semibold text-xs text-foreground flex items-center gap-1 group-hover:text-primary transition-colors truncate max-w-[200px] sm:max-w-[260px]">
                        <User className="size-3 text-muted-foreground shrink-0" />
                        <span className="truncate">{pacienteNombre}</span>
                      </span>
                    )}

                    {cobro.ventaPagador?.ventaNumero ? (
                      <span className="text-[11px] text-muted-foreground truncate">
                        (Venta #{cobro.ventaPagador.ventaNumero})
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium text-foreground">
                        Directo
                      </span>
                    )}

                    {cobro.ventaPagador?.convenioNombre && (
                      <span className="text-[10px] text-blue-600 dark:text-blue-400 bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.2 rounded flex items-center gap-1 font-medium truncate max-w-[130px]">
                        <Building2 className="size-2.5 shrink-0" />
                        <span className="truncate">{cobro.ventaPagador.convenioNombre}</span>
                      </span>
                    )}
                  </div>

                  {/* Detalles secundarios en línea compacta */}
                  <div className="flex items-center gap-2 text-[10px] sm:text-[11px] text-muted-foreground flex-wrap">
                    {cobro.ventaPagador?.pacienteDocumento && (
                      <>
                        <span>CI: <strong className="text-foreground font-mono">{cobro.ventaPagador.pacienteDocumento}</strong></span>
                        <span className="text-muted-foreground/40">•</span>
                      </>
                    )}

                    <span className="flex items-center gap-1">
                      <Vault className="size-2.5 text-muted-foreground/70 shrink-0" />
                      <span>{cajaNombre}</span>
                    </span>

                    <span className="text-muted-foreground/40">•</span>

                    <span className="flex items-center gap-1">
                      <Calendar className="size-2.5 text-muted-foreground/70 shrink-0" />
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
              <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-border/30 relative z-10">
                <div className="flex flex-col items-start sm:items-end pr-0.5">
                  {isPendingPayment ? (
                    <>
                      <span className="text-xs font-bold text-amber-600 dark:text-amber-400 font-mono">
                        {formatCurrency(pagadorMonto)}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        Por cobrar
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                        {formatCurrency(cobro.total)}
                      </span>
                      {pagadorMonto > 0 && pagadorMonto !== cobro.total && (
                        <span className="text-[10px] text-muted-foreground font-mono">
                          Asig: {formatCurrency(pagadorMonto)}
                        </span>
                      )}
                    </>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <CobroStatusBadge cobro={cobro} />

                  {/* Menú de Acciones Rápidas */}
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      onClick={(e) => e.stopPropagation()}
                      className="size-6.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground inline-flex items-center justify-center transition-colors border border-border/50 cursor-pointer"
                    >
                      <MoreVertical className="size-3" />
                      <span className="sr-only">Opciones</span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40 text-xs">
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

                      {(cobro.estado === EstadoCobro.Registrado ||
                        cobro.estado === EstadoCobro.Confirmado) && (
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
    );
  }

  return (
    <div className="space-y-2 w-full">
      {/* FILTROS SEGMENTADOS Y BUSCADOR COMPACTO */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
        {/* Segmented Control de Pestañas */}
        <div className="inline-flex items-center p-0.5 rounded-lg bg-muted/60 border border-border/50 gap-0.5 overflow-x-auto max-w-full scrollbar-none">
          {tabs.map((t) => {
            const isActive = selectedEstadoTab === t.key;
            return (
              <button
                key={t.key.toString()}
                type="button"
                onClick={() => onEstadoTabChange?.(t.key)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer whitespace-nowrap select-none ${
                  isActive
                    ? "bg-background text-foreground shadow-2xs font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/40"
                }`}
              >
                {t.dotColor && (
                  <span
                    className={`size-1.5 rounded-full ${t.dotColor} shrink-0`}
                  />
                )}
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Buscador Rápido Compacto */}
        <div className="w-full sm:w-56 md:w-64">
          <SearchInput
            value={searchTerm}
            onChange={onSearchChange}
            placeholder="Buscar cobro, venta, paciente..."
            className="h-7.5 text-xs bg-background shadow-2xs"
          />
        </div>
      </div>

      {/* CONTENIDO DEL LISTADO */}
      <div className="space-y-1.5">
        {content}

        {/* PAGINACIÓN */}
        {totalItems > pageSize && (
          <div className="pt-1.5 px-0.5">
            <DataTablePagination
              currentPage={currentPage}
              pageSize={pageSize}
              totalItems={totalItems}
              onPageChange={onPageChange}
              onPageSizeChange={onPageSizeChange}
              itemLabel="cobros"
            />
          </div>
        )}
      </div>
    </div>
  );
}
