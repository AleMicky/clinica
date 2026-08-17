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
import { Trash2 } from "lucide-react";
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
    <div className="p-4 bg-card rounded-xl border border-border/80 shadow-2xs space-y-3 hover:border-primary/40 transition-colors w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-border/50">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20 font-bold px-2 py-0.5">
            Prestación #{index + 1}
          </Badge>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-semibold text-muted-foreground">📁 {row.categoriaNombre || "Catálogo General"}</span>
            <span className="text-muted-foreground">→</span>
            <span className="font-extrabold text-foreground text-xs">
              🩺 {row.servicioNombre || "Consulta Médica General"}
              {row.servicioCodigo ? ` (${row.servicioCodigo})` : ""}
            </span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onRemove(row.id)}
          className="h-7 px-2.5 text-xs font-semibold gap-1 text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border-rose-200 self-end sm:self-auto"
          title="Quitar esta prestación"
        >
          <Trash2 className="size-3.5" />
          <span className="hidden sm:inline">Quitar</span>
        </Button>
      </div>

      <div className="grid grid-cols-12 gap-3 items-end pt-1">
        <div className="col-span-12 sm:col-span-5 space-y-1">
          <div className="flex items-center justify-between">
            <Label className="text-[11px] text-muted-foreground font-semibold">Médico Tratante</Label>
            {row.medicosDisponibles && row.medicosDisponibles.length > 0 && (
              <span className="text-[10px] text-primary font-medium">
                {row.medicosDisponibles.length} asignado(s)
              </span>
            )}
          </div>
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
            <SelectTrigger className="h-9 w-full bg-background text-xs font-medium border-border/80">
              <SelectValue placeholder="Seleccionar médico...">
                {selectedMedicoNombre}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sin-medico" label="Sin Médico / Guardia">Sin Médico / Guardia</SelectItem>
              {row.medicosDisponibles && row.medicosDisponibles.length > 0 && (
                <div className="border-b border-border/50 pb-1 mb-1">
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
                    Médicos Asignados a la Prestación ({row.medicosDisponibles.length})
                  </div>
                  {row.medicosDisponibles.map((md) => (
                    <SelectItem
                      key={`md-${md.medicoId}`}
                      value={md.medicoId.toString()}
                      label={md.nombreMedico}
                    >
                      👨‍⚕️ {md.nombreMedico}
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

        <div className="col-span-4 sm:col-span-2 space-y-1">
          <Label className="text-[11px] text-muted-foreground font-semibold text-center block">Cantidad</Label>
          <Input
            type="number"
            min="1"
            value={row.cantidad}
            onChange={(e) => onUpdate(row.id, "cantidad", Number(e.target.value))}
            className="h-9 text-xs text-center font-bold bg-background"
          />
        </div>

        <div className="col-span-4 sm:col-span-2 space-y-1">
          <Label className="text-[11px] text-muted-foreground font-semibold text-right block">Precio (S/.)</Label>
          <Input
            type="number"
            min="0"
            step="0.5"
            value={row.precioUnitario}
            onChange={(e) => onUpdate(row.id, "precioUnitario", Number(e.target.value))}
            className="h-9 text-xs text-right font-mono font-bold bg-background"
          />
        </div>

        <div className="col-span-4 sm:col-span-3 text-right">
          <span className="text-[10px] text-muted-foreground uppercase block font-bold">Subtotal</span>
          <span className="text-base font-extrabold text-primary">
            S/. {Math.max(0, subtotalFila).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
