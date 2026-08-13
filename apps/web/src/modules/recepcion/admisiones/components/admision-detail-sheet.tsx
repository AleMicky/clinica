"use client";

import * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  User,
  Calendar,
  CreditCard,
  Printer,
  Stethoscope,
  Clock,
  Building2,
  CheckCircle2,
} from "lucide-react";
import {
  EstadoAdmision,
  formatConvenioNombre,
  formatMedicoNombre,
  formatPacienteDocumento,
  formatPacienteNombre,
  formatServicioNombre,
  type AdmisionResponse,
} from "../types/admision.types";
import { AdmisionStatusBadge } from "./admision-status-badge";

interface AdmisionDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  admision: AdmisionResponse | null;
  onChangeStatusClick?: (admision: AdmisionResponse) => void;
}

export function AdmisionDetailSheet({
  open,
  onOpenChange,
  admision,
  onChangeStatusClick,
}: AdmisionDetailSheetProps) {
  if (!admision) return null;

  const totalCalculado =
    admision.totalAdmision ??
    admision.detalles.reduce((acc, d) => acc + (d.total || 0), 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg w-full overflow-y-auto p-0 border-l border-border/80">
        <SheetHeader className="p-5 border-b border-border/70 bg-muted/30">
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="font-mono text-xs bg-background">
              {admision.numero}
            </Badge>
            <AdmisionStatusBadge estado={admision.estado} />
          </div>
          <SheetTitle className="text-lg font-bold text-foreground mt-2 flex items-center gap-2">
            <FileText className="size-5 text-primary" />
            Ficha de Admisión Médica
          </SheetTitle>
          <SheetDescription className="text-xs text-muted-foreground">
            Detalle de servicios registrados, paciente y estado de cobro/atención.
          </SheetDescription>
        </SheetHeader>

        <div className="p-5 space-y-5">
          {/* LÍNEA DE TIEMPO / ESTADO EN PROCESO */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-primary/5 via-primary/10 to-blue-500/5 border border-primary/15 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-foreground">
              <span>Flujo de Atención</span>
              <span className="text-[11px] text-muted-foreground font-normal">
                {new Date(admision.fechaHora).toLocaleString("es-ES", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </span>
            </div>
            <div className="flex items-center justify-between gap-1 py-1">
              <div className="flex flex-col items-center gap-1 text-[10px]">
                <div
                  className={`size-6 rounded-full flex items-center justify-center font-bold text-white ${
                    admision.estado >= EstadoAdmision.Registrada
                      ? "bg-blue-600 shadow-xs"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  1
                </div>
                <span className="text-[10px] text-muted-foreground">Registro</span>
              </div>
              <div className="h-0.5 flex-1 bg-border/80" />
              <div className="flex flex-col items-center gap-1 text-[10px]">
                <div
                  className={`size-6 rounded-full flex items-center justify-center font-bold text-white ${
                    admision.estado >= EstadoAdmision.Pagada
                      ? "bg-emerald-600 shadow-xs"
                      : admision.estado === EstadoAdmision.PendientePago
                      ? "bg-amber-500 shadow-xs"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  2
                </div>
                <span className="text-[10px] text-muted-foreground">Pago</span>
              </div>
              <div className="h-0.5 flex-1 bg-border/80" />
              <div className="flex flex-col items-center gap-1 text-[10px]">
                <div
                  className={`size-6 rounded-full flex items-center justify-center font-bold text-white ${
                    admision.estado === EstadoAdmision.EnAtencion
                      ? "bg-purple-600 animate-pulse shadow-xs"
                      : admision.estado >= EstadoAdmision.Finalizada
                      ? "bg-purple-600 shadow-xs"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  3
                </div>
                <span className="text-[10px] text-muted-foreground">Atención</span>
              </div>
              <div className="h-0.5 flex-1 bg-border/80" />
              <div className="flex flex-col items-center gap-1 text-[10px]">
                <div
                  className={`size-6 rounded-full flex items-center justify-center font-bold text-white ${
                    admision.estado === EstadoAdmision.Finalizada
                      ? "bg-zinc-700 shadow-xs"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  4
                </div>
                <span className="text-[10px] text-muted-foreground">Fin</span>
              </div>
            </div>
          </div>

          {/* INFORMACIÓN DEL PACIENTE */}
          {(() => {
            const nombreCompleto = formatPacienteNombre(admision.paciente, admision.pacienteNombre);
            const documento = formatPacienteDocumento(admision.paciente, admision.pacienteDocumento);
            const hcNumero =
              (admision.paciente && "numeroHistoriaClinica" in admision.paciente
                ? admision.paciente.numeroHistoriaClinica
                : undefined) ||
              (admision.pacienteId ? admision.pacienteId.toString().padStart(5, "0") : "---");

            const convenio = admision.convenio?.nombre || formatConvenioNombre(admision.convenio, admision.convenioNombre);

            return (
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <User className="size-3.5 text-primary" />
                  Datos del Paciente
                </h4>
                <div className="p-3.5 rounded-xl border border-border/70 bg-card space-y-2 text-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-sm text-foreground">
                        {nombreCompleto}
                      </p>
                      <p className="text-muted-foreground text-[11px]">
                        Documento: {documento}
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-[10px]">
                      HC #{hcNumero}
                    </Badge>
                  </div>

                  <Separator className="my-1.5" />

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Building2 className="size-3.5 text-primary/70 shrink-0" />
                      <span>
                        Convenio:{" "}
                        <strong className="text-foreground">
                          {convenio}
                        </strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="size-3.5 text-primary/70 shrink-0" />
                      <span>
                        Fecha:{" "}
                        <strong className="text-foreground">
                          {new Date(admision.fechaHora).toLocaleDateString("es-ES")}
                        </strong>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* PRESTACIONES MÉDICAS REGISTRADAS */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Stethoscope className="size-3.5 text-primary" />
                Detalle de Prestaciones Médicas ({admision.detalles.length})
              </h4>
            </div>

            <div className="rounded-xl border border-border/70 overflow-hidden bg-card text-xs">
              <div className="bg-muted/50 p-2.5 font-semibold text-muted-foreground grid grid-cols-12 gap-2 text-[11px]">
                <span className="col-span-5">Servicio</span>
                <span className="col-span-3">Médico</span>
                <span className="col-span-1 text-center">Cant.</span>
                <span className="col-span-3 text-right">Subtotal</span>
              </div>
              <div className="divide-y divide-border/60">
                {admision.detalles.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground text-xs">
                    No hay servicios asociados a esta admisión.
                  </div>
                ) : (
                  admision.detalles.map((item) => (
                    <div key={item.id} className="p-2.5 grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-5">
                        <p className="font-semibold text-foreground">
                          {formatServicioNombre(item)}
                        </p>
                        {item.descuento > 0 && (
                          <span className="text-[10px] text-emerald-600">
                            Desc: -S/.{item.descuento.toFixed(2)}
                          </span>
                        )}
                      </div>
                      <div className="col-span-3 text-[11px] text-muted-foreground truncate">
                        {formatMedicoNombre(item)}
                      </div>
                      <div className="col-span-1 text-center font-medium">
                        {item.cantidad}
                      </div>
                      <div className="col-span-3 text-right font-bold text-foreground">
                        S/. {item.total.toFixed(2)}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-3 bg-muted/30 border-t border-border/70 flex justify-between items-center font-bold">
                <span className="text-muted-foreground">Total a Cancelar:</span>
                <span className="text-base text-primary">
                  S/. {totalCalculado.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* OBSERVACIONES */}
          {admision.observacion && (
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="size-3.5 text-primary" />
                Observaciones de Recepción
              </h4>
              <p className="p-3 rounded-lg border border-border/60 bg-muted/20 text-xs text-muted-foreground italic">
                "{admision.observacion}"
              </p>
            </div>
          )}

          {/* ACCIONES DEL BOTTOM */}
          <div className="pt-2 flex items-center gap-2">
            {onChangeStatusClick && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onOpenChange(false);
                  onChangeStatusClick(admision);
                }}
                className="flex-1 h-9 text-xs font-semibold gap-1.5"
              >
                <CheckCircle2 className="size-3.5 text-primary" />
                Cambiar Estado
              </Button>
            )}

            <Button
              variant="secondary"
              size="sm"
              onClick={handlePrint}
              className="h-9 px-4 text-xs font-semibold gap-1.5"
            >
              <Printer className="size-3.5" />
              Imprimir Ticket
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
