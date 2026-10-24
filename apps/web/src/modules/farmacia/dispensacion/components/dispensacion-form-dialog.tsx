"use client";

import * as React from "react";
import {
  useForm,
  useFieldArray,
  Controller,
  useWatch,
  type Control,
} from "react-hook-form";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api/api-error";
import {
  Pill,
  Plus,
  Trash2,
  Copy,
  Package,
  Warehouse,
  Loader2,
  AlertTriangle,
  Layers,
  FileText,
  Clock,
  Check,
  Hash,
  User,
  Stethoscope,
  ShoppingBag,
  ShieldCheck,
  Printer,
  Lock,
  Unlock,
  Sparkles,
  Search,
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
import { Autocomplete, type AutocompleteOption } from "@/components/ui/autocomplete";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn, formatDate } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";

import {
  useCreateDispensacion,
  useMedicamentosStock,
} from "../hooks/use-dispensacion";
import {
  MedicamentoAutocomplete,
  getMedicineBrand,
} from "./medicamento-autocomplete";
import { useAlmacenes } from "@/modules/almacenes/almacen/hooks/use-almacen";
import { usePacientes } from "@/modules/recepcion/pacientes/hooks/use-pacientes";
import { useMedicos } from "@/modules/recursos-humanos/medico";
import type {
  CreateDispensacionRequest,
  TipoDispensacion,
  MedicamentoStockResponse,
} from "../types/dispensacion.types";

interface DispensacionFormDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onSuccessCallback?: () => void;
}

interface FormDetalle {
  productoId: number;
  partidaInventarioId?: number;
  cantidad: number;
  precioUnitario: number;
  descuento: number;
  descuentoTipo?: "monto" | "porcentaje";
  indicaciones?: string;
}

interface FormValues {
  tipo: TipoDispensacion;
  almacenId: number;
  isWalkIn: boolean;
  pacienteId?: number;
  clienteNombre?: string;
  clienteDocumento?: string;
  medicoId?: number;
  observaciones?: string;
  detalles: FormDetalle[];
}

/** Problemas detectados en una fila. Cualquier mensaje presente bloquea la emisión. */
interface RowIssues {
  producto?: string;
  cantidad?: string;
  lote?: string;
  descuento?: string;
}

function hasIssues(issues?: RowIssues): boolean {
  return Boolean(
    issues &&
      (issues.producto ||
        issues.cantidad ||
        issues.lote ||
        issues.descuento)
  );
}

function formatBs(value: number): string {
  return (Number(value) || 0).toLocaleString("es-ES", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function getRowDescuentoMonto(d?: FormDetalle): number {
  if (!d) return 0;
  const cant = Number(d.cantidad) || 0;
  const precio = Number(d.precioUnitario) || 0;
  const desc = Number(d.descuento) || 0;
  if (d.descuentoTipo === "porcentaje") {
    return Math.max(0, (cant * precio * desc) / 100);
  }
  return Math.max(0, desc);
}

function getRowSubtotal(d?: FormDetalle): number {
  if (!d) return 0;
  const cant = Number(d.cantidad) || 0;
  const precio = Number(d.precioUnitario) || 0;
  const descMonto = getRowDescuentoMonto(d);
  return Math.max(0, cant * precio - descMonto);
}

/** Evita que la rueda del mouse cambie el valor de un input numérico al hacer scroll. */
const blurOnWheel = (e: React.WheelEvent<HTMLInputElement>) => e.currentTarget.blur();

function IssueText({ children }: { readonly children?: string }) {
  if (!children) return null;
  return (
    <p className="mt-0.5 text-[10px] leading-tight font-medium text-destructive">
      {children}
    </p>
  );
}

/** Imprime un ticket térmico con formato optimizado para 80mm */
function printTicketDispensacion(data: {
  numero: string;
  fecha: string;
  tipo: string;
  almacenNombre?: string;
  clienteNombre: string;
  clienteDocumento?: string;
  medicoNombre?: string;
  detalles: Array<{
    nombre: string;
    cantidad: number;
    precioUnitario: number;
    descuento: number;
    subtotal: number;
    lote?: string;
  }>;
  total: number;
  totalDescuento: number;
}) {
  const printWindow = window.open("", "_blank", "width=380,height=600");
  if (!printWindow) return;

  const html = `
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="utf-8">
        <title>Ticket Dispensación - ${data.numero}</title>
        <style>
          @page { margin: 3mm; size: 80mm auto; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Courier New", monospace;
            font-size: 11px;
            line-height: 1.3;
            margin: 0;
            padding: 8px;
            color: #000;
          }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .bold { font-weight: bold; }
          .divider { border-top: 1px dashed #444; margin: 6px 0; }
          table { width: 100%; border-collapse: collapse; font-size: 10px; margin-top: 4px; }
          th { text-align: left; border-bottom: 1px dashed #444; padding: 2px 0; font-size: 9px; }
          td { padding: 3px 0; vertical-align: top; }
          .footer-note { font-size: 9px; margin-top: 10px; text-align: center; color: #333; }
        </style>
      </head>
      <body>
        <div class="text-center bold" style="font-size: 13px;">CLÍNICA ALEMANA</div>
        <div class="text-center">FARMACIA INSTITUCIONAL</div>
        <div class="text-center" style="font-size: 10px;">${data.almacenNombre ?? "Almacén Central"}</div>
        <div class="divider"></div>
        <div><strong>ORDEN DISPENSACIÓN:</strong> ${data.numero}</div>
        <div><strong>FECHA:</strong> ${data.fecha}</div>
        <div><strong>MODALIDAD:</strong> ${data.tipo}</div>
        <div><strong>PACIENTE/CLI.:</strong> ${data.clienteNombre}</div>
        ${data.clienteDocumento ? `<div><strong>DOC/HC:</strong> ${data.clienteDocumento}</div>` : ""}
        ${data.medicoNombre ? `<div><strong>MÉDICO:</strong> ${data.medicoNombre}</div>` : ""}
        <div class="divider"></div>
        <table>
          <thead>
            <tr>
              <th style="width: 45%;">ÍTEM / LOTE</th>
              <th style="width: 15%; text-align: center;">CANT</th>
              <th style="width: 20%; text-align: right;">P.U.</th>
              <th style="width: 20%; text-align: right;">SUBTOTAL</th>
            </tr>
          </thead>
          <tbody>
            ${data.detalles
              .map(
                (d) => `
              <tr>
                <td>
                  <div class="bold">${d.nombre}</div>
                  ${d.lote ? `<div style="font-size: 8px; color: #555;">Lote: ${d.lote}</div>` : ""}
                </td>
                <td style="text-align: center;">${d.cantidad}</td>
                <td style="text-align: right;">${d.precioUnitario.toFixed(2)}</td>
                <td style="text-align: right;">${d.subtotal.toFixed(2)}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
        <div class="divider"></div>
        ${
          data.totalDescuento > 0
            ? `<div class="text-right">DESCUENTO TOTAL: -Bs. ${data.totalDescuento.toFixed(2)}</div>`
            : ""
        }
        <div class="text-right bold" style="font-size: 13px;">TOTAL A PAGAR: Bs. ${data.total.toFixed(2)}</div>
        <div class="divider"></div>
        <div class="footer-note">
          <strong>PASE POR CAJA PARA PAGO Y DESPACHO</strong><br/>
          Ticket de control interno de dispensación farmacéutica.<br/>
          ¡Muchas gracias por su atención!
        </div>
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 600);
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}

interface DetalleRowProps {
  readonly index: number;
  readonly control: Control<FormValues>;
  readonly register: ReturnType<typeof useForm<FormValues>>["register"];
  readonly setValue: ReturnType<typeof useForm<FormValues>>["setValue"];
  readonly onRemove: () => void;
  readonly onDuplicate: () => void;
  readonly onSplitLots: () => void;
  readonly canRemove: boolean;
  readonly isDuplicate: boolean;
  readonly isHighlighted: boolean;
  readonly issues?: RowIssues;
  readonly showRequiredErrors: boolean;
  readonly almacenId: number;
  readonly stockMedicamentos: MedicamentoStockResponse[];
  readonly canEditPriceRole: boolean;
  readonly isPriceUnlocked: boolean;
  readonly onTogglePriceUnlock: () => void;
}

function DetalleRow({
  index,
  almacenId,
  control,
  register,
  setValue,
  onRemove,
  onDuplicate,
  onSplitLots,
  canRemove,
  isDuplicate,
  isHighlighted,
  issues,
  showRequiredErrors,
  stockMedicamentos,
  canEditPriceRole,
  isPriceUnlocked,
  onTogglePriceUnlock,
}: DetalleRowProps) {
  const detalle = useWatch({
    control,
    name: `detalles.${index}`,
  });

  const currentProductoId = Number(detalle?.productoId) || 0;
  const cantidad = Number(detalle?.cantidad) || 0;
  const precioUnitario = Number(detalle?.precioUnitario) || 0;
  const descuento = Number(detalle?.descuento) || 0;
  const descuentoTipo = detalle?.descuentoTipo || "monto";
  const descMonto = getRowDescuentoMonto(detalle);
  const subtotal = getRowSubtotal(detalle);

  // Medicamento metadata
  const selectedMed = React.useMemo(() => {
    return stockMedicamentos.find((m) => m.productoId === currentProductoId) ?? null;
  }, [stockMedicamentos, currentProductoId]);

  const lotes = selectedMed?.lotes ?? [];
  const stockDisponible = selectedMed?.stockDisponible ?? 0;

  // "Requerido" se muestra tras intentar emitir; stock/lote/descuento se muestran siempre que aplique
  const productoError = showRequiredErrors ? issues?.producto : undefined;
  const cantidadError =
    issues?.cantidad && (showRequiredErrors || currentProductoId > 0) ? issues.cantidad : undefined;
  const loteError = issues?.lote;
  const descuentoError = issues?.descuento;
  const hasVisibleError = Boolean(productoError || cantidadError || loteError || descuentoError);

  const handleMedicineChange = (med: MedicamentoStockResponse | null) => {
    if (!med) {
      setValue(`detalles.${index}.productoId`, 0);
      setValue(`detalles.${index}.partidaInventarioId`, undefined);
      setValue(`detalles.${index}.precioUnitario`, 0);
      setValue(`detalles.${index}.descuento`, 0);
      return;
    }

    setValue(`detalles.${index}.productoId`, med.productoId);
    setValue(`detalles.${index}.precioUnitario`, med.precioReferencial);
    setValue(`detalles.${index}.descuento`, 0);

    // Pick first available lot
    const lot = med.lotes[0];
    setValue(`detalles.${index}.partidaInventarioId`, lot?.partidaInventarioId);
  };

  return (
    <tr
      id={`detalle-row-${index}`}
      className={cn(
        "group align-top hover:bg-muted/30 transition-colors border-b border-border/40 last:border-0",
        isDuplicate && "bg-amber-500/5 hover:bg-amber-500/10",
        hasVisibleError && "bg-destructive/5 hover:bg-destructive/10",
        isHighlighted && "bg-teal-500/15 ring-1 ring-teal-500/30"
      )}
    >
      {/* Index */}
      <td className="px-2 py-1.5 text-center text-muted-foreground font-mono text-[11px] w-9">
        <span
          className={cn(
            "size-5 rounded inline-flex items-center justify-center bg-muted/70 text-[10px] font-semibold text-foreground/80",
            hasVisibleError && "bg-destructive/15 text-destructive"
          )}
        >
          {index + 1}
        </span>
      </td>

      {/* Producto Selector con Autocomplete */}
      <td className="px-2 py-1.5 min-w-64">
        <div className="space-y-0.5">
          <Controller
            name={`detalles.${index}.productoId`}
            control={control}
            render={({ field, fieldState }) => (
              <MedicamentoAutocomplete
                id={`detalle-med-${index}`}
                almacenId={almacenId}
                value={field.value}
                onValueChange={(val, med) => {
                  field.onChange(val || 0);
                  handleMedicineChange(med ?? null);
                }}
                error={Boolean(fieldState.error) || Boolean(productoError)}
                placeholder="Buscar por código, nombre..."
                className="h-7 text-xs"
              />
            )}
          />
          <IssueText>{productoError}</IssueText>

          {/* Badges metadata */}
          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
            {selectedMed?.codigo && (
              <span className="font-mono text-[9px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground font-medium">
                {selectedMed.codigo}
              </span>
            )}
            {selectedMed && (
              <span className="font-mono text-[9px] bg-teal-500/10 text-teal-700 dark:text-teal-300 px-1.5 py-0.5 rounded font-semibold">
                Marca: {getMedicineBrand(selectedMed)}
              </span>
            )}
            {selectedMed?.unidadMedida && (
              <span className="font-mono text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-semibold">
                {selectedMed.unidadMedida}
              </span>
            )}
            {isDuplicate && (
              <span className="inline-flex items-center gap-0.5 text-[9px] text-amber-600 dark:text-amber-400 font-semibold bg-amber-500/10 px-1.5 py-0.5 rounded">
                <AlertTriangle className="size-2.5 shrink-0" />
                Duplicado
              </span>
            )}
          </div>
        </div>
      </td>

      {/* Lote / Vencimiento */}
      <td className="px-2 py-1.5 min-w-44">
        {lotes.length > 0 ? (
          <>
            <select
              {...register(`detalles.${index}.partidaInventarioId`, {
                setValueAs: (v) => (v === "" || v === null ? undefined : Number(v)),
              })}
              className={cn(
                "w-full h-7 text-[11px] px-2 rounded-md border border-border/60 bg-background font-mono shadow-2xs",
                loteError && "border-destructive text-destructive font-medium"
              )}
            >
              {lotes.map((lt) => (
                <option key={lt.partidaInventarioId} value={lt.partidaInventarioId}>
                  {lt.lote || "LOTE-S/N"} {lt.fechaVencimiento ? `(Vcto: ${formatDate(lt.fechaVencimiento)})` : ""} [Disp: {lt.cantidadDisponible}]
                </option>
              ))}
            </select>
            {loteError && (
              <div className="mt-0.5 flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] leading-tight font-medium text-destructive">{loteError}</span>
                {lotes.length > 1 && (
                  <button
                    type="button"
                    onClick={onSplitLots}
                    className="text-[10px] font-semibold text-teal-700 dark:text-teal-300 underline underline-offset-2 hover:text-teal-600 cursor-pointer"
                  >
                    Repartir en lotes (FEFO)
                  </button>
                )}
              </div>
            )}
          </>
        ) : (
          <span className="text-[10px] text-muted-foreground italic">
            {currentProductoId ? "Sin lotes reg." : "—"}
          </span>
        )}
      </td>

      {/* Stock Disponible */}
      <td className="px-2 py-1.5 w-20 text-center">
        <Badge
          variant="outline"
          className={cn(
            "font-mono text-[10px] px-1.5 py-0.5 font-semibold tabular-nums border",
            stockDisponible > 10
              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
              : stockDisponible > 0
                ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30"
                : "bg-destructive/10 text-destructive border-destructive/30 font-bold"
          )}
        >
          {stockDisponible}
        </Badge>
      </td>

      {/* Cantidad */}
      <td className="px-2 py-1.5 w-24">
        <Input
          type="number"
          step="any"
          min="1"
          onWheel={blurOnWheel}
          {...register(`detalles.${index}.cantidad`, {
            valueAsNumber: true,
          })}
          placeholder="1"
          aria-invalid={Boolean(cantidadError)}
          className={cn(
            "h-7 text-xs font-mono text-center font-semibold px-1 shadow-2xs",
            cantidadError && "border-destructive text-destructive font-bold focus-visible:ring-destructive"
          )}
        />
        <IssueText>{cantidadError}</IssueText>
      </td>

      {/* Precio Unitario (Bloqueado por defecto / rol) */}
      <td className="px-2 py-1.5 w-28">
        <div className="relative flex items-center">
          <span className="absolute left-2 text-[10px] text-muted-foreground font-medium pointer-events-none select-none">
            Bs.
          </span>
          <Input
            type="number"
            step="0.01"
            min="0"
            disabled={!isPriceUnlocked}
            onWheel={blurOnWheel}
            {...register(`detalles.${index}.precioUnitario`, {
              setValueAs: (v) => (v === "" || v === null ? 0 : Number(v)),
            })}
            placeholder="0.00"
            className={cn(
              "h-7 text-xs font-mono text-right pl-7 pr-6 shadow-2xs font-medium",
              !isPriceUnlocked && "bg-muted/50 text-foreground cursor-not-allowed opacity-90"
            )}
          />
          <button
            type="button"
            onClick={onTogglePriceUnlock}
            title={
              isPriceUnlocked
                ? "Bloquear precio referencial"
                : canEditPriceRole
                  ? "Desbloquear para modificar precio unitario"
                  : "Solo administradores o jefes de farmacia pueden editar precios"
            }
            className={cn(
              "absolute right-1 p-0.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer rounded",
              isPriceUnlocked ? "text-teal-600 dark:text-teal-400 font-bold" : "text-muted-foreground/60"
            )}
          >
            {isPriceUnlocked ? <Unlock className="size-3" /> : <Lock className="size-3" />}
          </button>
        </div>
      </td>

      {/* Descuento con selector % / Bs. */}
      <td className="px-2 py-1.5 w-32">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1">
            <div className="relative flex-1 flex items-center">
              <span className="absolute left-1.5 text-[10px] text-muted-foreground font-medium pointer-events-none select-none">
                {descuentoTipo === "porcentaje" ? "%" : "Bs."}
              </span>
              <Input
                type="number"
                step={descuentoTipo === "porcentaje" ? "1" : "0.01"}
                min="0"
                max={descuentoTipo === "porcentaje" ? 100 : undefined}
                onWheel={blurOnWheel}
                {...register(`detalles.${index}.descuento`, {
                  setValueAs: (v) => (v === "" || v === null ? 0 : Number(v)),
                })}
                placeholder="0"
                aria-invalid={Boolean(descuentoError)}
                className={cn(
                  "h-7 text-xs font-mono text-right pl-6 pr-1.5 shadow-2xs",
                  descuentoError && "border-destructive text-destructive focus-visible:ring-destructive font-bold"
                )}
              />
            </div>
            <button
              type="button"
              onClick={() => {
                const next = descuentoTipo === "porcentaje" ? "monto" : "porcentaje";
                setValue(`detalles.${index}.descuentoTipo`, next);
                setValue(`detalles.${index}.descuento`, 0);
              }}
              title={`Modo actual: ${descuentoTipo === "porcentaje" ? "Porcentaje (%)" : "Bolivianos (Bs.)"}. Clic para alternar.`}
              className="h-7 px-1.5 text-[10px] font-bold rounded border border-border/70 bg-muted/60 hover:bg-muted text-foreground transition-colors cursor-pointer shrink-0"
            >
              {descuentoTipo === "porcentaje" ? "%" : "Bs."}
            </button>
          </div>
          {descuentoTipo === "porcentaje" && descuento > 0 && (
            <p className="text-[9px] text-right text-muted-foreground font-mono">
              -Bs. {formatBs(descMonto)}
            </p>
          )}
          <IssueText>{descuentoError}</IssueText>
        </div>
      </td>

      {/* Subtotal */}
      <td className="px-2 py-1.5 w-28 text-right">
        <div className="h-7 flex items-center justify-end font-mono text-xs font-bold text-teal-600 dark:text-teal-400 tabular-nums whitespace-nowrap">
          Bs. {formatBs(subtotal)}
        </div>
      </td>

      {/* Acciones */}
      <td className="px-1.5 py-1.5 text-center w-16">
        <div className="flex items-center justify-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onDuplicate}
            title="Duplicar fila"
            className="size-6.5 text-muted-foreground hover:text-teal-600 hover:bg-teal-500/10 cursor-pointer transition-colors rounded"
          >
            <Copy className="size-3" />
            <span className="sr-only">Duplicar</span>
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onRemove}
            disabled={!canRemove}
            title={canRemove ? "Eliminar fila" : "Mínimo 1 fila requerida"}
            className="size-6.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded"
          >
            <Trash2 className="size-3" />
            <span className="sr-only">Eliminar</span>
          </Button>
        </div>
      </td>
    </tr>
  );
}

/** Tarjeta individual para vista móvil (smartphone / tablet vertical) */
function DetalleMobileCard({
  index,
  almacenId,
  control,
  register,
  setValue,
  onRemove,
  onDuplicate,
  onSplitLots,
  canRemove,
  isDuplicate,
  issues,
  showRequiredErrors,
  stockMedicamentos,
  canEditPriceRole,
  isPriceUnlocked,
  onTogglePriceUnlock,
}: DetalleRowProps) {
  const detalle = useWatch({
    control,
    name: `detalles.${index}`,
  });

  const currentProductoId = Number(detalle?.productoId) || 0;
  const cantidad = Number(detalle?.cantidad) || 0;
  const precioUnitario = Number(detalle?.precioUnitario) || 0;
  const descuento = Number(detalle?.descuento) || 0;
  const descuentoTipo = detalle?.descuentoTipo || "monto";
  const descMonto = getRowDescuentoMonto(detalle);
  const subtotal = getRowSubtotal(detalle);

  const selectedMed = React.useMemo(() => {
    return stockMedicamentos.find((m) => m.productoId === currentProductoId) ?? null;
  }, [stockMedicamentos, currentProductoId]);

  const lotes = selectedMed?.lotes ?? [];
  const stockDisponible = selectedMed?.stockDisponible ?? 0;

  const productoError = showRequiredErrors ? issues?.producto : undefined;
  const cantidadError =
    issues?.cantidad && (showRequiredErrors || currentProductoId > 0) ? issues.cantidad : undefined;
  const loteError = issues?.lote;
  const descuentoError = issues?.descuento;

  const handleMedicineChange = (med: MedicamentoStockResponse | null) => {
    if (!med) {
      setValue(`detalles.${index}.productoId`, 0);
      setValue(`detalles.${index}.partidaInventarioId`, undefined);
      setValue(`detalles.${index}.precioUnitario`, 0);
      setValue(`detalles.${index}.descuento`, 0);
      return;
    }

    setValue(`detalles.${index}.productoId`, med.productoId);
    setValue(`detalles.${index}.precioUnitario`, med.precioReferencial);
    setValue(`detalles.${index}.descuento`, 0);

    const lot = med.lotes[0];
    setValue(`detalles.${index}.partidaInventarioId`, lot?.partidaInventarioId);
  };

  return (
    <div
      className={cn(
        "p-3 rounded-lg border border-border/70 bg-card space-y-2.5 shadow-2xs transition-colors",
        isDuplicate && "border-amber-500/40 bg-amber-500/5",
        hasIssues(issues) && "border-destructive/40 bg-destructive/5"
      )}
    >
      <div className="flex items-center justify-between gap-2 border-b border-border/40 pb-2">
        <div className="flex items-center gap-1.5">
          <span className="size-5 rounded inline-flex items-center justify-center bg-muted text-[10px] font-bold text-foreground">
            #{index + 1}
          </span>
          <span className="font-semibold text-xs text-foreground">Medicamento / Insumo</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onDuplicate}
            className="size-6 text-muted-foreground hover:text-teal-600"
          >
            <Copy className="size-3" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onRemove}
            disabled={!canRemove}
            className="size-6 text-muted-foreground hover:text-destructive disabled:opacity-30"
          >
            <Trash2 className="size-3" />
          </Button>
        </div>
      </div>

      {/* Medicamento selector */}
      <div>
        <Controller
          name={`detalles.${index}.productoId`}
          control={control}
          render={({ field, fieldState }) => (
            <MedicamentoAutocomplete
              id={`detalle-med-mobile-${index}`}
              almacenId={almacenId}
              value={field.value}
              onValueChange={(val, med) => {
                field.onChange(val || 0);
                handleMedicineChange(med ?? null);
              }}
              error={Boolean(fieldState.error) || Boolean(productoError)}
              placeholder="Buscar medicamento o insumo..."
              className="h-8 text-xs"
            />
          )}
        />
        <IssueText>{productoError}</IssueText>

        <div className="flex items-center gap-1.5 flex-wrap pt-1">
          {selectedMed?.codigo && (
            <span className="font-mono text-[9px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
              {selectedMed.codigo}
            </span>
          )}
          {selectedMed && (
            <span className="font-mono text-[9px] bg-teal-500/10 text-teal-700 dark:text-teal-300 px-1.5 py-0.5 rounded font-semibold">
              Marca: {getMedicineBrand(selectedMed)}
            </span>
          )}
          <Badge
            variant="outline"
            className={cn(
              "font-mono text-[9px] px-1.5 py-0.5 font-semibold",
              stockDisponible > 0 ? "text-emerald-700 dark:text-emerald-300" : "text-destructive"
            )}
          >
            Stock: {stockDisponible}
          </Badge>
        </div>
      </div>

      {/* Lote */}
      {lotes.length > 0 && (
        <div className="space-y-1">
          <Label className="text-[10px] text-muted-foreground">Lote & Vencimiento</Label>
          <select
            {...register(`detalles.${index}.partidaInventarioId`, {
              setValueAs: (v) => (v === "" || v === null ? undefined : Number(v)),
            })}
            className={cn(
              "w-full h-7 text-[11px] px-2 rounded-md border border-border/60 bg-background font-mono",
              loteError && "border-destructive text-destructive font-medium"
            )}
          >
            {lotes.map((lt) => (
              <option key={lt.partidaInventarioId} value={lt.partidaInventarioId}>
                {lt.lote || "S/N"} {lt.fechaVencimiento ? `(${formatDate(lt.fechaVencimiento)})` : ""} [Disp: {lt.cantidadDisponible}]
              </option>
            ))}
          </select>
          {loteError && (
            <div className="flex items-center justify-between gap-1">
              <IssueText>{loteError}</IssueText>
              {lotes.length > 1 && (
                <button
                  type="button"
                  onClick={onSplitLots}
                  className="text-[10px] text-teal-700 dark:text-teal-300 underline font-semibold"
                >
                  Repartir FEFO
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Fila valores: Cantidad, P.U., Descuento */}
      <div className="grid grid-cols-3 gap-2">
        <div className="space-y-1">
          <Label className="text-[10px] text-muted-foreground">Cantidad *</Label>
          <Input
            type="number"
            step="any"
            min="1"
            onWheel={blurOnWheel}
            {...register(`detalles.${index}.cantidad`, { valueAsNumber: true })}
            className={cn("h-7.5 text-xs font-mono text-center font-bold", cantidadError && "border-destructive")}
          />
          <IssueText>{cantidadError}</IssueText>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Label className="text-[10px] text-muted-foreground">P. Unitario</Label>
            <button
              type="button"
              onClick={onTogglePriceUnlock}
              className="text-muted-foreground hover:text-foreground"
            >
              {isPriceUnlocked ? <Unlock className="size-2.5 text-teal-600" /> : <Lock className="size-2.5" />}
            </button>
          </div>
          <Input
            type="number"
            step="0.01"
            min="0"
            disabled={!isPriceUnlocked}
            onWheel={blurOnWheel}
            {...register(`detalles.${index}.precioUnitario`, {
              setValueAs: (v) => (v === "" || v === null ? 0 : Number(v)),
            })}
            className="h-7.5 text-xs font-mono text-right"
          />
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Label className="text-[10px] text-muted-foreground">Descuento</Label>
            <button
              type="button"
              onClick={() => {
                const next = descuentoTipo === "porcentaje" ? "monto" : "porcentaje";
                setValue(`detalles.${index}.descuentoTipo`, next);
                setValue(`detalles.${index}.descuento`, 0);
              }}
              className="text-[9px] font-bold text-teal-700 dark:text-teal-300 underline"
            >
              {descuentoTipo === "porcentaje" ? "%" : "Bs."}
            </button>
          </div>
          <Input
            type="number"
            step={descuentoTipo === "porcentaje" ? "1" : "0.01"}
            min="0"
            onWheel={blurOnWheel}
            {...register(`detalles.${index}.descuento`, {
              setValueAs: (v) => (v === "" || v === null ? 0 : Number(v)),
            })}
            className="h-7.5 text-xs font-mono text-right"
          />
          <IssueText>{descuentoError}</IssueText>
        </div>
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-border/30 text-xs">
        <span className="text-muted-foreground font-medium">Subtotal:</span>
        <span className="font-mono font-bold text-teal-600 dark:text-teal-400">
          Bs. {formatBs(subtotal)}
        </span>
      </div>
    </div>
  );
}

export function DispensacionFormDialog({
  open,
  onOpenChange,
  onSuccessCallback,
}: DispensacionFormDialogProps) {
  const { hasAnyRole } = useAuth();
  const canEditPriceRole = hasAnyRole(["admin", "administrador", "farmaceutico_jefe", "supervisor", "gerente"]);

  const { data: almacenesData } = useAlmacenes({ pageSize: 50 });
  const almacenes = almacenesData?.items ?? [];

  // Default to Farmacia Central if exists
  const defaultAlmacenId = React.useMemo(() => {
    const farm = almacenes.find((a) => a.codigo === "ALM-FARM");
    return farm?.id || (almacenes[0]?.id ?? 0);
  }, [almacenes]);

  // Server-side search with debounce for Pacientes
  const [pacienteSearch, setPacienteSearch] = React.useState("");
  const [debouncedPacienteSearch, setDebouncedPacienteSearch] = React.useState("");

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedPacienteSearch(pacienteSearch.trim());
    }, 250);
    return () => clearTimeout(timer);
  }, [pacienteSearch]);

  const { data: pacientesData, isLoading: loadingPacientes } = usePacientes({
    search: debouncedPacienteSearch || undefined,
    pageSize: 50,
  });

  // Server-side search with debounce for Médicos
  const [medicoSearch, setMedicoSearch] = React.useState("");
  const [debouncedMedicoSearch, setDebouncedMedicoSearch] = React.useState("");

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedMedicoSearch(medicoSearch.trim());
    }, 250);
    return () => clearTimeout(timer);
  }, [medicoSearch]);

  const { data: medicosData, isLoading: loadingMedicos } = useMedicos({
    search: debouncedMedicoSearch || undefined,
    pageSize: 50,
  });

  // Opciones memorizadas para los autocompletes
  const almacenOptions = React.useMemo<AutocompleteOption[]>(
    () =>
      almacenes.map((alm) => ({
        value: String(alm.id),
        label: `${alm.nombre} (${alm.codigo})`,
      })),
    [almacenes]
  );

  const pacienteOptions = React.useMemo<AutocompleteOption[]>(
    () =>
      (pacientesData?.items ?? []).map((p) => ({
        value: String(p.id),
        label: `${p.persona.nombres} ${p.persona.apellidoPaterno}`,
        description: `C.I. ${p.persona.numeroDocumento} · HC ${p.numeroHistoriaClinica}`,
      })),
    [pacientesData]
  );

  const medicoOptions = React.useMemo<AutocompleteOption[]>(
    () =>
      (medicosData?.items ?? []).map((m) => ({
        value: String(m.id),
        label: `Dr(a). ${m.empleado?.persona?.nombres ?? ""} ${m.empleado?.persona?.apellidoPaterno ?? ""}`.trim(),
      })),
    [medicosData]
  );

  const createMutation = useCreateDispensacion();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      tipo: "VentaAmbulatoria",
      almacenId: defaultAlmacenId,
      isWalkIn: true,
      clienteNombre: "",
      clienteDocumento: "",
      observaciones: "",
      detalles: [
        {
          productoId: 0,
          cantidad: 1,
          precioUnitario: 0,
          descuento: 0,
          descuentoTipo: "monto",
        },
      ],
    },
  });

  const { fields, append, remove, insert } = useFieldArray({
    control,
    name: "detalles",
  });

  const selectedAlmacenId = watch("almacenId") || defaultAlmacenId;
  const isWalkIn = watch("isWalkIn");
  const selectedTipo = watch("tipo");
  const watchedPacienteId = watch("pacienteId");
  const rawDetalles = useWatch({
    control,
    name: "detalles",
  });
  const watchedDetalles = React.useMemo(() => rawDetalles ?? [], [rawDetalles]);

  // Control de estado para validaciones y cierre protegido
  const [attemptedSubmit, setAttemptedSubmit] = React.useState(false);
  const [showConfirmClose, setShowConfirmClose] = React.useState(false);
  const [highlightedRowIndex, setHighlightedRowIndex] = React.useState<number | null>(null);
  const [unlockedPriceRows, setUnlockedPriceRows] = React.useState<Record<number, boolean>>({});
  const [shouldPrintTicket, setShouldPrintTicket] = React.useState(true);

  // Fetch medicines in the selected warehouse
  const { data: stockMedicamentos = [], isLoading: loadingStock } =
    useMedicamentosStock(selectedAlmacenId);

  const quickAddOptions = React.useMemo<AutocompleteOption[]>(
    () =>
      stockMedicamentos.map((med) => ({
        value: String(med.productoId),
        label: med.nombre,
        description: `${med.codigo} · Marca: ${getMedicineBrand(med)} · Bs. ${med.precioReferencial} · Stock ${med.stockDisponible}`,
      })),
    [stockMedicamentos]
  );
  const [quickAddKey, setQuickAddKey] = React.useState(0);

  // Set default warehouse when list loads
  React.useEffect(() => {
    if (defaultAlmacenId && !watch("almacenId")) {
      setValue("almacenId", defaultAlmacenId);
    }
  }, [defaultAlmacenId, setValue, watch]);

  // Reset form when dialog opens
  React.useEffect(() => {
    if (open) {
      setAttemptedSubmit(false);
      setShowConfirmClose(false);
      setUnlockedPriceRows({});
      reset({
        tipo: "VentaAmbulatoria",
        almacenId: defaultAlmacenId,
        isWalkIn: true,
        clienteNombre: "",
        clienteDocumento: "",
        observaciones: "",
        detalles: [
          {
            productoId: 0,
            cantidad: 1,
            precioUnitario: 0,
            descuento: 0,
            descuentoTipo: "monto",
          },
        ],
      });
    }
  }, [open, defaultAlmacenId, reset]);

  // Verificar si hay datos cargados en el formulario para evitar pérdida accidental
  const isFormDirty = React.useMemo(() => {
    const hasProducts = watchedDetalles.some(
      (d) => Number(d?.productoId) > 0 || (Number(d?.cantidad) || 0) > 1
    );
    const hasMultipleRows = watchedDetalles.length > 1;
    const hasClientText = Boolean(watch("clienteNombre")?.trim()) || Boolean(watch("clienteDocumento")?.trim());
    const hasObs = Boolean(watch("observaciones")?.trim());
    const hasPatient = Boolean(watch("pacienteId"));
    return hasProducts || hasMultipleRows || hasClientText || hasObs || hasPatient;
  }, [watchedDetalles, watch]);

  const handleRequestClose = React.useCallback(() => {
    if (isFormDirty) {
      setShowConfirmClose(true);
    } else {
      onOpenChange(false);
    }
  }, [isFormDirty, onOpenChange]);

  // Cálculos de totales
  const totalItemsCount = watchedDetalles.length;
  const totalCantidad = watchedDetalles.reduce(
    (acc, curr) => acc + (Number(curr?.cantidad) || 0),
    0
  );
  const totalDescuento = watchedDetalles.reduce(
    (acc, curr) => acc + getRowDescuentoMonto(curr),
    0
  );
  const calculatedTotal = React.useMemo(() => {
    return watchedDetalles.reduce((acc, curr) => {
      return acc + getRowSubtotal(curr);
    }, 0);
  }, [watchedDetalles]);

  // Comprobar medicamentos duplicados
  const duplicateProductIds = React.useMemo(() => {
    const counts = new Map<number, number>();
    for (const d of watchedDetalles) {
      const pid = Number(d?.productoId);
      if (pid > 0) {
        counts.set(pid, (counts.get(pid) || 0) + 1);
      }
    }
    const duplicates = new Set<number>();
    counts.forEach((count, pid) => {
      if (count > 1) duplicates.add(pid);
    });
    return duplicates;
  }, [watchedDetalles]);

  const hasDuplicates = duplicateProductIds.size > 0;

  // Validación de problemas por fila
  const rowsIssues = React.useMemo(() => {
    return watchedDetalles.map((detalle) => {
      const issues: RowIssues = {};
      const pid = Number(detalle?.productoId) || 0;
      const cant = Number(detalle?.cantidad) || 0;
      const precio = Number(detalle?.precioUnitario) || 0;
      const desc = Number(detalle?.descuento) || 0;
      const descTipo = detalle?.descuentoTipo || "monto";
      const med = stockMedicamentos.find((m) => m.productoId === pid);

      // 1. Producto
      if (!pid || pid <= 0) {
        issues.producto = "Seleccione un medicamento";
      }

      // 2. Cantidad y existencias
      if (!cant || cant <= 0) {
        issues.cantidad = "Cantidad debe ser mayor a 0";
      } else if (med) {
        if (med.stockDisponible <= 0) {
          issues.cantidad = "Sin existencias en este almacén (Stock: 0)";
        } else if (cant > med.stockDisponible) {
          issues.cantidad = `Supera el stock total disponible (${med.stockDisponible} unids)`;
        }
      }

      // 3. Lote
      if (med && detalle?.partidaInventarioId) {
        const chosenLot = med.lotes.find(
          (l) => l.partidaInventarioId === Number(detalle.partidaInventarioId)
        );
        if (chosenLot) {
          if (chosenLot.cantidadDisponible <= 0) {
            issues.lote = `El lote ${chosenLot.lote || "S/N"} no tiene existencias`;
          } else if (cant > chosenLot.cantidadDisponible) {
            issues.lote = `El lote seleccionado solo tiene ${chosenLot.cantidadDisponible} unids`;
          }
        }
      }

      // 4. Descuento
      if (descTipo === "porcentaje") {
        if (desc < 0 || desc > 100) {
          issues.descuento = "El porcentaje debe estar entre 0% y 100%";
        }
      } else {
        const subtotalBruto = cant * precio;
        if (desc < 0) {
          issues.descuento = "El descuento no puede ser negativo";
        } else if (desc > subtotalBruto && subtotalBruto > 0) {
          issues.descuento = `Descuento supera el subtotal bruto (Bs. ${formatBs(subtotalBruto)})`;
        }
      }

      return issues;
    });
  }, [watchedDetalles, stockMedicamentos]);

  const hasAnyRowIssues = rowsIssues.some((issue) => hasIssues(issue));
  const isPacienteRequiredAndMissing = !isWalkIn && (!watchedPacienteId || Number(watchedPacienteId) <= 0);

  // Agregar rápido sin duplicar (+1 a existente)
  const handleAddMedicineQuick = (productoId: number) => {
    const med = stockMedicamentos.find((m) => m.productoId === productoId);
    if (!med) return;

    // Verificar si el medicamento ya se encuentra en la orden
    const existingIndex = watchedDetalles.findIndex(
      (d) => Number(d?.productoId) === productoId
    );

    if (existingIndex !== -1) {
      const currentQty = Number(watchedDetalles[existingIndex]?.cantidad) || 0;
      setValue(`detalles.${existingIndex}.cantidad`, currentQty + 1);
      setHighlightedRowIndex(existingIndex);
      toast.info(`Se sumó +1 a "${med.nombre}" (Total: ${currentQty + 1})`);
      setTimeout(() => setHighlightedRowIndex(null), 1200);
      return;
    }

    const lot = med.lotes[0];

    // Si la primera fila está vacía, reemplazarla
    if (
      fields.length === 1 &&
      (!watchedDetalles[0]?.productoId || Number(watchedDetalles[0]?.productoId) === 0)
    ) {
      setValue("detalles.0.productoId", med.productoId);
      setValue("detalles.0.partidaInventarioId", lot?.partidaInventarioId);
      setValue("detalles.0.cantidad", 1);
      setValue("detalles.0.precioUnitario", med.precioReferencial);
      setValue("detalles.0.descuento", 0);
      setValue("detalles.0.descuentoTipo", "monto");
      setHighlightedRowIndex(0);
      setTimeout(() => setHighlightedRowIndex(null), 1200);
      return;
    }

    append({
      productoId: med.productoId,
      partidaInventarioId: lot?.partidaInventarioId,
      cantidad: 1,
      precioUnitario: med.precioReferencial,
      descuento: 0,
      descuentoTipo: "monto",
      indicaciones: "",
    });

    setHighlightedRowIndex(fields.length);
    setTimeout(() => setHighlightedRowIndex(null), 1200);
  };

  const handleAddRow = React.useCallback(() => {
    const newIdx = fields.length;
    append({
      productoId: 0,
      cantidad: 1,
      precioUnitario: 0,
      descuento: 0,
      descuentoTipo: "monto",
    });

    // Enfocar automáticamente el buscador de la nueva fila
    setTimeout(() => {
      const el = document.getElementById(`detalle-med-${newIdx}`);
      if (el) {
        el.focus();
      } else {
        const row = document.getElementById(`detalle-row-${newIdx}`);
        const btn = row?.querySelector("button, input") as HTMLElement | null;
        btn?.focus();
      }
    }, 80);
  }, [append, fields.length]);

  const handleDuplicateRow = (idx: number) => {
    const item = watchedDetalles[idx];
    if (item) {
      insert(idx + 1, {
        productoId: item.productoId,
        partidaInventarioId: item.partidaInventarioId,
        cantidad: item.cantidad,
        precioUnitario: item.precioUnitario,
        descuento: item.descuento,
        descuentoTipo: item.descuentoTipo ?? "monto",
        indicaciones: item.indicaciones,
      });
    }
  };

  // Consolidar duplicados con un solo clic
  const handleConsolidateDuplicates = () => {
    const consolidatedMap = new Map<number, FormDetalle>();
    const orderOfProducts: number[] = [];

    for (const d of watchedDetalles) {
      const pid = Number(d?.productoId);
      if (!pid || pid <= 0) continue;

      if (!consolidatedMap.has(pid)) {
        consolidatedMap.set(pid, { ...d });
        orderOfProducts.push(pid);
      } else {
        const existing = consolidatedMap.get(pid)!;
        const totalCant = (Number(existing.cantidad) || 0) + (Number(d.cantidad) || 0);
        const totalDesc = getRowDescuentoMonto(existing) + getRowDescuentoMonto(d);
        existing.cantidad = totalCant;
        existing.descuento = totalDesc;
        existing.descuentoTipo = "monto";
      }
    }

    if (orderOfProducts.length === 0) return;

    const newDetalles = orderOfProducts.map((pid) => consolidatedMap.get(pid)!);
    setValue("detalles", newDetalles);
    toast.success("Medicamentos duplicados consolidados correctamente.");
  };

  // Repartir automáticamente la cantidad en lotes por vencimiento (FEFO)
  const handleSplitLots = (rowIndex: number) => {
    const item = watchedDetalles[rowIndex];
    if (!item) return;

    const med = stockMedicamentos.find((m) => m.productoId === Number(item.productoId));
    if (!med || med.lotes.length <= 1) return;

    let requestedTotal = Number(item.cantidad) || 0;
    if (requestedTotal > med.stockDisponible) {
      toast.error(`La cantidad (${requestedTotal}) supera el stock total disponible (${med.stockDisponible}).`);
      return;
    }

    // Ordenar lotes por fecha de vencimiento ascendente (FEFO)
    const sortedLots = [...med.lotes].sort((a, b) => {
      const timeA = a.fechaVencimiento ? new Date(a.fechaVencimiento).getTime() : 9999999999999;
      const timeB = b.fechaVencimiento ? new Date(b.fechaVencimiento).getTime() : 9999999999999;
      return timeA - timeB;
    });

    const splitRows: FormDetalle[] = [];
    for (const lot of sortedLots) {
      if (requestedTotal <= 0) break;
      const availableInLot = Number(lot.cantidadDisponible) || 0;
      if (availableInLot <= 0) continue;

      const take = Math.min(requestedTotal, availableInLot);
      splitRows.push({
        productoId: med.productoId,
        partidaInventarioId: lot.partidaInventarioId,
        cantidad: take,
        precioUnitario: Number(item.precioUnitario) || med.precioReferencial,
        descuento: 0,
        descuentoTipo: "monto",
        indicaciones: item.indicaciones,
      });
      requestedTotal -= take;
    }

    if (splitRows.length === 0) return;

    // Actualizar la fila actual con el primer lote
    setValue(`detalles.${rowIndex}`, splitRows[0]);

    // Insertar las filas subsecuentes
    for (let i = 1; i < splitRows.length; i++) {
      insert(rowIndex + i, splitRows[i]);
    }

    toast.success(
      `Cantidad repartida en ${splitRows.length} lotes por vencimiento (FEFO).`
    );
  };

  const handleClearAllRows = () => {
    reset((prev) => ({
      ...prev,
      detalles: [
        {
          productoId: 0,
          cantidad: 1,
          precioUnitario: 0,
          descuento: 0,
          descuentoTipo: "monto",
        },
      ],
    }));
  };

  // Guardado y emisión de la orden
  const handleSaveOrder = async (values: FormValues, action: "close" | "new_order") => {
    setAttemptedSubmit(true);

    if (values.detalles.length === 0) {
      toast.error("Debe agregar al menos un medicamento a la orden.");
      return;
    }

    if (isPacienteRequiredAndMissing) {
      toast.error("Debe seleccionar un paciente registrado con historia clínica.");
      return;
    }

    if (hasAnyRowIssues) {
      toast.error("Existen filas con errores de stock, lotes o descuentos. Corríjalos para continuar.");
      return;
    }

    try {
      const payload: CreateDispensacionRequest = {
        tipo: values.tipo,
        almacenId: Number(values.almacenId),
        pacienteId: !values.isWalkIn && values.pacienteId ? Number(values.pacienteId) : undefined,
        clienteNombre: values.isWalkIn ? values.clienteNombre?.trim() : undefined,
        clienteDocumento: values.isWalkIn ? values.clienteDocumento?.trim() : undefined,
        medicoId: values.medicoId ? Number(values.medicoId) : undefined,
        observaciones: values.observaciones?.trim(),
        detalles: values.detalles.map((d) => {
          const descMonto = getRowDescuentoMonto(d);
          return {
            productoId: Number(d.productoId),
            partidaInventarioId: d.partidaInventarioId ? Number(d.partidaInventarioId) : undefined,
            cantidad: Number(d.cantidad),
            precioUnitario: Number(d.precioUnitario),
            descuento: Number(descMonto.toFixed(2)),
            indicaciones: d.indicaciones?.trim(),
          };
        }),
      };

      const res = await createMutation.mutateAsync(payload);
      toast.success(
        `Dispensación "${res.numero}" emitida exitosamente. Pase el ticket para cobro en Caja.`
      );

      // Imprimir ticket térmico si está activo
      if (shouldPrintTicket) {
        const almacenObj = almacenes.find((a) => a.id === Number(values.almacenId));
        const medicoObj = medicosData?.items?.find((m) => m.id === Number(values.medicoId));
        const medicoNombre = medicoObj
          ? `Dr(a). ${medicoObj.empleado?.persona?.nombres ?? ""} ${medicoObj.empleado?.persona?.apellidoPaterno ?? ""}`.trim()
          : undefined;

        const pacienteObj = pacientesData?.items?.find((p) => p.id === Number(values.pacienteId));
        const clienteNom = values.isWalkIn
          ? values.clienteNombre || "Cliente Mostrador"
          : pacienteObj
            ? `${pacienteObj.persona.nombres} ${pacienteObj.persona.apellidoPaterno}`
            : "Paciente con HC";
        const clienteDoc = values.isWalkIn
          ? values.clienteDocumento
          : pacienteObj?.persona.numeroDocumento;

        const ticketDetalles = values.detalles.map((d) => {
          const med = stockMedicamentos.find((m) => m.productoId === Number(d.productoId));
          const lot = med?.lotes.find((l) => l.partidaInventarioId === Number(d.partidaInventarioId));
          const sub = getRowSubtotal(d);
          const descVal = getRowDescuentoMonto(d);
          return {
            nombre: med?.nombre || `Ítem #${d.productoId}`,
            cantidad: Number(d.cantidad),
            precioUnitario: Number(d.precioUnitario),
            descuento: descVal,
            subtotal: sub,
            lote: lot?.lote || undefined,
          };
        });

        printTicketDispensacion({
          numero: res.numero,
          fecha: new Date().toLocaleString("es-ES"),
          tipo: values.tipo === "VentaAmbulatoria" ? "Venta Mostrador" : values.tipo,
          almacenNombre: almacenObj?.nombre,
          clienteNombre: clienteNom,
          clienteDocumento: clienteDoc,
          medicoNombre,
          detalles: ticketDetalles,
          total: calculatedTotal,
          totalDescuento,
        });
      }

      onSuccessCallback?.();

      if (action === "new_order") {
        setAttemptedSubmit(false);
        reset({
          tipo: "VentaAmbulatoria",
          almacenId: defaultAlmacenId,
          isWalkIn: true,
          clienteNombre: "",
          clienteDocumento: "",
          observaciones: "",
          detalles: [
            {
              productoId: 0,
              cantidad: 1,
              precioUnitario: 0,
              descuento: 0,
              descuentoTipo: "monto",
            },
          ],
        });
        toast.info("Formulario reiniciado para nueva atención.");
      } else {
        onOpenChange(false);
      }
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error));
    }
  };

  // Atajos de teclado: F2 para agregar fila, Ctrl+Enter / Cmd+Enter para emitir
  React.useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F2") {
        e.preventDefault();
        handleAddRow();
      } else if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleSubmit((vals) => handleSaveOrder(vals, "close"))();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, handleAddRow, handleSubmit]);

  const isSaving = createMutation.isPending || isSubmitting;

  const renderDetallesRows = () => {
    if (loadingStock) {
      return (
        <tr>
          <td
            colSpan={9}
            className="px-3 py-6 text-center text-muted-foreground text-xs"
          >
            <div className="flex flex-col items-center justify-center gap-1.5">
              <Loader2 className="size-5 animate-spin text-teal-600" />
              <span className="font-medium text-xs">
                Cargando catálogo y existencias de farmacia...
              </span>
            </div>
          </td>
        </tr>
      );
    }

    if (fields.length === 0) {
      return (
        <tr>
          <td
            colSpan={9}
            className="px-3 py-8 text-center text-muted-foreground text-xs"
          >
            <div className="flex flex-col items-center justify-center gap-2">
              <Search className="size-6 text-muted-foreground/50" />
              <div className="space-y-0.5">
                <span className="font-semibold text-xs text-foreground">
                  Busca o escanea un medicamento
                </span>
                <p className="text-[11px] text-muted-foreground">
                  Usa el buscador rápido de arriba o presiona <kbd className="px-1 py-0.5 rounded bg-muted font-mono text-[10px] border">F2</kbd> para agregar una línea.
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleAddRow}
                className="h-7 text-xs px-2.5 gap-1.5 text-teal-600 border-teal-500/30 hover:bg-teal-500/10"
              >
                <Plus className="size-3.5" />
                <span>Agregar Medicamento</span>
              </Button>
            </div>
          </td>
        </tr>
      );
    }

    return fields.map((field, idx) => {
      const currentProdId = Number(watchedDetalles[idx]?.productoId);
      const isDup = Boolean(
        currentProdId > 0 && duplicateProductIds.has(currentProdId)
      );

      return (
        <DetalleRow
          key={field.id}
          index={idx}
          almacenId={selectedAlmacenId}
          control={control}
          register={register}
          setValue={setValue}
          onRemove={() => remove(idx)}
          onDuplicate={() => handleDuplicateRow(idx)}
          onSplitLots={() => handleSplitLots(idx)}
          canRemove={fields.length > 1}
          isDuplicate={isDup}
          isHighlighted={highlightedRowIndex === idx}
          issues={rowsIssues[idx]}
          showRequiredErrors={attemptedSubmit}
          stockMedicamentos={stockMedicamentos}
          canEditPriceRole={canEditPriceRole}
          isPriceUnlocked={Boolean(unlockedPriceRows[idx] || canEditPriceRole)}
          onTogglePriceUnlock={() => {
            if (!canEditPriceRole) {
              toast.warning("Permiso restringido: solo administradores o farmacéuticos jefes pueden modificar precios de venta.");
              return;
            }
            setUnlockedPriceRows((prev) => ({
              ...prev,
              [idx]: !prev[idx],
            }));
          }}
        />
      );
    });
  };

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            handleRequestClose();
          } else {
            onOpenChange(true);
          }
        }}
      >
        <DialogContent className="w-[calc(100vw-1.5rem)] h-[calc(100dvh-1.5rem)] sm:w-[calc(100vw-3.5rem)] sm:h-[calc(100dvh-3.5rem)] max-w-none sm:max-w-none rounded-2xl shadow-2xl flex flex-col p-3.5 sm:p-5 overflow-hidden gap-2.5">
          {/* Header Compacto y Elegante */}
          <DialogHeader className="pb-2 border-b border-border/40 shrink-0">
            <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="size-8.5 rounded-lg flex items-center justify-center shrink-0 border shadow-2xs bg-teal-500/10 border-teal-500/25 text-teal-600 dark:text-teal-400">
                  <Pill className="size-4.5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <DialogTitle className="text-sm sm:text-base font-bold text-foreground">
                      Nueva Orden de Venta / Dispensación de Farmacia
                    </DialogTitle>
                  </div>
                  <DialogDescription className="text-xs text-muted-foreground leading-none pt-0.5">
                    Venta de mostrador o dispensación con control FEFO de lotes y pase directo para cobro en Caja.
                  </DialogDescription>
                </div>
              </div>

              {/* Badges de Tipo y Estado */}
              <div className="flex items-center gap-2 shrink-0">
                <Badge
                  variant="outline"
                  className="text-[11px] h-5.5 px-2.5 font-semibold text-teal-700 dark:text-teal-300 border-teal-500/30 bg-teal-500/10 gap-1.5"
                >
                  <ShoppingBag className="size-3" />
                  <span>
                    {selectedTipo === "VentaAmbulatoria"
                      ? "Venta Mostrador"
                      : selectedTipo === "Hospitalaria"
                        ? "Hospitalaria"
                        : "Urgencia"}
                  </span>
                </Badge>

                <Badge
                  variant="outline"
                  className="text-[11px] h-5.5 px-2.5 font-medium text-amber-700 dark:text-amber-300 border-amber-500/30 bg-amber-500/10 gap-1.5"
                >
                  <Clock className="size-3" />
                  <span>Pendiente Pago</span>
                </Badge>
              </div>
            </div>
          </DialogHeader>

          {/* Form Body */}
          <form
            id="dispensacion-form"
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit((vals) => handleSaveOrder(vals, "close"))();
            }}
            className="flex-1 min-h-0 flex flex-col gap-2.5 overflow-y-auto sm:overflow-hidden text-xs pr-0.5"
          >
            {/* Section 1: Cabecera Holgada */}
            <div className="p-2.5 sm:p-3 rounded-lg bg-card/80 border border-border/70 flex flex-col gap-2.5 shrink-0 shadow-2xs">
              <div className="flex items-center justify-between pb-1 border-b border-border/30">
                <span className="font-semibold text-foreground text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="size-3.5 text-teal-600" />
                  1. Datos de Emisión y Destinatario
                </span>
                <span className="text-[11px] text-muted-foreground">
                  <span className="text-destructive font-bold">*</span> Obligatorios
                </span>
              </div>

              {/* Fila 1: Almacén, Tipo, Modalidad y Médico */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {/* Almacén */}
                <div className="space-y-1">
                  <Label
                    htmlFor="almacenId"
                    className="text-xs font-medium leading-none flex items-center gap-1"
                  >
                    <Warehouse className="size-3 text-muted-foreground" />
                    Almacén Emisor (Farmacia) <span className="text-destructive">*</span>
                  </Label>
                  <Controller
                    name="almacenId"
                    control={control}
                    render={({ field }) => (
                      <Autocomplete
                        id="almacenId"
                        value={field.value ? String(field.value) : ""}
                        onValueChange={(v) => field.onChange(v ? Number(v) : 0)}
                        options={almacenOptions}
                        allowCustomValue={false}
                        placeholder="Buscar almacén..."
                        className="h-7.5 text-xs"
                      />
                    )}
                  />
                </div>

                {/* Tipo de Dispensación */}
                <div className="space-y-1">
                  <Label
                    htmlFor="tipo"
                    className="text-xs font-medium leading-none flex items-center gap-1"
                  >
                    <FileText className="size-3 text-muted-foreground" />
                    Tipo de Dispensación <span className="text-destructive">*</span>
                  </Label>
                  <select
                    id="tipo"
                    {...register("tipo")}
                    className="w-full h-7.5 px-2.5 text-xs rounded-md border border-border/60 bg-background text-foreground shadow-2xs"
                  >
                    <option value="VentaAmbulatoria">Venta Mostrador (Ticket a Caja)</option>
                    <option value="Hospitalaria">Hospitalización (Cargo Internación)</option>
                    <option value="Urgencia">Urgencias (Atención Inmediata)</option>
                  </select>
                </div>

                {/* Selector Modo: Particular vs Registrado (Accesible con radiogroup) */}
                <div className="space-y-1">
                  <Label className="text-xs font-medium leading-none flex items-center gap-1">
                    <User className="size-3 text-muted-foreground" />
                    Modalidad de Cliente
                  </Label>
                  <div
                    role="radiogroup"
                    aria-label="Modalidad de cliente"
                    className="flex items-center gap-1 bg-muted/60 p-0.5 rounded-md border border-border/50 h-7.5"
                  >
                    <button
                      type="button"
                      role="radio"
                      aria-checked={isWalkIn}
                      onClick={() => setValue("isWalkIn", true)}
                      className={cn(
                        "flex-1 h-6 text-[11px] rounded font-medium transition-colors cursor-pointer",
                        isWalkIn
                          ? "bg-background text-foreground font-semibold shadow-2xs border border-border/40"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      Particular / Mostrador
                    </button>
                    <button
                      type="button"
                      role="radio"
                      aria-checked={!isWalkIn}
                      onClick={() => setValue("isWalkIn", false)}
                      className={cn(
                        "flex-1 h-6 text-[11px] rounded font-medium transition-colors cursor-pointer",
                        !isWalkIn
                          ? "bg-background text-foreground font-semibold shadow-2xs border border-border/40"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      Paciente con HC
                    </button>
                  </div>
                </div>

                {/* Médico Prescriptor (Opcional, con búsqueda en servidor) */}
                <div className="space-y-1">
                  <Label
                    htmlFor="medicoId"
                    className="text-xs font-medium leading-none flex items-center gap-1"
                  >
                    <Stethoscope className="size-3 text-muted-foreground" />
                    Médico Prescriptor (Opcional)
                  </Label>
                  <Controller
                    name="medicoId"
                    control={control}
                    render={({ field }) => (
                      <Autocomplete
                        id="medicoId"
                        value={field.value ? String(field.value) : ""}
                        onValueChange={(v) => field.onChange(v ? Number(v) : undefined)}
                        onSearchChange={setMedicoSearch}
                        isLoading={loadingMedicos}
                        options={medicoOptions}
                        allowCustomValue={false}
                        placeholder="Sin médico / buscar..."
                        emptyText="No se encontró el médico."
                        className="h-7.5 text-xs"
                      />
                    )}
                  />
                </div>
              </div>

              {/* Fila 2: Datos de Cliente y Observaciones */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2.5">
                {isWalkIn ? (
                  <>
                    <div className="space-y-1 sm:col-span-1 lg:col-span-4">
                      <Label
                        htmlFor="clienteNombre"
                        className="text-xs font-medium leading-none flex items-center gap-1"
                      >
                        Nombre Cliente (Opcional)
                      </Label>
                      <Input
                        id="clienteNombre"
                        {...register("clienteNombre")}
                        placeholder="Ej. Juan Pérez (o Venta Mostrador)"
                        className="h-7.5 text-xs bg-background/50 shadow-2xs"
                      />
                    </div>

                    <div className="space-y-1 sm:col-span-1 lg:col-span-3">
                      <Label
                        htmlFor="clienteDocumento"
                        className="text-xs font-medium leading-none flex items-center gap-1"
                      >
                        <Hash className="size-3 text-muted-foreground" />
                        Documento / C.I. / NIT (Opcional)
                      </Label>
                      <Input
                        id="clienteDocumento"
                        {...register("clienteDocumento")}
                        placeholder="Ej. 1234567 LP"
                        className="h-7.5 text-xs font-mono bg-background/50 shadow-2xs"
                      />
                    </div>
                  </>
                ) : (
                  <div className="space-y-1 sm:col-span-2 lg:col-span-7">
                    <Label
                      htmlFor="pacienteId"
                      className="text-xs font-medium leading-none flex items-center gap-1"
                    >
                      Paciente de la Clínica <span className="text-destructive">*</span>
                    </Label>
                    <Controller
                      name="pacienteId"
                      control={control}
                      render={({ field }) => (
                        <Autocomplete
                          id="pacienteId"
                          value={field.value ? String(field.value) : ""}
                          onValueChange={(v) => field.onChange(v ? Number(v) : undefined)}
                          onSearchChange={setPacienteSearch}
                          isLoading={loadingPacientes}
                          options={pacienteOptions}
                          allowCustomValue={false}
                          error={attemptedSubmit && isPacienteRequiredAndMissing}
                          placeholder="Buscar por nombre, C.I. o N° de HC..."
                          emptyText="No se encontró el paciente."
                          className="h-7.5 text-xs"
                        />
                      )}
                    />
                    {attemptedSubmit && isPacienteRequiredAndMissing && (
                      <IssueText>
                        Debe seleccionar un paciente registrado con historia clínica.
                      </IssueText>
                    )}
                  </div>
                )}

                {/* Observaciones */}
                <div className="space-y-1 sm:col-span-2 lg:col-span-5">
                  <Label
                    htmlFor="observaciones"
                    className="text-xs font-medium leading-none"
                  >
                    Observación / Indicaciones de Dispensación
                  </Label>
                  <Input
                    id="observaciones"
                    {...register("observaciones")}
                    placeholder="Observaciones para el ticket de cobro y despacho..."
                    className="h-7.5 text-xs bg-background/50 shadow-2xs"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Items Table Proporcionada */}
            <div className="flex-1 min-h-0 flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2 shrink-0 flex-wrap">
                <div className="flex items-center gap-2">
                  <Package className="size-4 text-teal-600" />
                  <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                    2. Medicamentos e Insumos a Dispensar
                  </span>
                  <Badge
                    variant="secondary"
                    className="text-[11px] h-5 px-2 font-mono font-medium"
                  >
                    {totalItemsCount} {totalItemsCount === 1 ? "artículo" : "artículos"}
                  </Badge>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Selector Rápido de Medicamentos (sin duplicar, suma +1) */}
                  <div className="w-56 sm:w-80">
                    <Autocomplete
                      key={quickAddKey}
                      value=""
                      onValueChange={(v) => {
                        if (!v) return;
                        handleAddMedicineQuick(Number(v));
                        setQuickAddKey((k) => k + 1);
                      }}
                      options={quickAddOptions}
                      allowCustomValue={false}
                      isLoading={loadingStock}
                      placeholder="➕ Agregar medicamento rápido..."
                      emptyText="Sin medicamentos con stock."
                      className="h-7 text-xs border-teal-500/40 bg-teal-500/5 placeholder:text-teal-700/70 dark:placeholder:text-teal-300/70"
                    />
                  </div>

                  {fields.length > 1 && (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={handleClearAllRows}
                      className="h-7 text-xs px-2.5 text-muted-foreground hover:text-destructive cursor-pointer"
                    >
                      Reiniciar
                    </Button>
                  )}

                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleAddRow}
                    title="Atajo: F2"
                    className="h-7 text-xs px-3 gap-1.5 text-teal-600 border-teal-500/30 hover:bg-teal-500/5 cursor-pointer shadow-2xs font-medium"
                  >
                    <Plus className="size-3.5" />
                    <span>Agregar Línea</span>
                    <kbd className="hidden sm:inline-block ml-1 text-[9px] px-1 py-0.2 rounded bg-muted/80 text-muted-foreground font-mono">
                      F2
                    </kbd>
                  </Button>
                </div>
              </div>

              {/* Alerta de duplicados con botón para consolidar */}
              {hasDuplicates && (
                <div className="shrink-0 p-2 rounded-md bg-amber-500/10 border border-amber-500/25 text-amber-800 dark:text-amber-300 text-xs flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
                    <span>
                      Hay medicamentos repetidos en la orden. Puedes consolidar sus cantidades para evitar líneas duplicadas en el ticket.
                    </span>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleConsolidateDuplicates}
                    className="h-6 text-[11px] px-2.5 border-amber-500/40 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 font-semibold gap-1"
                  >
                    <Sparkles className="size-3" />
                    <span>Consolidar duplicados</span>
                  </Button>
                </div>
              )}

              {/* Vista Móvil: Tarjetas compactas e interactivas */}
              <div className="sm:hidden flex-1 overflow-y-auto space-y-2 pr-0.5">
                {fields.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground border border-dashed rounded-lg">
                    <p className="text-xs">No hay medicamentos en la orden.</p>
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleAddRow}
                      className="mt-2 text-xs h-7"
                    >
                      Agregar Medicamento
                    </Button>
                  </div>
                ) : (
                  fields.map((field, idx) => (
                    <DetalleMobileCard
                      key={field.id}
                      index={idx}
                      almacenId={selectedAlmacenId}
                      control={control}
                      register={register}
                      setValue={setValue}
                      onRemove={() => remove(idx)}
                      onDuplicate={() => handleDuplicateRow(idx)}
                      onSplitLots={() => handleSplitLots(idx)}
                      canRemove={fields.length > 1}
                      isDuplicate={duplicateProductIds.has(Number(watchedDetalles[idx]?.productoId))}
                      isHighlighted={highlightedRowIndex === idx}
                      issues={rowsIssues[idx]}
                      showRequiredErrors={attemptedSubmit}
                      stockMedicamentos={stockMedicamentos}
                      canEditPriceRole={canEditPriceRole}
                      isPriceUnlocked={Boolean(unlockedPriceRows[idx] || canEditPriceRole)}
                      onTogglePriceUnlock={() => {
                        if (!canEditPriceRole) {
                          toast.warning("Solo administradores pueden modificar precios.");
                          return;
                        }
                        setUnlockedPriceRows((prev) => ({
                          ...prev,
                          [idx]: !prev[idx],
                        }));
                      }}
                    />
                  ))
                )}
              </div>

              {/* Vista Desktop: Tabla con scroll independiente y cabecera fija */}
              <div className="hidden sm:block flex-1 min-h-[140px] rounded-lg border border-border/70 overflow-x-auto overflow-y-auto bg-card shadow-2xs">
                <table className="w-full min-w-[880px] text-left text-xs border-collapse">
                  <thead className="sticky top-0 z-10 bg-muted/95 backdrop-blur-xs border-b border-border/70 text-muted-foreground font-semibold text-[11px] uppercase tracking-wider">
                    <tr>
                      <th className="px-2.5 py-2 w-9 text-center">#</th>
                      <th className="px-2.5 py-2 min-w-64">Medicamento / Presentación *</th>
                      <th className="px-2.5 py-2 min-w-44">Lote / Vencimiento</th>
                      <th className="px-2.5 py-2 w-20 text-center">Stock</th>
                      <th className="px-2.5 py-2 w-24 text-center">Cantidad *</th>
                      <th className="px-2.5 py-2 w-28 text-right">Precio Unit. (Bs.)</th>
                      <th className="px-2.5 py-2 w-32 text-right">Desc. (% / Bs.)</th>
                      <th className="px-2.5 py-2 w-28 text-right">Subtotal (Bs.)</th>
                      <th className="px-2 py-2 w-16 text-center">
                        <span className="sr-only">Acciones</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {renderDetallesRows()}
                  </tbody>
                </table>
              </div>

              {/* Barra Unificada de Resumen y Totales (Siempre Visible) */}
              <div className="shrink-0 flex flex-wrap items-center justify-between gap-3 px-3.5 py-2 rounded-lg bg-muted/40 border border-border/50 text-xs">
                <div className="flex items-center gap-3 text-muted-foreground text-xs flex-wrap">
                  <span>
                    Líneas: <strong className="text-foreground">{totalItemsCount}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Unidades:{" "}
                    <strong className="text-teal-600 dark:text-teal-400 font-mono font-semibold">
                      {totalCantidad.toLocaleString("es-ES")}
                    </strong>
                  </span>
                  {totalDescuento > 0 && (
                    <>
                      <span>•</span>
                      <span className="text-amber-600 dark:text-amber-400 font-medium">
                        Descuento: Bs. {formatBs(totalDescuento)}
                      </span>
                    </>
                  )}
                  <span>•</span>
                  <span className="font-medium text-muted-foreground flex items-center gap-1.5">
                    <ShieldCheck className="size-3.5 text-teal-600" />
                    FEFO automático & cobro en Caja
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  <span className="text-xs text-muted-foreground font-medium">Total a Cobrar:</span>
                  <div className="bg-teal-500/10 border border-teal-500/30 px-3 py-1 rounded-md flex items-center">
                    <span className="text-base font-bold text-teal-600 dark:text-teal-400 font-mono tabular-nums">
                      Bs. {formatBs(calculatedTotal)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </form>

          {/* Footer Completo con Acciones Rápidas */}
          <DialogFooter className="pt-2 border-t border-border/40 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-2.5">
            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRequestClose}
                disabled={isSaving}
                className="h-8 px-3.5 text-xs cursor-pointer"
              >
                Cancelar
              </Button>

              <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={shouldPrintTicket}
                  onChange={(e) => setShouldPrintTicket(e.target.checked)}
                  className="rounded border-border text-teal-600 focus:ring-teal-500 size-3.5"
                />
                <Printer className="size-3.5 text-muted-foreground" />
                <span>Imprimir ticket térmico al emitir</span>
              </label>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              {/* Botón: Emitir y Nueva Orden */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isSaving || fields.length === 0}
                onClick={() => handleSubmit((vals) => handleSaveOrder(vals, "new_order"))()}
                className="h-8 px-3.5 text-xs text-teal-700 dark:text-teal-300 border-teal-500/40 hover:bg-teal-500/10 font-medium cursor-pointer"
              >
                {isSaving ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Plus className="size-3.5" />
                )}
                <span>Emitir y nueva orden</span>
              </Button>

              {/* Botón Principal: Emitir y Cerrar */}
              <Button
                type="button"
                size="sm"
                disabled={isSaving || fields.length === 0}
                onClick={() => handleSubmit((vals) => handleSaveOrder(vals, "close"))()}
                className="h-8 px-4 text-xs bg-teal-600 hover:bg-teal-700 text-white font-medium gap-1.5 cursor-pointer shadow-2xs transition-all"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>Emitiendo Orden...</span>
                  </>
                ) : (
                  <>
                    <Check className="size-3.5" />
                    <span>Emitir Orden de Venta</span>
                    <kbd className="hidden sm:inline-block ml-1 text-[9px] px-1 py-0.2 rounded bg-teal-800 text-white font-mono opacity-90">
                      Ctrl+↵
                    </kbd>
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de confirmación para evitar cierre accidental con datos cargados */}
      <Dialog open={showConfirmClose} onOpenChange={setShowConfirmClose}>
        <DialogContent className="max-w-md p-5 rounded-xl">
          <DialogHeader className="gap-1.5">
            <DialogTitle className="flex items-center gap-2 text-destructive text-base">
              <AlertTriangle className="size-5" />
              ¿Descartar orden en curso?
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
              Hay medicamentos y datos ingresados en esta orden de dispensación. Si cierras la ventana ahora, se perderá la información sin emitir a Caja.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowConfirmClose(false)}
              className="text-xs h-8"
            >
              Continuar editando
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => {
                setShowConfirmClose(false);
                onOpenChange(false);
              }}
              className="text-xs h-8"
            >
              Descartar y salir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
