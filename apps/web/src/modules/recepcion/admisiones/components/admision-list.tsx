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
}: AdmisionListProps) {
  const tabs: Array<{
    key: EstadoAdmisionTab;
    label: string;
    count?: number;
    activeClasses: string;
  }> = [
    {
      key: "TODOS",
      label: "Todos",
      count: counts?.todos,
      activeClasses: "bg-primary text-primary-foreground shadow-xs",
    },
    {
      key: EstadoAdmision.Registrada,
      label: "Registradas",
      count: counts?.registradas,
      activeClasses: "bg-blue-600 text-white shadow-xs",
    },
    {
      key: EstadoAdmision.Confirmada,
      label: "Confirmadas",
      count: counts?.confirmadas,
      activeClasses: "bg-emerald-600 text-white shadow-xs",
    },
    {
      key: EstadoAdmision.EnviadaVenta,
      label: "Enviadas a Venta",
      count: counts?.enviadasVenta,
      activeClasses: "bg-purple-600 text-white shadow-xs",
    },
    {
      key: EstadoAdmision.Cancelada,
      label: "Canceladas",
      count: counts?.canceladas,
      activeClasses: "bg-rose-600 text-white shadow-xs",
    },
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
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer select-none ${
                  isActive
                    ? t.activeClasses
                    : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
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

        {/* Buscador */}
        <div className="w-full md:w-64">
          <SearchInput
            value={searchTerm}
            onChange={onSearchChange}
            placeholder="Buscar admisión, DNI, paciente..."
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
        ) : admisiones.length === 0 ? (
          <div className="py-12 text-center border border-dashed border-border/60 rounded-xl bg-muted/10 space-y-2">
            <FileText className="size-8 text-muted-foreground/40 mx-auto" />
            <p className="font-bold text-xs text-foreground">No se encontraron admisiones</p>
            <p className="text-[11px] max-w-xs mx-auto text-muted-foreground">
              Intente ajustar los filtros de búsqueda o registre una nueva admisión de paciente.
            </p>
          </div>
        ) : (
          <div className="space-y-1.5">
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

              return (
                <div
                  key={adm.id}
                  onClick={() => onViewDetail(adm)}
                  className="group cursor-pointer p-3 rounded-xl border border-border/50 bg-card hover:border-primary/40 hover:bg-muted/25 transition-all shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative"
                >
                  {/* Bloque Izquierdo: Avatar + Paciente + Documento + Convenio + Fecha + Prestaciones */}
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    {/* Badge Icono / Avatar */}
                    <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 border border-primary/20 mt-0.5 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <User className="size-4.5" />
                    </div>

                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-xs text-primary bg-primary/10 px-1.5 py-0.2 rounded border border-primary/20">
                          #{adm.numero}
                        </span>

                        <span className="font-bold text-xs text-foreground group-hover:text-primary transition-colors truncate">
                          {nombreCompleto}
                        </span>

                        <span className="text-[11px] text-muted-foreground font-mono">
                          (Doc: {documento})
                        </span>
                      </div>

                      {/* Detalles secundarios en línea compacta */}
                      <div className="flex items-center gap-2.5 text-[11px] text-muted-foreground flex-wrap pt-0.5">
                        <span className="flex items-center gap-1 font-medium text-foreground">
                          <Building2 className="size-3 text-primary/70 shrink-0" />
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
                          <Stethoscope className="size-3 text-blue-600/70 shrink-0" />
                          <span>
                            {numPrestaciones === 1
                              ? primeraPrestacion
                              : `${primeraPrestacion} +${numPrestaciones - 1}`}
                          </span>
                        </span>

                        {adm.recepcionista && (
                          <>
                            <span className="text-muted-foreground/40">•</span>
                            <span className="flex items-center gap-1 text-[10.5px] text-foreground/80">
                              <User className="size-3 text-emerald-600 shrink-0" />
                              <span className="truncate max-w-[150px]" title={adm.recepcionista.nombreCompleto}>
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
                  <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/30">
                    <div className="flex flex-col items-start sm:items-end pr-0.5">
                      <span className="text-xs font-extrabold text-foreground font-mono">
                        Bs. {total.toFixed(2)}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
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
                          className="h-7 px-2.5 text-[11px] font-semibold gap-1 bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs cursor-pointer transition-all hover:scale-[1.02]"
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
                          className="h-7 px-2.5 text-[11px] font-semibold gap-1 bg-purple-600 hover:bg-purple-700 text-white shadow-2xs cursor-pointer transition-all hover:scale-[1.02]"
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
                        className="h-7 px-2.5 text-[11px] font-semibold gap-1 border-border/80 text-foreground hover:bg-accent hover:text-primary shadow-2xs cursor-pointer transition-all"
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
                          className="h-7 px-2.5 text-[11px] font-semibold gap-1 border-amber-500/30 text-amber-700 dark:text-amber-400 hover:bg-amber-500/10 shadow-2xs cursor-pointer transition-all"
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
                          className="h-7 px-2 text-[11px] font-semibold gap-1 text-destructive/80 hover:text-destructive hover:bg-destructive/10 cursor-pointer transition-all"
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
