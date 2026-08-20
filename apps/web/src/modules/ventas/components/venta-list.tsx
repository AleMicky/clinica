"use client";

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
  Eye,
  RefreshCw,
  XCircle,
  FileText,
  Calendar,
  CreditCard,
  CheckCircle2,
  Receipt,
  Hash,
  Send,
} from "lucide-react";
import {
  EstadoVenta,
  type VentaResponse,
} from "../types/ventas.types";
import { VentaStatusBadge } from "./venta-status-badge";
import { Skeleton } from "@/components/ui/skeleton";

interface VentaListProps {
  ventas: VentaResponse[];
  isLoading?: boolean;
  totalItems: number;
  currentPage: number;
  pageSize: number;
  searchTerm: string;
  selectedEstadoTab?: EstadoVenta;
  selectedVentaId?: number | null;
  onEstadoTabChange?: (tab: EstadoVenta) => void;
  onSearchChange: (term: string) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onViewDetail: (venta: VentaResponse) => void;
  onEnviarACaja?: (venta: VentaResponse) => void;
  onDirectChangeStatus?: (venta: VentaResponse, nuevoEstado: EstadoVenta) => void;
  onChangeStatus: (venta: VentaResponse) => void;
  onAnular: (id: number) => void;
  onRefresh?: () => void;
}

export function VentaList({
  ventas,
  isLoading = false,
  totalItems,
  currentPage,
  pageSize,
  searchTerm,
  selectedEstadoTab = EstadoVenta.Pendiente,
  selectedVentaId,
  onEstadoTabChange,
  onSearchChange,
  onPageChange,
  onPageSizeChange,
  onViewDetail,
  onEnviarACaja,
  onDirectChangeStatus,
  onChangeStatus,
  onAnular,
}: VentaListProps) {
  const tabs: Array<{
    key: EstadoVenta;
    label: string;
    activeClasses: string;
  }> = [
    { key: EstadoVenta.Pendiente, label: "Pendientes", activeClasses: "bg-amber-600 text-white shadow-xs" },
    { key: EstadoVenta.PendienteCobro, label: "En Caja", activeClasses: "bg-indigo-600 text-white shadow-xs" },
    { key: EstadoVenta.ParcialmentePagada, label: "Parciales", activeClasses: "bg-blue-600 text-white shadow-xs" },
    { key: EstadoVenta.Pagada, label: "Pagadas", activeClasses: "bg-emerald-600 text-white shadow-xs" },
    { key: EstadoVenta.Anulada, label: "Anuladas", activeClasses: "bg-rose-600 text-white shadow-xs" },
  ];

  return (
    <div className="space-y-2.5 w-full">
      {/* FILTROS EN FORMATO BADGE Y BUSCADOR */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 px-0.5">
        {/* Badges interactivos de estado */}
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
            placeholder="Buscar por N° venta, paciente..."
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
        ) : ventas.length === 0 ? (
          <div className="py-12 text-center border border-dashed border-border/60 rounded-xl bg-muted/10 space-y-2">
            <FileText className="size-8 text-muted-foreground/40 mx-auto" />
            <p className="font-bold text-xs text-foreground">No se encontraron comprobantes de venta</p>
            <p className="text-[11px] max-w-xs mx-auto text-muted-foreground">
              Intente ajustar los filtros de búsqueda o registre una nueva venta/cobro de atención.
            </p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {ventas.map((venta) => {
              const pacienteNombre = venta.paciente?.nombreCompleto || "Paciente";
              const docPaciente = venta.paciente?.numeroHistoriaClinica
                ? `(HC: ${venta.paciente.numeroHistoriaClinica})`
                : "";

              const monedaSimbolo = venta.moneda?.simbolo || (venta.moneda?.codigo === "USD" ? "$" : "Bs.");
              const numDetalles = venta.detalles?.length || 0;
              const isSelected = selectedVentaId === venta.id;

              return (
                <div
                  key={venta.id}
                  onClick={() => onViewDetail(venta)}
                  className={`group cursor-pointer p-3 rounded-xl transition-all shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative ${
                    isSelected
                      ? "border-primary/80 bg-primary/5 dark:bg-primary/10 shadow-xs ring-1 ring-primary/40 border"
                      : "border border-border/50 bg-card hover:border-primary/40 hover:bg-muted/25"
                  }`}
                >
                  {/* Bloque Izquierdo: Avatar + Paciente + Documento + Admisión + Fecha */}
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    {/* Icono / Avatar */}
                    <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 border border-primary/20 mt-0.5 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <Receipt className="size-4.5" />
                    </div>

                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-xs text-primary bg-primary/10 px-1.5 py-0.2 rounded border border-primary/20">
                          #{venta.numero}
                        </span>

                        <span className="font-bold text-xs text-foreground group-hover:text-primary transition-colors truncate">
                          {pacienteNombre}
                        </span>

                        {docPaciente && (
                          <span className="text-[11px] text-muted-foreground font-mono">
                            {docPaciente}
                          </span>
                        )}
                      </div>

                      {/* Detalles secundarios en línea compacta */}
                      <div className="flex items-center gap-2.5 text-[11px] text-muted-foreground flex-wrap pt-0.5">
                        <span className="flex items-center gap-1 font-medium text-foreground">
                          <Hash className="size-3 text-primary/70 shrink-0" />
                          Admisión #{venta.admisionId}
                        </span>

                        <span className="text-muted-foreground/40">•</span>

                        <span className="flex items-center gap-1">
                          <Calendar className="size-3 text-muted-foreground/70 shrink-0" />
                          <span>
                            {new Date(venta.fecha).toLocaleString("es-ES", {
                              dateStyle: "short",
                              timeStyle: "short",
                            })}
                          </span>
                        </span>

                        {venta.vendedor?.nombreCompleto && (
                          <>
                            <span className="text-muted-foreground/40">•</span>
                            <span className="text-muted-foreground">
                              Cajero: <strong className="text-foreground font-normal">{venta.vendedor.nombreCompleto}</strong>
                            </span>
                          </>
                        )}

                        {numDetalles > 0 && (
                          <>
                            <span className="text-muted-foreground/40">•</span>
                            <span className="flex items-center gap-1">
                              <CreditCard className="size-3 text-blue-600/70 shrink-0" />
                              <span>{numDetalles} ítem{numDetalles !== 1 ? "s" : ""}</span>
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bloque Derecho: Monto, Estado & Acciones */}
                  <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/30">
                    <div className="flex flex-col items-start sm:items-end pr-0.5">
                      <span className="text-xs font-extrabold text-foreground font-mono">
                        {monedaSimbolo} {venta.total.toFixed(2)}
                      </span>
                      {venta.descuento > 0 && (
                        <span className="text-[10px] text-emerald-600 font-medium">
                          Desc: -{monedaSimbolo} {venta.descuento.toFixed(2)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <VentaStatusBadge estado={venta.estado} />

                      {/* Menú de Acciones Rápidas */}
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          onClick={(e) => e.stopPropagation()}
                          className="size-7 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground inline-flex items-center justify-center transition-colors border border-border/60 cursor-pointer"
                        >
                          <MoreVertical className="size-3.5" />
                          <span className="sr-only">Más opciones</span>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 text-xs">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              onViewDetail(venta);
                            }}
                            className="gap-2 cursor-pointer"
                          >
                            <Eye className="size-3.5 text-primary" />
                            Ver Ficha Detalle
                          </DropdownMenuItem>

                          {venta.estado !== EstadoVenta.Anulada && (
                            <>
                              <DropdownMenuSeparator />
                              {venta.estado === EstadoVenta.Pendiente && (
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onEnviarACaja ? onEnviarACaja(venta) : onChangeStatus(venta);
                                  }}
                                  className="gap-2 text-indigo-600 dark:text-indigo-400 cursor-pointer font-medium"
                                >
                                  <Send className="size-3.5" />
                                  Mandar a Caja
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onChangeStatus(venta);
                                }}
                                className="gap-2 cursor-pointer"
                              >
                                <RefreshCw className="size-3.5 text-amber-500" />
                                Cambiar Estado
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onAnular(venta.id);
                                }}
                                className="gap-2 text-rose-600 dark:text-rose-400 focus:text-rose-600 cursor-pointer"
                              >
                                <XCircle className="size-3.5" />
                                Anular Comprobante
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

        {/* PAGINACIÓN: Solo se muestra si hay más de 10 registros */}
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
