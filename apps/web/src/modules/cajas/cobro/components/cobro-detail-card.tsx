"use client";

import * as React from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertCircle,
  Ban,
  Building2,
  Calendar,
  CheckCircle2,
  Coins,
  CreditCard,
  Hash,
  Loader2,
  Plus,
  Receipt,
  Store,
  Trash2,
  Wallet,
  Zap,
} from "lucide-react";
import {
  EstadoCobro,
  type CobroDetalleRequest,
  type CobroResponse,
  type UpdateCobroRequest,
} from "../types/cobro.types";
import { CobroStatusBadge } from "./cobro-status-badge";
import { useCobro, useUpdateCobro } from "../hooks/use-cobros";
import { useMetodosPago } from "@/modules/parametros/metodo-pago/hooks/use-metodos-pago";
import { useMonedas } from "@/modules/parametros/moneda/hooks/use-monedas";
import { useBancos } from "@/modules/parametros/banco/hooks/use-bancos";

interface CobroDetailCardProps {
  cobro: CobroResponse | null;
  onSuccessCobro?: () => void;
  onAnular?: (cobro: CobroResponse) => void;
}

export function CobroDetailCard({
  cobro: initialCobro,
  onSuccessCobro,
  onAnular,
}: CobroDetailCardProps) {
  const cobroId = initialCobro?.id ?? 0;
  const { data: fullCobro, isLoading: isLoadingFull } = useCobro(
    cobroId,
    cobroId > 0
  );
  const cobro = fullCobro ?? initialCobro;

  const updateCobroMutation = useUpdateCobro();

  // Queries para selects
  const { data: metodosData, isLoading: isLoadingMetodos } = useMetodosPago({
    pageSize: 50,
  });
  const { data: monedasData, isLoading: isLoadingMonedas } = useMonedas({
    pageSize: 50,
  });
  const { data: bancosData } = useBancos({ pageSize: 50 });

  const metodos = metodosData?.items?.filter((m) => m.activo) ?? [];
  const monedas = monedasData?.items?.filter((m) => m.activo) ?? [];
  const monedaBase = monedas.find((m) => m.esBase) ?? monedas[0];
  const bancos = bancosData?.items?.filter((b) => b.activo) ?? [];

  // Estado del Formulario de Cobro
  const [detalles, setDetalles] = React.useState<CobroDetalleRequest[]>([]);
  const [observacion, setObservacion] = React.useState("");

  const isPendingCobro =
    cobro?.estado === EstadoCobro.Registrado &&
    (cobro.total === 0 || (cobro.detalles && cobro.detalles.length === 0));

  const montoObjetivo =
    cobro?.ventaPagador?.monto && cobro.ventaPagador.monto > 0
      ? cobro.ventaPagador.monto
      : cobro?.total || 0;

  // Inicializar detalles de cobro cuando se selecciona un cobro
  React.useEffect(() => {
    if (cobro && isPendingCobro) {
      const defaultMetodoId = metodos[0]?.id ?? 1;
      const defaultMonedaId = monedaBase?.id ?? 1;

      // Si no tiene detalles creados en el estado local, pre-cargar 1 línea con el monto objetivo
      if (detalles.length === 0) {
        setDetalles([
          {
            metodoPagoId: defaultMetodoId,
            monedaId: defaultMonedaId,
            cuentaBancariaId: null,
            monto: montoObjetivo,
            tipoCambio: 1,
            referencia: "",
            entidadFinanciera: "",
            observacion: "",
          },
        ]);
      }
      setObservacion(cobro.observacion || "");
    } else if (cobro && cobro.detalles && cobro.detalles.length > 0) {
      // Si ya tiene detalles guardados
      setDetalles(
        cobro.detalles.map((d) => ({
          metodoPagoId: d.metodoPagoId,
          monedaId: d.monedaId,
          cuentaBancariaId: d.cuentaBancariaId,
          monto: d.monto,
          tipoCambio: d.tipoCambio,
          referencia: d.referencia,
          entidadFinanciera: d.entidadFinanciera,
          observacion: d.observacion,
        }))
      );
      setObservacion(cobro.observacion || "");
    }
  }, [cobroId, isPendingCobro, metodos.length, monedaBase?.id, montoObjetivo]);

  if (!cobro) {
    return (
      <Card className="border border-border/70 shadow-2xs bg-card/60 rounded-xl p-8 text-center flex flex-col items-center justify-center min-h-[420px] space-y-3">
        <div className="size-14 rounded-2xl bg-muted/60 flex items-center justify-center text-muted-foreground/60">
          <Wallet className="size-7" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-foreground">Terminal de Cobro</h3>
          <p className="text-xs text-muted-foreground max-w-xs mt-1">
            Seleccione un cobro de la lista para procesar los métodos de pago, registrar transacciones y emitir comprobantes.
          </p>
        </div>
      </Card>
    );
  }

  // Cálculos en tiempo real
  const totalIngresado = detalles.reduce((acc, d) => {
    const monto = Number(d.monto) || 0;
    const tc = Number(d.tipoCambio) || 1;
    return acc + monto * tc;
  }, 0);

  const saldoPendiente = Math.max(0, montoObjetivo - totalIngresado);
  const vuelto = Math.max(0, totalIngresado - montoObjetivo);

  // Manejo de Líneas de Pago
  const handleAddDetalle = () => {
    const defaultMetodoId = metodos[0]?.id ?? 1;
    const defaultMonedaId = monedaBase?.id ?? 1;

    setDetalles((prev) => [
      ...prev,
      {
        metodoPagoId: defaultMetodoId,
        monedaId: defaultMonedaId,
        cuentaBancariaId: null,
        monto: saldoPendiente > 0 ? saldoPendiente : 0,
        tipoCambio: 1,
        referencia: "",
        entidadFinanciera: "",
        observacion: "",
      },
    ]);
  };

  const handleRemoveDetalle = (index: number) => {
    setDetalles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateDetalle = (
    index: number,
    field: keyof CobroDetalleRequest,
    value: unknown
  ) => {
    setDetalles((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const handlePagarTodoEfectivo = () => {
    const defaultMetodoId =
      metodos.find((m) => m.nombre.toLowerCase().includes("efectivo"))?.id ??
      metodos[0]?.id ??
      1;
    const defaultMonedaId = monedaBase?.id ?? 1;

    setDetalles([
      {
        metodoPagoId: defaultMetodoId,
        monedaId: defaultMonedaId,
        cuentaBancariaId: null,
        monto: montoObjetivo,
        tipoCambio: 1,
        referencia: "",
        entidadFinanciera: "",
        observacion: "",
      },
    ]);
  };

  const handleConfirmarCobro = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cobro) return;

    if (detalles.length === 0) {
      toast.error("Debe ingresar al menos una forma de pago.");
      return;
    }

    const hasInvalidMonto = detalles.some((d) => !d.monto || Number(d.monto) <= 0);
    if (hasInvalidMonto) {
      toast.error("Todos los montos de pago deben ser mayores a 0.");
      return;
    }

    const payload: UpdateCobroRequest = {
      turnoCajaId: cobro.turnoCaja?.id || cobro.turnoCajaId || 1,
      ventaPagadorId: cobro.ventaPagador?.id || cobro.ventaPagadorId || 1,
      fechaHora: new Date().toISOString(),
      observacion: observacion.trim() || undefined,
      detalles: detalles.map((d) => ({
        metodoPagoId: Number(d.metodoPagoId),
        monedaId: Number(d.monedaId),
        cuentaBancariaId: d.cuentaBancariaId ? Number(d.cuentaBancariaId) : null,
        monto: Number(d.monto),
        tipoCambio: Number(d.tipoCambio) || 1,
        referencia: d.referencia?.trim() || null,
        entidadFinanciera: d.entidadFinanciera?.trim() || null,
        observacion: d.observacion?.trim() || null,
      })),
    };

    try {
      await updateCobroMutation.mutateAsync({
        id: cobro.id,
        data: payload,
      });

      toast.success(
        `Cobro #${cobro.numero} procesado y registrado con éxito por Bs. ${totalIngresado.toFixed(2)}.`
      );
      onSuccessCobro?.();
    } catch (error: any) {
      const msg =
        error?.response?.data?.detail ||
        error?.message ||
        "No se pudo registrar el cobro.";
      toast.error(msg);
    }
  };

  const cajaNombre =
    cobro.turnoCaja?.caja?.nombre ||
    cobro.turnoCaja?.caja?.codigo ||
    `Caja #${cobro.turnoCajaId || "-"}`;

  const cajeroNombre = cobro.turnoCaja?.empleado?.nombreCompleto;

  return (
    <Card className="border border-border/70 shadow-xs bg-card rounded-xl overflow-hidden flex flex-col">
      {/* CABECERA DE DETALLE */}
      <CardHeader className="p-3.5 border-b border-border/70 bg-muted/20 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-mono font-bold text-xs bg-primary/10 text-primary px-2 py-0.5 rounded border border-primary/20">
              #{cobro.numero}
            </span>
            {cobro.ventaPagador?.ventaNumero && (
              <Badge variant="secondary" className="text-[10px] font-mono">
                Venta #{cobro.ventaPagador.ventaNumero}
              </Badge>
            )}
          </div>
          <CobroStatusBadge cobro={cobro} />
        </div>

        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
              <Store className="size-4 text-indigo-600" />
              {cajaNombre}
            </h3>
            {cobro.ventaPagador?.convenioNombre && (
              <p className="text-[11px] text-blue-600 font-medium flex items-center gap-1 mt-0.5">
                <Building2 className="size-3" />
                Convenio: {cobro.ventaPagador.convenioNombre}
              </p>
            )}
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">
              Monto a Cobrar
            </span>
            <span className="text-base font-extrabold text-primary font-mono">
              Bs. {montoObjetivo.toFixed(2)}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-3.5 space-y-3.5 overflow-y-auto max-h-[calc(100vh-280px)] scrollbar-thin">
        {/* METADATOS BÁSICOS */}
        <div className="grid grid-cols-2 gap-2 text-xs p-2.5 rounded-lg border border-border/60 bg-muted/20">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Calendar className="size-3.5 text-primary/70 shrink-0" />
            <span>
              Fecha:{" "}
              <strong className="text-foreground">
                {new Date(cobro.fechaHora).toLocaleString("es-ES", {
                  dateStyle: "short",
                  timeStyle: "short",
                })}
              </strong>
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Hash className="size-3.5 text-indigo-600 shrink-0" />
            <span>
              Turno: <strong className="text-foreground">#{cobro.turnoCaja?.id || cobro.turnoCajaId || "-"}</strong>
            </span>
          </div>
          {cajeroNombre && (
            <div className="col-span-2 flex items-center gap-1.5 text-muted-foreground pt-1 border-t border-border/40 text-[11px]">
              <CreditCard className="size-3.5 text-blue-600 shrink-0" />
              <span>
                Cajero: <strong className="text-foreground">{cajeroNombre}</strong>
              </span>
            </div>
          )}
        </div>

        {/* TERMINAL DE COBRO INTERACTIVO (CUANDO ESTÁ EN REGISTRADO / PENDIENTE) */}
        {isPendingCobro || (cobro.estado === EstadoCobro.Registrado && detalles.length > 0) ? (
          <form onSubmit={handleConfirmarCobro} className="space-y-3.5">
            {/* PANEL DE CONTROL DE SALDOS EN TIEMPO REAL */}
            <div className="p-3 rounded-xl border border-border/80 bg-gradient-to-r from-muted/30 via-card to-primary/5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Coins className="size-3.5 text-emerald-600" />
                  Liquidación de Pago
                </span>

                {isPendingCobro && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handlePagarTodoEfectivo}
                    className="h-6 px-2 text-[11px] font-semibold gap-1 text-emerald-600 border-emerald-500/30 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 cursor-pointer"
                  >
                    <Zap className="size-3" />
                    Pagar Total Efectivo
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1 border-t border-border/40 text-center font-mono">
                <div className="p-1.5 rounded-lg bg-background border border-border/50">
                  <span className="text-[10px] text-muted-foreground block font-sans">
                    Objetivo
                  </span>
                  <span className="text-xs font-bold text-foreground">
                    Bs. {montoObjetivo.toFixed(2)}
                  </span>
                </div>

                <div className="p-1.5 rounded-lg bg-background border border-border/50">
                  <span className="text-[10px] text-muted-foreground block font-sans">
                    Ingresado
                  </span>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    Bs. {totalIngresado.toFixed(2)}
                  </span>
                </div>

                <div
                  className={`p-1.5 rounded-lg border ${
                    saldoPendiente === 0
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400"
                      : "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400"
                  }`}
                >
                  <span className="text-[10px] font-sans block">
                    {saldoPendiente > 0 ? "Saldo Restante" : "Completado"}
                  </span>
                  <span className="text-xs font-extrabold">
                    {saldoPendiente > 0
                      ? `Bs. ${saldoPendiente.toFixed(2)}`
                      : vuelto > 0
                      ? `Vuelto: Bs. ${vuelto.toFixed(2)}`
                      : "✓ 0.00"}
                  </span>
                </div>
              </div>
            </div>

            {/* LISTA DE FORMAS DE PAGO */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <CreditCard className="size-3.5 text-primary" />
                  Formas de Pago ({detalles.length})
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddDetalle}
                  className="h-6 px-2 text-[11px] gap-1 cursor-pointer font-medium"
                >
                  <Plus className="size-3" />
                  Agregar Pago
                </Button>
              </div>

              {isLoadingMetodos || isLoadingMonedas ? (
                <div className="p-3 space-y-2">
                  <Skeleton className="h-9 w-full" />
                </div>
              ) : detalles.length === 0 ? (
                <div className="p-4 border border-dashed rounded-lg text-center text-xs text-muted-foreground space-y-1">
                  <AlertCircle className="size-4 text-amber-500 mx-auto" />
                  <p>Haga click en "Agregar Pago" o "Pagar Total Efectivo"</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {detalles.map((det, index) => {
                    const currentMetodo = metodos.find(
                      (m) => m.id === det.metodoPagoId
                    );
                    const isBancoRequired =
                      currentMetodo?.nombre.toLowerCase().includes("transf") ||
                      currentMetodo?.nombre.toLowerCase().includes("qr") ||
                      currentMetodo?.nombre.toLowerCase().includes("dep") ||
                      currentMetodo?.nombre.toLowerCase().includes("tarj");

                    return (
                      <div
                        key={index}
                        className="p-2.5 rounded-lg border border-border/70 bg-card space-y-2 text-xs shadow-2xs"
                      >
                        <div className="grid grid-cols-12 gap-1.5 items-center">
                          {/* Método de Pago */}
                          <div className="col-span-5 sm:col-span-4">
                            <Label className="text-[10px] text-muted-foreground block mb-0.5">
                              Método
                            </Label>
                            <Select
                              value={det.metodoPagoId.toString()}
                              onValueChange={(val) =>
                                handleUpdateDetalle(
                                  index,
                                  "metodoPagoId",
                                  Number(val)
                                )
                              }
                            >
                              <SelectTrigger className="h-7 text-xs bg-background w-full">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {metodos.map((m) => (
                                  <SelectItem
                                    key={m.id}
                                    value={m.id.toString()}
                                    className="text-xs"
                                  >
                                    {m.nombre}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Moneda */}
                          <div className="col-span-3 sm:col-span-3">
                            <Label className="text-[10px] text-muted-foreground block mb-0.5">
                              Moneda
                            </Label>
                            <Select
                              value={det.monedaId.toString()}
                              onValueChange={(val) =>
                                handleUpdateDetalle(
                                  index,
                                  "monedaId",
                                  Number(val)
                                )
                              }
                            >
                              <SelectTrigger className="h-7 text-xs bg-background w-full font-mono">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {monedas.map((m) => (
                                  <SelectItem
                                    key={m.id}
                                    value={m.id.toString()}
                                    className="text-xs font-mono"
                                  >
                                    {m.codigo}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Monto */}
                          <div className="col-span-3 sm:col-span-4">
                            <Label className="text-[10px] text-muted-foreground block mb-0.5">
                              Monto
                            </Label>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={det.monto || ""}
                              onChange={(e) =>
                                handleUpdateDetalle(
                                  index,
                                  "monto",
                                  Number(e.target.value)
                                )
                              }
                              className="h-7 text-xs bg-background font-mono font-bold"
                              placeholder="0.00"
                            />
                          </div>

                          {/* Eliminar fila */}
                          <div className="col-span-1 flex justify-end pt-3">
                            {detalles.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveDetalle(index)}
                                className="h-7 w-7 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                              >
                                <Trash2 className="size-3.5" />
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Campos bancarios y referencia si aplica */}
                        {isBancoRequired && (
                          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border/40 text-[11px]">
                            <div>
                              <Label className="text-[10px] text-muted-foreground block mb-0.5">
                                Banco / Entidad
                              </Label>
                              <Input
                                value={det.entidadFinanciera || ""}
                                onChange={(e) =>
                                  handleUpdateDetalle(
                                    index,
                                    "entidadFinanciera",
                                    e.target.value
                                  )
                                }
                                placeholder="Ej: Banco Unión, BCP..."
                                className="h-6 text-xs bg-background"
                              />
                            </div>

                            <div>
                              <Label className="text-[10px] text-muted-foreground block mb-0.5">
                                N° Referencia / Voucher
                              </Label>
                              <Input
                                value={det.referencia || ""}
                                onChange={(e) =>
                                  handleUpdateDetalle(
                                    index,
                                    "referencia",
                                    e.target.value
                                  )
                                }
                                placeholder="N° Comprobante / Tx"
                                className="h-6 text-xs bg-background font-mono"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Observación general */}
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">
                Nota u Observación del Cobro
              </Label>
              <Textarea
                value={observacion}
                onChange={(e) => setObservacion(e.target.value)}
                placeholder="Observaciones de caja..."
                rows={2}
                className="text-xs bg-background resize-none"
              />
            </div>

            {/* BOTONES DE ACCIÓN */}
            <div className="pt-2 flex items-center justify-between gap-2">
              {onAnular && cobro.estado === EstadoCobro.Registrado && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onAnular(cobro)}
                  className="h-8 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
                >
                  <Ban className="size-3.5 mr-1" />
                  Anular Cobro
                </Button>
              )}

              <Button
                type="submit"
                size="sm"
                disabled={
                  updateCobroMutation.isPending ||
                  detalles.length === 0 ||
                  totalIngresado <= 0
                }
                className="h-8 text-xs font-semibold gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white ml-auto shadow-xs cursor-pointer"
              >
                {updateCobroMutation.isPending ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="size-3.5" />
                )}
                Confirmar y Registrar Cobro
              </Button>
            </div>
          </form>
        ) : (
          /* VISTA DE LECTURA DE DETALLES PARA COBROS YA FINALIZADOS O ANULADOS */
          <div className="space-y-3">
            <div className="p-3 rounded-lg border border-border/70 bg-card space-y-2 text-xs">
              <span className="font-bold text-foreground flex items-center gap-1.5">
                <Receipt className="size-3.5 text-primary" />
                Pagos Registrados ({cobro.detalles?.length || 0})
              </span>

              {cobro.detalles && cobro.detalles.length > 0 ? (
                <div className="divide-y divide-border/40">
                  {cobro.detalles.map((det) => {
                    const metodoNombre =
                      metodos.find((m) => m.id === det.metodoPagoId)?.nombre ||
                      `Método #${det.metodoPagoId}`;
                    const monedaCodigo =
                      monedas.find((m) => m.id === det.monedaId)?.codigo ||
                      "BOB";

                    return (
                      <div
                        key={det.id}
                        className="py-2 flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-semibold text-foreground">
                            {metodoNombre}
                          </p>
                          {(det.referencia || det.entidadFinanciera) && (
                            <p className="text-[10px] text-muted-foreground">
                              {det.entidadFinanciera ? `${det.entidadFinanciera} - ` : ""}
                              Ref: {det.referencia || "-"}
                            </p>
                          )}
                        </div>
                        <div className="text-right font-mono">
                          <span className="font-bold text-foreground block">
                            {monedaCodigo} {Number(det.monto).toFixed(2)}
                          </span>
                          {det.tipoCambio !== 1 && (
                            <span className="text-[10px] text-muted-foreground">
                              (TC: {det.tipoCambio} = Bs. {det.montoMonedaBase?.toFixed(2)})
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-2">
                  No hay detalles de pago registrados.
                </p>
              )}
            </div>

            {/* Total Cobrado */}
            <div className="p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 flex justify-between items-center text-xs">
              <span className="font-bold text-foreground uppercase">
                Total Cobrado:
              </span>
              <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                Bs. {Number(cobro.total).toFixed(2)}
              </span>
            </div>

            {cobro.observacion && (
              <div className="p-2.5 rounded-lg border border-border/60 bg-muted/20 text-xs">
                <span className="font-semibold text-muted-foreground block text-[10px]">
                  Observación:
                </span>
                <p className="text-foreground mt-0.5">{cobro.observacion}</p>
              </div>
            )}

            {onAnular && cobro.estado === EstadoCobro.Registrado && (
              <div className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onAnular(cobro)}
                  className="w-full h-8 text-xs text-rose-600 border-rose-500/30 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer font-semibold gap-1.5"
                >
                  <Ban className="size-3.5" />
                  Anular Cobro
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
