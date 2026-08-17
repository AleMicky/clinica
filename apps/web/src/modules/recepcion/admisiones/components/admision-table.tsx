"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
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
  MoreHorizontal,
  Eye,
  RefreshCw,
  Trash2,
  FileText,
  Building2,
  Calendar,
  Printer,
  Download,
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

interface AdmisionTableProps {
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
  onChangeStatus: (admision: AdmisionResponse) => void;
  onDelete: (id: number) => void;
  onRefresh?: () => void;
}

export function AdmisionTable({
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
  onChangeStatus,
  onDelete,
}: AdmisionTableProps) {
  const tabs = [
    { key: "TODOS", label: "Todas" },
    { key: EstadoAdmision.Registrada, label: "Registradas" },
    { key: EstadoAdmision.Confirmada, label: "Confirmadas" },
    { key: EstadoAdmision.EnviadaVenta, label: "Enviadas a Venta" },
    { key: EstadoAdmision.Cancelada, label: "Canceladas" },
  ];

  return (
    <Card className="border border-border/70 shadow-2xs bg-card overflow-hidden">
      {/* PESTAÑAS DE FILTRO RÁPIDO & BUSCADOR */}
      <div className="p-2.5 sm:px-3.5 sm:py-2 border-b border-border/70 bg-muted/15">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2">
          {/* Tabs por estado */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {tabs.map((t) => {
              const isActive = selectedEstadoTab === t.key;
              return (
                <Button
                  key={t.key.toString()}
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onEstadoTabChange?.(t.key as EstadoAdmision | "TODOS")}
                  className={`h-7 text-[11px] font-semibold px-2.5 rounded-lg transition-all ${isActive
                    ? "bg-primary text-primary-foreground shadow-2xs"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    }`}
                >
                  {t.label}
                </Button>
              );
            })}
          </div>

          {/* Buscador de admisión */}
          <div className="w-full md:w-64">
            <SearchInput
              value={searchTerm}
              onChange={onSearchChange}
              placeholder="Buscar admisión, DNI, paciente..."
              className="h-8 text-xs"
            />
          </div>
        </div>
      </div>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40 text-[10px] uppercase tracking-wider font-bold">
              <TableRow className="h-8">
                <TableHead className="w-[130px] pl-3 py-1.5">N° Admisión</TableHead>
                <TableHead className="min-w-[200px] py-1.5">Paciente</TableHead>
                <TableHead className="min-w-[160px] py-1.5">Convenio / Cobertura</TableHead>
                <TableHead className="min-w-[130px] py-1.5">Fecha & Hora</TableHead>
                <TableHead className="text-right w-[100px] py-1.5">Total</TableHead>
                <TableHead className="w-[120px] text-center py-1.5">Estado</TableHead>
                <TableHead className="w-[50px] text-right pr-3 py-1.5">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="h-10">
                    <TableCell className="pl-3 py-2"><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell className="py-2"><Skeleton className="h-4 w-36" /></TableCell>
                    <TableCell className="py-2"><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell className="py-2"><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell className="text-right py-2"><Skeleton className="h-4 w-14 ml-auto" /></TableCell>
                    <TableCell className="text-center py-2"><Skeleton className="h-4 w-18 mx-auto" /></TableCell>
                    <TableCell className="pr-3 py-2"><Skeleton className="h-4 w-5 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : admisiones.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-36 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground space-y-1.5">
                      <FileText className="size-7 text-muted-foreground/50" />
                      <p className="font-bold text-xs">No se encontraron admisiones</p>
                      <p className="text-[11px] max-w-xs text-muted-foreground">
                        Intente ajustar los filtros de búsqueda o registre una nueva admisión de paciente.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                admisiones.map((adm) => {
                  const total =
                    adm.totalAdmision ??
                    adm.detalles.reduce((acc, d) => acc + (d.total || 0), 0);

                  const nombreCompleto = formatPacienteNombre(adm.paciente, adm.pacienteNombre);
                  const documento = formatPacienteDocumento(adm.paciente, adm.pacienteDocumento);
                  const convenio = adm.convenio?.nombre || formatConvenioNombre(adm.convenio, adm.convenioNombre);

                  return (
                    <TableRow key={adm.id} className="hover:bg-muted/30 transition-colors group h-10">
                      {/* N° Admisión */}
                      <TableCell className="pl-3 py-2 font-mono font-bold text-xs text-foreground">
                        <div className="flex items-center gap-1.5">
                          <span className="size-1.5 rounded-full bg-primary/80 inline-block" />
                          {adm.numero}
                        </div>
                      </TableCell>

                      {/* Paciente */}
                      <TableCell className="py-2">
                        <div className="flex flex-col">
                          <span className="font-bold text-xs text-foreground group-hover:text-primary transition-colors leading-snug">
                            {nombreCompleto}
                          </span>
                          <span className="text-[10px] text-muted-foreground leading-tight">
                            Doc: {documento}
                          </span>
                        </div>
                      </TableCell>

                      {/* Convenio */}
                      <TableCell className="py-2">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Building2 className="size-3 text-primary/70 shrink-0" />
                          <span className="truncate max-w-[140px] font-medium text-xs text-foreground" title={convenio}>
                            {convenio}
                          </span>
                        </div>
                      </TableCell>

                      {/* Fecha y Hora */}
                      <TableCell className="py-2">
                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <Calendar className="size-3 text-muted-foreground shrink-0" />
                          <span>
                            {new Date(adm.fechaHora).toLocaleString("es-ES", {
                              dateStyle: "short",
                              timeStyle: "short",
                            })}
                          </span>
                        </div>
                      </TableCell>

                      {/* Total */}
                      <TableCell className="text-right font-bold text-xs text-foreground py-2 font-mono">
                        Bs. {total.toFixed(2)}
                      </TableCell>

                      {/* Estado */}
                      <TableCell className="text-center py-2">
                        <AdmisionStatusBadge estado={adm.estado} />
                      </TableCell>

                      {/* Menú de Acciones */}
                      <TableCell className="text-right pr-3 py-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors inline-flex items-center justify-center size-7">
                            <MoreHorizontal className="size-3.5" />
                            <span className="sr-only">Acciones</span>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 text-xs">
                            <DropdownMenuItem onClick={() => onViewDetail(adm)} className="gap-2 cursor-pointer">
                              <Eye className="size-3.5 text-primary" />
                              Ver Ficha de Admisión
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={async () => {
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
                              onClick={async () => {
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
                            <DropdownMenuItem onClick={() => onChangeStatus(adm)} className="gap-2 cursor-pointer">
                              <RefreshCw className="size-3.5 text-amber-500" />
                              Cambiar Estado
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => onDelete(adm.id)}
                              className="gap-2 text-rose-600 dark:text-rose-400 focus:text-rose-600 cursor-pointer"
                            >
                              <Trash2 className="size-3.5" />
                              Cancelar Admisión
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* PAGINACIÓN */}
        <div className="p-2.5 sm:px-3.5 border-t border-border/70">
          <DataTablePagination
            currentPage={currentPage}
            pageSize={pageSize}
            totalItems={totalItems}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
          />
        </div>
      </CardContent>
    </Card>
  );
}
