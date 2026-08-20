"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2 } from "lucide-react";
import type { ServiceItemState } from "../store/use-admision-store";
import type { MedicoResponse } from "@/modules/recursos-humanos/medico/types/medico.types";

export interface ServicioRowItemProps {
  row: ServiceItemState;
  index: number;
  medicos: MedicoResponse[];
  onUpdate: (id: string, field: keyof ServiceItemState, value: unknown) => void;
  onRemove: (id: string) => void;
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
    <div className="p-2.5 rounded-lg border border-border/70 bg-card/60 hover:bg-card hover:border-primary/40 transition-all space-y-1.5 shadow-2xs">
      {/* Fila Superior: Badge + Nombre Completo + Código + Categoría + Botón Eliminar */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <Badge
            variant="outline"
            className="text-[10px] bg-primary/10 text-primary border-primary/25 font-bold px-1.5 py-0 h-4.5 shrink-0"
          >
            #{index + 1}
          </Badge>

          <span
            className="font-bold text-foreground text-xs leading-snug truncate"
            title={row.servicioNombre}
          >
            {row.servicioNombre || "Consulta Médica"}
          </span>

          {row.servicioCodigo && (
            <span className="font-mono text-[9.5px] font-bold text-muted-foreground bg-muted/60 px-1.5 py-0.2 rounded shrink-0">
              {row.servicioCodigo}
            </span>
          )}

          {row.categoriaNombre && (
            <span className="text-[10px] text-muted-foreground/80 font-medium truncate hidden md:inline">
              • {row.categoriaNombre}
            </span>
          )}
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onRemove(row.id)}
          className="size-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md cursor-pointer transition-colors shrink-0"
          title="Quitar prestación"
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>

      {/* Fila Inferior: Selector de Médico + Cantidad + Precio + Subtotal */}
      <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 pt-1 border-t border-border/40">
        {/* Selector de Médico */}
        <div className="w-full sm:w-60 min-w-[170px]">
          {row.medicosDisponibles && row.medicosDisponibles.length > 0 ? (
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
              <SelectTrigger className="h-7 w-full bg-background text-[11px] font-medium border-border/80 truncate">
                <SelectValue placeholder="Seleccionar médico...">
                  {selectedMedicoNombre}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="max-w-md">
                <SelectItem value="sin-medico" label="Sin Médico / Guardia">
                  Sin Médico / Guardia
                </SelectItem>
                {row.medicosDisponibles.map((md) => (
                  <SelectItem
                    key={`md-${md.medicoId}`}
                    value={md.medicoId.toString()}
                    label={md.nombreMedico}
                  >
                    {md.nombreMedico}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="h-7 px-2.5 flex items-center bg-muted/40 rounded border border-border/60 text-[11px] text-muted-foreground font-medium select-none">
              <span className="truncate">Sin Médico / Guardia</span>
            </div>
          )}
        </div>

        {/* Valores Numéricos: Cantidad + Precio + Subtotal */}
        <div className="flex items-center gap-2.5 ml-auto">
          {/* Cantidad */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Cant:</span>
            <Input
              type="number"
              min="1"
              value={row.cantidad}
              onChange={(e) => onUpdate(row.id, "cantidad", Math.max(1, Number(e.target.value)))}
              className="h-7 w-12 text-xs text-center font-bold font-mono bg-background px-1"
              placeholder="1"
            />
          </div>

          {/* Precio Unitario */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">P. Unit:</span>
            <Input
              type="number"
              min="0"
              step="0.5"
              value={row.precioUnitario}
              onChange={(e) => onUpdate(row.id, "precioUnitario", Math.max(0, Number(e.target.value)))}
              className="h-7 w-18 text-xs text-right font-mono font-medium bg-background px-1.5"
              placeholder="0.00"
            />
          </div>

          {/* Subtotal */}
          <span className="text-xs font-bold text-primary font-mono min-w-[70px] text-right">
            Bs. {Math.max(0, subtotalFila).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
