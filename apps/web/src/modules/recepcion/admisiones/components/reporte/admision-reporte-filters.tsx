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
              Todo el Historial
            </button>
          </div>
        </div>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="h-7 px-2.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 rounded-lg gap-1.5 cursor-pointer font-medium"
          >
            <RotateCcw className="size-3" />
            Restablecer filtros
          </Button>
        )}
      </div>

      {/* Date Validation Alert if inverted */}
      {isDateInverted && (
        <div className="flex items-center gap-2 px-3 py-2 text-xs font-medium bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20 rounded-xl animate-in fade-in">
          <AlertTriangle className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <span>La fecha inicial es posterior a la final. Ajuste el rango de fechas para ver resultados coherentes.</span>
        </div>
      )}

      {/* 2. Main Filter Inputs Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 items-end">
        {/* Search Input */}
        <div className="space-y-1.5">
          <Label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
            <Search className="size-3 text-muted-foreground" /> Búsqueda General
          </Label>
          <div className="relative">
            <Input
              placeholder="N° admisión, paciente, DNI, HC..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-8.5 text-xs pl-8 pr-7 rounded-xl bg-muted/30 hover:bg-muted/50 focus:bg-background border-border/50 transition-colors"
            />
            <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            {searchTerm && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 cursor-pointer rounded-full hover:bg-muted"
                title="Limpiar búsqueda"
              >
                <X className="size-3" />
              </button>
            )}
          </div>
        </div>

        {/* Fecha Desde */}
        <div className="space-y-1.5">
          <Label className="text-[11px] font-medium text-muted-foreground">Fecha Inicial</Label>
          <Input
            type="date"
            value={fechaDesde}
            onChange={(e) => onFechaDesdeChange(e.target.value)}
            className={cn(
              "h-8.5 text-xs rounded-xl bg-muted/30 hover:bg-muted/50 focus:bg-background border-border/50 transition-colors",
              isDateInverted && "border-amber-500 focus-visible:ring-amber-500"
            )}
          />
        </div>

        {/* Fecha Hasta */}
        <div className="space-y-1.5">
          <Label className="text-[11px] font-medium text-muted-foreground">Fecha Final</Label>
          <Input
            type="date"
            value={fechaHasta}
            onChange={(e) => onFechaHastaChange(e.target.value)}
            className={cn(
              "h-8.5 text-xs rounded-xl bg-muted/30 hover:bg-muted/50 focus:bg-background border-border/50 transition-colors",
              isDateInverted && "border-amber-500 focus-visible:ring-amber-500"
            )}
          />
        </div>

        {/* Estado Selector */}
        <div className="space-y-1.5">
          <Label className="text-[11px] font-medium text-muted-foreground">Estado de Admisión</Label>
          <Select
            value={selectedEstado}
            onValueChange={(val) => onSelectedEstadoChange(val ?? "TODOS")}
          >
            <SelectTrigger className="h-8.5 text-xs w-full rounded-xl bg-muted/30 hover:bg-muted/50 focus:bg-background border-border/50 transition-colors">
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
        <div className="space-y-1.5">
          <Label className="text-[11px] font-medium text-muted-foreground">Convenio / Seguro</Label>
          <Select
            value={selectedConvenioId}
            onValueChange={(val) => onSelectedConvenioIdChange(val ?? "TODOS")}
          >
            <SelectTrigger className="h-8.5 text-xs w-full rounded-xl bg-muted/30 hover:bg-muted/50 focus:bg-background border-border/50 transition-colors">
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
    </div>
  );
}

