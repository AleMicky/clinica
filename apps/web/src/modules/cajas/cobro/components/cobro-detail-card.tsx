"use client";

import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Ban,
  Building2,
  CheckCircle2,
  ChevronsUpDown,
  Coins,
  CreditCard,
  Loader2,
  QrCode,
  Receipt,
  Search,
  Store,
  User,
  Wallet,
  X,
  Zap,
} from "lucide-react";
import {
  EstadoCobro,
  type CobroDetalleRequest,
  type CobroResponse,
  type ConfirmarCobroRequest,
} from "../types/cobro.types";
import { CobroStatusBadge } from "./cobro-status-badge";
import { useCobro, useConfirmarCobro } from "../hooks/use-cobros";
import { useMetodosPago } from "@/modules/parametros/metodo-pago/hooks/use-metodos-pago";
import { useMonedas } from "@/modules/parametros/moneda/hooks/use-monedas";
import { useBancos } from "@/modules/parametros/banco/hooks/use-bancos";

interface CobroDetailCardProps {
  cobro: CobroResponse | null;
  onSuccessCobro?: () => void;
  onAnular?: (cobro: CobroResponse) => void;
  onBack?: () => void;
}

function formatCurrency(amount?: number | null): string {
  return `Bs. ${Number(amount || 0).toLocaleString("es-BO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function getInitialDetalles(
  cobro: CobroResponse,
  montoObjetivo: number,
  metodos: Array<{ id: number; nombre: string }>,
  monedaBase?: { id: number }
): CobroDetalleRequest[] {
  if (cobro.detalles && cobro.detalles.length > 0) {
    return cobro.detalles.map((d) => ({
      metodoPagoId: d.metodoPagoId || d.metodoPago?.id || metodos[0]?.id || 1,
      monedaId: d.monedaId || d.moneda?.id || monedaBase?.id || 1,
      cuentaBancariaId: d.cuentaBancariaId,
      monto: d.monto,
      tipoCambio: d.tipoCambio,
      referencia: d.referencia,
      entidadFinanciera: d.entidadFinanciera,
      observacion: d.observacion,
    }));
  }

  // Por defecto buscar método de efectivo
  const efectivoMetodo =
    metodos.find((m) => m.nombre.toLowerCase().includes("efectivo")) ||
    metodos[0];
  const defaultMetodoId = efectivoMetodo?.id ?? 1;
  const defaultMonedaId = monedaBase?.id ?? 1;

  return [
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
  ];
}

interface CobroLiquidacionFormProps {
  cobro: CobroResponse;
  montoObjetivo: number;
  metodos: Array<{ id: number; nombre: string }>;
  monedaBase?: { id: number; nombre: string; codigo: string };
  onSuccessCobro?: () => void;
  onAnular?: (cobro: CobroResponse) => void;
}

interface BancoAutocompleteProps {
  value?: string | null;
  onValueChange: (value: string | null) => void;
  bancos: Array<{ id: number; codigo: string; nombre: string; nombreCorto?: string | null }>;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
}

function BancoAutocomplete({
  value,
  onValueChange,
  bancos,
  isLoading = false,
  disabled = false,
  className,
  placeholder = "Ej: Banco Unión, BCP...",
}: Readonly<BancoAutocompleteProps>) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  const selectedBanco = React.useMemo(() => {
    if (!value) return null;
    return bancos.find(
      (b) => b.nombre.toLowerCase() === value.toLowerCase()
    );
  }, [bancos, value]);

  const filteredBancos = React.useMemo(() => {
    if (!searchQuery.trim()) return bancos;
    const q = searchQuery.toLowerCase().trim();
    return bancos.filter(
      (b) =>
        b.nombre.toLowerCase().includes(q) ||
        (b.nombreCorto && b.nombreCorto.toLowerCase().includes(q)) ||
        b.codigo.toLowerCase().includes(q)
    );
  }, [bancos, searchQuery]);

  const handleSelect = (banco: { nombre: string }) => {
    onValueChange(banco.nombre);
    setIsOpen(false);
    setSearchQuery("");
  };

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onValueChange(null);
    setSearchQuery("");
  };

  const handleSelectCustom = () => {
    if (searchQuery.trim()) {
      onValueChange(searchQuery.trim());
      setIsOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger
        type="button"
        disabled={disabled}
        aria-expanded={isOpen}
        className={cn(
          "w-full h-8 px-2.5 flex items-center justify-between gap-1.5 text-xs rounded-md border border-input bg-background text-left transition-all cursor-pointer shadow-2xs hover:border-primary/50 focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring",
          disabled && "opacity-50 cursor-not-allowed pointer-events-none",
          className
        )}
      >
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <Building2
            className={cn(
              "size-3.5 shrink-0",
              value ? "text-primary" : "text-muted-foreground"
            )}
          />
          {selectedBanco ? (
            <div className="flex items-center gap-1.5 min-w-0 flex-1 truncate">
              {selectedBanco.nombreCorto && (
                <span className="font-mono font-bold text-[10px] text-primary bg-primary/10 px-1 py-0.2 rounded shrink-0">
                  {selectedBanco.nombreCorto}
                </span>
              )}
              <span className="font-medium text-foreground truncate text-xs">
                {selectedBanco.nombre}
              </span>
            </div>
          ) : value ? (
            <span className="font-medium text-foreground truncate text-xs">
              {value}
            </span>
          ) : (
            <span className="text-muted-foreground truncate text-xs">
              {placeholder}
            </span>
          )}
        </div>

        <div className="flex items-center gap-0.5 shrink-0 text-muted-foreground ml-1">
          {isLoading ? (
            <Loader2 className="size-3 animate-spin text-primary" />
          ) : value && !disabled ? (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  e.stopPropagation();
                  handleClear(e as unknown as React.MouseEvent);
                }
              }}
              className="rounded-full p-0.5 hover:bg-muted hover:text-foreground transition-colors cursor-pointer inline-flex items-center justify-center"
              title="Quitar selección"
            >
              <X className="size-3" />
            </span>
          ) : (
            <ChevronsUpDown className="size-3 opacity-60" />
          )}
        </div>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="w-[280px] sm:w-[320px] p-1.5 max-h-72 overflow-hidden flex flex-col rounded-xl shadow-xl border-border/80 z-50 bg-popover text-popover-foreground"
      >
        {/* Search header */}
        <div className="flex items-center gap-1.5 px-2 py-1.5 border-b border-border/50 bg-muted/20 rounded-md mb-1">
          <Search className="size-3.5 text-muted-foreground shrink-0" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (filteredBancos.length > 0) {
                  handleSelect(filteredBancos[0]);
                } else if (searchQuery.trim()) {
                  handleSelectCustom();
                }
              }
            }}
            placeholder="Buscar banco por nombre o código..."
            className="w-full text-xs bg-transparent outline-none placeholder:text-muted-foreground/70"
            autoFocus
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="p-0.5 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="size-3" />
            </button>
          )}
        </div>

        {/* Results list */}
        <div className="overflow-y-auto max-h-48 pr-0.5 space-y-0.5 scrollbar-none">
          {isLoading && filteredBancos.length === 0 ? (
            <div className="flex items-center justify-center gap-2 px-3 py-3 text-xs text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin text-primary" />
              <span>Cargando bancos...</span>
            </div>
          ) : filteredBancos.length === 0 ? (
            <div className="px-3 py-3 text-xs text-muted-foreground text-center space-y-2">
              <p>No se encontraron bancos coincidentes.</p>
              {searchQuery.trim() && (
                <button
                  type="button"
                  onClick={handleSelectCustom}
                  className="w-full text-left text-xs px-2 py-1.5 rounded-md bg-primary/10 text-primary hover:bg-primary/20 font-medium transition-colors"
                >
                  Usar &quot;{searchQuery.trim()}&quot;
                </button>
              )}
            </div>
          ) : (
            <ul className="space-y-0.5">
              {filteredBancos.map((banco) => {
                const isSelected =
                  value?.toLowerCase() === banco.nombre.toLowerCase();

                return (
                  <li
                    key={banco.id}
                    onClick={() => handleSelect(banco)}
                    className={cn(
                      "flex cursor-pointer select-none items-center justify-between rounded-lg px-2 py-1.5 outline-hidden hover:bg-accent hover:text-accent-foreground transition-colors text-xs",
                      isSelected && "bg-accent/80 font-medium text-accent-foreground"
                    )}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div className="size-5 rounded flex items-center justify-center shrink-0 border bg-primary/10 border-primary/25 text-primary text-[10px] font-bold">
                        {banco.codigo.slice(0, 2)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="truncate block font-medium">
                          {banco.nombre}
                        </span>
                        {banco.nombreCorto && (
                          <span className="text-[10px] text-muted-foreground block">
                            {banco.nombreCorto}
                          </span>
                        )}
                      </div>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="size-3.5 text-primary shrink-0" />
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function CobroLiquidacionForm({
  cobro,
  montoObjetivo,
  metodos,
  monedaBase,
  onSuccessCobro,
  onAnular,
}: Readonly<CobroLiquidacionFormProps>) {
  const confirmarCobroMutation = useConfirmarCobro();

  const { data: bancosData, isLoading: isLoadingBancos } = useBancos({
    pageSize: 100,
  });
  const bancos = React.useMemo(() => {
    return bancosData?.items?.filter((b) => b.activo) ?? [];
  }, [bancosData]);

  const [detalles, setDetalles] = React.useState<CobroDetalleRequest[]>(() =>
    getInitialDetalles(cobro, montoObjetivo, metodos, monedaBase)
  );
  const [observacion, setObservacion] = React.useState(cobro.observacion || "");
  const [montoRecibidoEfectivo, setMontoRecibidoEfectivo] = React.useState<number>(montoObjetivo);

  // Obtener método actual activo del primer detalle
  const activeDetalle = detalles[0] || {
    metodoPagoId: metodos[0]?.id || 1,
    monedaId: monedaBase?.id || 1,
    monto: montoObjetivo,
    referencia: "",
    entidadFinanciera: "",
  };

  const selectedMetodo = metodos.find((m) => m.id === activeDetalle.metodoPagoId);
  const isEfectivo =
    selectedMetodo?.nombre.toLowerCase().includes("efectivo") ?? true;
  const isDigital =
    selectedMetodo?.nombre.toLowerCase().includes("qr") ||
    selectedMetodo?.nombre.toLowerCase().includes("tarj") ||
    selectedMetodo?.nombre.toLowerCase().includes("transf") ||
    selectedMetodo?.nombre.toLowerCase().includes("dep");

  // Cálculo de vuelto para efectivo
  const vuelto = isEfectivo
    ? Math.max(0, montoRecibidoEfectivo - montoObjetivo)
    : 0;

  // Cambiar método de pago en un solo clic
  const handleSelectMetodo = (metodoId: number) => {
    setDetalles([
      {
        ...activeDetalle,
        metodoPagoId: metodoId,
        monto: montoObjetivo,
      },
    ]);
  };

  // Botones de efectivo rápido
  const handleSetEfectivoExacto = () => {
    setMontoRecibidoEfectivo(montoObjetivo);
    setDetalles([
      {
        ...activeDetalle,
        monto: montoObjetivo,
      },
    ]);
  };

  const handleAddBilletes = (extra: number) => {
    const nuevoMonto = Math.ceil(montoObjetivo / extra) * extra;
    setMontoRecibidoEfectivo(nuevoMonto);
  };

  const handleConfirmarCobro = async (e: React.SubmitEvent) => {
    e.preventDefault();

    if (detalles.length === 0) {
      toast.error("Debe ingresar al menos una forma de pago.");
      return;
    }

    const payload: ConfirmarCobroRequest = {
      observacion: observacion.trim() || null,
      detalles: detalles.map((d) => ({
        metodoPagoId: Number(d.metodoPagoId),
        monedaId: Number(d.monedaId),
        cuentaBancariaId: d.cuentaBancariaId ? Number(d.cuentaBancariaId) : null,
        monto: Number(montoObjetivo),
        tipoCambio: 1,
        referencia: d.referencia?.trim() || null,
        entidadFinanciera: d.entidadFinanciera?.trim() || null,
        observacion: d.observacion?.trim() || null,
      })),
    };

    try {
      await confirmarCobroMutation.mutateAsync({
        id: cobro.id,
        data: payload,
      });

      toast.success(
        `Cobro #${cobro.numero} registrado con éxito por ${formatCurrency(montoObjetivo)}.`
      );
      onSuccessCobro?.();
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { detail?: string; message?: string; title?: string } };
        message?: string;
      };
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.response?.data?.title ||
        err?.message ||
        "No se pudo confirmar el cobro.";
      toast.error(msg);
    }
  };

  return (
    <form onSubmit={handleConfirmarCobro} className="flex-1 min-h-0 flex flex-col justify-between gap-2.5 p-3 sm:p-3.5 overflow-hidden">
      <div className="flex-1 min-h-0 overflow-y-auto space-y-2.5 pr-0.5 scrollbar-none">
        {/* PANTALLA HERO DEL MONTO A COBRAR (ESTILO CAJA POS) */}
        <div className="rounded-xl p-4 bg-gradient-to-r from-emerald-950/40 via-card to-emerald-950/20 border border-emerald-500/30 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
              Monto a Liquidar
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-sm font-semibold text-emerald-600">Bs.</span>
              <span className="text-3xl font-extrabold text-foreground font-mono tracking-tight">
                {montoObjetivo.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
              Estado de Saldo
            </span>
            <Badge className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-semibold text-xs mt-1">
              Exacto a Pagar
            </Badge>
          </div>
        </div>

        {/* SELECTOR RÁPIDO DE MÉTODO DE PAGO (CHIPS INTERACTIVOS) */}
        <div className="space-y-1.5">
          <Label className="text-xs font-bold text-foreground">
            Forma de Pago
          </Label>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {metodos.slice(0, 4).map((m) => {
              const isSelected = activeDetalle.metodoPagoId === m.id;
              const isEfect = m.nombre.toLowerCase().includes("efectivo");
              const isQr = m.nombre.toLowerCase().includes("qr");
              const isTarj = m.nombre.toLowerCase().includes("tarj");

              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => handleSelectMetodo(m.id)}
                  className={`h-11 px-3 rounded-lg border flex items-center justify-center gap-2 text-xs font-semibold transition-all cursor-pointer select-none ${
                    isSelected
                      ? "bg-primary text-primary-foreground border-primary shadow-xs"
                      : "bg-muted/30 text-foreground border-border/70 hover:bg-muted/70 hover:border-border"
                  }`}
                >
                  {isEfect && <Coins className="size-4 shrink-0" />}
                  {isQr && <QrCode className="size-4 shrink-0" />}
                  {isTarj && <CreditCard className="size-4 shrink-0" />}
                  {!isEfect && !isQr && !isTarj && <Wallet className="size-4 shrink-0" />}
                  <span className="truncate">{m.nombre}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* PANEL DINÁMICO SEGÚN MÉTODO DE PAGO */}
        {isEfectivo ? (
          <div className="p-3 rounded-xl border border-border/60 bg-muted/20 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Coins className="size-3.5 text-amber-500" />
                Cálculo de Efectivo y Vuelto
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSetEfectivoExacto}
                className="h-6 px-2 text-[11px] gap-1 cursor-pointer font-medium"
              >
                <Zap className="size-3 text-amber-500" />
                Monto Exacto
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3 items-center">
              <div>
                <Label className="text-[11px] text-muted-foreground block mb-1">
                  Efectivo Recibido (Bs.)
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={montoRecibidoEfectivo || ""}
                  onChange={(e) => setMontoRecibidoEfectivo(Number(e.target.value))}
                  className="h-9 font-mono font-bold text-sm bg-background"
                />
              </div>

              <div className="p-2 rounded-lg bg-background border border-border/50 text-right">
                <span className="text-[10px] text-muted-foreground block font-medium">
                  Vuelto a Entregar
                </span>
                <span
                  className={`text-lg font-mono font-extrabold ${
                    vuelto > 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-muted-foreground"
                  }`}
                >
                  {formatCurrency(vuelto)}
                </span>
              </div>
            </div>

            {/* Atajos de billetes comunes */}
            <div className="flex items-center gap-1.5 pt-1">
              <span className="text-[10px] text-muted-foreground">Billetes:</span>
              <div className="flex items-center gap-1 flex-wrap">
                {[50, 100, 200].map((billete) => (
                  <button
                    key={billete}
                    type="button"
                    onClick={() => handleAddBilletes(billete)}
                    className="px-2 py-0.5 rounded bg-background border border-border/60 text-[10px] font-mono font-semibold hover:border-primary cursor-pointer"
                  >
                    Bs. {billete}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : isDigital ? (
          <div className="p-3 rounded-xl border border-border/60 bg-muted/20 space-y-2">
            <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <QrCode className="size-3.5 text-blue-500" />
              Datos de Transacción / Comprobante
            </span>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-[11px] text-muted-foreground block mb-0.5">
                  N° de Referencia / Comprobante
                </Label>
                <Input
                  type="text"
                  placeholder="Ej: OP-983421"
                  value={activeDetalle.referencia || ""}
                  onChange={(e) =>
                    setDetalles([
                      {
                        ...activeDetalle,
                        referencia: e.target.value,
                      },
                    ])
                  }
                  className="h-8 text-xs font-mono bg-background"
                />
              </div>

              <div>
                <Label htmlFor="banco-entidad-field" className="text-[11px] text-muted-foreground block mb-0.5">
                  Banco / Entidad (Opcional)
                </Label>
                <BancoAutocomplete
                  value={activeDetalle.entidadFinanciera || ""}
                  onValueChange={(val) =>
                    setDetalles([
                      {
                        ...activeDetalle,
                        entidadFinanciera: val,
                      },
                    ])
                  }
                  bancos={bancos}
                  isLoading={isLoadingBancos}
                />
              </div>
            </div>
          </div>
        ) : null}

        {/* NOTA U OBSERVACIÓN DEL COBRO (UNA SOLA LÍNEA COMPACTA) */}
        <div>
          <Input
            type="text"
            placeholder="Nota u observación de caja (opcional)..."
            value={observacion}
            onChange={(e) => setObservacion(e.target.value)}
            className="h-8 text-xs bg-muted/20 border-border/60"
          />
        </div>
      </div>

      {/* PIE DE ACCIONES: CONFIRMAR COBRO EN UN BOTÓN PRINCIPAL */}
      <div className="pt-2 border-t border-border/50 flex items-center gap-2">
        {onAnular && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onAnular(cobro)}
            className="h-10 px-3 text-xs text-rose-600 border-rose-500/30 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer font-semibold gap-1.5 shrink-0"
          >
            <Ban className="size-3.5" />
            <span className="hidden sm:inline">Anular</span>
          </Button>
        )}

        <Button
          type="submit"
          disabled={confirmarCobroMutation.isPending}
          className="flex-1 h-10 text-xs sm:text-sm font-bold gap-2 cursor-pointer shadow-md bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          {confirmarCobroMutation.isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              <span>Procesando Cobro...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="size-4" />
              <span>Confirmar y Registrar Cobro • {formatCurrency(montoObjetivo)}</span>
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

export function CobroDetailCard({
  cobro: initialCobro,
  onSuccessCobro,
  onAnular,
  onBack,
}: Readonly<CobroDetailCardProps>) {
  const cobroId = initialCobro?.id ?? 0;
  const { data: fullCobro } = useCobro(cobroId, cobroId > 0);
  const cobro = fullCobro ?? initialCobro;

  const { data: metodosData, isLoading: isLoadingMetodos } = useMetodosPago({
    pageSize: 50,
  });
  const { data: monedasData, isLoading: isLoadingMonedas } = useMonedas({
    pageSize: 50,
  });

  const metodos = React.useMemo(
    () => metodosData?.items?.filter((m) => m.activo) ?? [],
    [metodosData?.items]
  );
  const monedas = React.useMemo(
    () => monedasData?.items?.filter((m) => m.activo) ?? [],
    [monedasData?.items]
  );
  const monedaBase = React.useMemo(
    () => monedas.find((m) => m.esBase) ?? monedas[0],
    [monedas]
  );

  if (!cobro) {
    return (
      <div className="h-full flex-1 min-h-0 flex flex-col items-center justify-center p-8 text-center text-muted-foreground border border-border/70 rounded-xl bg-card shadow-2xs">
        <div className="size-12 rounded-2xl bg-muted/60 flex items-center justify-center text-muted-foreground/50 mb-2">
          <Wallet className="size-6" />
        </div>
        <h3 className="text-sm font-bold text-foreground">Terminal de Cobro Listo</h3>
        <p className="text-xs text-muted-foreground max-w-xs mt-1">
          Seleccione un ticket de la cola izquierda para liquidar formas de pago en un solo clic.
        </p>
      </div>
    );
  }

  const montoObjetivo =
    cobro.ventaPagador?.monto && cobro.ventaPagador.monto > 0
      ? cobro.ventaPagador.monto
      : cobro.total || 0;

  const cajaNombre =
    cobro.turnoCaja?.caja?.nombre ||
    cobro.turnoCaja?.caja?.codigo ||
    `Caja #${cobro.turnoCajaId || "-"}`;

  const cajeroNombre = cobro.turnoCaja?.empleado?.nombreCompleto;

  return (
    <div className="h-full flex flex-col border border-border/70 rounded-xl bg-card overflow-hidden shadow-2xs">
      {/* CABECERA INTEGRADA DEL TICKET (SIN CAJAS ANIDADAS) */}
      <div className="p-3 border-b border-border/60 bg-muted/20 flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          {onBack && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onBack}
              className="lg:hidden h-6.5 px-2 text-xs gap-1 cursor-pointer font-medium mr-1 border-border/70"
            >
              <ArrowLeft className="size-3" />
              <span>Cola</span>
            </Button>
          )}
          <span className="font-mono font-bold text-xs bg-primary/15 text-primary px-2 py-0.5 rounded border border-primary/25">
            #{cobro.numero}
          </span>
          {cobro.ventaPagador?.ventaNumero && (
            <span className="text-[11px] font-medium text-muted-foreground">
              Venta #{cobro.ventaPagador.ventaNumero}
            </span>
          )}
          <CobroStatusBadge cobro={cobro} />
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Store className="size-3 text-primary" />
            <strong className="text-foreground">{cajaNombre}</strong>
          </span>
          <span>•</span>
          <span>Turno #{cobro.turnoCaja?.id || cobro.turnoCajaId || "-"}</span>
          {cajeroNombre && (
            <>
              <span>•</span>
              <span className="truncate max-w-[130px]">{cajeroNombre}</span>
            </>
          )}
        </div>
      </div>

      {/* TIRA DE DATOS DEL PACIENTE */}
      {cobro.ventaPagador?.pacienteNombreCompleto && (
        <div className="px-4 py-2 border-b border-border/40 bg-background/50 flex items-center justify-between text-xs shrink-0 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <User className="size-3.5 text-primary" />
            <span className="font-bold text-foreground">
              {cobro.ventaPagador.pacienteNombreCompleto}
            </span>
            {cobro.ventaPagador.pacienteDocumento && (
              <span className="text-muted-foreground font-mono text-[11px]">
                (CI: {cobro.ventaPagador.pacienteDocumento})
              </span>
            )}
          </div>

          {cobro.ventaPagador.convenioNombre && (
            <div className="flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20 font-medium">
              <Building2 className="size-3" />
              <span>{cobro.ventaPagador.convenioNombre}</span>
            </div>
          )}
        </div>
      )}

      {/* CUERPO DEL TERMINAL: LIQUIDACIÓN O RECIBO SELLADO */}
      {cobro.estado === EstadoCobro.Registrado ? (
        isLoadingMetodos || isLoadingMonedas ? (
          <div className="p-4 space-y-3">
            <Skeleton className="h-20 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
        ) : (
          <CobroLiquidacionForm
            key={cobro.id}
            cobro={cobro}
            montoObjetivo={montoObjetivo}
            metodos={metodos}
            monedaBase={monedaBase}
            onSuccessCobro={onSuccessCobro}
            onAnular={onAnular}
          />
        )
      ) : (
        /* VISTA DE TICKET COBRADO O ANULADO (RECIBO FINAL) */
        <div className="flex-1 min-h-0 p-4 sm:p-5 flex flex-col justify-between overflow-hidden">
          <div className="flex-1 min-h-0 overflow-y-auto space-y-3.5 pr-1 scrollbar-none">
            <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                  Cobro Confirmado y Liquidado
                </span>
                <span className="text-2xl font-mono font-extrabold text-foreground">
                  {formatCurrency(cobro.total)}
                </span>
              </div>
              <CheckCircle2 className="size-8 text-emerald-600 dark:text-emerald-400" />
            </div>

            {/* Desglose de pagos */}
            <div className="p-3 rounded-lg border border-border/70 bg-card space-y-2 text-xs">
              <span className="font-bold text-foreground flex items-center gap-1.5">
                <Receipt className="size-3.5 text-primary" />
                Formas de Pago Registradas
              </span>

              {cobro.detalles && cobro.detalles.length > 0 ? (
                <div className="divide-y divide-border/40">
                  {cobro.detalles.map((det) => (
                    <div key={det.id} className="py-2 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-foreground">
                          {det.metodoPago?.nombre || "Método de Pago"}
                        </p>
                        {det.referencia && (
                          <p className="text-[10px] text-muted-foreground font-mono">
                            Ref: {det.referencia}
                          </p>
                        )}
                      </div>
                      <span className="font-mono font-bold text-foreground">
                        {det.moneda?.codigo || "BOB"} {Number(det.monto).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-2">
                  Detalles registrados en caja.
                </p>
              )}
            </div>

            {cobro.observacion && (
              <div className="p-2.5 rounded-lg border border-border/60 bg-muted/20 text-xs">
                <span className="font-semibold text-muted-foreground block text-[10px]">
                  Observación de caja:
                </span>
                <p className="text-foreground mt-0.5">{cobro.observacion}</p>
              </div>
            )}
          </div>

          {onAnular && cobro.estado === EstadoCobro.Confirmado && (
            <div className="shrink-0 pt-2 border-t border-border/50">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onAnular(cobro)}
                className="w-full h-9 text-xs text-rose-600 border-rose-500/30 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer font-semibold gap-1.5"
              >
                <Ban className="size-3.5" />
                Anular Cobro Realizado
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
