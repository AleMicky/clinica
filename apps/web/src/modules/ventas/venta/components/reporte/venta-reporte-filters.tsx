"use client";

import * as React from "react";
import { Search, X, Calendar, AlertTriangle, RotateCcw } from "lucide-react";
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
import { EstadoVenta, EstadoVentaLabels } from "../../types/ventas.types";
import { cn } from "@/lib/utils";

export type DatePreset = "hoy" | "ayer" | "semana" | "mes" | "30dias" | "todo";

interface VentaReporteFiltersProps {
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

export function VentaReporteFilters({
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
}: Readonly<VentaReporteFiltersProps>) {
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
              Histórico Completo
            </button>
          </div>
        </div>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="h-7 px-2.5 text-xs text-muted-foreground hover:text-destructive gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="size-3" />
            <span>Restablecer Filtros</span>
          </Button>
        )}
      </div>

      {/* 2. Interactive Filter Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
        {/* Search Input (5 Cols) */}
        <div className="lg:col-span-5 space-y-1">
          <Label className="text-[11px] font-semibold text-muted-foreground">
            Búsqueda General
          </Label>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar por N° venta, paciente, CI, vendedor..."
              className="h-9 pl-8 pr-8 text-xs bg-muted/20 border-border/50 rounded-lg focus-visible:ring-1 focus-visible:ring-primary"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Fecha Desde (2 Cols) */}
        <div className="lg:col-span-2 space-y-1">
          <Label className="text-[11px] font-semibold text-muted-foreground">
            Desde
          </Label>
          <DatePicker
            value={fechaDesde}
            onChange={onFechaDesdeChange}
            placeholder="Inicio"
            className={cn("h-9 text-xs rounded-lg", isDateInverted && "border-amber-500/80 text-amber-600")}
          />
        </div>

        {/* Fecha Hasta (2 Cols) */}
        <div className="lg:col-span-2 space-y-1">
          <Label className="text-[11px] font-semibold text-muted-foreground">
            Hasta
          </Label>
          <DatePicker
            value={fechaHasta}
            onChange={onFechaHastaChange}
            placeholder="Fin"
            className={cn("h-9 text-xs rounded-lg", isDateInverted && "border-amber-500/80 text-amber-600")}
          />
        </div>

        {/* Estado Venta (3 Cols) */}
        <div className="lg:col-span-3 space-y-1">
          <Label className="text-[11px] font-semibold text-muted-foreground">
            Estado de Venta
          </Label>
          <Select
            value={selectedEstado}
            onValueChange={(val) => {
              if (val) onSelectedEstadoChange(val);
            }}
          >
            <SelectTrigger className="h-9 text-xs rounded-lg bg-muted/20 border-border/50">
              <SelectValue placeholder="Todos los estados" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TODOS" className="text-xs">
                Todos los estados
              </SelectItem>
              <SelectItem value={String(EstadoVenta.Pendiente)} className="text-xs">
                {EstadoVentaLabels[EstadoVenta.Pendiente]}
              </SelectItem>
              <SelectItem value={String(EstadoVenta.PendienteCobro)} className="text-xs">
                {EstadoVentaLabels[EstadoVenta.PendienteCobro]}
              </SelectItem>
              <SelectItem value={String(EstadoVenta.ParcialmentePagada)} className="text-xs">
                {EstadoVentaLabels[EstadoVenta.ParcialmentePagada]}
              </SelectItem>
              <SelectItem value={String(EstadoVenta.Pagada)} className="text-xs">
                {EstadoVentaLabels[EstadoVenta.Pagada]}
              </SelectItem>
              <SelectItem value={String(EstadoVenta.Anulada)} className="text-xs">
                {EstadoVentaLabels[EstadoVenta.Anulada]}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Date Inversion Warning Banner */}
      {isDateInverted && (
        <div className="flex items-center gap-2 p-2.5 bg-amber-500/10 border border-amber-500/25 rounded-xl text-amber-700 dark:text-amber-400 text-xs">
          <AlertTriangle className="size-4 shrink-0" />
          <span>
            <strong>Atención:</strong> La fecha de inicio es posterior a la fecha final. Invierta las fechas para obtener resultados.
          </span>
        </div>
      )}
    </div>
  );
}
