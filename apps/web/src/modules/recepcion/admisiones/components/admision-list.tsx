"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
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
  Trash2,
  FileText,
  Building2,
  Calendar,
  Printer,
  Download,
  Stethoscope,
  User,
  CheckCircle2,
  Send,
} from "lucide-react";
import {
  EstadoAdmision,
  formatConvenioNombre,
  formatPacienteDocumento,
  formatPacienteNombre,
  type AdmisionResponse,
} from "../types/admision.types";
import { downloadAdmisionPdf, openAdmisionPdfInNewTab } from "../api/admision.api";
import { toast } from "sonner";
import { AdmisionStatusBadge } from "./admision-status-badge";
import { Skeleton } from "@/components/ui/skeleton";

interface AdmisionListProps {
  admisiones: AdmisionResponse[];
  isLoading: boolean;
  totalItems: number;
  currentPage: number;
  pageSize: number;
  searchTerm: string;
  selectedEstadoTab?: EstadoAdmision | "TODOS";
  onEstadoTabChange?: (tab: EstadoAdmision | "TODOS") => void;
  onSearchChange: (term: string) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onViewDetail: (admision: AdmisionResponse) => void;
  onDirectChangeStatus?: (admision: AdmisionResponse, nuevoEstado: EstadoAdmision) => void;
  onChangeStatus: (admision: AdmisionResponse) => void;
  onDelete: (id: number) => void;
  onRefresh?: () => void;
}

export function AdmisionList({
  admisiones,
  isLoading,
  totalItems,
  currentPage,
  pageSize,
  searchTerm,
  selectedEstadoTab = "TODOS",
  onEstadoTabChange,
  onSearchChange,
  onPageChange,
  onPageSizeChange,
  onViewDetail,
  onDirectChangeStatus,
}: AdmisionListProps) {
  const tabs: Array<{
    key: EstadoAdmision | "TODOS";
    label: string;
    activeClasses: string;
  }> = [
      { key: "TODOS", label: "Todas", activeClasses: "bg-primary text-primary-foreground shadow-xs" },
      { key: EstadoAdmision.Registrada, label: "Registradas", activeClasses: "bg-blue-600 text-white shadow-xs" },
      { key: EstadoAdmision.Confirmada, label: "Confirmadas", activeClasses: "bg-emerald-600 text-white shadow-xs" },
      { key: EstadoAdmision.EnviadaVenta, label: "Enviadas a Venta", activeClasses: "bg-purple-600 text-white shadow-xs" },
      { key: EstadoAdmision.Cancelada, label: "Canceladas", activeClasses: "bg-rose-600 text-white shadow-xs" },
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
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer select-none ${isActive
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
                      </div>
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
                              onViewDetail(adm);
                            }}
                            className="gap-2 cursor-pointer"
                          >
                            <Eye className="size-3.5 text-primary" />
                            Ver Ficha de Admisión
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={async (e) => {
                              e.stopPropagation();
                              try {
                                await openAdmisionPdfInNewTab(adm.id);
                              } catch {
                                toast.error("Error al generar el PDF de admisión.");
                              }
                            }}
                            className="gap-2 cursor-pointer"
                          >
                            <Printer className="size-3.5 text-blue-600" />
                            Ver Ticket PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={async (e) => {
                              e.stopPropagation();
                              try {
                                await downloadAdmisionPdf(adm.id, adm.numero);
                                toast.success("PDF descargado correctamente.");
                              } catch {
                                toast.error("Error al descargar el PDF.");
                              }
                            }}
                            className="gap-2 cursor-pointer"
                          >
                            <Download className="size-3.5 text-emerald-600" />
                            Descargar PDF
                          </DropdownMenuItem>

                          {/* Acciones de Estado directas en menú */}
                          {adm.estado !== EstadoAdmision.Cancelada && (
                            <>
                              <DropdownMenuSeparator />
                              {adm.estado === EstadoAdmision.Registrada && (
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onDirectChangeStatus?.(adm, EstadoAdmision.Confirmada);
                                  }}
                                  className="gap-2 text-emerald-600 dark:text-emerald-400 cursor-pointer font-medium"
                                >
                                  <CheckCircle2 className="size-3.5" />
                                  Confirmar Admisión
                                </DropdownMenuItem>
                              )}
                              {adm.estado === EstadoAdmision.Confirmada && (
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onDirectChangeStatus?.(adm, EstadoAdmision.EnviadaVenta);
                                  }}
                                  className="gap-2 text-purple-600 dark:text-purple-400 cursor-pointer font-medium"
                                >
                                  <Send className="size-3.5" />
                                  Enviar a Venta
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDirectChangeStatus?.(adm, EstadoAdmision.Cancelada);
                                }}
                                className="gap-2 text-rose-600 dark:text-rose-400 focus:text-rose-600 cursor-pointer"
                              >
                                <Trash2 className="size-3.5" />
                                Cancelar Admisión
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
