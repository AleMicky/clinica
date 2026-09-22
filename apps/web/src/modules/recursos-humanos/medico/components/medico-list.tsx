"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SearchInput, DataTablePagination, StatusBadge } from "@/components/shared";
import {
  Edit,
  Trash2,
  Stethoscope,
  FileBadge,
  Handshake,
  Star,
  Plus,
} from "lucide-react";
import type { MedicoResponse } from "../types/medico.types";

interface MedicoListProps {
  medicos: MedicoResponse[];
  isLoading: boolean;
  totalItems: number;
  currentPage: number;
  pageSize: number;
  searchTerm: string;
  selectedStatusTab?: "TODOS" | "ACTIVOS" | "INACTIVOS";
  onStatusTabChange?: (tab: "TODOS" | "ACTIVOS" | "INACTIVOS") => void;
  onSearchChange: (term: string) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onEdit: (medico: MedicoResponse) => void;
  onDelete: (medico: MedicoResponse) => void;
  onManageAcuerdos?: (medico: MedicoResponse) => void;
  onAddClick?: () => void;
  onRefresh?: () => void;
}

export function getMedicoFullName(medico: MedicoResponse): string {
  const persona = medico.empleado?.persona;
  if (persona) {
    const parts = [persona.nombres, persona.apellidoPaterno, persona.apellidoMaterno].filter(
      Boolean
    );
    return parts.join(" ");
  }
  return medico.empleado?.nombreCompleto || `Médico #${medico.id}`;
}

export function MedicoList({
  medicos,
  isLoading,
  totalItems,
  currentPage,
  pageSize,
  searchTerm,
  selectedStatusTab = "TODOS",
  onStatusTabChange,
  onSearchChange,
  onPageChange,
  onPageSizeChange,
  onEdit,
  onDelete,
  onManageAcuerdos,
  onAddClick,
}: MedicoListProps) {
  const tabs: Array<{
    key: "TODOS" | "ACTIVOS" | "INACTIVOS";
    label: string;
    activeClasses: string;
  }> = [
    { key: "TODOS", label: "Todos", activeClasses: "bg-primary text-primary-foreground shadow-xs" },
    { key: "ACTIVOS", label: "Activos", activeClasses: "bg-emerald-600 text-white shadow-xs" },
    { key: "INACTIVOS", label: "Inactivos", activeClasses: "bg-rose-600 text-white shadow-xs" },
  ];

  return (
    <div className="space-y-2.5 w-full">
      {/* BARRA DE FILTROS Y BUSCADOR COMPACTA */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 px-0.5">
        {/* Badges de estado */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {tabs.map((t) => {
            const isActive = selectedStatusTab === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => onStatusTabChange?.(t.key)}
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
        <div className="w-full sm:w-72">
          <SearchInput
            value={searchTerm}
            onChange={onSearchChange}
            placeholder="Buscar por médico, matrícula o empleado..."
            className="h-8.5 text-xs bg-background shadow-2xs"
          />
        </div>
      </div>

      {/* TABLA DE MÉDICOS */}
      <div className="border border-border/70 rounded-xl overflow-hidden bg-card shadow-2xs">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-xs font-bold h-9">Médico Asistencial</TableHead>
              <TableHead className="text-xs font-bold h-9 hidden md:table-cell">
                Matrícula & Registro
              </TableHead>
              <TableHead className="text-xs font-bold h-9">Especialidades</TableHead>
              <TableHead className="text-xs font-bold h-9 text-center w-24">Estado</TableHead>
              <TableHead className="text-xs font-bold h-9 text-right w-44">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="py-2.5">
                    <div className="flex items-center gap-2.5">
                      <Skeleton className="size-8 rounded-lg" />
                      <div className="space-y-1">
                        <Skeleton className="h-3.5 w-32" />
                        <Skeleton className="h-2.5 w-20" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell py-2.5">
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell className="py-2.5">
                    <Skeleton className="h-4 w-28" />
                  </TableCell>
                  <TableCell className="text-center py-2.5">
                    <Skeleton className="h-5 w-16 mx-auto rounded-full" />
                  </TableCell>
                  <TableCell className="text-right py-2.5">
                    <Skeleton className="h-7 w-24 ml-auto rounded-md" />
                  </TableCell>
                </TableRow>
              ))
            ) : medicos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center">
                  <div className="max-w-xs mx-auto space-y-2">
                    <div className="size-10 rounded-full bg-muted/50 flex items-center justify-center mx-auto text-muted-foreground">
                      <Stethoscope className="size-5" />
                    </div>
                    <p className="font-bold text-xs text-foreground">
                      No se encontraron médicos
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {searchTerm
                        ? "Intente con otro término de búsqueda."
                        : "Comience registrando el primer médico de la clínica."}
                    </p>
                    {onAddClick && (
                      <Button
                        type="button"
                        size="sm"
                        onClick={onAddClick}
                        className="h-7.5 px-3 text-xs gap-1 bg-primary text-primary-foreground mt-1 cursor-pointer"
                      >
                        <Plus className="size-3" />
                        <span>Registrar Médico</span>
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              medicos.map((med) => {
                const nombre = getMedicoFullName(med);
                const initials =
                  med.empleado?.persona?.nombres?.[0] &&
                  med.empleado?.persona?.apellidoPaterno?.[0]
                    ? `${med.empleado.persona.nombres[0]}${med.empleado.persona.apellidoPaterno[0]}`
                    : "DR";

                const especialidadesActivas = (med.especialidades ?? []).filter(
                  (e) => e.activo
                );
                const principalEsp = especialidadesActivas.find((e) => e.esPrincipal);
                const otrasEsp = especialidadesActivas.filter((e) => !e.esPrincipal);

                return (
                  <TableRow
                    key={med.id}
                    onDoubleClick={() => onEdit(med)}
                    className="hover:bg-muted/40 transition-colors group cursor-default"
                  >
                    {/* Médico Asistencial */}
                    <TableCell className="py-2.5">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-[11px] shrink-0 border border-primary/20">
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <p
                            className="font-bold text-xs text-foreground truncate group-hover:text-primary transition-colors cursor-pointer"
                            onClick={() => onEdit(med)}
                            title="Haga clic para editar"
                          >
                            Dr(a). {nombre}
                          </p>
                          <div className="flex items-center gap-1.5 text-[10.5px] text-muted-foreground">
                            {med.empleado?.codigoEmpleado && (
                              <span className="font-mono">
                                EMP: {med.empleado.codigoEmpleado}
                              </span>
                            )}
                            {/* Matrícula visible en pantallas móviles */}
                            <span className="md:hidden font-mono font-semibold text-primary">
                              • #{med.matriculaProfesional}
                            </span>
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    {/* Matrícula & MinSalud */}
                    <TableCell className="hidden md:table-cell py-2.5">
                      <div className="space-y-0.5">
                        <span className="font-mono font-bold text-[11px] text-primary bg-primary/10 px-1.5 py-0.2 rounded border border-primary/20 inline-block">
                          #{med.matriculaProfesional}
                        </span>
                        {med.registroMinisterioSalud ? (
                          <div className="flex items-center gap-1 text-[10px] text-sky-600 dark:text-sky-400 font-medium">
                            <FileBadge className="size-2.5 shrink-0" />
                            <span>MinSalud: {med.registroMinisterioSalud}</span>
                          </div>
                        ) : (
                          <p className="text-[10px] text-muted-foreground/60 italic">
                            Sin Reg. MinSalud
                          </p>
                        )}
                      </div>
                    </TableCell>

                    {/* Especialidades */}
                    <TableCell className="py-2.5">
                      {especialidadesActivas.length > 0 ? (
                        <div className="flex items-center gap-1 flex-wrap">
                          {principalEsp && (
                            <Badge className="bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30 gap-1 text-[10px] px-1.5 py-0.2">
                              <Star className="size-2.5 fill-amber-500 text-amber-500 shrink-0" />
                              <span className="truncate max-w-[140px]">
                                {principalEsp.especialidad?.nombre ||
                                  `Esp #${principalEsp.especialidadId}`}
                              </span>
                            </Badge>
                          )}

                          {otrasEsp.slice(0, 2).map((esp) => (
                            <Badge
                              key={esp.id}
                              variant="outline"
                              className="text-[10px] bg-muted/60 text-muted-foreground px-1.5 py-0.2 border-border/60 truncate max-w-[120px]"
                            >
                              {esp.especialidad?.nombre ||
                                `Esp #${esp.especialidadId}`}
                            </Badge>
                          ))}

                          {otrasEsp.length > 2 && (
                            <Badge
                              variant="secondary"
                              className="text-[9.5px] px-1 py-0.2 font-mono"
                              title={otrasEsp
                                .slice(2)
                                .map(
                                  (e) =>
                                    e.especialidad?.nombre ||
                                    `Esp #${e.especialidadId}`
                                )
                                .join(", ")}
                            >
                              +{otrasEsp.length - 2} más
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-[10.5px] text-muted-foreground/60 italic">
                          Sin especialidades
                        </span>
                      )}
                    </TableCell>

                    {/* Estado */}
                    <TableCell className="text-center py-2.5">
                      <StatusBadge active={med.activo} />
                    </TableCell>

                    {/* Acciones Rápidas */}
                    <TableCell className="text-right py-2.5">
                      <div className="flex items-center justify-end gap-1">
                        {/* Botón Acuerdos */}
                        {onManageAcuerdos && (
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => onManageAcuerdos(med)}
                            className="h-7 px-2 text-[11px] font-semibold gap-1 text-purple-600 hover:text-purple-700 hover:bg-purple-500/10 cursor-pointer rounded-md transition-colors"
                            title="Pactar acuerdos de honorarios"
                          >
                            <Handshake className="size-3" />
                            <span className="hidden lg:inline">Acuerdos</span>
                          </Button>
                        )}

                        {/* Botón Editar */}
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => onEdit(med)}
                          className="h-7 px-2 text-[11px] font-semibold gap-1 text-primary hover:text-primary/90 hover:bg-primary/10 cursor-pointer rounded-md transition-colors"
                          title="Editar expediente y especialidades"
                        >
                          <Edit className="size-3" />
                          <span className="hidden lg:inline">Editar</span>
                        </Button>

                        {/* Botón Eliminar */}
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => onDelete(med)}
                          className="size-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer rounded-md transition-colors"
                          title="Inhabilitar médico"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* PAGINACIÓN */}
      {totalItems > 10 && (
        <div className="pt-1 px-0.5">
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
  );
}
