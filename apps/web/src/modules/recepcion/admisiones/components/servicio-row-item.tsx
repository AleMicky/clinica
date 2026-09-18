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
import { Trash2, Plus, Minus, Stethoscope } from "lucide-react";
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
  const cantidad = row.cantidad || 1;
  const precioUnitario = row.precioUnitario || 0;
  const descuento = row.descuento || 0;
  const subtotalFila = cantidad * precioUnitario - descuento;

  const selectedMedicoNombre = React.useMemo(() => {
    if (!row.medicoId) return "Sin Médico / Guardia";
    const m = medicos.find((med) => med.id === row.medicoId);
    if (m?.empleado?.nombreCompleto) return m.empleado.nombreCompleto;
    const md = row.medicosDisponibles?.find((mDis) => mDis.medicoId === row.medicoId);
    if (md?.nombreMedico) return md.nombreMedico;
    return `Médico #${row.medicoId}`;
  }, [row.medicoId, medicos, row.medicosDisponibles]);

  const handleDecreaseQuantity = () => {
    if (cantidad > 1) {
      onUpdate(row.id, "cantidad", cantidad - 1);
    }
  };

  const handleIncreaseQuantity = () => {
    onUpdate(row.id, "cantidad", cantidad + 1);
  };

  return (
    <div className="p-3 rounded-xl border border-border/80 bg-card hover:border-primary/40 transition-all space-y-2.5 shadow-2xs hover:shadow-xs group">
      {/* Fila Superior: Badge #Index + Nombre + Código + Categoría + Botón Eliminar */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="size-6 rounded-lg bg-primary/10 text-primary font-black text-[11px] flex items-center justify-center shrink-0 border border-primary/20">
            {index + 1}
          </div>

          <div className="min-w-0 flex items-center gap-1.5 flex-wrap">
            <span
              className="font-bold text-foreground text-xs sm:text-sm leading-snug truncate"
              title={row.servicioNombre}
            >
              {row.servicioNombre || "Prestación Médica"}
            </span>

            {row.servicioCodigo && (
              <span className="font-mono text-[10px] font-bold text-muted-foreground bg-muted/70 px-1.5 py-0.5 rounded-md shrink-0 border border-border/60">
                {row.servicioCodigo}
              </span>
            )}

            {row.categoriaNombre && (
              <Badge
                variant="secondary"
                className="text-[9.5px] font-semibold text-muted-foreground bg-secondary/60 px-1.5 py-0 h-4.5 hidden md:inline-flex"
              >
                {row.categoriaNombre}
              </Badge>
            )}
          </div>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onRemove(row.id)}
          className="size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg cursor-pointer transition-colors shrink-0"
          title="Eliminar prestación del carrito"
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>

      {/* Fila Inferior: Asignación de Médico + Control de Cantidad (+/-) + Precio + Subtotal */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 pt-2 border-t border-border/50 items-center">
        {/* Selector de Médico (5 cols) */}
        <div className="sm:col-span-6 lg:col-span-5 flex items-center gap-1.5 min-w-0">
          <div className="size-6 rounded-md bg-muted/60 text-muted-foreground flex items-center justify-center shrink-0">
            <Stethoscope className="size-3.5 text-primary" />
          </div>

          <div className="min-w-0 flex-1">
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
                <SelectTrigger className="h-7.5 w-full bg-background text-[11px] font-medium border-border/80 truncate rounded-lg">
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
              <div className="h-7.5 px-2.5 flex items-center bg-muted/30 rounded-lg border border-border/60 text-[11px] text-muted-foreground font-medium select-none">
                <span className="truncate">Sin Médico / Guardia</span>
              </div>
            )}
          </div>
        </div>

        {/* Controles de Cantidad, Precio y Subtotal (7 cols) */}
        <div className="sm:col-span-6 lg:col-span-7 flex items-center justify-between sm:justify-end gap-2.5 sm:ml-auto">
          {/* Stepper de Cantidad con botones +/- */}
          <div className="flex items-center gap-1 bg-muted/40 p-0.5 rounded-lg border border-border/60">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleDecreaseQuantity}
              disabled={cantidad <= 1}
              className="size-6 rounded-md hover:bg-background text-muted-foreground hover:text-foreground cursor-pointer disabled:opacity-30"
              title="Disminuir cantidad"
            >
              <Minus className="size-3" />
            </Button>

            <Input
              type="number"
              min="1"
              value={cantidad}
              onChange={(e) => onUpdate(row.id, "cantidad", Math.max(1, Number(e.target.value)))}
              className="h-6 w-10 text-xs text-center font-bold font-mono bg-background border-0 p-0 shadow-none focus-visible:ring-0"
            />

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleIncreaseQuantity}
              className="size-6 rounded-md hover:bg-background text-muted-foreground hover:text-foreground cursor-pointer"
              title="Aumentar cantidad"
            >
              <Plus className="size-3" />
            </Button>
          </div>

          {/* Precio Unitario */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">x</span>
            <div className="relative">
              <span className="absolute left-1.5 top-1.5 text-[10px] text-muted-foreground font-mono">Bs.</span>
              <Input
                type="number"
                min="0"
                step="0.5"
                value={precioUnitario}
                onChange={(e) => onUpdate(row.id, "precioUnitario", Math.max(0, Number(e.target.value)))}
                className="h-7 w-20 text-xs text-right font-mono font-bold bg-background pl-6 pr-1.5 border-border/80 rounded-lg"
              />
            </div>
          </div>

          {/* Subtotal de Fila */}
          <div className="text-right min-w-[75px] pl-1">
            <span className="text-[10px] text-muted-foreground block leading-none font-medium">Subtotal</span>
            <span className="text-xs sm:text-sm font-extrabold text-foreground font-mono">
              Bs. {Math.max(0, subtotalFila).toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
