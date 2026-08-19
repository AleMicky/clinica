"use client";

import * as React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Building2,
  Calendar,
  CheckCircle2,
  Coins,
  Receipt,
  RefreshCw,
  Send,
  User,
  Users,
  XCircle,
} from "lucide-react";
import {
  EstadoVenta,
  TipoPagador,
  formatVentaMedicoNombre,
  formatVentaServicioNombre,
  type VentaResponse,
} from "../types/ventas.types";
import { PagadorStatusBadge, VentaStatusBadge } from "./venta-status-badge";
import {
  useVenta,
  useVentaDetalles,
  useVentaPagadores,
} from "../hooks/use-ventas";
import { useConvenios } from "@/modules/servicios/convenio/hooks/use-convenio";

interface VentaDetailCardProps {
  venta: VentaResponse | null;
  onEnviarACajaClick?: (venta: VentaResponse) => void;
  onDirectChangeStatus?: (venta: VentaResponse, nuevoEstado: EstadoVenta) => void;
  onChangeStatusClick?: (venta: VentaResponse) => void;
  onAnularClick?: (id: number) => void;
}

export function VentaDetailCard({
  venta: initialVenta,
  onEnviarACajaClick,
  onDirectChangeStatus,
  onChangeStatusClick,
  onAnularClick,
}: VentaDetailCardProps) {
  const ventaId = initialVenta?.id ?? 0;

  // Consultas directas del recurso y sub-recursos
  const { data: fullVentaData } = useVenta(ventaId, ventaId > 0);
  const { data: detallesResult, isLoading: isLoadingDetalles } = useVentaDetalles(
    ventaId,
    ventaId > 0
  );
  const { data: pagadoresResult, isLoading: isLoadingPagadores } = useVentaPagadores(
    ventaId,
    ventaId > 0
  );

  const venta = fullVentaData ?? initialVenta;

  // Consultas auxiliares para nombres generales
  const { data: conveniosData } = useConvenios({ pageSize: 100 });

  if (!venta) {
    return (
      <Card className="border border-border/70 shadow-2xs bg-card/60 rounded-xl p-8 text-center flex flex-col items-center justify-center min-h-[420px] space-y-3">
        <div className="size-14 rounded-2xl bg-muted/60 flex items-center justify-center text-muted-foreground/60">
          <Receipt className="size-7" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-foreground">Detalle de Comprobante</h3>
          <p className="text-xs text-muted-foreground max-w-xs mt-1">
            Seleccione una venta del listado para inspeccionar sus prestaciones, coberturas y distribución de pagadores.
          </p>
        </div>
      </Card>
    );
  }

  // Agrupación limpia de detalles y pagadores (priorizando endpoint directo /ventas/{id}/detalles)
  const detalles =
    detallesResult?.items && detallesResult.items.length > 0
      ? detallesResult.items
      : fullVentaData?.detalles && fullVentaData.detalles.length > 0
      ? fullVentaData.detalles
      : initialVenta?.detalles ?? [];

  const pagadores =
    pagadoresResult?.items && pagadoresResult.items.length > 0
      ? pagadoresResult.items
      : fullVentaData?.pagadores && fullVentaData.pagadores.length > 0
      ? fullVentaData.pagadores
      : initialVenta?.pagadores ?? [];

  const pacienteNombre = venta.paciente?.nombreCompleto || "Paciente";
  const docPaciente = venta.paciente?.numeroHistoriaClinica
    ? `HC: ${venta.paciente.numeroHistoriaClinica}`
    : "";

  const monedaSimbolo = venta.moneda?.simbolo || (venta.moneda?.codigo === "USD" ? "$" : "Bs.");

  return (
    <Card className="border border-border/70 shadow-xs bg-card rounded-xl overflow-hidden flex flex-col">
      {/* CABECERA DE DETALLE */}
      <CardHeader className="p-3.5 border-b border-border/70 bg-muted/20 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-mono font-bold text-xs bg-primary/10 text-primary px-2 py-0.5 rounded border border-primary/20">
              #{venta.numero}
            </span>
            <Badge variant="secondary" className="text-[10px] font-mono">
              Admisión #{venta.admisionId}
            </Badge>
          </div>
          <VentaStatusBadge estado={venta.estado} />
        </div>

        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
              <User className="size-4 text-primary" />
              {pacienteNombre}
            </h3>
            {docPaciente && (
              <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
                {docPaciente}
              </p>
            )}
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">
              Total Cobro
            </span>
            <span className="text-base font-extrabold text-primary font-mono">
              {monedaSimbolo} {venta.total.toFixed(2)}
            </span>
          </div>
        </div>

        {/* ACCIONES RÁPIDAS */}
        <div className="flex items-center gap-1.5 pt-1 flex-wrap">
          {venta.estado === EstadoVenta.Pendiente && (
            <Button
              type="button"
              size="sm"
              onClick={() => onEnviarACajaClick?.(venta)}
              className="h-7 px-3 text-xs font-semibold gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xs cursor-pointer"
            >
              <Send className="size-3.5" />
              Mandar a Caja
            </Button>
          )}

          {onChangeStatusClick && venta.estado !== EstadoVenta.Anulada && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onChangeStatusClick(venta)}
              className="h-7 px-2.5 text-xs font-medium gap-1 cursor-pointer"
              title="Cambiar Estado"
            >
              <RefreshCw className="size-3 text-amber-500" />
              <span>Cambiar Estado</span>
            </Button>
          )}

          {onAnularClick && venta.estado !== EstadoVenta.Anulada && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onAnularClick(venta.id)}
              className="h-7 px-2 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 ml-auto cursor-pointer"
              title="Anular Comprobante"
            >
              <XCircle className="size-3.5" />
              <span>Anular</span>
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-3.5 space-y-3.5 overflow-y-auto max-h-[calc(100vh-280px)] scrollbar-thin">
        {/* METADATOS BÁSICOS (Fecha, Moneda, Vendedor) */}
        <div className="grid grid-cols-2 gap-2 text-xs p-2.5 rounded-lg border border-border/60 bg-muted/20">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Calendar className="size-3.5 text-primary/70 shrink-0" />
            <span>
              Fecha:{" "}
              <strong className="text-foreground">
                {new Date(venta.fecha).toLocaleString("es-ES", {
                  dateStyle: "short",
                  timeStyle: "short",
                })}
              </strong>
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Coins className="size-3.5 text-emerald-600 shrink-0" />
            <span>
              Moneda: <strong className="text-foreground">{venta.moneda?.nombre || monedaSimbolo}</strong>
            </span>
          </div>
          {venta.vendedor?.nombreCompleto && (
            <div className="col-span-2 flex items-center gap-1.5 text-muted-foreground pt-1 border-t border-border/40 text-[11px]">
              <User className="size-3.5 text-blue-600 shrink-0" />
              <span>
                Cajero / Vendedor: <strong className="text-foreground">{venta.vendedor.nombreCompleto}</strong>
              </span>
            </div>
          )}
        </div>

        {/* TABS DE DETALLES Y PAGADORES */}
        <Tabs defaultValue="detalles" className="w-full">
          <TabsList className="grid grid-cols-2 w-full h-8 bg-muted/60 p-0.5">
            <TabsTrigger value="detalles" className="text-xs font-semibold cursor-pointer">
              Prestaciones ({detalles.length})
            </TabsTrigger>
            <TabsTrigger value="pagadores" className="text-xs font-semibold cursor-pointer">
              Pagadores ({pagadores.length})
            </TabsTrigger>
          </TabsList>

          {/* TAB DETALLES */}
          <TabsContent value="detalles" className="space-y-2 mt-2.5">
            <div className="rounded-lg border border-border/60 overflow-hidden bg-card text-xs">
              <div className="bg-muted/40 p-2 font-semibold text-muted-foreground grid grid-cols-12 gap-1.5 text-[10px]">
                <span className="col-span-6">Servicio</span>
                <span className="col-span-3">Médico</span>
                <span className="col-span-1 text-center">Cant.</span>
                <span className="col-span-2 text-right">Subtotal</span>
              </div>

              <div className="divide-y divide-border/50">
                {isLoadingDetalles ? (
                  <div className="p-3 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ) : detalles.length === 0 ? (
                  <div className="p-3 text-center text-muted-foreground text-xs">
                    No hay servicios registrados en este comprobante.
                  </div>
                ) : (
                  detalles.map((det, index) => {
                    const servicioNombre = formatVentaServicioNombre(det);
                    const medicoNombre = formatVentaMedicoNombre(det);

                    return (
                      <div
                        key={det.id || index}
                        className="p-2 grid grid-cols-12 gap-1.5 items-center text-[11px]"
                      >
                        <div className="col-span-6">
                          <p className="font-semibold text-foreground line-clamp-1">
                            {servicioNombre}
                          </p>
                          {det.descuento > 0 && (
                            <span className="text-[10px] text-emerald-600 font-medium">
                              Desc: -{monedaSimbolo} {det.descuento.toFixed(2)}
                            </span>
                          )}
                        </div>
                        <div className="col-span-3 text-[10px] text-muted-foreground truncate">
                          {medicoNombre}
                        </div>
                        <div className="col-span-1 text-center font-medium">
                          {det.cantidad}
                        </div>
                        <div className="col-span-2 text-right font-bold text-foreground font-mono">
                          {monedaSimbolo} {det.total.toFixed(2)}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </TabsContent>

          {/* TAB PAGADORES */}
          <TabsContent value="pagadores" className="space-y-2 mt-2.5">
            <div className="space-y-1.5">
              {isLoadingPagadores ? (
                <div className="p-3 space-y-2">
                  <Skeleton className="h-4 w-full" />
                </div>
              ) : pagadores.length === 0 ? (
                <div className="p-4 text-center text-xs text-muted-foreground border rounded-lg">
                  No hay pagadores configurados.
                </div>
              ) : (
                pagadores.map((pag, index) => {
                  const convenioObj = conveniosData?.items?.find((c) => c.id === pag.convenioId);
                  const convenioNombre =
                    convenioObj?.nombre || (pag.convenioId ? `Convenio #${pag.convenioId}` : null);

                  return (
                    <div
                      key={pag.id || index}
                      className="p-2.5 rounded-lg border border-border/60 bg-card flex items-center justify-between text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 font-semibold text-foreground">
                          {pag.tipo === TipoPagador.Paciente ? (
                            <span className="flex items-center gap-1 text-primary text-xs">
                              <Users className="size-3.5" /> Paciente (Directo)
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-blue-600 text-xs">
                              <Building2 className="size-3.5" /> {convenioNombre || "Convenio Institucional"}
                            </span>
                          )}
                        </div>
                        <PagadorStatusBadge estado={pag.estado} />
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-muted-foreground block">Monto Cobertura:</span>
                        <span className="text-xs font-bold text-foreground font-mono">
                          {monedaSimbolo} {pag.monto.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* TARJETA TOTALES Y RESUMEN FINANCIERO */}
        <div className="p-3 rounded-xl border border-primary/20 bg-primary/5 space-y-1.5 text-xs">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal:</span>
            <span className="font-mono">{monedaSimbolo} {venta.subtotal.toFixed(2)}</span>
          </div>
          {venta.descuento > 0 && (
            <div className="flex justify-between text-emerald-600 font-medium">
              <span>Descuento Total:</span>
              <span className="font-mono">-{monedaSimbolo} {venta.descuento.toFixed(2)}</span>
            </div>
          )}
          <div className="pt-1.5 border-t border-primary/20 flex justify-between items-center text-xs font-extrabold text-foreground">
            <span>IMPORTE TOTAL:</span>
            <span className="text-base text-primary font-mono font-extrabold">
              {monedaSimbolo} {venta.total.toFixed(2)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
