"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, Stethoscope } from "lucide-react";
import type { ServiceItemState } from "../store/use-admision-store";
import type { MedicoResponse } from "@/modules/recursos-humanos/medico/types/medico.types";

export interface ServicioRowItemProps {
  row: ServiceItemState;
  index: number;
  medicos: MedicoResponse[];
  onUpdate: (id: string, field: keyof ServiceItemState, value: unknown) => void;
  onRemove: (id: string) => void;
  isOnlyRow?: boolean;
}

export function ServicioRowItem({
  row,
  index,
  medicos,
  onUpdate,
  onRemove,
}: ServicioRowItemProps) {
  const subtotalFila = (row.cantidad || 1) * (row.precioUnitario || 0) - (row.descuento || 0);

  const selectedMedicoNombre = React.useMemo(() => {
    if (!row.medicoId) return "Sin Médico / Guardia";
    const m = medicos.find((med) => med.id === row.medicoId);
    if (m?.empleado?.nombreCompleto) return m.empleado.nombreCompleto;
    const md = row.medicosDisponibles?.find((mDis) => mDis.medicoId === row.medicoId);
    if (md?.nombreMedico) return md.nombreMedico;
    return `Médico #${row.medicoId}`;
  }, [row.medicoId, medicos, row.medicosDisponibles]);

  return (
    <div className="p-2.5 bg-card rounded-lg border border-border/70 shadow-2xs space-y-2 hover:border-primary/40 transition-colors w-full text-xs">
      {/* Cabecera del Item */}
      <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-border/50">
        <div className="flex items-center gap-1.5 min-w-0">
          <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20 font-bold px-1.5 py-0 h-4.5 shrink-0">
            #{index + 1}
          </Badge>

          <span className="font-semibold text-foreground truncate">
            {row.servicioNombre || "Consulta Médica"}
          </span>

          {row.servicioCodigo && (
            <span className="font-mono text-[10px] text-muted-foreground shrink-0">
              ({row.servicioCodigo})
            </span>
          )}

          {row.categoriaNombre && (
            <span className="text-[10px] text-muted-foreground/70 truncate hidden sm:inline">
              • {row.categoriaNombre}
            </span>
          )}
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onRemove(row.id)}
          className="size-6 text-destructive hover:bg-destructive/10 shrink-0 cursor-pointer"
          title="Quitar prestación"
        >
          <Trash2 className="size-3" />
        </Button>
      </div>

      {/* Grid de Inputs: Médico + Cantidad + Precio + Subtotal */}
      <div className="grid grid-cols-12 gap-2 items-center">
        {/* Médico Tratante */}
        <div className="col-span-12 sm:col-span-5">
          <Select
            value={row.medicoId ? row.medicoId.toString() : "sin-medico"}
            onValueChange={(val: string | null) =>
              onUpdate(
                row.id,
                "medicoId",
                !val || val === "sin-medico" ? undefined : Number(val)
              )
            }
          >
            <SelectTrigger className="h-7.5 w-full bg-background text-xs font-medium border-border/80">
              <SelectValue placeholder="Médico tratante...">
                {selectedMedicoNombre}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sin-medico" label="Sin Médico / Guardia">
                Sin Médico / Guardia
              </SelectItem>
              {row.medicosDisponibles && row.medicosDisponibles.length > 0 && (
                <div className="border-b border-border/50 pb-1 mb-1">
                  <div className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary">
                    Médicos Asignados ({row.medicosDisponibles.length})
                  </div>
                  {row.medicosDisponibles.map((md) => (
                    <SelectItem
                      key={`md-${md.medicoId}`}
                      value={md.medicoId.toString()}
                      label={md.nombreMedico}
                    >
                      {md.nombreMedico}
                    </SelectItem>
                  ))}
                </div>
              )}
              {medicos.map((m) => {
                const nombre = m.empleado?.nombreCompleto || `Médico #${m.id}`;
                return (
                  <SelectItem key={m.id} value={m.id.toString()} label={nombre}>
                    {nombre}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Cantidad */}
        <div className="col-span-3 sm:col-span-2">
          <Input
            type="number"
            min="1"
            value={row.cantidad}
            onChange={(e) => onUpdate(row.id, "cantidad", Math.max(1, Number(e.target.value)))}
            className="h-7.5 text-xs text-center font-bold font-mono bg-background"
            placeholder="Cant."
          />
        </div>

        {/* Precio Unitario */}
        <div className="col-span-4 sm:col-span-2">
          <Input
            type="number"
            min="0"
            step="0.5"
            value={row.precioUnitario}
            onChange={(e) => onUpdate(row.id, "precioUnitario", Math.max(0, Number(e.target.value)))}
            className="h-7.5 text-xs text-right font-mono font-medium bg-background"
            placeholder="Precio"
          />
        </div>

        {/* Subtotal */}
        <div className="col-span-5 sm:col-span-3 text-right">
          <span className="text-xs font-bold text-primary font-mono">
            Bs. {Math.max(0, subtotalFila).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
