"use client";

import * as React from "react";
import { Search, X, Calendar, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EstadoAdmision } from "../../types/admision.types";
import { cn } from "@/lib/utils";

export type DatePreset = "hoy" | "ayer" | "semana" | "mes" | "30dias" | "todo";

interface ConvenioOption {
  id: number;
  nombre: string;
}

interface AdmisionReporteFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  fechaDesde: string;
  onFechaDesdeChange: (value: string) => void;
  fechaHasta: string;
  onFechaHastaChange: (value: string) => void;
  selectedEstado: string;
  onSelectedEstadoChange: (value: string) => void;
  selectedConvenioId: string;
  onSelectedConvenioIdChange: (value: string) => void;
  convenios: ConvenioOption[];
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  onApplyPreset: (preset: DatePreset) => void;
  todayIso: string;
  yesterdayIso: string;
  startOfMonthIso: string;
}

export function AdmisionReporteFilters({
  searchTerm,
  onSearchChange,
  fechaDesde,
  onFechaDesdeChange,
  fechaHasta,
  onFechaHastaChange,
  selectedEstado,
  onSelectedEstadoChange,
  selectedConvenioId,
  onSelectedConvenioIdChange,
  convenios,
  hasActiveFilters,
  onClearFilters,
  onApplyPreset,
  todayIso,
  yesterdayIso,
  startOfMonthIso,
}: AdmisionReporteFiltersProps) {
  const isDateInverted = Boolean(fechaDesde && fechaHasta && fechaDesde > fechaHasta);

  return (
    <Card className="border border-border/70 bg-card shadow-2xs">
      <CardContent className="p-3 space-y-2.5">
        {/* Quick Presets Bar */}
        <div className="flex items-center gap-1 flex-wrap pb-2 border-b border-border/40 text-xs">
          <span className="text-[11px] font-semibold text-muted-foreground mr-1 flex items-center gap-1">
            <Calendar className="size-3 text-primary" /> Período rápido:
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onApplyPreset("hoy")}
            className={cn(
              "h-6.5 px-2 text-[11px] rounded-md cursor-pointer",
              fechaDesde === todayIso && fechaHasta === todayIso && "bg-primary/10 text-primary border-primary/30 font-semibold"
            )}
          >
            Hoy
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onApplyPreset("ayer")}
            className={cn(
              "h-6.5 px-2 text-[11px] rounded-md cursor-pointer",
              fechaDesde === yesterdayIso && fechaHasta === yesterdayIso && "bg-primary/10 text-primary border-primary/30 font-semibold"
            )}
          >
            Ayer
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onApplyPreset("semana")}
            className="h-6.5 px-2 text-[11px] rounded-md cursor-pointer"
          >
            Esta Semana
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onApplyPreset("mes")}
            className={cn(
              "h-6.5 px-2 text-[11px] rounded-md cursor-pointer",
              fechaDesde === startOfMonthIso && fechaHasta === todayIso && "bg-primary/10 text-primary border-primary/30 font-semibold"
            )}
          >
            Este Mes
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onApplyPreset("30dias")}
            className="h-6.5 px-2 text-[11px] rounded-md cursor-pointer"
          >
            Últimos 30 días
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onApplyPreset("todo")}
            className={cn(
              "h-6.5 px-2 text-[11px] rounded-md cursor-pointer",
              !fechaDesde && !fechaHasta && "bg-primary/10 text-primary border-primary/30 font-semibold"
            )}
          >
            Todo el Historial
          </Button>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="h-6.5 px-1.5 text-[11px] text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 ml-auto gap-1 cursor-pointer"
            >
              <X className="size-3" />
              Limpiar filtros
            </Button>
          )}
        </div>

        {/* Date Validation Alert if inverted */}
        {isDateInverted && (
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30 rounded-lg">
            <AlertTriangle className="size-3.5 shrink-0" />
            <span>Atención: La fecha inicial es posterior a la fecha final. Por favor verifique el rango.</span>
          </div>
        )}

        {/* Form Filter Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5 items-end">
          {/* Search Input */}
          <div className="space-y-1">
            <Label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
              <Search className="size-3" /> Búsqueda General
            </Label>
            <div className="relative">
              <Input
                placeholder="N° admisión, paciente, DNI, HC..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="h-8 text-xs pl-7.5 pr-7"
              />
              <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => onSearchChange("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 cursor-pointer"
                >
                  <X className="size-3" />
                </button>
              )}
            </div>
          </div>

          {/* Fecha Desde */}
          <div className="space-y-1">
            <Label className="text-[11px] font-medium text-muted-foreground">Fecha Desde</Label>
            <Input
              type="date"
              value={fechaDesde}
              onChange={(e) => onFechaDesdeChange(e.target.value)}
              className={cn("h-8 text-xs", isDateInverted && "border-amber-500 focus-visible:ring-amber-500")}
            />
          </div>

          {/* Fecha Hasta */}
          <div className="space-y-1">
            <Label className="text-[11px] font-medium text-muted-foreground">Fecha Hasta</Label>
            <Input
              type="date"
              value={fechaHasta}
              onChange={(e) => onFechaHastaChange(e.target.value)}
              className={cn("h-8 text-xs", isDateInverted && "border-amber-500 focus-visible:ring-amber-500")}
            />
          </div>

          {/* Estado Selector */}
          <div className="space-y-1">
            <Label className="text-[11px] font-medium text-muted-foreground">Estado</Label>
            <Select
              value={selectedEstado}
              onValueChange={(val) => onSelectedEstadoChange(val ?? "TODOS")}
            >
              <SelectTrigger className="h-8 text-xs w-full">
                <SelectValue placeholder="Todos los Estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODOS">Todos los Estados</SelectItem>
                <SelectItem value={String(EstadoAdmision.Registrada)}>Registrada</SelectItem>
                <SelectItem value={String(EstadoAdmision.Confirmada)}>Confirmada</SelectItem>
                <SelectItem value={String(EstadoAdmision.EnviadaVenta)}>Enviada a Venta</SelectItem>
                <SelectItem value={String(EstadoAdmision.Cancelada)}>Cancelada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Convenio / Cobertura */}
          <div className="space-y-1">
            <Label className="text-[11px] font-medium text-muted-foreground">Convenio / Seguro</Label>
            <Select
              value={selectedConvenioId}
              onValueChange={(val) => onSelectedConvenioIdChange(val ?? "TODOS")}
            >
              <SelectTrigger className="h-8 text-xs w-full">
                <SelectValue placeholder="Todas las Coberturas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODOS">Todas las Coberturas</SelectItem>
                <SelectItem value="-1">Particular (Sin Convenio)</SelectItem>
                {convenios.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
