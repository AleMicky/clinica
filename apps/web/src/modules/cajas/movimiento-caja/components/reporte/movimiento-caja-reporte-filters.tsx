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
import { cn } from "@/lib/utils";
import type { TurnoCajaResponse } from "../../../turno-caja/types/turno-caja.types";

export type DatePreset = "hoy" | "ayer" | "semana" | "mes" | "30dias" | "todo";

interface MovimientoCajaReporteFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  fechaDesde: string;
  onFechaDesdeChange: (value: string) => void;
  fechaHasta: string;
  onFechaHastaChange: (value: string) => void;
  selectedNaturaleza: "TODOS" | "ENTRADA" | "SALIDA";
  onSelectedNaturalezaChange: (value: "TODOS" | "ENTRADA" | "SALIDA") => void;
  selectedTurnoId: number | null;
  onSelectedTurnoIdChange: (value: number | null) => void;
  turnos: TurnoCajaResponse[];
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  onApplyPreset: (preset: DatePreset) => void;
  todayIso: string;
  yesterdayIso: string;
  startOfMonthIso: string;
}

export function MovimientoCajaReporteFilters({
  searchTerm,
  onSearchChange,
  fechaDesde,
  onFechaDesdeChange,
  fechaHasta,
  onFechaHastaChange,
  selectedNaturaleza,
  onSelectedNaturalezaChange,
  selectedTurnoId,
  onSelectedTurnoIdChange,
  turnos,
  hasActiveFilters,
  onClearFilters,
  onApplyPreset,
  todayIso,
  yesterdayIso,
  startOfMonthIso,
}: Readonly<MovimientoCajaReporteFiltersProps>) {
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
            className="h-7 px-2.5 text-xs gap-1.5 text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 cursor-pointer transition-colors"
          >
            <RotateCcw className="size-3" />
            <span>Limpiar filtros</span>
          </Button>
        )}
      </div>

      {/* 2. Detailed Filter Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
        {/* Search */}
        <div className="lg:col-span-4 space-y-1">
          <Label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
            <Search className="size-3" /> Buscar en movimientos
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Concepto, tipo, referencia, observación..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-9 pl-9 pr-8 text-xs bg-muted/20 border-border/50 rounded-xl focus:bg-background transition-all"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
              >
                <X className="size-3" />
              </button>
            )}
          </div>
        </div>

        {/* Naturaleza */}
        <div className="lg:col-span-2 space-y-1">
          <Label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
            <Filter className="size-3" /> Naturaleza
          </Label>
          <Select
            value={selectedNaturaleza}
            onValueChange={(val) =>
              onSelectedNaturalezaChange(val as "TODOS" | "ENTRADA" | "SALIDA")
            }
          >
            <SelectTrigger className="h-9 text-xs bg-muted/20 border-border/50 rounded-xl">
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TODOS" className="text-xs">
                Todas las operaciones
              </SelectItem>
              <SelectItem value="ENTRADA" className="text-xs">
                🟢 Solo Entradas (Ingresos)
              </SelectItem>
              <SelectItem value="SALIDA" className="text-xs">
                🔴 Solo Salidas (Egresos)
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Turno / Caja */}
        <div className="lg:col-span-2 space-y-1">
          <Label className="text-[11px] font-semibold text-muted-foreground">
            Turno / Caja
          </Label>
          <Select
            value={selectedTurnoId ? String(selectedTurnoId) : "TODOS"}
            onValueChange={(val) =>
              onSelectedTurnoIdChange(val === "TODOS" ? null : Number(val))
            }
          >
            <SelectTrigger className="h-9 text-xs bg-muted/20 border-border/50 rounded-xl truncate">
              <SelectValue placeholder="Todas las cajas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TODOS" className="text-xs">
                Todos los turnos
              </SelectItem>
              {turnos.map((t) => (
                <SelectItem key={t.id} value={String(t.id)} className="text-xs">
                  {t.caja?.nombre || `Turno #${t.id}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Fecha Desde */}
        <div className="lg:col-span-2 space-y-1">
          <Label className="text-[11px] font-semibold text-muted-foreground">
            Fecha Desde
          </Label>
          <DatePicker
            value={fechaDesde}
            onChange={(val) => onFechaDesdeChange(val || "")}
            placeholder="DD/MM/AAAA"
            allowClear
            className="h-9 text-xs bg-muted/20 border-border/50 rounded-xl"
          />
        </div>

        {/* Fecha Hasta */}
        <div className="lg:col-span-2 space-y-1">
          <Label className="text-[11px] font-semibold text-muted-foreground">
            Fecha Hasta
          </Label>
          <DatePicker
            value={fechaHasta}
            onChange={(val) => onFechaHastaChange(val || "")}
            placeholder="DD/MM/AAAA"
            allowClear
            className="h-9 text-xs bg-muted/20 border-border/50 rounded-xl"
          />
        </div>
      </div>

      {/* Date Inversion Alert */}
      {isDateInverted && (
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs">
          <AlertTriangle className="size-4 shrink-0" />
          <span>
            La fecha inicial es posterior a la fecha final. Por favor verifique el rango seleccionado.
          </span>
        </div>
      )}
    </div>
  );
}
