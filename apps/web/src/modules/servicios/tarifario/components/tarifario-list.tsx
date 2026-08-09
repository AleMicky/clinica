"use client";

import * as React from "react";
import {
  Tag,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Plus,
  Coins,
  Star,
  Calendar,
  RefreshCw,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import type { TarifarioItem } from "../types/tarifario.types";

interface TarifarioListProps {
  tarifarios: TarifarioItem[];
  selectedTarifarioId: number | null;
  isLoading: boolean;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onSelectTarifario: (tarifario: TarifarioItem) => void;
  onEditTarifario: (tarifario: TarifarioItem) => void;
  onDeleteTarifario: (tarifario: TarifarioItem) => void;
  onAddTarifario: () => void;
  onRefresh?: () => void;
}

function formatDate(dateStr?: string | null) {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    return isNaN(d.getTime())
      ? dateStr
      : d.toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
  } catch {
    return dateStr;
  }
}

export function TarifarioList({
  tarifarios,
  selectedTarifarioId,
  isLoading,
  searchTerm,
  onSearchChange,
  onSelectTarifario,
  onEditTarifario,
  onDeleteTarifario,
  onAddTarifario,
  onRefresh,
}: TarifarioListProps) {
  return (
    <div className="flex flex-col gap-2.5 bg-card border border-border/60 rounded-xl p-3 shadow-2xs">
      {/* Header */}
      <div className="flex items-center justify-between px-0.5 pt-0.5 border-b border-border/40 pb-2.5">
        <div className="flex items-center gap-1.5">
          <Tag className="size-4 text-primary" />
          <h2 className="text-xs font-semibold text-foreground uppercase tracking-wider">
            Tarifarios
          </h2>
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-mono">
            {tarifarios.length}
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          {onRefresh && (
            <Button
              variant="outline"
              size="icon"
              onClick={onRefresh}
              disabled={isLoading}
              className="size-7 cursor-pointer border-border/60"
              title="Recargar tarifarios"
              aria-label="Recargar tarifarios"
            >
              <RefreshCw className={cn("size-3.5", isLoading && "animate-spin")} />
            </Button>
          )}
          <Button
            size="sm"
            onClick={onAddTarifario}
            className="h-7 px-2.5 text-xs gap-1 cursor-pointer"
          >
            <Plus className="size-3.5" />
            <span>Nuevo</span>
          </Button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="size-3.5 absolute left-2.5 top-2.5 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Buscar por código o nombre..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-8.5 pl-8 text-xs bg-muted/20 border-border/60 focus:bg-background transition-colors"
        />
      </div>

      {/* List content */}
      <div className="flex flex-col gap-1.5 max-h-[calc(100vh-280px)] min-h-[320px] overflow-y-auto pr-0.5">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className="p-3 rounded-lg border border-border/40 bg-muted/10 space-y-2"
            >
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-28 rounded" />
                <Skeleton className="h-4 w-12 rounded" />
              </div>
              <Skeleton className="h-3 w-40 rounded" />
            </div>
          ))
        ) : tarifarios.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
            <Tag className="size-8 text-muted-foreground/40 stroke-1 mb-1.5" />
            <p className="text-xs font-medium text-foreground">Sin tarifarios</p>
            <p className="text-[11px] text-muted-foreground max-w-[200px]">
              {searchTerm ? "No se encontraron coincidencias." : "Cree una lista de precios para comenzar."}
            </p>
          </div>
        ) : (
          tarifarios.map((t) => {
            const isSelected = t.id === selectedTarifarioId;
            const isExpired = t.fechaFin ? new Date(t.fechaFin) < new Date() : false;

            return (
              <div
                key={t.id}
                onClick={() => onSelectTarifario(t)}
                className={cn(
                  "group relative flex flex-col gap-1.5 p-3 rounded-lg border text-left transition-all cursor-pointer select-none",
                  isSelected
                    ? "bg-primary/5 border-primary/40 shadow-2xs ring-1 ring-primary/20"
                    : "bg-card border-border/50 hover:bg-muted/40 hover:border-border"
                )}
              >
                {/* Top line: Code, badges & Menu */}
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="font-mono text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                      {t.codigo}
                    </span>
                    {t.esPrincipal && (
                      <Badge variant="outline" className="text-[9px] px-1 py-0 border-amber-500/40 text-amber-600 bg-amber-500/10 gap-0.5">
                        <Star className="size-2.5 fill-amber-500 text-amber-500" />
                        <span>Principal</span>
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        className="inline-flex size-6 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground text-muted-foreground opacity-70 group-hover:opacity-100 transition-opacity cursor-pointer"
                        aria-label={`Acciones de ${t.codigo}`}
                      >
                        <MoreVertical className="size-3.5" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-36">
                        <DropdownMenuItem
                          onClick={() => onEditTarifario(t)}
                          className="text-xs gap-2 cursor-pointer"
                        >
                          <Edit className="size-3.5 text-muted-foreground" />
                          <span>Editar</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onDeleteTarifario(t)}
                          className="text-xs gap-2 text-destructive focus:text-destructive cursor-pointer"
                        >
                          <Trash2 className="size-3.5" />
                          <span>Eliminar</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Name */}
                <p className="text-xs font-medium text-foreground line-clamp-1">
                  {t.nombre}
                </p>

                {/* Footer details: Currency & Dates */}
                <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/30">
                  <div className="flex items-center gap-1 font-medium text-foreground/80">
                    <Coins className="size-3 text-muted-foreground shrink-0" />
                    <span className="truncate">{t.monedaNombre}</span>
                  </div>

                  <div className="flex items-center gap-1 font-mono text-[10px]">
                    <Calendar className="size-3 text-muted-foreground shrink-0" />
                    <span>
                      {formatDate(t.fechaInicio)}
                      {t.fechaFin && ` - ${formatDate(t.fechaFin)}`}
                    </span>
                    {isExpired && (
                      <span className="text-destructive font-sans font-semibold text-[9px] ml-0.5">(Vencido)</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
