"use client";

import { type ReactNode } from "react";
import {
  SearchInput,
  DataTablePagination,
} from "@/components/shared";
import {
  FileText,
  Calendar,
  CreditCard,
  Receipt,
  Hash,
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
}: Readonly<VentaListProps>) {
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

  let content: ReactNode;
  if (isLoading) {
    content = (
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
    );
  } else if (ventas.length === 0) {
    content = (
      <div className="py-12 text-center border border-dashed border-border/60 rounded-xl bg-muted/10 space-y-2">
        <FileText className="size-8 text-muted-foreground/40 mx-auto" />
        <p className="font-bold text-xs text-foreground">No se encontraron comprobantes de venta</p>
        <p className="text-[11px] max-w-xs mx-auto text-muted-foreground">
          {searchTerm.trim()
            ? "No hay resultados para el término de búsqueda ingresado en este período."
            : "No hay comprobantes registrados con este estado para el período seleccionado."}
        </p>
      </div>
    );
  } else {
    content = (
      <div className="space-y-1.5">
        {ventas.map((venta) => {
          const isSelected = selectedVentaId === venta.id;
          const pacienteNombre = venta.paciente?.nombreCompleto || "Paciente sin asignar";
          const docPaciente = venta.paciente?.numeroHistoriaClinica
            ? `HC: ${venta.paciente.numeroHistoriaClinica}`
            : null;
          const monedaSimbolo = venta.moneda?.simbolo || "Bs.";
          const numDetalles = venta.detalles?.length || 0;

          return (
            <div
              key={venta.id}
              className={`group p-3 rounded-xl transition-all shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative ${
                isSelected
                  ? "border-primary/80 bg-primary/5 dark:bg-primary/10 shadow-xs ring-1 ring-primary/40 border"
                  : "border border-border/50 bg-card hover:border-primary/40 hover:bg-muted/25"
              }`}
            >
              <button
                type="button"
                aria-label={`Ver detalle de venta #${venta.numero} - ${pacienteNombre}`}
                onClick={() => onViewDetail(venta)}
                className="absolute inset-0 size-full cursor-pointer rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 z-0"
              />
              {/* Bloque Izquierdo: Avatar + Paciente + Documento + Admisión + Fecha */}
              <div className="pointer-events-none flex items-start gap-3 min-w-0 flex-1">
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

              {/* Bloque Derecho: Total + Estado */}
              <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/40">
                <div className="flex flex-col items-start sm:items-end">
                  <span className="text-xs font-extrabold text-foreground font-mono">
                    {monedaSimbolo} {venta.total.toFixed(2)}
                  </span>
                  {venta.descuento > 0 && (
                    <span className="text-[10px] text-emerald-600 font-medium">
                      Desc: -{monedaSimbolo} {venta.descuento.toFixed(2)}
                    </span>
                  )}
                </div>

                <div className="relative z-10 flex items-center">
                  <VentaStatusBadge estado={venta.estado} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-2.5 w-full">
      {/* FILTROS EN FORMATO BADGE Y BUSCADOR */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-2.5 px-0.5">
        {/* Badges interactivos de estado */}
        <div className="flex items-center gap-1.5 overflow-x-auto min-w-0 py-0.5 scrollbar-none">
          {tabs.map((t) => {
            const isActive = selectedEstadoTab === t.key;
            return (
              <button
                key={t.key.toString()}
                type="button"
                onClick={() => onEstadoTabChange?.(t.key)}
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer select-none ${
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
        <div className="w-full xl:w-64 shrink-0">
          <SearchInput
            value={searchTerm}
            onChange={onSearchChange}
            placeholder="Buscar por N° venta, paciente..."
            className="w-full sm:w-full"
            inputClassName="h-8 text-xs bg-background shadow-2xs"
          />
        </div>
      </div>

      {/* CONTENIDO DEL LISTADO */}
      <div className="space-y-1.5">
        {content}

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
