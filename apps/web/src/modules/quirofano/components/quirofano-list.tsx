"use client";

import * as React from "react";
import {
  Activity,
  Calendar,
  Clock,
  Eye,
  FileSpreadsheet,
  CheckCircle2,
  Play,
  Ban,
  Scissors,
  User,
  Stethoscope,
  DoorOpen,
  Package,
  Layers,
  Search,
  Filter,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn, formatDate } from "@/lib/utils";
import type {
  CirugiaResponse,
  EstadoCirugia,
  TipoCirugia,
} from "../types/quirofano.types";

interface QuirofanoListProps {
  cirugias: CirugiaResponse[];
  isLoading: boolean;
  onViewDetail: (cirugia: CirugiaResponse) => void;
  onIniciar: (cirugia: CirugiaResponse) => void;
  onProtocoloGastos: (cirugia: CirugiaResponse) => void;
  onFinalizar: (cirugia: CirugiaResponse) => void;
  onCancelar: (cirugia: CirugiaResponse) => void;
  onSearchChange: (search: string) => void;
  onEstadoChange: (estado: EstadoCirugia | undefined) => void;
  selectedEstado?: EstadoCirugia;
}

function getEstadoBadge(estado: EstadoCirugia) {
  switch (estado) {
    case "Programada":
      return (
        <Badge
          variant="outline"
          className="bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30 font-semibold text-[10px] gap-1"
        >
          <Calendar className="size-2.5" />
          <span>Programada</span>
        </Badge>
      );
    case "EnPreparacion":
      return (
        <Badge
          variant="outline"
          className="bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30 font-semibold text-[10px] gap-1"
        >
          <Clock className="size-2.5" />
          <span>En Preparación</span>
        </Badge>
      );
    case "EnCurso":
      return (
        <Badge
          variant="outline"
          className="bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 font-semibold text-[10px] gap-1 animate-pulse"
        >
          <Activity className="size-2.5" />
          <span>En Quirófano</span>
        </Badge>
      );
    case "Recuperacion":
      return (
        <Badge
          variant="outline"
          className="bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/30 font-semibold text-[10px] gap-1"
        >
          <Clock className="size-2.5" />
          <span>Recuperación</span>
        </Badge>
      );
    case "Finalizada":
      return (
        <Badge
          variant="outline"
          className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 font-semibold text-[10px] gap-1"
        >
          <CheckCircle2 className="size-2.5" />
          <span>Finalizada (Stock Descontado)</span>
        </Badge>
      );
    case "Cancelada":
      return (
        <Badge
          variant="outline"
          className="bg-destructive/10 text-destructive border-destructive/30 font-semibold text-[10px] gap-1"
        >
          <Ban className="size-2.5" />
          <span>Cancelada</span>
        </Badge>
      );
    default:
      return <Badge variant="secondary">{estado}</Badge>;
  }
}

export function QuirofanoList({
  cirugias,
  isLoading,
  onViewDetail,
  onIniciar,
  onProtocoloGastos,
  onFinalizar,
  onCancelar,
  onSearchChange,
  onEstadoChange,
  selectedEstado,
}: QuirofanoListProps) {
  const [searchTerm, setSearchTerm] = React.useState("");

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    onSearchChange(e.target.value);
  };

  return (
    <div className="space-y-3">
      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 p-2.5 rounded-xl border border-border/70 bg-card shadow-2xs">
        <div className="relative flex-1">
          <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Buscar por código (CIR-...), paciente, procedimiento o cirujano..."
            className="h-8 text-xs pl-8 bg-background/50"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs">
            <Filter className="size-3 text-muted-foreground" />
            <select
              value={selectedEstado || ""}
              onChange={(e) =>
                onEstadoChange(
                  e.target.value ? (e.target.value as EstadoCirugia) : undefined
                )
              }
              className="h-8 px-2 text-xs rounded-md border border-border/60 bg-background text-foreground shadow-2xs"
            >
              <option value="">Todos los estados</option>
              <option value="Programada">Programadas</option>
              <option value="EnCurso">En Quirófano (En Curso)</option>
              <option value="Finalizada">Finalizadas</option>
              <option value="Cancelada">Canceladas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Cirugias Table */}
      <div className="rounded-xl border border-border/70 overflow-hidden bg-card shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-muted/50 border-b border-border/60">
              <tr className="text-muted-foreground font-semibold text-[10px] uppercase tracking-wider">
                <th className="px-3 py-2 w-28">N° Cirugía</th>
                <th className="px-3 py-2 min-w-48">Paciente & Admisión</th>
                <th className="px-3 py-2 min-w-56">Procedimiento & Sala</th>
                <th className="px-3 py-2 min-w-44">Cirujano & Equipo</th>
                <th className="px-3 py-2 min-w-32">Fecha Programada</th>
                <th className="px-3 py-2 w-36 text-center">Estado</th>
                <th className="px-3 py-2 w-32 text-right">Insumos ALM-QUI</th>
                <th className="px-3 py-2 w-32 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-3 py-8 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-1.5">
                      <div className="size-5 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs">Cargando cirugías y bloque quirúrgico...</span>
                    </div>
                  </td>
                </tr>
              ) : cirugias.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-3 py-8 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-1.5">
                      <Scissors className="size-6 text-muted-foreground/60" />
                      <span className="font-medium text-xs">No hay cirugías registradas con los filtros seleccionados</span>
                    </div>
                  </td>
                </tr>
              ) : (
                cirugias.map((c) => {
                  const itemsCount = c.gastosMateriales.length;
                  const totalGasto = c.totalPrecioMateriales;

                  return (
                    <tr
                      key={c.id}
                      className="hover:bg-muted/30 transition-colors group"
                    >
                      {/* N° Cirugia */}
                      <td className="px-3 py-2.5 font-mono text-xs font-bold text-foreground">
                        <div className="flex items-center gap-1.5">
                          <span className="text-cyan-700 dark:text-cyan-300 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">
                            {c.numero}
                          </span>
                        </div>
                        <span className="text-[10px] text-muted-foreground font-normal block pt-0.5">
                          {c.tipoTexto}
                        </span>
                      </td>

                      {/* Paciente */}
                      <td className="px-3 py-2.5">
                        <div className="font-semibold text-foreground flex items-center gap-1">
                          <User className="size-3 text-cyan-600 shrink-0" />
                          <span className="truncate">{c.pacienteNombreCompleto}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground pt-0.5">
                          <span>HC: {c.pacienteHistoriaClinica}</span>
                          {c.admisionNumero && (
                            <>
                              <span>•</span>
                              <span className="text-primary font-mono font-medium">
                                Adm: {c.admisionNumero}
                              </span>
                            </>
                          )}
                        </div>
                      </td>

                      {/* Procedimiento & Sala */}
                      <td className="px-3 py-2.5">
                        <div className="font-semibold text-foreground line-clamp-1">
                          {c.procedimientoQuirurgico}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground pt-0.5">
                          <DoorOpen className="size-2.5 text-muted-foreground" />
                          <span className="font-medium text-foreground/80">{c.salaOperaciones}</span>
                          <span>•</span>
                          <span>Anestesia: {c.tipoAnestesiaTexto}</span>
                        </div>
                      </td>

                      {/* Cirujano & Equipo */}
                      <td className="px-3 py-2.5">
                        <div className="font-medium text-foreground flex items-center gap-1">
                          <Stethoscope className="size-3 text-cyan-600 shrink-0" />
                          <span className="truncate">{c.cirujanoNombreCompleto}</span>
                        </div>
                        <div className="text-[10px] text-muted-foreground truncate pt-0.5">
                          {c.anestesiologoNombreCompleto ? `Anest: ${c.anestesiologoNombreCompleto}` : "Sin anestesiólogo reg."}
                        </div>
                      </td>

                      {/* Fecha */}
                      <td className="px-3 py-2.5 font-mono text-[11px] text-muted-foreground">
                        <div className="text-foreground font-medium">
                          {formatDate(c.fechaProgramada)}
                        </div>
                        {c.fechaInicio && (
                          <div className="text-[10px] text-amber-600 dark:text-amber-400">
                            Inició: {new Date(c.fechaInicio).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </div>
                        )}
                      </td>

                      {/* Estado */}
                      <td className="px-3 py-2.5 text-center">
                        {getEstadoBadge(c.estado)}
                      </td>

                      {/* Insumos */}
                      <td className="px-3 py-2.5 text-right font-mono">
                        <div className="font-bold text-foreground tabular-nums">
                          Bs. {totalGasto.toFixed(2)}
                        </div>
                        <span className="text-[10px] text-muted-foreground">
                          {itemsCount} {itemsCount === 1 ? "artículo" : "artículos"}
                        </span>
                      </td>

                      {/* Acciones */}
                      <td className="px-3 py-2.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {/* Detalle Quirúrgico */}
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => onViewDetail(c)}
                            title="Ver Protocolo Quirúrgico / Imprimir"
                            className="size-7 text-muted-foreground hover:text-cyan-600 hover:bg-cyan-500/10 cursor-pointer rounded-lg"
                          >
                            <Eye className="size-3.5" />
                          </Button>

                          {/* Iniciar Cirugía */}
                          {(c.estado === "Programada" || c.estado === "EnPreparacion") && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => onIniciar(c)}
                              title="Iniciar Cirugía en Quirófano"
                              className="size-7 text-amber-600 hover:text-amber-700 hover:bg-amber-500/10 cursor-pointer rounded-lg"
                            >
                              <Play className="size-3.5" />
                            </Button>
                          )}

                          {/* Hoja de Gastos / Protocolo */}
                          {c.estado === "EnCurso" && (
                            <>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => onProtocoloGastos(c)}
                                title="Registrar Materiales e Insumos en Hoja de Gasto"
                                className="size-7 text-cyan-600 hover:text-cyan-700 hover:bg-cyan-500/10 cursor-pointer rounded-lg"
                              >
                                <FileSpreadsheet className="size-3.5" />
                              </Button>

                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => onFinalizar(c)}
                                title="Finalizar Cirugía & Descontar Inventario"
                                className="size-7 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10 cursor-pointer rounded-lg"
                              >
                                <CheckCircle2 className="size-3.5" />
                              </Button>
                            </>
                          )}

                          {/* Cancelar */}
                          {c.estado !== "Finalizada" && c.estado !== "Cancelada" && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => onCancelar(c)}
                              title="Cancelar Cirugía"
                              className="size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer rounded-lg"
                            >
                              <Ban className="size-3.5" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
