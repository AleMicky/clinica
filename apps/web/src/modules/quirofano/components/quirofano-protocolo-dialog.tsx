"use client";

import * as React from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { toast } from "sonner";
import {
  FileSpreadsheet,
  CheckCircle2,
  Plus,
  Trash2,
  Package,
  Layers,
  Scissors,
  Loader2,
  Check,
  AlertTriangle,
  Clock,
  ShieldCheck,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

import {
  useFinalizarCirugia,
  useRegistrarGastosMaterialesCirugia,
  useMaterialesQuirofanoStock,
} from "../hooks/use-quirofano";
import { MaterialQuirofanoAutocomplete } from "./material-quirofano-autocomplete";
import type {
  CirugiaResponse,
  FinalizarCirugiaRequest,
  MaterialQuirofanoStockResponse,
} from "../types/quirofano.types";

interface QuirofanoProtocoloDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly cirugia: CirugiaResponse | null;
  readonly isFinalizeMode?: boolean;
  readonly onSuccessCallback?: () => void;
}

interface FormValues {
  diagnosticoPostOperatorio?: string;
  observaciones?: string;
  gastos: {
    productoId: number;
    partidaInventarioId?: number;
    cantidad: number;
    precioUnitario: number;
    momentoQuirurgico?: string;
    observaciones?: string;
  }[];
}

export function QuirofanoProtocoloDialog({
  open,
  onOpenChange,
  cirugia,
  isFinalizeMode = false,
  onSuccessCallback,
}: QuirofanoProtocoloDialogProps) {
  const { data: materialesStock = [], isLoading: loadingMateriales } =
    useMaterialesQuirofanoStock(cirugia?.almacenId);

  const registrarGastosMutation = useRegistrarGastosMaterialesCirugia();
  const finalizarMutation = useFinalizarCirugia();

  const { register, handleSubmit, control, setValue, reset, watch } =
    useForm<FormValues>({
      defaultValues: {
        diagnosticoPostOperatorio: "",
        observaciones: "",
        gastos: [],
      },
    });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "gastos",
  });

  const watchedGastos = watch("gastos") || [];

  React.useEffect(() => {
    if (open && cirugia) {
      reset({
        diagnosticoPostOperatorio:
          cirugia.diagnosticoPostOperatorio ||
          cirugia.diagnosticoPreOperatorio ||
          "",
        observaciones: "",
        gastos: [],
      });
    }
  }, [open, cirugia, reset]);

  const handleAddMaterial = (mat: MaterialQuirofanoStockResponse) => {
    const lot = mat.lotes[0];
    append({
      productoId: mat.productoId,
      partidaInventarioId: lot?.partidaInventarioId,
      cantidad: 1,
      precioUnitario: mat.precioReferencial,
      momentoQuirurgico: "Tiempo Quirúrgico",
      observaciones: "",
    });
  };

  const onSubmit = async (values: FormValues) => {
    if (!cirugia) return;

    const validGastos = values.gastos
      .filter((g) => g.productoId > 0 && g.cantidad > 0)
      .map((g) => ({
        productoId: Number(g.productoId),
        partidaInventarioId: g.partidaInventarioId
          ? Number(g.partidaInventarioId)
          : undefined,
        cantidad: Number(g.cantidad),
        precioUnitario: Number(g.precioUnitario),
        momentoQuirurgico: g.momentoQuirurgico?.trim(),
        observaciones: g.observaciones?.trim(),
      }));

    try {
      if (isFinalizeMode) {
        const payload: FinalizarCirugiaRequest = {
          fechaFin: new Date().toISOString(),
          diagnosticoPostOperatorio: values.diagnosticoPostOperatorio?.trim(),
          observaciones: values.observaciones?.trim(),
          gastosFinales: validGastos.length > 0 ? validGastos : undefined,
        };

        await finalizarMutation.mutateAsync({
          id: cirugia.id,
          data: payload,
        });

        toast.success(
          `Cirugía "${cirugia.numero}" finalizada exitosamente. Inventario de Quirófano (ALM-QUI) descontado.`
        );
      } else {
        if (validGastos.length === 0) {
          toast.error("Debe agregar al menos un material a la hoja de gasto.");
          return;
        }

        await registrarGastosMutation.mutateAsync({
          id: cirugia.id,
          data: { gastos: validGastos },
        });

        toast.success(
          `Insumos registrados en la hoja de gasto de la cirugía "${cirugia.numero}".`
        );
      }

      onSuccessCallback?.();
      onOpenChange(false);
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        error?.message ||
        "Error al procesar el protocolo quirúrgico.";
      toast.error(errorMsg);
    }
  };

  const isSaving =
    registrarGastosMutation.isPending || finalizarMutation.isPending;

  if (!cirugia) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl lg:max-w-4xl max-h-[92vh] flex flex-col p-4 overflow-hidden gap-0">
        <DialogHeader className="pb-2.5 border-b border-border/40 shrink-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-lg flex items-center justify-center shrink-0 border shadow-2xs bg-cyan-500/10 border-cyan-500/25 text-cyan-600 dark:text-cyan-400">
                {isFinalizeMode ? (
                  <CheckCircle2 className="size-4" />
                ) : (
                  <FileSpreadsheet className="size-4" />
                )}
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground">
                  {isFinalizeMode
                    ? `Cierre y Finalización de Cirugía — ${cirugia.numero}`
                    : `Hoja de Gasto de Materiales — ${cirugia.numero}`}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground pt-0.5">
                  {cirugia.procedimientoQuirurgico} • Paciente:{" "}
                  <strong>{cirugia.pacienteNombreCompleto}</strong> (HC:{" "}
                  {cirugia.pacienteHistoriaClinica})
                </DialogDescription>
              </div>
            </div>

            <Badge
              variant="outline"
              className="text-[10px] h-5 px-2 font-mono font-semibold text-cyan-700 dark:text-cyan-300 border-cyan-500/30 bg-cyan-500/10"
            >
              {cirugia.salaOperaciones}
            </Badge>
          </div>
        </DialogHeader>

        <form
          id="protocolo-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 overflow-y-auto py-2.5 space-y-3 pr-0.5 text-xs"
        >
          {isFinalizeMode && (
            <div className="p-2.5 rounded-lg bg-card border border-border/70 space-y-2 shadow-2xs">
              <span className="font-semibold text-foreground text-[11px] uppercase tracking-wider flex items-center gap-1">
                <Layers className="size-3 text-cyan-600" />
                Diagnóstico de Cierre y Hallazgos
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="space-y-0.5">
                  <Label
                    htmlFor="diagnosticoPostOperatorio"
                    className="text-[11px] font-medium"
                  >
                    Diagnóstico Post-Operatorio Definitivo
                  </Label>
                  <Input
                    id="diagnosticoPostOperatorio"
                    {...register("diagnosticoPostOperatorio")}
                    placeholder="Ej. Apendicitis flegmonosa sin perforación..."
                    className="h-7 text-xs bg-background/50 shadow-2xs font-medium"
                  />
                </div>

                <div className="space-y-0.5">
                  <Label
                    htmlFor="observaciones"
                    className="text-[11px] font-medium"
                  >
                    Hallazgos Quirúrgicos / Complicaciones
                  </Label>
                  <Input
                    id="observaciones"
                    {...register("observaciones")}
                    placeholder="Ej. Procedimiento sin complicaciones, sangrado estimado 50cc..."
                    className="h-7 text-xs bg-background/50 shadow-2xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Previous registered materials */}
          {cirugia.gastosMateriales.length > 0 && (
            <div className="p-2.5 rounded-lg bg-muted/20 border border-border/60 space-y-2">
              <span className="font-semibold text-foreground text-[11px] uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Package className="size-3 text-muted-foreground" />
                  Materiales ya Registrados Previamente ({cirugia.gastosMateriales.length})
                </span>
                <span className="font-mono text-cyan-600 dark:text-cyan-400 font-bold">
                  Total: Bs. {cirugia.totalPrecioMateriales.toFixed(2)}
                </span>
              </span>

              <div className="rounded-md border border-border/60 overflow-hidden bg-card text-xs">
                <table className="w-full text-left">
                  <thead className="bg-muted/40 text-[10px] text-muted-foreground uppercase font-semibold border-b border-border/50">
                    <tr>
                      <th className="px-2 py-1">Código</th>
                      <th className="px-2 py-1">Material</th>
                      <th className="px-2 py-1">Momento</th>
                      <th className="px-2 py-1 text-center">Cant.</th>
                      <th className="px-2 py-1 text-right">P. Unit.</th>
                      <th className="px-2 py-1 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {cirugia.gastosMateriales.map((g) => (
                      <tr key={g.id}>
                        <td className="px-2 py-1 font-mono text-[10px] text-muted-foreground">
                          {g.productoCodigo}
                        </td>
                        <td className="px-2 py-1 font-medium">{g.productoNombre}</td>
                        <td className="px-2 py-1 text-[10px] text-muted-foreground">
                          {g.momentoQuirurgico || "—"}
                        </td>
                        <td className="px-2 py-1 text-center font-mono font-semibold">
                          {g.cantidad}
                        </td>
                        <td className="px-2 py-1 text-right font-mono text-muted-foreground">
                          Bs. {g.precioUnitario.toFixed(2)}
                        </td>
                        <td className="px-2 py-1 text-right font-mono font-bold text-foreground">
                          Bs. {g.subtotal.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* New materials to add */}
          <div className="p-2.5 rounded-lg bg-card border border-border/70 space-y-2 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground text-[11px] uppercase tracking-wider flex items-center gap-1">
                <Scissors className="size-3 text-cyan-600" />
                {isFinalizeMode
                  ? "Materiales e Insumos Consumidos Adicionales al Cierre"
                  : "Agregar Nuevos Insumos a la Hoja de Gasto"}
              </span>

              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() =>
                  append({
                    productoId: 0,
                    cantidad: 1,
                    precioUnitario: 0,
                    momentoQuirurgico: "Tiempo Principal",
                  })
                }
                className="h-6 text-[11px] px-2 gap-1 text-cyan-600 border-cyan-500/30 hover:bg-cyan-500/5 cursor-pointer shadow-2xs font-medium"
              >
                <Plus className="size-3" />
                <span>Agregar Insumo</span>
              </Button>
            </div>

            {fields.length === 0 ? (
              <div className="text-center py-4 text-xs text-muted-foreground border border-dashed border-border/60 rounded-md">
                No hay insumos adicionales pendientes de registrar.
              </div>
            ) : (
              <div className="rounded-md border border-border/70 overflow-hidden bg-card">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-muted/50 border-b border-border/60 text-[10px] uppercase font-semibold text-muted-foreground">
                    <tr>
                      <th className="px-2 py-1 min-w-56">Insumo Quirúrgico</th>
                      <th className="px-2 py-1 w-28">Momento</th>
                      <th className="px-2 py-1 w-20 text-center">Cantidad</th>
                      <th className="px-2 py-1 w-24 text-right">Precio (Bs.)</th>
                      <th className="px-1 py-1 w-10 text-center">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {fields.map((field, idx) => {
                      return (
                        <tr key={field.id}>
                          <td className="px-2 py-1">
                            <Controller
                              name={`gastos.${idx}.productoId`}
                              control={control}
                              render={({ field }) => (
                                <MaterialQuirofanoAutocomplete
                                  value={field.value}
                                  onValueChange={(val, mat) => {
                                    field.onChange(val || 0);
                                    if (mat) {
                                      setValue(
                                        `gastos.${idx}.precioUnitario`,
                                        mat.precioReferencial
                                      );
                                      setValue(
                                        `gastos.${idx}.partidaInventarioId`,
                                        mat.lotes[0]?.partidaInventarioId
                                      );
                                    }
                                  }}
                                  placeholder="Buscar insumo..."
                                  className="h-6.5 text-xs"
                                />
                              )}
                            />
                          </td>

                          <td className="px-2 py-1">
                            <select
                              {...register(`gastos.${idx}.momentoQuirurgico`)}
                              className="w-full h-6.5 text-[11px] px-1 rounded-md border border-border/60 bg-background shadow-2xs"
                            >
                              <option value="Pre-anestesia">Pre-anestesia</option>
                              <option value="Tiempo Principal">Tiempo Principal</option>
                              <option value="Sutura y Cierre">Sutura y Cierre</option>
                              <option value="Recuperación">Recuperación</option>
                            </select>
                          </td>

                          <td className="px-2 py-1">
                            <Input
                              type="number"
                              min="1"
                              step="any"
                              {...register(`gastos.${idx}.cantidad`, {
                                valueAsNumber: true,
                              })}
                              className="h-6.5 text-xs font-mono text-center shadow-2xs font-semibold"
                            />
                          </td>

                          <td className="px-2 py-1 text-right">
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              {...register(`gastos.${idx}.precioUnitario`, {
                                valueAsNumber: true,
                              })}
                              className="h-6.5 text-xs font-mono text-right shadow-2xs font-semibold"
                            />
                          </td>

                          <td className="px-1 py-1 text-center">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => remove(idx)}
                              className="size-6 text-muted-foreground hover:text-destructive cursor-pointer rounded"
                            >
                              <Trash2 className="size-3" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </form>

        <DialogFooter className="pt-2 border-t border-border/40 shrink-0 flex flex-row items-center justify-between gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
            className="h-7.5 px-3 text-xs cursor-pointer"
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            form="protocolo-form"
            size="sm"
            disabled={isSaving}
            className={`h-7.5 px-3.5 text-xs text-white font-medium gap-1.5 cursor-pointer shadow-2xs ${
              isFinalizeMode
                ? "bg-emerald-600 hover:bg-emerald-700"
                : "bg-cyan-600 hover:bg-cyan-700"
            }`}
          >
            {isSaving ? (
              <>
                <Loader2 className="size-3 animate-spin" />
                <span>Procesando...</span>
              </>
            ) : isFinalizeMode ? (
              <>
                <Check className="size-3" />
                <span>Confirmar Cierre y Descontar Almacén</span>
              </>
            ) : (
              <>
                <Check className="size-3" />
                <span>Guardar Insumos en Hoja de Gasto</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
