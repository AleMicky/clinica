"use client";

import * as React from "react";
import {
  Plus,
  RefreshCw,
  Inbox,
  LayoutGrid,
  List,
  Table as TableIcon,
  HeartPulse,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { SearchInput, DataTablePagination } from "@/components/shared";
import { cn } from "@/lib/utils";
import { MedicoCard } from "./medico-card";
import { MedicoTable } from "./medico-table";
import type { MedicoResponse } from "../types/medico.types";

type ViewModeType = "list" | "grid" | "table";
type StatusFilterType = "all" | "active" | "inactive";

interface MedicoCardListProps {
  medicos: MedicoResponse[];
  isLoading?: boolean;
  totalItems?: number;
  currentPage?: number;
  pageSize?: number;
  searchTerm?: string;
  onSearchChange?: (value: string) => void;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  onAddClick?: () => void;
  onEdit?: (medico: MedicoResponse) => void;
  onManageExpediente?: (medico: MedicoResponse) => void;
  onDelete?: (medico: MedicoResponse) => void;
  onRefresh?: () => void;
}

export function MedicoCardList({
  medicos,
  isLoading = false,
  totalItems = 0,
  currentPage = 1,
  pageSize = 10,
  searchTerm = "",
  onSearchChange,
  onPageChange,
  onPageSizeChange,
  onAddClick,
  onEdit,
  onManageExpediente,
  onDelete,
  onRefresh,
}: MedicoCardListProps) {
  const [viewMode, setViewMode] = React.useState<ViewModeType>("list");
  const [statusFilter, setStatusFilter] = React.useState<StatusFilterType>("all");

  // Local filtering by active/inactive filter pills
  const filteredMedicos = React.useMemo(() => {
    if (statusFilter === "active") return medicos.filter((m) => m.activo);
    if (statusFilter === "inactive") return medicos.filter((m) => !m.activo);
    return medicos;
  }, [medicos, statusFilter]);

  const counts = React.useMemo(() => {
    return {
      all: medicos.length,
      active: medicos.filter((m) => m.activo).length,
      inactive: medicos.filter((m) => !m.activo).length,
    };
  }, [medicos]);

  return (
    <Card className="shadow-xs border border-border/70 rounded-xl overflow-hidden bg-card">
      {/* Header Toolbar */}
      <CardHeader className="p-4 sm:p-5 border-b border-border/50 bg-muted/20 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <HeartPulse className="size-4 text-primary" />
              <span>Cuerpo Médico</span>
              {onRefresh && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onRefresh}
                  disabled={isLoading}
                  title="Recargar datos"
                  className="cursor-pointer size-7 rounded-md"
                >
                  <RefreshCw
                    className={`size-3.5 ${isLoading ? "animate-spin" : ""}`}
                  />
                </Button>
              )}
            </CardTitle>
            <CardDescription className="text-xs mt-0.5">
              Gestión de expedientes médicos, especialidades acreditadas y acuerdos de honorarios.
            </CardDescription>
          </div>

          <div className="flex items-center gap-2 flex-wrap shrink-0">
            {/* Search Input */}
            <SearchInput
              placeholder="Buscar por matrícula, minsal, persona..."
              value={searchTerm}
              onChange={onSearchChange}
              className="w-full sm:w-64 h-9 text-xs"
            />

            {/* View Mode Toggle */}
            <div className="flex items-center bg-muted/60 p-0.5 rounded-lg border border-border/50 shrink-0">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                title="Vista tarjetas cuadrícula"
                className="h-7 px-2.5 text-[11px] gap-1 cursor-pointer rounded-md font-medium"
              >
                <LayoutGrid className="size-3.5" />
                <span className="hidden sm:inline">Tarjetas</span>
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                title="Vista lista filas"
                className="h-7 px-2.5 text-[11px] gap-1 cursor-pointer rounded-md font-medium"
              >
                <List className="size-3.5" />
                <span className="hidden sm:inline">Lista</span>
              </Button>
              <Button
                variant={viewMode === "table" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("table")}
                title="Vista tabla compacta"
                className="h-7 px-2.5 text-[11px] gap-1 cursor-pointer rounded-md font-medium"
              >
                <TableIcon className="size-3.5" />
                <span className="hidden sm:inline">Tabla</span>
              </Button>
            </div>

            {/* Action Button */}
            {onAddClick && (
              <Button
                size="sm"
                onClick={onAddClick}
                className="h-9 px-3.5 text-xs gap-1.5 font-medium cursor-pointer shadow-xs"
              >
                <Plus className="size-4" />
                <span>Nuevo Médico</span>
              </Button>
            )}
          </div>
        </div>

        {/* Filter Pills Bar */}
        <div className="flex items-center gap-2 pt-1 border-t border-border/40 text-xs flex-wrap">
          <span className="text-muted-foreground font-medium text-[11px] mr-1">Filtrar:</span>
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 border",
              statusFilter === "all"
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-muted-foreground border-border/60 hover:bg-muted"
            )}
          >
            <span>Todos</span>
            <Badge
              variant="secondary"
              className={cn(
                "px-1.5 py-0 h-4 text-[10px] rounded-full",
                statusFilter === "all" ? "bg-primary-foreground/20 text-primary-foreground" : ""
              )}
            >
              {counts.all}
            </Badge>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("active")}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 border",
              statusFilter === "active"
                ? "bg-emerald-600 text-white border-emerald-600"
                : "bg-background text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
            )}
          >
            <span>Activos</span>
            <Badge
              variant="secondary"
              className={cn(
                "px-1.5 py-0 h-4 text-[10px] rounded-full",
                statusFilter === "active" ? "bg-white/20 text-white" : ""
              )}
            >
              {counts.active}
            </Badge>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("inactive")}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 border",
              statusFilter === "inactive"
                ? "bg-destructive text-destructive-foreground border-destructive"
                : "bg-background text-destructive border-destructive/30 hover:bg-destructive/10"
            )}
          >
            <span>Inactivos</span>
            <Badge
              variant="secondary"
              className={cn(
                "px-1.5 py-0 h-4 text-[10px] rounded-full",
                statusFilter === "inactive" ? "bg-white/20 text-white" : ""
              )}
            >
              {counts.inactive}
            </Badge>
          </button>
        </div>
      </CardHeader>

      {/* Main Content Area */}
      <CardContent className="p-4 sm:p-5">
        {isLoading ? (
          <div
            className={cn(
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                : "flex flex-col gap-3"
            )}
          >
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="border rounded-xl p-4 space-y-3 bg-card">
                <div className="flex items-center gap-3">
                  <Skeleton className="size-10 rounded-full" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
            ))}
          </div>
        ) : filteredMedicos.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed rounded-xl bg-muted/10 text-muted-foreground gap-2">
            <Inbox className="size-10 stroke-1 text-muted-foreground/60" />
            <p className="text-sm font-semibold text-foreground">
              No se encontraron médicos registrados
            </p>
            <p className="text-xs text-muted-foreground max-w-sm">
              {searchTerm || statusFilter !== "all"
                ? "Ajuste los criterios de búsqueda o los filtros aplicados."
                : "Haga clic en 'Nuevo Médico' para agregar el primer registro."}
            </p>
            {onAddClick && !searchTerm && (
              <Button size="sm" onClick={onAddClick} className="mt-2 text-xs gap-1.5">
                <Plus className="size-3.5" /> Registrar Médico
              </Button>
            )}
          </div>
        ) : viewMode === "table" ? (
          <MedicoTable
            medicos={filteredMedicos}
            isLoading={false}
            onEdit={onEdit}
            onManageExpediente={onManageExpediente}
            onDelete={onDelete}
          />
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMedicos.map((medico) => (
              <MedicoCard
                key={medico.id}
                medico={medico}
                viewMode="grid"
                onEdit={onEdit}
                onManageExpediente={onManageExpediente}
                onDelete={onDelete}
              />
            ))}
          </div>
        ) : (
          /* Horizontal Row List View */
          <div className="flex flex-col gap-2.5">
            {filteredMedicos.map((medico) => (
              <MedicoCard
                key={medico.id}
                medico={medico}
                viewMode="list"
                onEdit={onEdit}
                onManageExpediente={onManageExpediente}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </CardContent>

      {/* Integrated Footer Pagination */}
      {totalItems > 0 && (
        <DataTablePagination
          totalItems={totalItems}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={onPageChange ?? (() => {})}
          onPageSizeChange={onPageSizeChange}
        />
      )}
    </Card>
  );
}
