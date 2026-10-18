"use client";

import * as React from "react";
import {
  SlidersHorizontal,
  ArrowDownLeft,
  ArrowUpRight,
  Search,
  RefreshCw,
  FolderTree,
  Tag,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useTiposMovimientoCaja,
  useConceptosMovimientoCaja,
} from "../../movimiento-caja/hooks/use-movimientos-caja";
import type {
  TipoMovimientoCajaInfo,
  ConceptoMovimientoCajaInfo,
} from "../../movimiento-caja/types/movimiento-caja.types";

export function TipoMovimientoCajaModuleView() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filtroNaturaleza, setFiltroNaturaleza] = React.useState<string>("TODOS");

  const { data: tiposData, isLoading, refetch } = useTiposMovimientoCaja();

  const filteredTipos = React.useMemo(() => {
    if (!tiposData) return [];

    return tiposData.filter((t) => {
      const matchesSearch =
        !searchTerm ||
        t.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.codigo.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesNaturaleza =
        filtroNaturaleza === "TODOS" ||
        t.naturaleza.toUpperCase() === filtroNaturaleza.toUpperCase();

      return matchesSearch && matchesNaturaleza;
    });
  }, [tiposData, searchTerm, filtroNaturaleza]);

  const totalTipos = tiposData?.length || 0;
  const totalEntradas =
    tiposData?.filter((t) => t.naturaleza.toUpperCase() === "ENTRADA").length ||
    0;
  const totalSalidas =
    tiposData?.filter((t) => t.naturaleza.toUpperCase() === "SALIDA").length || 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <SlidersHorizontal className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                Tipos y Conceptos de Movimiento
              </h1>
              <p className="text-xs text-muted-foreground">
                Configuración del catálogo de tipos y conceptos para ingresos y egresos de caja
              </p>
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isLoading}
          className="h-8 gap-1.5 text-xs self-start sm:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
          <span>Actualizar</span>
        </Button>
      </div>

      {/* Métricas / Resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="shadow-xs py-3 px-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">Total de Tipos</span>
            <FolderTree className="h-4 w-4 text-muted-foreground/60" />
          </div>
          <div className="text-2xl font-bold mt-1">{totalTipos}</div>
        </Card>

        <Card className="shadow-xs py-3 px-4 border-emerald-500/20 bg-emerald-50/30 dark:bg-emerald-950/10">
          <div className="flex items-center justify-between">
            <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">Tipos de Ingreso (Entrada)</span>
            <ArrowDownLeft className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 mt-1">
            {totalEntradas}
          </div>
        </Card>

        <Card className="shadow-xs py-3 px-4 border-rose-500/20 bg-rose-50/30 dark:bg-rose-950/10">
          <div className="flex items-center justify-between">
            <span className="text-xs text-rose-700 dark:text-rose-400 font-medium">Tipos de Egreso (Salida)</span>
            <ArrowUpRight className="h-4 w-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-rose-700 dark:text-rose-400 mt-1">
            {totalSalidas}
          </div>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Buscar por código o nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 h-8 text-xs bg-card"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <Button
            variant={filtroNaturaleza === "TODOS" ? "default" : "outline"}
            size="sm"
            onClick={() => setFiltroNaturaleza("TODOS")}
            className="h-8 text-xs px-3 flex-1 sm:flex-initial"
          >
            Todos ({totalTipos})
          </Button>
          <Button
            variant={filtroNaturaleza === "ENTRADA" ? "default" : "outline"}
            size="sm"
            onClick={() => setFiltroNaturaleza("ENTRADA")}
            className="h-8 text-xs px-3 flex-1 sm:flex-initial gap-1"
          >
            <ArrowDownLeft className="h-3 w-3 text-emerald-500" />
            Entradas
          </Button>
          <Button
            variant={filtroNaturaleza === "SALIDA" ? "default" : "outline"}
            size="sm"
            onClick={() => setFiltroNaturaleza("SALIDA")}
            className="h-8 text-xs px-3 flex-1 sm:flex-initial gap-1"
          >
            <ArrowUpRight className="h-3 w-3 text-rose-500" />
            Salidas
          </Button>
        </div>
      </div>

      {/* Lista de Tipos con sus Conceptos */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-4 space-y-3">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-16 w-full" />
            </Card>
          ))}
        </div>
      ) : filteredTipos.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">
          <SlidersHorizontal className="h-8 w-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm font-medium">No se encontraron tipos de movimiento</p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            {searchTerm ? "Pruebe con otros términos de búsqueda" : "No hay tipos registrados"}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTipos.map((tipo) => (
            <TipoMovimientoCard key={tipo.id} tipo={tipo} />
          ))}
        </div>
      )}
    </div>
  );
}

function TipoMovimientoCard({ tipo }: { tipo: TipoMovimientoCajaInfo }) {
  const isEntrada = tipo.naturaleza.toUpperCase() === "ENTRADA";
  const { data: conceptos, isLoading } = useConceptosMovimientoCaja(tipo.id);

  return (
    <Card className="shadow-xs overflow-hidden border border-border">
      <CardHeader className="p-4 pb-2 bg-muted/30 border-b border-border/60">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-muted font-bold text-foreground">
              {tipo.codigo}
            </span>
            <CardTitle className="text-sm font-semibold text-foreground">
              {tipo.nombre}
            </CardTitle>
          </div>
          <Badge
            variant={isEntrada ? "default" : "secondary"}
            className={`text-[10px] px-2 py-0.5 ${
              isEntrada
                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                : "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/20"
            }`}
          >
            {isEntrada ? "Entrada (+)" : "Salida (-)"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-medium flex items-center gap-1">
              <Tag className="h-3 w-3" />
              Conceptos asignados
            </span>
            <span className="text-[11px]">
              {conceptos ? `${conceptos.length} concepto(s)` : "Cargando..."}
            </span>
          </div>

          {isLoading ? (
            <div className="space-y-1.5">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-3/4" />
            </div>
          ) : !conceptos || conceptos.length === 0 ? (
            <div className="rounded-md border border-dashed border-border p-3 text-center text-xs text-muted-foreground/70">
              No tiene conceptos asociados
            </div>
          ) : (
            <div className="divide-y divide-border/60 rounded-md border border-border/80 overflow-hidden bg-background">
              {conceptos.map((conc: ConceptoMovimientoCajaInfo) => (
                <div
                  key={conc.id}
                  className="flex items-center justify-between px-3 py-1.5 text-xs hover:bg-muted/40 transition-colors"
                >
                  <span className="font-medium text-foreground">{conc.nombre}</span>
                  <span className="font-mono text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                    {conc.codigo}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
