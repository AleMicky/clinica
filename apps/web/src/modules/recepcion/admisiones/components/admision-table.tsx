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
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";
import {
  EstadoAdmision,
  type AdmisionResponse,
} from "../types/admision.types";
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
    { key: EstadoAdmision.PendientePago, label: "Pendientes Cobro" },
    { key: EstadoAdmision.Pagada, label: "Pagadas" },
    { key: EstadoAdmision.EnAtencion, label: "En Atención" },
    { key: EstadoAdmision.Finalizada, label: "Finalizadas" },
  ];

  return (
    <Card className="border border-border/70 shadow-xs bg-card overflow-hidden">
      {/* PESTAÑAS DE FILTRO RÁPIDO & BUSCADOR */}
      <div className="p-4 space-y-3.5 border-b border-border/70 bg-muted/20">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
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
                  className={`h-8 text-xs font-semibold px-3 rounded-lg transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  {t.label}
                </Button>
              );
            })}
          </div>

          {/* Buscador de admisión */}
          <div className="w-full md:w-72">
            <SearchInput
              value={searchTerm}
              onChange={onSearchChange}
              placeholder="Buscar N° admisión, DNI, paciente..."
              className="h-9 text-xs"
            />
          </div>
        </div>
      </div>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40 text-[11px] uppercase tracking-wider font-semibold">
              <TableRow>
                <TableHead className="w-[140px] pl-4">N° Admisión</TableHead>
                <TableHead className="min-w-[220px]">Paciente</TableHead>
                <TableHead className="min-w-[170px]">Convenio / Cobertura</TableHead>
                <TableHead className="min-w-[140px]">Fecha & Hora</TableHead>
                <TableHead className="text-right w-[110px]">Total</TableHead>
                <TableHead className="w-[130px] text-center">Estado</TableHead>
                <TableHead className="w-[60px] text-right pr-4">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell className="pl-4"><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                    <TableCell className="text-center"><Skeleton className="h-5 w-20 mx-auto" /></TableCell>
                    <TableCell className="pr-4"><Skeleton className="h-5 w-6 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : admisiones.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-44 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground space-y-2">
                      <FileText className="size-8 text-muted-foreground/50" />
                      <p className="font-semibold text-sm">No se encontraron admisiones</p>
                      <p className="text-xs max-w-xs text-muted-foreground">
                        Intenta ajustar los filtros de búsqueda o registra una nueva admisión de paciente.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                admisiones.map((adm) => {
                  const total =
                    adm.totalAdmision ??
                    adm.detalles.reduce((acc, d) => acc + (d.total || 0), 0);

                  return (
                    <TableRow key={adm.id} className="hover:bg-muted/30 transition-colors group">
                      {/* N° Admisión */}
                      <TableCell className="pl-4 font-mono font-bold text-xs text-foreground">
                        <div className="flex items-center gap-1.5">
                          <span className="size-2 rounded-full bg-primary/80 inline-block" />
                          {adm.numero}
                        </div>
                      </TableCell>

                      {/* Paciente */}
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold text-xs text-foreground group-hover:text-primary transition-colors">
                            {adm.pacienteNombre || `Paciente #${adm.pacienteId}`}
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            Doc: {adm.pacienteDocumento || "Sin Documento"}
                          </span>
                        </div>
                      </TableCell>

                      {/* Convenio */}
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Building2 className="size-3.5 text-primary/70 shrink-0" />
                          <span className="truncate max-w-[150px] font-medium text-foreground">
                            {adm.convenioNombre || "Particular"}
                          </span>
                        </div>
                      </TableCell>

                      {/* Fecha y Hora */}
                      <TableCell>
                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <Calendar className="size-3 text-muted-foreground" />
                          <span>
                            {new Date(adm.fechaHora).toLocaleString("es-ES", {
                              dateStyle: "short",
                              timeStyle: "short",
                            })}
                          </span>
                        </div>
                      </TableCell>

                      {/* Total */}
                      <TableCell className="text-right font-bold text-xs text-foreground">
                        S/. {total.toFixed(2)}
                      </TableCell>

                      {/* Estado */}
                      <TableCell className="text-center">
                        <AdmisionStatusBadge estado={adm.estado} />
                      </TableCell>

                      {/* Menú de Acciones */}
                      <TableCell className="text-right pr-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors inline-flex items-center justify-center">
                            <MoreHorizontal className="size-4" />
                            <span className="sr-only">Acciones</span>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 text-xs">
                            <DropdownMenuItem onClick={() => onViewDetail(adm)} className="gap-2 cursor-pointer">
                              <Eye className="size-3.5 text-primary" />
                              Ver Ficha de Admisión
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
        <div className="p-4 border-t border-border/70">
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
