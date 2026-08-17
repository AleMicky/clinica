"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Stethoscope,
  Lock,
  ShoppingCart,
  Receipt,
  Loader2,
  Sparkles,
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
  isSubmitting,
  onCancel,
  onSubmit,
}: AdmisionCarritoSectionProps) {
  return (
    <div className="space-y-4">
      <Card className={`border shadow-2xs bg-card transition-all ${!isPatientValid ? "border-amber-500/30 opacity-90" : "border-border/70"}`}>
        <CardHeader className="p-4 pb-3 border-b border-border/60 flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-2">
            <Stethoscope className="size-4 text-primary" />
            <div>
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                3. Carrito de Prestaciones Médicas ({detalles.length})
                {!isPatientValid && (
                  <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20 font-bold text-[10px] gap-1 py-0 h-5">
                    <Lock className="size-3" /> Bloqueado (Falta Paciente)
                  </Badge>
                )}
              </CardTitle>
            </div>
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
            className={`h-8.5 text-xs font-bold gap-2 shadow-xs px-3.5 transition-all ${
              !isPatientValid
                ? "bg-muted text-muted-foreground border-muted cursor-not-allowed opacity-60"
                : "bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 text-primary-foreground"
            }`}
            title={!isPatientValid ? "Seleccione un paciente primero" : "Abrir catálogo de prestaciones"}
          >
            {!isPatientValid ? <Lock className="size-3.5" /> : <ShoppingCart className="size-3.5" />}
            Abrir Catálogo & Seleccionar Prestaciones
          </Button>
        </CardHeader>

        <CardContent className="p-4 space-y-3.5">
          {!isPatientValid ? (
            <div className="p-8 text-center border-2 border-dashed border-amber-500/30 rounded-xl bg-amber-500/5 space-y-3">
              <div className="size-11 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto font-bold">
                <Lock className="size-5" />
              </div>
              <div>
                <p className="font-bold text-xs text-foreground uppercase tracking-wider">
                  Paso 3 Bloqueado: Falta Seleccionar Paciente
                </p>
                <p className="text-[11px] text-muted-foreground mt-1 max-w-sm mx-auto leading-relaxed">
                  Por favor busque por <strong>Documento, Nombre o N° Historia Clínica</strong> en el Paso 1 (o regístrelo si no existe) para desbloquear el catálogo de prestaciones.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3.5 w-full">
              {detalles.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground border border-dashed rounded-xl space-y-2">
                  <ShoppingCart className="size-8 text-muted-foreground/40 mx-auto" />
                  <p className="font-semibold text-foreground">El carrito está vacío</p>
                  <p className="text-[11px]">Haga clic en <strong>"Abrir Catálogo"</strong> para elegir varias prestaciones a la vez.</p>
                </div>
              ) : (
                detalles.map((row, idx) => (
                  <ServicioRowItem
                    key={row.id}
                    row={row}
                    index={idx}
                    medicos={medicosList}
                    onUpdate={updateDetalle}
                    onRemove={removeDetalle}
                  />
                ))
              )}
            </div>
          )}

          <div className="sticky bottom-4 z-10 backdrop-blur-md bg-card/95 p-4 border border-border/80 rounded-xl shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-6 text-muted-foreground text-xs">
              <span>Subtotal Neto: <strong className="text-foreground">Bs. {totalSubtotal.toFixed(2)}</strong></span>
              <span>Descuento Aplicado: <strong className="text-emerald-600">-Bs. {totalDescuentos.toFixed(2)}</strong></span>
            </div>

            <div className="flex items-center gap-2.5">
              <span className="font-bold text-foreground text-xs uppercase tracking-wider">
                Total Admisión:
              </span>
              <span className="text-lg font-extrabold text-primary bg-primary/10 px-4 py-1.5 rounded-xl border border-primary/20 shadow-xs">
                Bs. {grandTotal.toFixed(2)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="p-4 bg-card border border-border/70 rounded-xl shadow-2xs flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
          <Receipt className="size-4 text-blue-600" />
          <span>Endpoint de admisión: <strong className="text-blue-600 font-bold">POST /admisiones</strong></span>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCancel}
            disabled={isSubmitting}
            className="h-9 px-4 text-xs font-medium"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            size="sm"
            onClick={onSubmit}
            disabled={isSubmitting || !isPatientValid || detalles.length === 0}
            className="h-9 px-5 text-xs font-semibold gap-2 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 text-primary-foreground shadow-sm shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Sparkles className="size-4" />
            )}
            Guardar Admisión
          </Button>
        </div>
      </div>
    </div>
  );
}
