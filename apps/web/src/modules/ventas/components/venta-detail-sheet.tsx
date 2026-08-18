"use client";

import * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building2,
  Calendar,
  Coins,
  DollarSign,
  FileText,
  HeartPulse,
  Receipt,
  RefreshCw,
  Stethoscope,
  User,
  Users,
} from "lucide-react";
import { EstadoVenta, TipoPagador, type VentaResponse } from "../types/ventas.types";
import { PagadorStatusBadge, VentaStatusBadge } from "./venta-status-badge";

import { usePacientes } from "@/modules/recepcion/pacientes/hooks/use-pacientes";
import { useMedicos } from "@/modules/recursos-humanos/medico/hooks/use-medicos";
import { useConvenios } from "@/modules/servicios/convenio/hooks/use-convenio";
import { useMonedas } from "@/modules/parametros/moneda/hooks/use-monedas";
import { useServicios } from "@/modules/servicios/servicio/hooks/use-servicio";
import { useCategoriasServicio } from "@/modules/servicios/categoria-servicio/hooks/use-categoria-servicio";

interface VentaDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  venta: VentaResponse | null;
  onChangeStatusClick?: (venta: VentaResponse) => void;
}

export function VentaDetailSheet({
  open,
  onOpenChange,
  venta,
  onChangeStatusClick,
}: VentaDetailSheetProps) {
  // Queries auxiliares para resolver nombres en la interfaz
  const { data: pacientesData } = usePacientes({ pageSize: 100 });
  const { data: medicosData } = useMedicos({ pageSize: 100 });
  const { data: conveniosData } = useConvenios({ pageSize: 100 });
  const { data: monedasData } = useMonedas({ pageSize: 100 });
  const { data: categoriasData } = useCategoriasServicio({ pageSize: 100 });

  const firstCatId = categoriasData?.items?.[0]?.id;
  const { data: serviciosData } = useServicios(
    firstCatId ?? 0,
    { pageSize: 100 },
    Boolean(open && firstCatId)
  );

  if (!venta) return null;

  // Mapas de ayuda
  const pacienteObj = pacientesData?.items?.find((p) => p.id === venta.pacienteId);
  const pacienteNombre = pacienteObj?.persona
    ? `${pacienteObj.persona.nombres} ${pacienteObj.persona.apellidoPaterno} ${pacienteObj.persona.apellidoMaterno || ""}`.trim()
    : `Paciente #${venta.pacienteId}`;

  const monedaObj = monedasData?.items?.find((m) => m.id === venta.monedaId);
  const monedaSimbolo = monedaObj?.simbolo || "Bs.";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-xl w-full flex flex-col p-0 border-l border-border/80 shadow-2xl bg-card">
        {/* CABECERA SHEET */}
        <SheetHeader className="p-5 border-b border-border/70 bg-gradient-to-r from-muted/60 via-background to-primary/5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shadow-xs">
                <Receipt className="size-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <SheetTitle className="text-lg font-bold text-foreground">
                    Venta #{venta.numero}
                  </SheetTitle>
                </div>
                <SheetDescription className="text-xs text-muted-foreground">
                  Registrada el {new Date(venta.fecha).toLocaleString()}
                </SheetDescription>
              </div>
            </div>

            <VentaStatusBadge estado={venta.estado} />
          </div>
        </SheetHeader>

        {/* CONTENIDO DESLIZABLE */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* TARJETA: INFORMACIÓN GENERAL */}
          <div className="p-4 rounded-xl border border-border/70 bg-background space-y-3 shadow-xs">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5 border-b border-border/50 pb-2">
              <FileText className="size-3.5 text-primary" />
              Datos Generales del Comprobante
            </h4>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-muted-foreground block text-[11px]">Paciente:</span>
                <span className="font-semibold text-foreground flex items-center gap-1 mt-0.5">
                  <User className="size-3 text-primary shrink-0" />
                  {pacienteNombre}
                </span>
              </div>

              <div>
                <span className="text-muted-foreground block text-[11px]">Admisión N°:</span>
                <span className="font-semibold text-foreground flex items-center gap-1 mt-0.5">
                  <HeartPulse className="size-3 text-primary shrink-0" />
                  #{venta.admisionId}
                </span>
              </div>

              <div>
                <span className="text-muted-foreground block text-[11px]">Moneda:</span>
                <span className="font-semibold text-foreground flex items-center gap-1 mt-0.5">
                  <Coins className="size-3 text-primary shrink-0" />
                  {monedaObj ? `${monedaObj.nombre} (${monedaSimbolo})` : `Moneda #${venta.monedaId}`}
                </span>
              </div>

              <div>
                <span className="text-muted-foreground block text-[11px]">Fecha de Registro:</span>
                <span className="font-semibold text-foreground flex items-center gap-1 mt-0.5">
                  <Calendar className="size-3 text-primary shrink-0" />
                  {new Date(venta.fecha).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* TAB: DETALLES Y PAGADORES */}
          <Tabs defaultValue="detalles" className="w-full">
            <TabsList className="grid grid-cols-2 w-full h-9 bg-muted/60 p-1">
              <TabsTrigger value="detalles" className="text-xs font-semibold">
                Prestaciones / Servicios ({venta.detalles.length})
              </TabsTrigger>
              <TabsTrigger value="pagadores" className="text-xs font-semibold">
                Pagadores ({venta.pagadores.length})
              </TabsTrigger>
            </TabsList>

            {/* TAB DETALLES */}
            <TabsContent value="detalles" className="space-y-3 mt-3">
              {venta.detalles.length === 0 ? (
                <div className="p-6 text-center text-xs text-muted-foreground border rounded-lg">
                  No hay ítems registrados en el detalle de la venta.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {venta.detalles.map((det, index) => {
                    const servicioObj = serviciosData?.items?.find((s) => s.id === det.servicioId);
                    const servicioNombre = servicioObj?.nombre || `Servicio #${det.servicioId}`;

                    const medicoObj = medicosData?.items?.find((m) => m.id === det.medicoId);
                    const medicoNombre = medicoObj?.empleado?.nombreCompleto || (det.medicoId ? `Médico #${det.medicoId}` : null);

                    return (
                      <div
                        key={det.id || index}
                        className="p-3 rounded-lg border border-border/70 bg-card space-y-2 text-xs hover:border-primary/40 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="font-semibold text-foreground flex items-center gap-1.5">
                            <Stethoscope className="size-3.5 text-primary shrink-0" />
                            {servicioNombre}
                          </div>
                          <span className="font-bold text-primary">
                            {monedaSimbolo} {det.total.toFixed(2)}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground pt-1 border-t border-border/40">
                          <div>
                            <span>Médico: </span>
                            <strong className="text-foreground">{medicoNombre || "Sin asignar"}</strong>
                          </div>
                          <div className="text-right">
                            <span>{det.cantidad} x {monedaSimbolo} {det.precioUnitario.toFixed(2)}</span>
                            {det.descuento > 0 && (
                              <span className="text-emerald-600 block">Desc: -{monedaSimbolo} {det.descuento.toFixed(2)}</span>
                            )}
                          </div>
                        </div>

                        {det.porcentajeMedico != null && (
                          <div className="flex items-center justify-between text-[10px] bg-muted/40 p-1.5 rounded-md border border-border/40 text-muted-foreground">
                            <span>Reparto Médico ({det.porcentajeMedico}%): <strong className="text-foreground">{monedaSimbolo} {(det.montoMedico || 0).toFixed(2)}</strong></span>
                            <span>Clínica: <strong className="text-foreground">{monedaSimbolo} {(det.montoClinica || 0).toFixed(2)}</strong></span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* TAB PAGADORES */}
            <TabsContent value="pagadores" className="space-y-3 mt-3">
              {venta.pagadores.length === 0 ? (
                <div className="p-6 text-center text-xs text-muted-foreground border rounded-lg">
                  No hay pagadores asignados a esta venta.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {venta.pagadores.map((pag, index) => {
                    const convenioObj = conveniosData?.items?.find((c) => c.id === pag.convenioId);
                    const convenioNombre = convenioObj?.nombre || (pag.convenioId ? `Convenio #${pag.convenioId}` : null);

                    return (
                      <div
                        key={pag.id || index}
                        className="p-3 rounded-lg border border-border/70 bg-card flex items-center justify-between text-xs hover:border-primary/40 transition-colors"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 font-semibold text-foreground">
                            {pag.tipo === TipoPagador.Paciente ? (
                              <span className="flex items-center gap-1 text-primary">
                                <Users className="size-3.5" /> Paciente (Directo)
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-blue-600">
                                <Building2 className="size-3.5" /> Convenio: {convenioNombre || "Institucional"}
                              </span>
                            )}
                          </div>
                          <PagadorStatusBadge estado={pag.estado} />
                        </div>

                        <div className="text-right">
                          <span className="text-[11px] text-muted-foreground block">Monto Asignado:</span>
                          <span className="text-sm font-bold text-foreground">
                            {monedaSimbolo} {pag.monto.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* TARJETA TOTALES Y RESUMEN FINANCIERO */}
          <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-2 text-xs">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal:</span>
              <span>{monedaSimbolo} {venta.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-emerald-600 font-medium">
              <span>Descuentos Aplicados:</span>
              <span>-{monedaSimbolo} {venta.descuento.toFixed(2)}</span>
            </div>
            <div className="pt-2 border-t border-primary/20 flex justify-between items-center text-sm font-extrabold text-foreground">
              <span>IMPORTE TOTAL:</span>
              <span className="text-lg text-primary">{monedaSimbolo} {venta.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* PIE DE SHEET */}
        <div className="p-4 border-t border-border/70 bg-muted/30 flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="h-8 text-xs"
          >
            Cerrar
          </Button>

          {venta.estado !== EstadoVenta.Anulada && onChangeStatusClick && (
            <Button
              size="sm"
              onClick={() => {
                onOpenChange(false);
                onChangeStatusClick(venta);
              }}
              className="h-8 text-xs font-semibold gap-1.5 bg-primary text-primary-foreground"
            >
              <RefreshCw className="size-3.5" />
              Cambiar Estado / Cobro
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
