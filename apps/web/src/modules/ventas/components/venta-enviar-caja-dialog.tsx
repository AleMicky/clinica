"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  CreditCard,
  Loader2,
  Send,
  Store,
  AlertCircle,
  Check,
  ChevronsUpDown,
  Search,
  X,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { type VentaResponse } from "../types/ventas.types";
import { useCajas } from "@/modules/cajas/caja/hooks/use-cajas";
import type { CajaResponse } from "@/modules/cajas/caja/types/caja.types";

interface VentaEnviarCajaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  venta: VentaResponse | null;
  onConfirm: (cajaId: number, motivo?: string) => Promise<void>;
  isLoading?: boolean;
}

export function VentaEnviarCajaDialog({
  open,
  onOpenChange,
  venta,
  onConfirm,
  isLoading = false,
}: VentaEnviarCajaDialogProps) {
  const [selectedCajaId, setSelectedCajaId] = React.useState<number | null>(null);
  const [motivo, setMotivo] = React.useState("");
  const [isComboboxOpen, setIsComboboxOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  const { data: cajasData, isLoading: isLoadingCajas } = useCajas(
    { pageSize: 50 },
    open
  );

  const cajas: CajaResponse[] = React.useMemo(() => {
    return cajasData?.items?.filter((c) => c.activo) ?? [];
  }, [cajasData]);

  // Filtrado en vivo por código, nombre o descripción
  const filteredCajas = React.useMemo(() => {
    if (!searchQuery.trim()) return cajas;
    const query = searchQuery.toLowerCase().trim();
    return cajas.filter(
      (c) =>
        c.nombre.toLowerCase().includes(query) ||
        (c.codigo && c.codigo.toLowerCase().includes(query)) ||
        (c.descripcion && c.descripcion.toLowerCase().includes(query))
    );
  }, [cajas, searchQuery]);

  const selectedCaja = React.useMemo(() => {
    return cajas.find((c) => c.id === selectedCajaId) ?? null;
  }, [cajas, selectedCajaId]);

  React.useEffect(() => {
    if (open) {
      setMotivo("");
      setSearchQuery("");
      setIsComboboxOpen(false);
      if (cajas.length > 0) {
        setSelectedCajaId(cajas[0].id);
      } else {
        setSelectedCajaId(null);
      }
    }
  }, [open, cajasData]);

  // Si no hay caja seleccionada por defecto pero cargaron cajas
  React.useEffect(() => {
    if (open && !selectedCajaId && cajas.length > 0) {
      setSelectedCajaId(cajas[0].id);
    }
  }, [open, selectedCajaId, cajas]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCajaId) return;
    await onConfirm(selectedCajaId, motivo.trim() || undefined);
    onOpenChange(false);
  };

  if (!venta) return null;

  const pacienteNombre = venta.paciente?.nombreCompleto || "Paciente";
  const monedaSimbolo =
    venta.moneda?.simbolo || (venta.moneda?.codigo === "USD" ? "$" : "Bs.");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg w-full border-border/80 shadow-2xl p-0 gap-0 overflow-hidden">
        {/* Cabecera estilizada */}
        <div className="px-5 pt-5 pb-4 bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-transparent border-b border-border/60">
          <DialogHeader className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
                <Send className="size-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground">
                  Enviar Venta #{venta.numero} a Caja
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Asigne la venta a una caja activa para que el cajero proceda con la cobranza.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Tarjeta de Resumen de la Venta */}
          <div className="p-3 bg-muted/40 rounded-xl border border-border/60 space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground font-medium">Paciente:</span>
              <strong className="text-foreground font-semibold">{pacienteNombre}</strong>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground font-medium">Nº Admisión / Referencia:</span>
              <span className="font-mono text-muted-foreground font-medium bg-background px-1.5 py-0.5 rounded border border-border/50">
                #{venta.admisionId}
              </span>
            </div>
            <div className="pt-2 border-t border-border/40 flex justify-between items-center">
              <span className="font-bold text-foreground">Total a Cobrar:</span>
              <div className="flex items-baseline gap-1">
                <span className="text-xs font-bold text-primary font-mono">{monedaSimbolo}</span>
                <span className="text-base font-extrabold text-primary font-mono">
                  {venta.total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Selector de Caja con Autocomplete */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
                <Store className="size-3.5 text-indigo-600 dark:text-indigo-400" />
                Caja de Destino <span className="text-rose-500">*</span>
              </Label>
              {cajas.length > 0 && (
                <span className="text-[10px] text-muted-foreground">
                  {cajas.length} caja{cajas.length !== 1 ? "s" : ""} disponible{cajas.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>

            {isLoadingCajas ? (
              <div className="h-10 rounded-xl border border-input bg-muted/30 px-3 flex items-center text-xs text-muted-foreground shadow-2xs">
                <Loader2 className="size-3.5 animate-spin mr-2 text-indigo-600" />
                Cargando cajas disponibles...
              </div>
            ) : cajas.length === 0 ? (
              <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-300 text-xs flex items-start gap-2.5">
                <AlertCircle className="size-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                <div>
                  <p className="font-semibold">No hay cajas activas registradas</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Debe registrar o habilitar al menos una caja en el módulo de Cajas.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {/* Popover / Autocomplete Combobox */}
                <Popover open={isComboboxOpen} onOpenChange={setIsComboboxOpen}>
                  <PopoverTrigger
                    type="button"
                    role="combobox"
                    aria-expanded={isComboboxOpen}
                    className={cn(
                      "w-full h-10 px-3 flex items-center justify-between text-xs font-normal bg-background border border-border/80 hover:border-indigo-500/70 hover:bg-accent/30 rounded-xl shadow-2xs transition-all cursor-pointer",
                      !selectedCaja && "text-muted-foreground"
                    )}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Store className="size-4 text-indigo-600 shrink-0" />
                      {selectedCaja ? (
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="font-semibold text-foreground truncate">
                            {selectedCaja.nombre}
                          </span>
                          {selectedCaja.codigo && (
                            <Badge
                              variant="secondary"
                              className="px-1.5 py-0 text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200/50 shrink-0"
                            >
                              {selectedCaja.codigo}
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span>Buscar o seleccionar caja...</span>
                      )}
                    </div>
                    <ChevronsUpDown className="size-3.5 opacity-50 shrink-0" />
                  </PopoverTrigger>

                  <PopoverContent
                    align="start"
                    className="w-80 sm:w-96 p-1.5 max-h-72 overflow-hidden flex flex-col rounded-xl shadow-xl border-border/80"
                  >
                    {/* Barra de búsqueda interactiva */}
                    <div className="flex items-center gap-2 px-2.5 py-1.5 border-b border-border/50 mb-1">
                      <Search className="size-3.5 text-muted-foreground shrink-0" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Buscar por nombre, código o ubicación..."
                        className="w-full text-xs bg-transparent outline-none placeholder:text-muted-foreground/70"
                        autoFocus
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => setSearchQuery("")}
                          className="text-muted-foreground hover:text-foreground p-0.5 rounded-sm cursor-pointer"
                        >
                          <X className="size-3" />
                        </button>
                      )}
                    </div>

                    {/* Lista de Cajas */}
                    <div className="overflow-y-auto max-h-52 space-y-0.5 pr-0.5 scrollbar-thin">
                      {filteredCajas.length === 0 ? (
                        <div className="p-4 text-center text-xs text-muted-foreground space-y-1">
                          <Store className="size-6 mx-auto opacity-40 text-muted-foreground" />
                          <p className="font-medium text-foreground">No se encontraron cajas</p>
                          <p className="text-[11px] text-muted-foreground">
                            Intente con otro término de búsqueda.
                          </p>
                        </div>
                      ) : (
                        filteredCajas.map((caja) => {
                          const isSelected = selectedCajaId === caja.id;
                          return (
                            <button
                              key={caja.id}
                              type="button"
                              onClick={() => {
                                setSelectedCajaId(caja.id);
                                setIsComboboxOpen(false);
                              }}
                              className={cn(
                                "w-full text-left p-2 rounded-lg text-xs flex items-center justify-between gap-2 transition-colors cursor-pointer",
                                isSelected
                                  ? "bg-indigo-500/10 text-indigo-900 dark:text-indigo-200 font-medium"
                                  : "hover:bg-accent/60 text-foreground"
                              )}
                            >
                              <div className="flex items-start gap-2 min-w-0">
                                <div
                                  className={cn(
                                    "size-7 rounded-md flex items-center justify-center shrink-0 mt-0.5",
                                    isSelected
                                      ? "bg-indigo-600 text-white"
                                      : "bg-muted text-muted-foreground"
                                  )}
                                >
                                  <Store className="size-3.5" />
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="font-semibold truncate">{caja.nombre}</span>
                                    {caja.codigo && (
                                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-muted text-muted-foreground">
                                        {caja.codigo}
                                      </span>
                                    )}
                                  </div>
                                  {caja.descripcion && (
                                    <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                                      {caja.descripcion}
                                    </p>
                                  )}
                                </div>
                              </div>
                              {isSelected && (
                                <div className="size-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                                  <Check className="size-3" />
                                </div>
                              )}
                            </button>
                          );
                        })
                      )}
                    </div>
                  </PopoverContent>
                </Popover>

                {/* Tarjeta Visual de Caja Seleccionada (UX/UI Feedback) */}
                {selectedCaja && (
                  <div className="p-2.5 rounded-xl border border-indigo-500/20 bg-indigo-500/5 dark:bg-indigo-950/20 flex items-center justify-between gap-2 text-xs animate-in fade-in-50 duration-200">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="size-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Store className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-foreground truncate">
                            {selectedCaja.nombre}
                          </span>
                          {selectedCaja.codigo && (
                            <Badge
                              variant="outline"
                              className="px-1.5 py-0 text-[10px] font-mono border-indigo-500/30 text-indigo-700 dark:text-indigo-300 font-bold"
                            >
                              {selectedCaja.codigo}
                            </Badge>
                          )}
                        </div>
                        <p className="text-[10.5px] text-muted-foreground truncate">
                          {selectedCaja.descripcion || "Caja habilitada para recepción de pagos"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 text-emerald-600 dark:text-emerald-400 font-medium text-[11px]">
                      <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Activa</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Motivo u observación opcional */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">
              Nota u Observación <span className="text-muted-foreground font-normal">(Opcional)</span>
            </Label>
            <Textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Instrucciones para el cajero o detalles adicionales para el cobro..."
              rows={2}
              className="text-xs bg-background resize-none rounded-xl border-border/80 focus:border-indigo-500"
            />
          </div>

          {/* Banner Informativo UX */}
          <div className="p-3 bg-muted/40 rounded-xl border border-border/60 text-[11px] text-muted-foreground flex items-start gap-2.5">
            <CreditCard className="size-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5 leading-relaxed">
              <span className="font-medium text-foreground">Efecto de la acción:</span>
              <p>
                La venta cambiará a <strong>"Pendiente de Cobro"</strong> y se generará una orden de cobranza visible de inmediato en la caja seleccionada.
              </p>
            </div>
          </div>

          <DialogFooter className="pt-2 gap-2 border-t border-border/50">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="h-8.5 text-xs rounded-xl cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isLoading || !selectedCajaId || cajas.length === 0}
              className="h-8.5 text-xs font-semibold gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl cursor-pointer shadow-md shadow-indigo-500/20 transition-all hover:scale-[1.01]"
            >
              {isLoading ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Send className="size-3.5" />
              )}
              Enviar a Caja
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
