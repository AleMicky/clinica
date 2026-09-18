"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Lock,
  ShoppingCart,
  PlusCircle,
  Receipt,
  Tag,
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
    <Card
      className={`border shadow-2xs bg-card overflow-hidden transition-all ${
        !isPatientValid ? "border-amber-500/30" : "border-border/80"
      }`}
    >
      <CardHeader className="p-3 pb-2.5 border-b border-border/60 bg-muted/20 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="size-5 rounded-md bg-primary/10 text-primary flex items-center justify-center font-bold text-[11px]">
            3
          </div>
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5 truncate">
            <span>Prestaciones Médicas</span>
            <Badge
              variant="secondary"
              className="font-mono text-[10px] font-bold px-1.5 py-0 h-4.5 bg-primary/10 text-primary border-primary/20"
            >
              {detalles.length} {detalles.length === 1 ? "item" : "items"}
            </Badge>
          </CardTitle>
        </div>

        <Button
          type="button"
          size="sm"
          onClick={() => {
            if (!isPatientValid) {
              toast.warning("Debe seleccionar un paciente en el Paso 1 antes de agregar prestaciones.");
              return;
            }
            onOpenMultiPicker();
          }}
          disabled={!isPatientValid}
          className={`h-7.5 text-xs font-semibold gap-1.5 px-3 rounded-lg shadow-xs transition-all cursor-pointer ${
            !isPatientValid
              ? "bg-muted text-muted-foreground border-muted cursor-not-allowed opacity-50"
              : "bg-primary hover:bg-primary/90 text-primary-foreground"
          }`}
          title={!isPatientValid ? "Seleccione un paciente primero" : "Abrir catálogo de prestaciones"}
        >
          {!isPatientValid ? (
            <Lock className="size-3" />
          ) : (
            <PlusCircle className="size-3.5" />
          )}
          <span>Catálogo de Prestaciones</span>
        </Button>
      </CardHeader>

      <CardContent className="p-3 space-y-3">
        {!isPatientValid ? (
          /* ESTADO BLOQUEADO: FALTA PACIENTE */
          <div className="py-10 px-4 text-center border border-dashed border-amber-500/30 rounded-xl bg-amber-500/5 space-y-2.5">
            <div className="size-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto shadow-2xs">
              <Lock className="size-5" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-xs sm:text-sm text-foreground">
                Paso 3 Bloqueado: Selección de Paciente Requerida
              </h4>
              <p className="text-[11px] text-muted-foreground max-w-sm mx-auto leading-relaxed">
                Para consultar precios de convenio y asignar prestaciones, por favor seleccione o registre al paciente en el <strong>Paso 1</strong>.
              </p>
            </div>
          </div>
        ) : detalles.length === 0 ? (
          /* ESTADO VACÍO: CARRITO SIN PRESTACIONES */
          <div className="py-10 px-4 text-center border border-dashed border-border/70 rounded-xl bg-muted/5 space-y-3">
            <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto shadow-2xs">
              <ShoppingCart className="size-5" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-xs sm:text-sm text-foreground">
                No hay prestaciones agregadas aún
              </h4>
              <p className="text-[11px] text-muted-foreground max-w-sm mx-auto leading-relaxed">
                Haga clic en <strong>&ldquo;Catálogo de Prestaciones&rdquo;</strong> para buscar y añadir consultas médicas, exámenes de laboratorio o procedimientos.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onOpenMultiPicker}
              className="h-8 text-xs font-semibold gap-1.5 px-3.5 rounded-lg border-primary/30 text-primary hover:bg-primary/10 cursor-pointer shadow-2xs"
            >
              <PlusCircle className="size-3.5" />
              <span>Explorar Catálogo</span>
            </Button>
          </div>
        ) : (
          /* LISTA DE ITEMS DEL CARRITO */
          <div className="space-y-2 max-h-[calc(100vh-340px)] overflow-y-auto pr-0.5 scrollbar-thin">
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

        {/* PANEL DE LIQUIDACIÓN Y TOTALES (BILLING SUMMARY CARD) */}
        <div className="p-3 bg-linear-to-r from-card via-background to-card border border-border/80 rounded-xl shadow-2xs space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Desglose de Subtotal y Descuentos */}
            <div className="flex items-center gap-4 text-muted-foreground text-[11px]">
              <div className="flex items-center gap-1.5">
                <Receipt className="size-3.5 text-muted-foreground" />
                <span>Subtotal:</span>
                <strong className="text-foreground font-mono font-bold">
                  Bs. {totalSubtotal.toFixed(2)}
                </strong>
              </div>

              {totalDescuentos > 0 && (
                <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md font-semibold">
                  <Tag className="size-3" />
                  <span>Descuento:</span>
                  <strong className="font-mono font-bold">
                    -Bs. {totalDescuentos.toFixed(2)}
                  </strong>
                </div>
              )}
            </div>

            {/* Total General Destacado */}
            <div className="flex items-center gap-2.5 ml-auto">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Total a Pagar:
              </span>
              <div className="bg-primary/10 border border-primary/20 px-3.5 py-1 rounded-xl shadow-2xs flex items-center gap-1">
                <span className="text-base sm:text-lg font-black text-primary font-mono tracking-tight">
                  Bs. {grandTotal.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

