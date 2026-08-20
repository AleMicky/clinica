"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SearchInput, DataTablePagination, StatusBadge } from "@/components/shared";
import {
  Edit,
  Trash2,
  Award,
  ShieldCheck,
  History,
  FileText,
} from "lucide-react";
import type { CargoResponse } from "../types/cargo.types";

interface CargoListProps {
  cargos: CargoResponse[];
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
  onEdit: (cargo: CargoResponse) => void;
  onDelete: (cargo: CargoResponse) => void;
  onRefresh?: () => void;
}

export function CargoList({
  cargos,
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
}: CargoListProps) {
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
      {/* FILTROS EN FORMATO BADGE Y BUSCADOR */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 px-0.5">
        {/* Badges interactivos de estado */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
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
        <div className="w-full md:w-64">
          <SearchInput
            value={searchTerm}
            onChange={onSearchChange}
            placeholder="Buscar por código o nombre..."
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
                  <div className="flex items-center gap-2.5">
                    <Skeleton className="size-9 rounded-xl" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-36" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : cargos.length === 0 ? (
          <div className="py-12 text-center border border-dashed border-border/60 rounded-xl bg-muted/10 space-y-2">
            <Award className="size-8 text-muted-foreground/40 mx-auto" />
            <p className="font-bold text-xs text-foreground">No se encontraron cargos</p>
            <p className="text-[11px] max-w-xs mx-auto text-muted-foreground">
              Intente ajustar los filtros de búsqueda o registre un nuevo cargo.
            </p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {cargos.map((cargo) => {
              const initials = cargo.codigo.slice(0, 2).toUpperCase() || "CR";

              return (
                <div
                  key={cargo.id}
                  onClick={() => onEdit(cargo)}
                  className="group cursor-pointer p-3 rounded-xl border border-border/50 bg-card hover:border-primary/40 hover:bg-muted/25 transition-all shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative"
                >
                  {/* Bloque Izquierdo: Avatar + Código + Nombre + Descripción */}
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    {/* Avatar */}
                    <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 border border-primary/20 mt-0.5 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      {initials}
                    </div>

                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-xs text-primary bg-primary/10 px-1.5 py-0.2 rounded border border-primary/20">
                          #{cargo.codigo}
                        </span>

                        <span className="font-bold text-xs text-foreground group-hover:text-primary transition-colors truncate">
                          {cargo.nombre}
                        </span>
                      </div>

                      {/* Descripción */}
                      {cargo.descripcion ? (
                        <p className="text-[11px] text-muted-foreground line-clamp-1">
                          {cargo.descripcion}
                        </p>
                      ) : (
                        <p className="text-[10.5px] text-muted-foreground/60 italic">
                          Sin descripción registrada
                        </p>
                      )}

                      {/* Metadatos de Auditoría UX/UI */}
                      {(cargo.creadoPor || cargo.fechaCreacion || cargo.modificadoPor) && (
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground/70 flex-wrap pt-1 border-t border-border/30 mt-1">
                          {(cargo.creadoPor || cargo.fechaCreacion) && (
                            <span className="flex items-center gap-1">
                              <ShieldCheck className="size-2.5 text-primary/70 shrink-0" />
                              <span>
                                {cargo.creadoPor ? `Registrado por: ${cargo.creadoPor}` : "Registrado"}
                              </span>
                              {cargo.fechaCreacion && (
                                <span className="font-mono text-[9.5px] text-muted-foreground/60">
                                  ({new Date(cargo.fechaCreacion).toLocaleString("es-ES", {
                                    dateStyle: "short",
                                    timeStyle: "short",
                                  })})
                                </span>
                              )}
                            </span>
                          )}

                          {cargo.modificadoPor && (
                            <>
                              <span className="text-muted-foreground/30">•</span>
                              <span className="flex items-center gap-1">
                                <History className="size-2.5 text-amber-600/70 shrink-0" />
                                <span>
                                  Modificado: <strong>{cargo.modificadoPor}</strong>
                                </span>
                                {cargo.fechaModificacion && (
                                  <span className="font-mono text-[9.5px] text-muted-foreground/60">
                                    ({new Date(cargo.fechaModificacion).toLocaleString("es-ES", {
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

                  {/* Bloque Derecho: Estado & Acciones */}
                  <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/30">
                    <StatusBadge active={cargo.activo} />

                    <div className="flex items-center gap-1.5">
                      {/* Botón Editar Visible */}
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(cargo);
                        }}
                        className="h-7 px-2.5 text-[11px] font-semibold gap-1 border-border/80 text-foreground hover:bg-accent hover:text-primary shadow-2xs cursor-pointer transition-all"
                        title="Editar cargo"
                      >
                        <Edit className="size-3 text-primary" />
                        <span>Editar</span>
                      </Button>

                      {/* Botón Eliminar Visible */}
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(cargo);
                        }}
                        className="h-7 px-2 text-[11px] font-semibold gap-1 text-destructive/80 hover:text-destructive hover:bg-destructive/10 cursor-pointer transition-all"
                        title="Eliminar cargo"
                      >
                        <Trash2 className="size-3" />
                        <span>Eliminar</span>
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* PAGINACIÓN */}
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
