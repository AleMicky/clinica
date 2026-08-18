"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Stethoscope,
  Lock,
  ShoppingCart,
} from "lucide-react";
import { ServicioRowItem } from "./servicio-row-item";
import type { ServiceItemState } from "../store/use-admision-store";
import type { MedicoResponse } from "@/modules/recursos-humanos/medico/types/medico.types";
import { toast } from "sonner";

export interface AdmisionCarritoSectionProps {
  isPatientValid: boolean;
  detalles: ServiceItemState[];
  medicosList: MedicoResponse[];
  updateDetalle: (id: string, field: keyof ServiceItemState, value: unknown) => void;
  removeDetalle: (id: string) => void;
  onOpenMultiPicker: () => void;
  totalSubtotal: number;
  totalDescuentos: number;
  grandTotal: number;
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function AdmisionCarritoSection({
  isPatientValid,
  detalles,
  medicosList,
  updateDetalle,
  removeDetalle,
  onOpenMultiPicker,
  totalSubtotal,
  totalDescuentos,
  grandTotal,
}: AdmisionCarritoSectionProps) {
  return (
    <Card className={`border shadow-2xs bg-card transition-all ${!isPatientValid ? "border-amber-500/30" : "border-border/70"}`}>
      <CardHeader className="p-3 pb-2.5 border-b border-border/60 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <Stethoscope className="size-4 text-primary shrink-0" />
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5 truncate">
            <span>3. Prestaciones ({detalles.length})</span>
            {!isPatientValid && (
              <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20 font-bold text-[9px] gap-1 py-0 h-4.5">
                <Lock className="size-2.5" /> Requiere Paciente
              </Badge>
            )}
          </CardTitle>
        </div>

        <Button
          type="button"
          size="sm"
          onClick={() => {
            if (!isPatientValid) {
              toast.warning("Debe seleccionar o registrar un paciente en el Paso 1 antes de agregar prestaciones.");
              return;
            }
            onOpenMultiPicker();
          }}
          disabled={!isPatientValid}
          className={`h-7.5 text-xs font-semibold gap-1.5 shadow-xs px-3 transition-all cursor-pointer ${
            !isPatientValid
              ? "bg-muted text-muted-foreground border-muted cursor-not-allowed opacity-60"
              : "bg-primary hover:bg-primary/90 text-primary-foreground"
          }`}
          title={!isPatientValid ? "Seleccione un paciente primero" : "Abrir catálogo de prestaciones"}
        >
          {!isPatientValid ? <Lock className="size-3" /> : <ShoppingCart className="size-3" />}
          <span>Catálogo de Prestaciones</span>
        </Button>
      </CardHeader>

      <CardContent className="p-3 space-y-2.5">
        {!isPatientValid ? (
          <div className="py-8 px-4 text-center border border-dashed border-amber-500/30 rounded-lg bg-amber-500/5 space-y-2">
            <div className="size-8 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto">
              <Lock className="size-4" />
            </div>
            <div>
              <p className="font-bold text-xs text-foreground">
                Paso 3 Bloqueado: Falta Seleccionar Paciente
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5 max-w-xs mx-auto">
                Busque o registre un paciente en el <strong>Paso 1</strong> para desbloquear las prestaciones.
              </p>
            </div>
          </div>
        ) : detalles.length === 0 ? (
          <div className="py-8 px-4 text-center text-xs text-muted-foreground border border-dashed border-border/70 rounded-lg bg-muted/5 space-y-1.5">
            <ShoppingCart className="size-7 text-muted-foreground/40 mx-auto" />
            <p className="font-bold text-foreground">El carrito está vacío</p>
            <p className="text-[11px] text-muted-foreground">
              Haga clic en <strong>"Catálogo de Prestaciones"</strong> para agregar servicios y consultas.
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto pr-0.5 scrollbar-thin">
            {detalles.map((row, idx) => (
              <ServicioRowItem
                key={row.id}
                row={row}
                index={idx}
                medicos={medicosList}
                onUpdate={updateDetalle}
                onRemove={removeDetalle}
              />
            ))}
          </div>
        )}

        {/* Resumen Compacto de Totales */}
        <div className="p-2.5 bg-card/95 border border-border/80 rounded-lg shadow-2xs flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4 text-muted-foreground text-[11px]">
            <span>Subtotal: <strong className="text-foreground font-mono">Bs. {totalSubtotal.toFixed(2)}</strong></span>
            {totalDescuentos > 0 && (
              <span>Descuento: <strong className="text-emerald-600 font-mono">-Bs. {totalDescuentos.toFixed(2)}</strong></span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground text-xs uppercase tracking-wider">
              Total:
            </span>
            <span className="text-sm sm:text-base font-extrabold text-primary bg-primary/10 px-3 py-1 rounded-lg border border-primary/20 font-mono">
              Bs. {grandTotal.toFixed(2)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
