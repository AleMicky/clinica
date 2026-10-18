"use client";

import * as React from "react";
import { Search, X, Calendar, AlertTriangle, RotateCcw, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { EstadoCobro, EstadoCobroLabels } from "../../types/cobro.types";
import { cn } from "@/lib/utils";

export type DatePreset = "hoy" | "ayer" | "semana" | "mes" | "30dias" | "todo";

interface CobroReporteFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  fechaDesde: string;
  onFechaDesdeChange: (value: string) => void;
  fechaHasta: string;
  onFechaHastaChange: (value: string) => void;
  selectedEstado: string;
  onSelectedEstadoChange: (value: string) => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  onApplyPreset: (preset: DatePreset) => void;
  todayIso: string;
  yesterdayIso: string;
  startOfMonthIso: string;
}

export function CobroReporteFilters({
  searchTerm,
  onSearchChange,
  fechaDesde,
  onFechaDesdeChange,
  fechaHasta,
  onFechaHastaChange,
  selectedEstado,
  onSelectedEstadoChange,
  hasActiveFilters,
  onClearFilters,
  onApplyPreset,
  todayIso,
  yesterdayIso,
  startOfMonthIso,
}: Readonly<CobroReporteFiltersProps>) {
  const isDateInverted = Boolean(fechaDesde && fechaHasta && fechaDesde > fechaHasta);

  const isToday = fechaDesde === todayIso && fechaHasta === todayIso;
  const isYesterday = fechaDesde === yesterdayIso && fechaHasta === yesterdayIso;
  const isMonth = fechaDesde === startOfMonthIso && fechaHasta === todayIso;
  const isAll = !fechaDesde && !fechaHasta;

  return (
    <div className="bg-card/80 backdrop-blur-sm border border-border/40 rounded-2xl p-4 shadow-xs space-y-3.5 transition-all">
      {/* 1. Quick Presets Pill Bar */}
      <div className="flex items-center justify-between gap-2 flex-wrap pb-3 border-b border-border/30">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-semibold text-muted-foreground mr-1 flex items-center gap-1.5">
            <Calendar className="size-3.5 text-primary" /> Período rápido:
          </span>
          <div className="inline-flex items-center gap-1 p-0.5 bg-muted/40 rounded-xl">
            <button
              type="button"
              onClick={() => onApplyPreset("hoy")}
              className={cn(
                "h-7 px-2.5 text-xs font-medium rounded-lg transition-all cursor-pointer",
                isToday
                  ? "bg-primary text-primary-foreground shadow-2xs font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
              )}
            >
              Hoy
            </button>
            <button
              type="button"
              onClick={() => onApplyPreset("ayer")}
              className={cn(
                "h-7 px-2.5 text-xs font-medium rounded-lg transition-all cursor-pointer",
                isYesterday
                  ? "bg-primary text-primary-foreground shadow-2xs font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
              )}
            >
              Ayer
            </button>
            <button
              type="button"
              onClick={() => onApplyPreset("semana")}
              className="h-7 px-2.5 text-xs font-medium rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-all cursor-pointer"
            >
              Esta Semana
            </button>
            <button
              type="button"
              onClick={() => onApplyPreset("mes")}
              className={cn(
                "h-7 px-2.5 text-xs font-medium rounded-lg transition-all cursor-pointer",
                isMonth
                  ? "bg-primary text-primary-foreground shadow-2xs font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
              )}
            >
              Este Mes
            </button>
            <button
              type="button"
              onClick={() => onApplyPreset("30dias")}
              className="h-7 px-2.5 text-xs font-medium rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-all cursor-pointer"
            >
              Últimos 30 días
            </button>
            <button
              type="button"
              onClick={() => onApplyPreset("todo")}
              className={cn(
                "h-7 px-2.5 text-xs font-medium rounded-lg transition-all cursor-pointer",
                isAll
                  ? "bg-primary text-primary-foreground shadow-2xs font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
              )}
            >
              Histórico Todo
            </button>
          </div>
        </div>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="h-7 px-2.5 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all cursor-pointer gap-1"
          >
            <RotateCcw className="size-3" />
            <span>Restablecer Filtros</span>
          </Button>
        )}
      </div>

      {/* 2. Detailed Input Filters Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
        {/* Search */}
        <div className="lg:col-span-5 space-y-1.5">
          <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
            <Search className="size-3 text-primary" /> Búsqueda libre
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar por N° cobro, N° venta, paciente, CI..."
              className="pl-9 pr-8 h-9 text-xs rounded-xl bg-background border-border/60 focus-visible:ring-primary/20"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded-full hover:bg-muted transition-all cursor-pointer"
                title="Limpiar búsqueda"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Date Desde */}
        <div className="lg:col-span-2.5 space-y-1.5">
          <Label className="text-xs font-semibold text-muted-foreground">Fecha Desde</Label>
          <DatePicker
            value={fechaDesde}
            onChange={onFechaDesdeChange}
            placeholder="Desde inicio..."
            className="w-full h-9 text-xs rounded-xl"
          />
        </div>

        {/* Date Hasta */}
        <div className="lg:col-span-2.5 space-y-1.5">
          <Label className="text-xs font-semibold text-muted-foreground">Fecha Hasta</Label>
          <DatePicker
            value={fechaHasta}
            onChange={onFechaHastaChange}
            placeholder="Hasta hoy..."
            className="w-full h-9 text-xs rounded-xl"
          />
        </div>

        {/* Estado Filter */}
        <div className="lg:col-span-2 space-y-1.5">
          <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
            <Filter className="size-3 text-primary" /> Estado
          </Label>
          <Select value={selectedEstado} onValueChange={(val) => onSelectedEstadoChange(val ?? "TODOS")}>
            <SelectTrigger className="w-full h-9 text-xs rounded-xl bg-background border-border/60">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TODOS" className="text-xs">
                Todos los estados
              </SelectItem>
              <SelectItem value={String(EstadoCobro.Confirmado)} className="text-xs">
                {EstadoCobroLabels[EstadoCobro.Confirmado]} (Cobrado)
              </SelectItem>
              <SelectItem value={String(EstadoCobro.Registrado)} className="text-xs">
                {EstadoCobroLabels[EstadoCobro.Registrado]} (Por Cobrar)
              </SelectItem>
              <SelectItem value={String(EstadoCobro.Anulado)} className="text-xs">
                {EstadoCobroLabels[EstadoCobro.Anulado]}
              </SelectItem>
              <SelectItem value={String(EstadoCobro.DevueltoParcial)} className="text-xs">
                {EstadoCobroLabels[EstadoCobro.DevueltoParcial]}
              </SelectItem>
              <SelectItem value={String(EstadoCobro.Devuelto)} className="text-xs">
                {EstadoCobroLabels[EstadoCobro.Devuelto]}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Date Inversion Error Banner */}
      {isDateInverted && (
        <div className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-300 bg-amber-500/10 border border-amber-500/20 px-3 py-2 rounded-xl">
          <AlertTriangle className="size-4 shrink-0 text-amber-500" />
          <span>
            La fecha inicial no puede ser mayor a la fecha final. Por favor ajusta el rango.
          </span>
        </div>
      )}
    </div>
  );
}
