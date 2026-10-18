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
  User,
  ChevronRight,
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

  let ticketListContent: ReactNode;

  if (isLoading) {
    ticketListContent = (
      <div className="space-y-1.5 p-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-lg" />
        ))}
      </div>
    );
  } else if (cobros.length === 0) {
    ticketListContent = (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-2 text-muted-foreground">
        <CreditCard className="size-8 text-muted-foreground/30" />
        <p className="font-semibold text-xs text-foreground">
          Sin tickets en cola
        </p>
        <p className="text-[11px] max-w-[200px]">
          Los cobros generados aparecerán aquí para su liquidación.
        </p>
      </div>
    );
  } else {
    ticketListContent = (
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5 scrollbar-thin">
        {cobros.map((cobro) => {
          const isSelected = selectedCobroId === cobro.id;
          const isPending = cobro.estado === EstadoCobro.Registrado;

          const cajaNombre =
            cobro.turnoCaja?.caja?.nombre ||
            cobro.turnoCaja?.caja?.codigo ||
            (cobro.turnoCajaId ? `Caja #${cobro.turnoCajaId}` : "-");

          const pacienteNombre = cobro.ventaPagador?.pacienteNombreCompleto;
          const pagadorMonto = cobro.ventaPagador?.monto ?? 0;
          const montoTotal = isPending && pagadorMonto > 0 ? pagadorMonto : cobro.total;

          return (
            <div
              key={cobro.id}
              className={`group relative rounded-lg border transition-all ${
                isSelected
                  ? "bg-primary/10 border-primary shadow-xs ring-1 ring-primary/40"
                  : "bg-card/70 border-border/60 hover:bg-muted/40 hover:border-border"
              }`}
            >
              <button
                type="button"
                onClick={() => onSelectCobro(cobro)}
                aria-pressed={isSelected}
                className="w-full text-left p-2.5 rounded-lg cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {/* Línea 1: N° Cobro + Hora + Badge */}
                <div className="flex items-center justify-between gap-1 text-[11px] pr-7">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-primary bg-primary/10 px-1.5 py-0.2 rounded border border-primary/20">
                      #{cobro.numero}
                    </span>
                    <span className="text-muted-foreground text-[10px]">
                      {new Date(cobro.fechaHora).toLocaleTimeString("es-ES", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <CobroStatusBadge cobro={cobro} />
                </div>

                {/* Línea 2: Paciente */}
                <div className="mt-1">
                  <p className="font-bold text-xs text-foreground truncate group-hover:text-primary transition-colors">
                    {pacienteNombre || "Cobro directo sin paciente"}
                  </p>
                  {cobro.ventaPagador?.pacienteDocumento && (
                    <p className="text-[10px] text-muted-foreground font-mono">
                      CI: {cobro.ventaPagador.pacienteDocumento}
                    </p>
                  )}
                </div>

                {/* Línea 3: Origen y Monto Destacado */}
                <div className="flex items-center justify-between gap-2 mt-1.5 pt-1 border-t border-border/40">
                  <span className="text-[10px] text-muted-foreground truncate">
                    {cobro.ventaPagador?.ventaNumero
                      ? `Venta #${cobro.ventaPagador.ventaNumero}`
                      : cajaNombre}
                  </span>

                  <div className="flex items-center gap-1 text-right">
                    <span
                      className={`font-mono font-extrabold text-xs ${
                        isPending
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-emerald-600 dark:text-emerald-400"
                      }`}
                    >
                      {formatCurrency(montoTotal)}
                    </span>
                    <ChevronRight className="size-3.5 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              </button>

              {/* Menú de opciones secundarias (fuera del botón nativo para evitar anidación interactiva) */}
              <div className="absolute top-2 right-2 z-10">
                <DropdownMenu>
                  <DropdownMenuTrigger
                    className="size-6 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground inline-flex items-center justify-center transition-colors border border-transparent hover:border-border cursor-pointer"
                  >
                    <MoreVertical className="size-3" />
                    <span className="sr-only">Opciones</span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-36 text-xs">
                    <DropdownMenuItem
                      onClick={() => onSelectCobro(cobro)}
                      className="cursor-pointer font-medium"
                    >
                      Seleccionar Ticket
                    </DropdownMenuItem>

                    {(cobro.estado === EstadoCobro.Registrado ||
                      cobro.estado === EstadoCobro.Confirmado) && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onAnular(cobro)}
                          className="text-rose-600 dark:text-rose-400 focus:text-rose-600 cursor-pointer"
                        >
                          <Ban className="size-3.5 mr-1.5" />
                          Anular Cobro
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col border border-border/70 rounded-xl bg-card overflow-hidden shadow-2xs">
      {/* CABECERA DE LA COLA: BUSCADOR Y TABS */}
      <div className="p-2 border-b border-border/60 bg-muted/20 space-y-1.5 shrink-0">
        <SearchInput
          value={searchTerm}
          onChange={onSearchChange}
          placeholder="Buscar paciente, N°..."
          className="h-7.5 text-xs bg-background shadow-2xs w-full"
        />

        {/* Tabs Segmentados de Estado */}
        <div className="flex items-center p-0.5 rounded-lg bg-muted/60 border border-border/50 gap-0.5 w-full">
          {tabs.map((t) => {
            const isActive = selectedEstadoTab === t.key;
            return (
              <button
                key={t.key.toString()}
                type="button"
                onClick={() => onEstadoTabChange?.(t.key)}
                className={`flex-1 inline-flex items-center justify-center gap-1 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer whitespace-nowrap select-none ${
                  isActive
                    ? "bg-background text-foreground shadow-2xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
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
      </div>

      {/* CONTENIDO DE LA COLA DE TICKETS */}
      {ticketListContent}

      {/* PIE DE PAGINACIÓN */}
      {totalItems > pageSize && (
        <div className="p-1.5 border-t border-border/50 bg-muted/10 shrink-0">
          <DataTablePagination
            currentPage={currentPage}
            pageSize={pageSize}
            totalItems={totalItems}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
            itemLabel="tickets"
          />
        </div>
      )}
    </div>
  );
}
