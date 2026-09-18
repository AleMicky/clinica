"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  SearchInput,
  DataTablePagination,
} from "@/components/shared";
import {
  Eye,
  Trash2,
  FileText,
  Building2,
  Calendar,
  Stethoscope,
  User,
  CheckCircle2,
  Send,
  ShieldCheck,
  History,
  Pencil,
  LayoutGrid,
  FileEdit,
  Ban,
  X,
  Plus,
} from "lucide-react";
import {
  EstadoAdmision,
  formatConvenioNombre,
  formatPacienteDocumento,
  formatPacienteNombre,
  type AdmisionCounts,
  type AdmisionResponse,
  type EstadoAdmisionTab,
} from "../types/admision.types";
import { AdmisionStatusBadge } from "./admision-status-badge";
import { Skeleton } from "@/components/ui/skeleton";

interface AdmisionListProps {
  admisiones: AdmisionResponse[];
  isLoading: boolean;
  totalItems: number;
  currentPage: number;
  pageSize: number;
  searchTerm: string;
  selectedEstadoTab?: EstadoAdmisionTab;
  counts?: AdmisionCounts;
  onEstadoTabChange?: (tab: EstadoAdmisionTab) => void;
  onSearchChange: (term: string) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onViewDetail: (admision: AdmisionResponse) => void;
  onEdit?: (admision: AdmisionResponse) => void;
  onDirectChangeStatus?: (admision: AdmisionResponse, nuevoEstado: EstadoAdmision) => void;
  onDelete: (id: number) => void;
  onResetFilters?: () => void;
}

function getInitials(name: string): string {
  if (!name) return "PA";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return (parts[0]?.substring(0, 2) || "PA").toUpperCase();
}

export function AdmisionList({
  admisiones,
  isLoading,
  totalItems,
  currentPage,
  pageSize,
  searchTerm,
  selectedEstadoTab = "TODOS",
  counts,
  onEstadoTabChange,
  onSearchChange,
  onPageChange,
  onPageSizeChange,
  onViewDetail,
  onEdit,
  onDirectChangeStatus,
  onDelete,
  onResetFilters,
}: AdmisionListProps) {
  const tabs: Array<{
    key: EstadoAdmisionTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    count?: number;
    activeClasses: string;
  }> = [
    {
      key: "TODOS",
      label: "Todos",
      icon: LayoutGrid,
      count: counts?.todos,
      activeClasses: "bg-primary text-primary-foreground shadow-xs shadow-primary/20",
    },
    {
      key: EstadoAdmision.Registrada,
      label: "Registradas",
      icon: FileEdit,
      count: counts?.registradas,
      activeClasses: "bg-blue-600 text-white shadow-xs shadow-blue-600/20",
    },
    {
      key: EstadoAdmision.Confirmada,
      label: "Confirmadas",
      icon: CheckCircle2,
      count: counts?.confirmadas,
      activeClasses: "bg-emerald-600 text-white shadow-xs shadow-emerald-600/20",
    },
    {
      key: EstadoAdmision.EnviadaVenta,
      label: "Enviadas a Venta",
      icon: Send,
      count: counts?.enviadasVenta,
      activeClasses: "bg-purple-600 text-white shadow-xs shadow-purple-600/20",
    },
    {
      key: EstadoAdmision.Cancelada,
      label: "Canceladas",
      icon: Ban,
      count: counts?.canceladas,
      activeClasses: "bg-rose-600 text-white shadow-xs shadow-rose-600/20",
    },
  ];

  const hasActiveFilters = Boolean(searchTerm.trim()) || selectedEstadoTab !== "TODOS";

  const handleReset = () => {
    if (onResetFilters) {
      onResetFilters();
    } else {
      onSearchChange("");
      onEstadoTabChange?.("TODOS");
    }
  };

  return (
    <div className="space-y-3 w-full">
      {/* FILTROS EN FORMATO BADGE Y BUSCADOR */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 px-0.5">
        {/* Badges interactivos de estado */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {tabs.map((t) => {
            const isActive = selectedEstadoTab === t.key;
            const Icon = t.icon;
            return (
              <button
                key={t.key.toString()}
                type="button"
                onClick={() => onEstadoTabChange?.(t.key)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer select-none ${
                  isActive
                    ? t.activeClasses
                    : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground border border-border/40"
                }`}
              >
                <Icon className="size-3.5 shrink-0 opacity-80" />
                <span>{t.label}</span>
                {typeof t.count === "number" && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold font-mono transition-colors ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-background text-muted-foreground border border-border/50"
                    }`}
                  >
                    {t.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Buscador y Limpiar */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="w-full md:w-64">
            <SearchInput
              value={searchTerm}
              onChange={onSearchChange}
              placeholder="Buscar admisión, DNI, paciente..."
              className="h-8.5 text-xs bg-background shadow-2xs"
            />
          </div>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="h-8.5 px-2 text-xs text-muted-foreground hover:text-foreground shrink-0 cursor-pointer gap-1"
              title="Restablecer filtros"
            >
              <X className="size-3.5" />
              <span className="hidden sm:inline">Limpiar</span>
            </Button>
          )}
        </div>
      </div>

      {/* CONTENIDO DEL LISTADO */}
      <div className="space-y-1.5">
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="p-3.5 rounded-xl border border-border/60 bg-card space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Skeleton className="size-9 rounded-xl" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-28" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-24 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : admisiones.length === 0 ? (
          <div className="py-14 text-center border border-dashed border-border/70 rounded-2xl bg-muted/10 space-y-3 px-4">
            <div className="size-12 rounded-2xl bg-muted flex items-center justify-center mx-auto text-muted-foreground/60 border border-border/50">
              <FileText className="size-6" />
            </div>
            <div className="space-y-1">
              <p className="font-bold text-sm text-foreground">No se encontraron admisiones</p>
              <p className="text-xs max-w-sm mx-auto text-muted-foreground">
                {hasActiveFilters
                  ? "No hay resultados para los filtros seleccionados. Intenta restablecer la búsqueda."
                  : "Aún no se han registrado admisiones para esta vista."}
              </p>
            </div>
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="text-xs gap-1.5 cursor-pointer mt-1"
              >
                <X className="size-3.5" />
                Limpiar filtros
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {admisiones.map((adm) => {
              const total =
                adm.totalAdmision ??
                adm.detalles.reduce((acc, d) => acc + (d.total || 0), 0);

              const nombreCompleto = formatPacienteNombre(adm.paciente, adm.pacienteNombre);
              const documento = formatPacienteDocumento(adm.paciente, adm.pacienteDocumento);
              const convenio =
                adm.convenio?.nombre || formatConvenioNombre(adm.convenio, adm.convenioNombre);

              const numPrestaciones = adm.detalles.length;
              const primeraPrestacion = adm.detalles[0]?.servicioNombre || "Consulta Médica";
              const initials = getInitials(nombreCompleto);

              return (
                <div
                  key={adm.id}
                  onClick={() => onViewDetail(adm)}
                  className="group cursor-pointer p-3.5 rounded-xl border border-border/60 bg-card hover:border-primary/50 hover:shadow-xs transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative"
                >
                  {/* Bloque Izquierdo: Avatar con Iniciales + Paciente + Documento + Convenio + Fecha + Prestaciones */}
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    {/* Badge / Avatar con Iniciales */}
                    <div className="size-9.5 rounded-xl bg-gradient-to-br from-primary/20 via-primary/10 to-blue-500/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 border border-primary/25 mt-0.5 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all duration-200 shadow-2xs">
                      {initials}
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">
                          #{adm.numero}
                        </span>

                        <span className="font-bold text-xs sm:text-sm text-foreground group-hover:text-primary transition-colors truncate">
                          {nombreCompleto}
                        </span>

                        <span className="text-[11px] text-muted-foreground font-mono bg-muted/60 px-1.5 py-0.2 rounded border border-border/40">
                          Doc: {documento}
                        </span>
                      </div>

                      {/* Detalles secundarios en línea compacta */}
                      <div className="flex items-center gap-2.5 text-[11px] text-muted-foreground flex-wrap pt-0.5">
                        <span className="flex items-center gap-1 font-medium text-foreground/90">
                          <Building2 className="size-3 text-primary/80 shrink-0" />
                          {convenio}
                        </span>

                        <span className="text-muted-foreground/40">•</span>

                        <span className="flex items-center gap-1">
                          <Calendar className="size-3 text-muted-foreground/70 shrink-0" />
                          <span>
                            {new Date(adm.fechaHora).toLocaleString("es-ES", {
                              dateStyle: "short",
                              timeStyle: "short",
                            })}
                          </span>
                        </span>

                        <span className="text-muted-foreground/40">•</span>

                        <span className="flex items-center gap-1">
                          <Stethoscope className="size-3 text-blue-600/80 shrink-0" />
                          <span className="truncate max-w-[200px]">
                            {numPrestaciones === 1
                              ? primeraPrestacion
                              : `${primeraPrestacion} (+${numPrestaciones - 1})`}
                          </span>
                        </span>

                        {adm.recepcionista && (
                          <>
                            <span className="text-muted-foreground/40">•</span>
                            <span className="flex items-center gap-1 text-[10.5px] text-foreground/80">
                              <User className="size-3 text-emerald-600 shrink-0" />
                              <span className="truncate max-w-[140px]" title={adm.recepcionista.nombreCompleto}>
                                {adm.recepcionista.nombreCompleto}
                              </span>
                            </span>
                          </>
                        )}
                      </div>

                      {/* Metadatos de Auditoría UX/UI */}
                      {(adm.creadoPor || adm.fechaCreacion || adm.modificadoPor) && (
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground/70 flex-wrap pt-1 border-t border-border/30 mt-1">
                          {adm.creadoPor && (
                            <span className="flex items-center gap-1">
                              <ShieldCheck className="size-2.5 text-primary/70 shrink-0" />
                              <span>
                                Creado por: <strong className="text-foreground/75 font-medium">{adm.creadoPor}</strong>
                              </span>
                              {adm.fechaCreacion && (
                                <span className="font-mono text-[9.5px] text-muted-foreground/60">
                                  ({new Date(adm.fechaCreacion).toLocaleString("es-ES", {
                                    dateStyle: "short",
                                    timeStyle: "short",
                                  })})
                                </span>
                              )}
                            </span>
                          )}

                          {adm.modificadoPor && (
                            <>
                              <span className="text-muted-foreground/30">•</span>
                              <span className="flex items-center gap-1">
                                <History className="size-2.5 text-amber-600/70 shrink-0" />
                                <span>
                                  Modificado por: <strong className="text-foreground/75 font-medium">{adm.modificadoPor}</strong>
                                </span>
                                {adm.fechaModificacion && (
                                  <span className="font-mono text-[9.5px] text-muted-foreground/60">
                                    ({new Date(adm.fechaModificacion).toLocaleString("es-ES", {
                                      dateStyle: "short",
                                      timeStyle: "short",
                                    })})
                                  </span>
                                )}
                              </span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bloque Derecho: Precio, Estado & Acciones */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/30">
                    <div className="flex flex-col items-start sm:items-end pr-0.5">
                      <span className="text-sm font-black text-foreground font-mono tracking-tight">
                        Bs. {total.toFixed(2)}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-medium">
                        {numPrestaciones} prestación{numPrestaciones !== 1 ? "es" : ""}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <AdmisionStatusBadge estado={adm.estado} />

                      {/* Botón directo de flujo según estado (Sin Modal) */}
                      {adm.estado === EstadoAdmision.Registrada && (
                        <Button
                          type="button"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDirectChangeStatus?.(adm, EstadoAdmision.Confirmada);
                          }}
                          className="h-7.5 px-2.5 text-[11px] font-semibold gap-1 bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs cursor-pointer transition-all hover:scale-[1.02]"
                          title="Confirmar admisión directamente"
                        >
                          <CheckCircle2 className="size-3" />
                          <span>Confirmar</span>
                        </Button>
                      )}

                      {adm.estado === EstadoAdmision.Confirmada && (
                        <Button
                          type="button"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDirectChangeStatus?.(adm, EstadoAdmision.EnviadaVenta);
                          }}
                          className="h-7.5 px-2.5 text-[11px] font-semibold gap-1 bg-purple-600 hover:bg-purple-700 text-white shadow-2xs cursor-pointer transition-all hover:scale-[1.02]"
                          title="Enviar admisión a Venta/Facturación"
                        >
                          <Send className="size-3" />
                          <span>Enviar a Venta</span>
                        </Button>
                      )}

                      {/* Botón Ver Ficha Visible */}
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewDetail(adm);
                        }}
                        className="h-7.5 px-2.5 text-[11px] font-semibold gap-1 border-border/80 text-foreground hover:bg-accent hover:text-primary shadow-2xs cursor-pointer transition-all"
                        title="Ver Ficha y Detalle de Admisión"
                      >
                        <Eye className="size-3 text-primary" />
                        <span>Ver Ficha</span>
                      </Button>

                      {/* Botón Editar Visible (Solo en estado Registrada) */}
                      {adm.estado === EstadoAdmision.Registrada && onEdit && (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(adm);
                          }}
                          className="h-7.5 px-2.5 text-[11px] font-semibold gap-1 border-amber-500/30 text-amber-700 dark:text-amber-400 hover:bg-amber-500/10 shadow-2xs cursor-pointer transition-all"
                          title="Editar Admisión y Servicios"
                        >
                          <Pencil className="size-3" />
                          <span>Editar</span>
                        </Button>
                      )}

                      {/* Botón Cancelar Visible */}
                      {adm.estado !== EstadoAdmision.Cancelada && (
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(adm.id);
                          }}
                          className="h-7.5 px-2 text-[11px] font-semibold gap-1 text-destructive/80 hover:text-destructive hover:bg-destructive/10 cursor-pointer transition-all"
                          title="Cancelar admisión"
                        >
                          <Trash2 className="size-3" />
                          <span>Cancelar</span>
                        </Button>
                      )}
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
