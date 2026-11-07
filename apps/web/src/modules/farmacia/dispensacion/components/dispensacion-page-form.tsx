"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
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
  Plus,
  Trash2,
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
  Lock,
  Unlock,
  Sparkles,
  Search,
  Calendar,
  ArrowLeft,
  RotateCcw,
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
import {
  Autocomplete,
  type AutocompleteOption,
} from "@/components/ui/autocomplete";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn, formatDate } from "@/lib/utils";

import {
  useCreateDispensacion,
  useUpdateDispensacion,
  useDispensacion,
  useMedicamentosStock,
} from "../hooks/use-dispensacion";
import {
  MedicamentoAutocomplete,
  getMedicineBrand,
} from "./medicamento-autocomplete";
import { DispensacionCobrarDialog } from "./dispensacion-cobrar-dialog";
import { DispensacionEntregarDialog } from "./dispensacion-entregar-dialog";
import { useAlmacenes } from "@/modules/almacenes/almacen/hooks/use-almacen";
import { usePacientes } from "@/modules/recepcion/pacientes/hooks/use-pacientes";
import { useAdmisiones } from "@/modules/recepcion/admisiones/hooks/use-admisiones";
import { useMedicos } from "@/modules/recursos-humanos/medico";
import {
  type CreateDispensacionRequest,
  type DispensacionResponse,
  type DispensacionDetalleResponse,
  type TipoDispensacion,
  type MedicamentoStockResponse,
  type LoteMedicamentoStockResponse,
  isEstadoPendientePago,
  isEstadoPagado,
  isEstadoEntregado,
  isEstadoAnulado,
} from "../types/dispensacion.types";

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
  fecha: string;
  almacenId: number;
  isWalkIn: boolean;
  pacienteId?: number;
  admisionId?: number;
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

function validateRowProducto(
  pid: number,
  selectedAlmacenId: number
): string | undefined {
  if (!selectedAlmacenId) {
    return "Seleccione un almacén emisor primero";
  }
  if (!pid || pid <= 0) {
    return "Seleccione un medicamento";
  }
  return undefined;
}

function validateRowCantidad(
  cant: number,
  effectiveStock: number,
  hasMed: boolean
): string | undefined {
  if (!cant || cant <= 0) {
    return "Cantidad debe ser mayor a 0";
  }
  if (hasMed) {
    if (effectiveStock <= 0) {
      return "Sin existencias en este almacén (Stock: 0)";
    }
    if (cant > effectiveStock) {
      return `Supera el stock total disponible (${effectiveStock} unids)`;
    }
  }
  return undefined;
}

function validateRowLote(
  cant: number,
  partidaId: number | undefined,
  med: MedicamentoStockResponse | undefined,
  previouslyReservedLot: number
): string | undefined {
  if (!med || !partidaId) return undefined;

  const chosenLot = med.lotes.find(
    (l) => l.partidaInventarioId === Number(partidaId)
  );
  if (!chosenLot) return undefined;

  const effectiveLotStock = chosenLot.cantidadDisponible + previouslyReservedLot;
  if (effectiveLotStock <= 0) {
    return `El lote ${chosenLot.lote || "S/N"} no tiene existencias`;
  }
  if (cant > effectiveLotStock) {
    return `El lote seleccionado solo tiene ${effectiveLotStock} unids`;
  }
  return undefined;
}

function validateRowDescuento(
  desc: number,
  descTipo: string,
  cant: number,
  precio: number
): string | undefined {
  if (descTipo === "porcentaje") {
    if (desc < 0 || desc > 100) {
      return "El porcentaje debe estar entre 0% y 100%";
    }
    return undefined;
  }

  const subtotalBruto = cant * precio;
  if (desc < 0) {
    return "El descuento no puede ser negativo";
  }
  if (desc > subtotalBruto && subtotalBruto > 0) {
    return `Descuento supera el subtotal bruto (Bs. ${formatBs(subtotalBruto)})`;
  }
  return undefined;
}

function getPreviouslyReservedQuantity(
  detalles: DispensacionDetalleResponse[] | undefined,
  predicate: (d: DispensacionDetalleResponse) => boolean
): number {
  if (!detalles) return 0;
  return detalles
    .filter(predicate)
    .reduce((sum, item) => sum + item.cantidad, 0);
}

function validateDetalleRow(
  detalle: FormDetalle,
  selectedAlmacenId: number,
  stockMedicamentos: MedicamentoStockResponse[],
  isEditMode: boolean,
  dispensacionExistente?: DispensacionResponse
): RowIssues {
  const pid = Number(detalle?.productoId) || 0;
  const cant = Number(detalle?.cantidad) || 0;
  const precio = Number(detalle?.precioUnitario) || 0;
  const desc = Number(detalle?.descuento) || 0;
  const descTipo = detalle?.descuentoTipo || "monto";
  const med = stockMedicamentos.find((m) => m.productoId === pid);

  const prevReservedProd = isEditMode
    ? getPreviouslyReservedQuantity(
        dispensacionExistente?.detalles,
        (d) => d.productoId === pid
      )
    : 0;
  const effectiveStock = med ? med.stockDisponible + prevReservedProd : 0;

  const prevReservedLot =
    isEditMode && detalle?.partidaInventarioId
      ? getPreviouslyReservedQuantity(
          dispensacionExistente?.detalles,
          (d) => d.partidaInventarioId === Number(detalle.partidaInventarioId)
        )
      : 0;

  return {
    producto: validateRowProducto(pid, selectedAlmacenId),
    cantidad: validateRowCantidad(cant, effectiveStock, Boolean(med)),
    lote: validateRowLote(cant, detalle?.partidaInventarioId, med, prevReservedLot),
    descuento: validateRowDescuento(desc, descTipo, cant, precio),
  };
}

function getLocalCurrentDateTime(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 16);
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

function buildDispensacionPayload(
  values: FormValues
): CreateDispensacionRequest {
  const fechaIso = values.fecha
    ? new Date(values.fecha).toISOString()
    : new Date().toISOString();

  const detalles = values.detalles.map((d) => ({
    productoId: Number(d.productoId),
    partidaInventarioId: d.partidaInventarioId
      ? Number(d.partidaInventarioId)
      : undefined,
    cantidad: Number(d.cantidad),
    precioUnitario: Number(d.precioUnitario),
    descuento: Number(getRowDescuentoMonto(d).toFixed(2)),
    indicaciones: d.indicaciones?.trim(),
  }));

  return {
    tipo: values.tipo,
    fecha: fechaIso,
    almacenId: Number(values.almacenId),
    pacienteId:
      !values.isWalkIn && values.pacienteId
        ? Number(values.pacienteId)
        : undefined,
    admisionId:
      !values.isWalkIn && values.admisionId
        ? Number(values.admisionId)
        : undefined,
    clienteNombre: values.isWalkIn ? values.clienteNombre?.trim() : undefined,
    clienteDocumento: values.isWalkIn
      ? values.clienteDocumento?.trim()
      : undefined,
    medicoId: values.medicoId ? Number(values.medicoId) : undefined,
    observaciones: values.observaciones?.trim(),
    detalles,
  };
}

/** Evita que la rueda del mouse cambie el valor de un input numérico al hacer scroll. */
const blurOnWheel = (e: React.WheelEvent<HTMLInputElement>) =>
  e.currentTarget.blur();

function IssueText({ children }: { readonly children?: string }) {
  if (!children) return null;
  return (
    <p className="mt-0.5 text-[10px] leading-tight font-medium text-destructive">
      {children}
    </p>
  );
}

interface DetalleRowProps {
  readonly index: number;
  readonly control: Control<FormValues>;
  readonly register: ReturnType<typeof useForm<FormValues>>["register"];
  readonly setValue: ReturnType<typeof useForm<FormValues>>["setValue"];
  readonly onRemove: () => void;
  readonly onSplitLots: () => void;
  readonly canRemove: boolean;
  readonly isDuplicate: boolean;
  readonly isHighlighted: boolean;
  readonly issues?: RowIssues;
  readonly showRequiredErrors: boolean;
  readonly almacenId: number;
  readonly stockMedicamentos: MedicamentoStockResponse[];
  readonly isPriceUnlocked: boolean;
  readonly onTogglePriceUnlock: () => void;
}

function getStockBadgeClass(stock: number): string {
  if (stock > 10) {
    return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30";
  }
  if (stock > 0) {
    return "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30";
  }
  return "bg-destructive/10 text-destructive border-destructive/30 font-bold";
}

function getDispensacionEstadoLabel(estado?: string | number | null): string {
  if (isEstadoPendientePago(estado)) return "Pendiente de Pago (Editable)";
  if (isEstadoPagado(estado)) return "Pagado";
  if (isEstadoEntregado(estado)) return "Entregado";
  if (isEstadoAnulado(estado)) return "Anulado";
  return String(estado ?? "");
}

function getTipoDispensacionLabel(tipo: TipoDispensacion): string {
  if (tipo === "VentaAmbulatoria" || tipo === "ventaAmbulatoria") {
    return "Venta Mostrador";
  }
  if (tipo === "Hospitalaria" || tipo === "hospitalaria") {
    return "Hospitalaria";
  }
  return "Urgencia";
}

interface ApplyMedicineSelectionParams {
  med: MedicamentoStockResponse | null;
  index: number;
  allDetalles?: FormValues["detalles"];
  setValue: ReturnType<typeof useForm<FormValues>>["setValue"];
  canRemove: boolean;
  onRemove: () => void;
}

function applyMedicineSelection({
  med,
  index,
  allDetalles,
  setValue,
  canRemove,
  onRemove,
}: ApplyMedicineSelectionParams) {
  if (!med) {
    setValue(`detalles.${index}.productoId`, 0);
    setValue(`detalles.${index}.partidaInventarioId`, undefined);
    setValue(`detalles.${index}.precioUnitario`, 0);
    setValue(`detalles.${index}.descuento`, 0);
    return;
  }

  // Prevenir duplicidad de medicamentos en la orden
  const existingIndex = allDetalles?.findIndex(
    (d, i) => i !== index && Number(d?.productoId) === med.productoId
  );

  if (existingIndex !== undefined && existingIndex !== -1) {
    const currentQty = Number(allDetalles?.[existingIndex]?.cantidad) || 0;
    setValue(`detalles.${existingIndex}.cantidad`, currentQty + 1);
    toast.info(
      `"${med.nombre}" ya existe en la orden (fila #${existingIndex + 1}). Se sumó +1 a su cantidad (Total: ${currentQty + 1}).`
    );
    if (canRemove) {
      onRemove();
    } else {
      setValue(`detalles.${index}.productoId`, 0);
      setValue(`detalles.${index}.partidaInventarioId`, undefined);
      setValue(`detalles.${index}.precioUnitario`, 0);
      setValue(`detalles.${index}.descuento`, 0);
    }
    return;
  }

  setValue(`detalles.${index}.productoId`, med.productoId);
  setValue(`detalles.${index}.precioUnitario`, med.precioReferencial);
  setValue(`detalles.${index}.descuento`, 0);

  const lot = med.lotes[0];
  setValue(`detalles.${index}.partidaInventarioId`, lot?.partidaInventarioId);
}

function useDetalleItemState({
  index,
  control,
  setValue,
  onRemove,
  canRemove,
  issues,
  showRequiredErrors,
  stockMedicamentos,
}: Pick<
  DetalleRowProps,
  | "index"
  | "control"
  | "setValue"
  | "onRemove"
  | "canRemove"
  | "issues"
  | "showRequiredErrors"
  | "stockMedicamentos"
>) {
  const detalle = useWatch({
    control,
    name: `detalles.${index}`,
  });
  const allDetalles = useWatch({
    control,
    name: "detalles",
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
    issues?.cantidad && (showRequiredErrors || currentProductoId > 0)
      ? issues.cantidad
      : undefined;
  const loteError = issues?.lote;
  const descuentoError = issues?.descuento;

  const handleMedicineChange = React.useCallback(
    (med: MedicamentoStockResponse | null) => {
      applyMedicineSelection({
        med,
        index,
        allDetalles,
        setValue,
        canRemove,
        onRemove,
      });
    },
    [index, allDetalles, setValue, canRemove, onRemove]
  );

  return {
    currentProductoId,
    cantidad,
    precioUnitario,
    descuento,
    descuentoTipo,
    descMonto,
    subtotal,
    selectedMed,
    lotes,
    stockDisponible,
    productoError,
    cantidadError,
    loteError,
    descuentoError,
    handleMedicineChange,
  };
}

interface LoteCellProps {
  readonly index: number;
  readonly register: ReturnType<typeof useForm<FormValues>>["register"];
  readonly lotes: LoteMedicamentoStockResponse[];
  readonly currentProductoId?: number;
  readonly loteError?: string;
  readonly onSplitLots: () => void;
}

function LoteCell({
  index,
  register,
  lotes,
  currentProductoId,
  loteError,
  onSplitLots,
}: LoteCellProps) {
  if (lotes.length === 0) {
    return (
      <td className="px-1 py-0.5 w-24">
        <span className="text-[10px] text-muted-foreground italic block text-center truncate">
          {currentProductoId ? "S/L" : "—"}
        </span>
      </td>
    );
  }

  return (
    <td className="px-1 py-0.5 w-24">
      <div className="flex items-center gap-0.5">
        <select
          {...register(`detalles.${index}.partidaInventarioId`, {
            setValueAs: (v) => (v === "" || v === null ? undefined : Number(v)),
          })}
          title="Lote y fecha de vencimiento"
          className={cn(
            "h-6.5 text-[10px] px-1 rounded border border-input bg-background font-mono truncate w-full cursor-pointer focus:ring-1 focus:ring-teal-500",
            loteError && "border-destructive text-destructive font-medium"
          )}
        >
          {lotes.map((lt) => (
            <option key={lt.partidaInventarioId} value={lt.partidaInventarioId}>
              {lt.lote || "S/N"} ({lt.cantidadDisponible})
            </option>
          ))}
        </select>
        {lotes.length > 1 && (
          <button
            type="button"
            onClick={onSplitLots}
            className="text-[9px] font-bold text-teal-700 dark:text-teal-300 hover:underline cursor-pointer shrink-0 px-0.5"
            title="Repartir lotes por FEFO"
          >
            FEFO
          </button>
        )}
      </div>
    </td>
  );
}

interface PrecioCellProps {
  readonly index: number;
  readonly register: ReturnType<typeof useForm<FormValues>>["register"];
  readonly isPriceUnlocked: boolean;
  readonly onTogglePriceUnlock: () => void;
}

function PrecioCell({
  index,
  register,
  isPriceUnlocked,
  onTogglePriceUnlock,
}: PrecioCellProps) {
  return (
    <td className="px-1 py-0.5 w-20 text-right">
      <div className="relative flex items-center">
        <span className="absolute left-1 text-[8px] text-muted-foreground font-mono select-none pointer-events-none">
          Bs
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
            "h-6.5 text-[11px] font-mono text-right pl-4 pr-3.5 font-medium w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
            !isPriceUnlocked &&
              "bg-muted/50 text-foreground cursor-not-allowed opacity-90"
          )}
        />
        <button
          type="button"
          onClick={onTogglePriceUnlock}
          title={
            isPriceUnlocked
              ? "Bloquear precio unitario"
              : "Desbloquear para modificar precio"
          }
          className={cn(
            "absolute right-0.5 p-0.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer rounded",
            isPriceUnlocked
              ? "text-teal-600 dark:text-teal-400 font-bold"
              : "text-muted-foreground/60"
          )}
        >
          {isPriceUnlocked ? (
            <Unlock className="size-2.5" />
          ) : (
            <Lock className="size-2.5" />
          )}
        </button>
      </div>
    </td>
  );
}

interface DescuentoCellProps {
  readonly index: number;
  readonly register: ReturnType<typeof useForm<FormValues>>["register"];
  readonly setValue: ReturnType<typeof useForm<FormValues>>["setValue"];
  readonly descuentoTipo?: "monto" | "porcentaje";
  readonly descuentoError?: string;
}

function DescuentoCell({
  index,
  register,
  setValue,
  descuentoTipo,
  descuentoError,
}: DescuentoCellProps) {
  const isPercentage = descuentoTipo === "porcentaje";

  return (
    <td className="px-1 py-0.5 w-20 text-right">
      <div className="flex items-center">
        <Input
          type="number"
          step={isPercentage ? "1" : "0.01"}
          min="0"
          max={isPercentage ? 100 : undefined}
          onWheel={blurOnWheel}
          {...register(`detalles.${index}.descuento`, {
            setValueAs: (v) => (v === "" || v === null ? 0 : Number(v)),
          })}
          placeholder="0"
          aria-invalid={Boolean(descuentoError)}
          className={cn(
            "h-6.5 text-[11px] font-mono text-right pl-1 pr-1 w-full rounded-r-none border-r-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
            descuentoError &&
              "border-destructive text-destructive focus-visible:ring-destructive font-bold"
          )}
        />
        <button
          type="button"
          onClick={() => {
            setValue(
              `detalles.${index}.descuentoTipo`,
              isPercentage ? "monto" : "porcentaje"
            );
            setValue(`detalles.${index}.descuento`, 0);
          }}
          title="Alternar entre % y Bs."
          className="h-6.5 px-1 text-[9px] font-bold rounded-r-md border border-input bg-muted/40 hover:bg-muted text-foreground transition-colors cursor-pointer shrink-0"
        >
          {isPercentage ? "%" : "Bs"}
        </button>
      </div>
    </td>
  );
}

/** Fila para vista de escritorio (lg+) */
function DetalleRow({
  index,
  almacenId,
  control,
  register,
  setValue,
  onRemove,
  onSplitLots,
  canRemove,
  isDuplicate,
  isHighlighted,
  issues,
  showRequiredErrors,
  stockMedicamentos,
  isPriceUnlocked,
  onTogglePriceUnlock,
}: DetalleRowProps) {
  const {
    currentProductoId,
    descuentoTipo,
    subtotal,
    selectedMed,
    lotes,
    stockDisponible,
    productoError,
    cantidadError,
    loteError,
    descuentoError,
    handleMedicineChange,
  } = useDetalleItemState({
    index,
    control,
    setValue,
    onRemove,
    canRemove,
    issues,
    showRequiredErrors,
    stockMedicamentos,
  });

  const hasVisibleError = Boolean(
    productoError || cantidadError || loteError || descuentoError
  );

  return (
    <tr
      id={`detalle-row-${index}`}
      className={cn(
        "group align-middle hover:bg-muted/40 transition-colors border-b border-border/40 last:border-0 h-8",
        isDuplicate && "bg-amber-500/5 hover:bg-amber-500/10",
        hasVisibleError && "bg-destructive/5 hover:bg-destructive/10",
        isHighlighted && "bg-teal-500/15 ring-1 ring-teal-500/30"
      )}
    >
      {/* Index */}
      <td className="px-1 py-0.5 text-center text-muted-foreground font-mono text-[10px] w-6 shrink-0">
        <span
          className={cn(
            "size-4.5 rounded inline-flex items-center justify-center bg-teal-500/10 text-teal-700 dark:text-teal-300 text-[9px] font-bold",
            hasVisibleError && "bg-destructive/15 text-destructive font-bold"
          )}
        >
          {index + 1}
        </span>
      </td>

      {/* Medicamento / Insumo */}
      <td className="px-1.5 py-0.5 min-w-[210px]">
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
              placeholder={
                !almacenId
                  ? "Seleccione almacén..."
                  : "Buscar medicamento o insumo..."
              }
              className="h-6.5 text-[11px] font-medium"
            />
          )}
        />
      </td>

      {/* Lote */}
      <LoteCell
        index={index}
        register={register}
        lotes={lotes}
        currentProductoId={currentProductoId}
        loteError={loteError}
        onSplitLots={onSplitLots}
      />

      {/* Stock Disponible */}
      <td className="px-1 py-0.5 w-12 text-center">
        <Badge
          variant="outline"
          className={cn(
            "font-mono text-[9px] px-1 py-0 h-4.5 font-bold tabular-nums border",
            getStockBadgeClass(stockDisponible)
          )}
          title={
            (selectedMed?.stockReservado ?? 0) > 0
              ? `Físico: ${selectedMed?.stockFisico ?? stockDisponible} · Reservado: ${selectedMed?.stockReservado}`
              : undefined
          }
        >
          {stockDisponible}
        </Badge>
      </td>

      {/* Cantidad */}
      <td className="px-1 py-0.5 w-14 text-center">
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
            "h-6.5 text-[11px] font-mono text-center font-bold px-1 w-11 mx-auto [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
            cantidadError &&
              "border-destructive text-destructive font-bold focus-visible:ring-destructive"
          )}
        />
      </td>

      {/* Precio Unitario */}
      <PrecioCell
        index={index}
        register={register}
        isPriceUnlocked={isPriceUnlocked}
        onTogglePriceUnlock={onTogglePriceUnlock}
      />

      {/* Descuento */}
      <DescuentoCell
        index={index}
        register={register}
        setValue={setValue}
        descuentoTipo={descuentoTipo}
        descuentoError={descuentoError}
      />

      {/* Subtotal */}
      <td className="px-1.5 py-0.5 w-20 text-right">
        <span className="font-mono text-[11px] font-bold text-teal-600 dark:text-teal-400 tabular-nums whitespace-nowrap">
          Bs.{formatBs(subtotal)}
        </span>
      </td>

      {/* Acciones */}
      <td className="px-0.5 py-0.5 text-center w-6">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemove}
          disabled={!canRemove}
          title={
            canRemove
              ? "Eliminar artículo de la orden"
              : "Mínimo 1 artículo requerido"
          }
          className="size-5.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed transition-colors rounded p-0 mx-auto"
        >
          <Trash2 className="size-3" />
          <span className="sr-only">Eliminar</span>
        </Button>
      </td>
    </tr>
  );
}

function useDebouncedValue(value: string, delay = 250): string {
  const [debounced, setDebounced] = React.useState("");

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced(value.trim());
    }, delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

function getDispensacionEstadoBadgeClass(estado?: string | number | null): string {
  if (isEstadoPendientePago(estado)) {
    return "text-amber-700 dark:text-amber-300 border-amber-500/30 bg-amber-500/10";
  }
  if (isEstadoPagado(estado)) {
    return "text-blue-700 dark:text-blue-300 border-blue-500/30 bg-blue-500/10";
  }
  if (isEstadoEntregado(estado)) {
    return "text-emerald-700 dark:text-emerald-300 border-emerald-500/30 bg-emerald-500/10";
  }
  if (isEstadoAnulado(estado)) {
    return "text-rose-700 dark:text-rose-300 border-rose-500/30 bg-rose-500/10";
  }
  return "";
}

function mapDispensacionToFormValues(
  dispensacionExistente: DispensacionResponse
): FormValues {
  const isWalkIn = !dispensacionExistente.pacienteId;
  const formattedDate = dispensacionExistente.fecha
    ? new Date(
        new Date(dispensacionExistente.fecha).getTime() -
          new Date().getTimezoneOffset() * 60000
      )
        .toISOString()
        .slice(0, 16)
    : getLocalCurrentDateTime();

  const detalles: FormDetalle[] =
    dispensacionExistente.detalles.length > 0
      ? dispensacionExistente.detalles.map((d) => ({
          productoId: d.productoId,
          partidaInventarioId: d.partidaInventarioId ?? undefined,
          cantidad: d.cantidad,
          precioUnitario: d.precioUnitario,
          descuento: d.descuento,
          descuentoTipo: "monto",
          indicaciones: d.indicaciones ?? "",
        }))
      : [
          {
            productoId: 0,
            cantidad: 1,
            precioUnitario: 0,
            descuento: 0,
            descuentoTipo: "monto",
          },
        ];

  return {
    tipo: dispensacionExistente.tipo,
    fecha: formattedDate,
    almacenId: dispensacionExistente.almacenId,
    isWalkIn,
    pacienteId: dispensacionExistente.pacienteId ?? undefined,
    admisionId: dispensacionExistente.admisionId ?? undefined,
    clienteNombre: dispensacionExistente.clienteNombre ?? "",
    clienteDocumento: dispensacionExistente.clienteDocumento ?? "",
    medicoId: dispensacionExistente.medicoId ?? undefined,
    observaciones: dispensacionExistente.observaciones ?? "",
    detalles,
  };
}

function computeDuplicateProductIds(detalles: FormDetalle[]): Set<number> {
  const counts = new Map<number, number>();
  for (const d of detalles) {
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
}

function consolidateDuplicateDetalles(detalles: FormDetalle[]): FormDetalle[] {
  const consolidatedMap = new Map<number, FormDetalle>();
  const orderOfProducts: number[] = [];

  for (const d of detalles) {
    const pid = Number(d?.productoId);
    if (!pid || pid <= 0) continue;

    const existing = consolidatedMap.get(pid);
    if (!existing) {
      consolidatedMap.set(pid, { ...d });
      orderOfProducts.push(pid);
    } else {
      existing.cantidad =
        (Number(existing.cantidad) || 0) + (Number(d.cantidad) || 0);
      existing.descuento =
        getRowDescuentoMonto(existing) + getRowDescuentoMonto(d);
      existing.descuentoTipo = "monto";
    }
  }

  return orderOfProducts.map((pid) => consolidatedMap.get(pid)!);
}

function buildSplitLotRows(
  item: FormDetalle | undefined,
  stockMedicamentos: MedicamentoStockResponse[]
): { error?: string; rows: FormDetalle[] } {
  if (!item) return { rows: [] };

  const med = stockMedicamentos.find(
    (m) => m.productoId === Number(item.productoId)
  );
  if (!med || med.lotes.length <= 1) return { rows: [] };

  let requestedTotal = Number(item.cantidad) || 0;
  if (requestedTotal > med.stockDisponible) {
    return {
      error: `La cantidad (${requestedTotal}) supera el stock total disponible (${med.stockDisponible}).`,
      rows: [],
    };
  }

  const sortedLots = [...med.lotes].sort((a, b) => {
    const timeA = a.fechaVencimiento
      ? new Date(a.fechaVencimiento).getTime()
      : 9999999999999;
    const timeB = b.fechaVencimiento
      ? new Date(b.fechaVencimiento).getTime()
      : 9999999999999;
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

  return { rows: splitRows };
}

interface ValidateOrderParams {
  values: FormValues;
  isEditMode: boolean;
  dispensacionExistente?: DispensacionResponse;
  isAlmacenRequiredAndMissing: boolean;
  isPacienteRequiredAndMissing: boolean;
  hasAnyRowIssues: boolean;
}

function getOrderValidationError({
  values,
  isEditMode,
  dispensacionExistente,
  isAlmacenRequiredAndMissing,
  isPacienteRequiredAndMissing,
  hasAnyRowIssues,
}: ValidateOrderParams): string | null {
  if (
    isEditMode &&
    dispensacionExistente &&
    !isEstadoPendientePago(dispensacionExistente.estado)
  ) {
    return `No se puede modificar una dispensación en estado "${dispensacionExistente.estado}".`;
  }

  if (isAlmacenRequiredAndMissing) {
    return "Debe seleccionar un almacén emisor.";
  }

  if (values.detalles.length === 0) {
    return "Debe agregar al menos un medicamento a la orden.";
  }

  if (isPacienteRequiredAndMissing) {
    return "Debe seleccionar un paciente registrado con historia clínica.";
  }

  if (hasAnyRowIssues) {
    return "Existen filas con errores de stock, lotes o descuentos. Corríjalos para continuar.";
  }

  return null;
}

interface DispensacionPageHeaderProps {
  readonly isEditMode: boolean;
  readonly orderIdentifier: string;
  readonly selectedTipo: TipoDispensacion;
  readonly dispensacionExistente?: DispensacionResponse;
  readonly onBack: () => void;
}

function DispensacionPageHeader({
  isEditMode,
  orderIdentifier,
  selectedTipo,
  dispensacionExistente,
  onBack,
}: Readonly<DispensacionPageHeaderProps>) {
  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3.5 bg-card border border-border/60 rounded-xl p-3.5 sm:p-4 shadow-2xs">
        <div className="flex items-start sm:items-center gap-3 min-w-0">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="size-8.5 rounded-lg border border-border/60 hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer shrink-0 mt-0.5 sm:mt-0"
            title="Volver al listado"
          >
            <ArrowLeft className="size-4" />
          </Button>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-foreground">
                {isEditMode
                  ? `Editar Dispensación: ${orderIdentifier}`
                  : "Nueva Dispensación y Venta de Farmacia"}
              </h1>
              <Badge
                variant="outline"
                className="text-[10px] h-5 px-2 font-semibold text-teal-700 dark:text-teal-300 border-teal-500/30 bg-teal-500/10 shrink-0 gap-1"
              >
                <ShoppingBag className="size-2.5" />
                <span>{getTipoDispensacionLabel(selectedTipo)}</span>
              </Badge>
              {isEditMode && dispensacionExistente ? (
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px] h-5 px-2 font-semibold shrink-0 gap-1",
                    getDispensacionEstadoBadgeClass(dispensacionExistente.estado)
                  )}
                >
                  <Clock className="size-2.5" />
                  <span>
                    {getDispensacionEstadoLabel(dispensacionExistente.estado)}
                  </span>
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="text-[10px] h-5 px-2 font-medium text-amber-700 dark:text-amber-300 border-amber-500/30 bg-amber-500/10 shrink-0 gap-1"
                >
                  <Clock className="size-2.5" />
                  <span>Pase a Cobro en Caja</span>
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground leading-normal mt-0.5">
              {isEditMode
                ? "Actualización de medicamentos, lotes y cantidades de la orden antes de su cobro final."
                : "Emisión con control FEFO de lotes, cálculo automático de importes y ticket para cobro en caja central."}
            </p>
          </div>
        </div>
      </div>

      {isEditMode &&
        dispensacionExistente &&
        !isEstadoPendientePago(dispensacionExistente.estado) && (
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-amber-800 dark:text-amber-300">
            <AlertTriangle className="size-5 shrink-0 mt-0.5" />
            <div className="space-y-0.5 text-xs">
              <p className="font-bold">
                Esta orden se encuentra en estado &quot;{dispensacionExistente.estado}&quot;
              </p>
              <p className="text-muted-foreground">
                Solo las dispensaciones en estado <strong>Pendiente de Pago</strong> pueden ser modificadas. Una vez pagada o entregada, el inventario y cobro han sido procesados.
              </p>
            </div>
          </div>
        )}
    </>
  );
}

interface DispensacionFooterSummaryProps {
  readonly totalItemsCount: number;
  readonly totalCantidad: number;
  readonly totalDescuento: number;
  readonly calculatedTotal: number;
  readonly isEditMode: boolean;
  readonly isSaving: boolean;
  readonly canSave: boolean;
  readonly isEditableState: boolean;
  readonly onCancel: () => void;
  readonly onSaveAndNew: () => void;
  readonly onSaveAndClose: () => void;
}

function DispensacionFooterSummary({
  totalItemsCount,
  totalCantidad,
  totalDescuento,
  calculatedTotal,
  isEditMode,
  isSaving,
  canSave,
  isEditableState,
  onCancel,
  onSaveAndNew,
  onSaveAndClose,
}: Readonly<DispensacionFooterSummaryProps>) {
  return (
    <div className="rounded-xl bg-card border border-border/50 p-3.5 sm:p-5 flex flex-col gap-4 shadow-xs">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3.5 border-b border-border/30">
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
                Descuento Total: Bs. {formatBs(totalDescuento)}
              </span>
            </>
          )}
          <span>•</span>
          <span className="font-medium text-muted-foreground flex items-center gap-1.5">
            <ShieldCheck className="size-3.5 text-teal-600" />
            Control FEFO automático
          </span>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <span className="text-xs text-muted-foreground font-medium">
            Total a Cobrar:
          </span>
          <div className="bg-teal-500/10 border border-teal-500/20 px-3.5 py-1.5 rounded-lg flex items-center">
            <span className="text-xl font-bold text-teal-600 dark:text-teal-400 font-mono tabular-nums">
              Bs. {formatBs(calculatedTotal)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onCancel}
          disabled={isSaving}
          className="w-full sm:w-auto h-8 px-4 text-xs cursor-pointer order-2 sm:order-1 text-muted-foreground hover:text-foreground"
        >
          Cancelar
        </Button>

        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2.5 justify-end order-1 sm:order-2">
          {!isEditMode && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isSaving || !canSave}
              onClick={onSaveAndNew}
              className="w-full sm:w-auto h-8 px-4 text-xs text-teal-700 dark:text-teal-300 border-teal-500/30 hover:bg-teal-500/10 font-medium cursor-pointer gap-1.5"
            >
              {isSaving ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Plus className="size-3.5" />
              )}
              <span>Guardar y Nueva Venta</span>
            </Button>
          )}

          <Button
            type="button"
            size="sm"
            disabled={isSaving || !canSave || !isEditableState}
            onClick={onSaveAndClose}
            className="w-full sm:w-auto h-8 px-5 text-xs bg-teal-600 hover:bg-teal-700 text-white font-medium gap-1.5 cursor-pointer shadow-xs transition-all"
            title={
              !isEditableState
                ? "Solo se pueden editar órdenes en estado Pendiente de Pago"
                : "Guardar orden (Ctrl + Enter)"
            }
          >
            {isSaving ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <Check className="size-3.5" />
                <span>{isEditMode ? "Guardar Cambios" : "Guardar"}</span>
                <kbd className="hidden sm:inline-block ml-1 text-[9px] px-1 py-0.2 rounded bg-teal-800 text-white font-mono opacity-90">
                  Ctrl+↵
                </kbd>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

function checkIsFormDirty(
  detalles: FormDetalle[],
  clienteNombre?: string,
  clienteDocumento?: string,
  observaciones?: string,
  pacienteId?: number
): boolean {
  const hasProducts = detalles.some(
    (d) => Number(d?.productoId) > 0 || (Number(d?.cantidad) || 0) > 1
  );
  const hasMultipleRows = detalles.length > 1;
  const hasClientText =
    Boolean(clienteNombre?.trim()) || Boolean(clienteDocumento?.trim());
  const hasObs = Boolean(observaciones?.trim());
  const hasPatient = Boolean(pacienteId);
  return (
    hasProducts || hasMultipleRows || hasClientText || hasObs || hasPatient
  );
}

interface AdmisionOptionItem {
  id: number;
  numero: string;
  fechaHora: string;
  pacienteId?: number;
  pacienteNombre?: string | null;
  convenioNombre?: string | null;
  paciente?: {
    id?: number;
    persona?: {
      nombres?: string;
      apellidoPaterno?: string;
    };
  } | null;
}

function buildAdmisionOptions(
  items: AdmisionOptionItem[],
  watchedPacienteId?: number
): AutocompleteOption[] {
  const filtered = watchedPacienteId
    ? items.filter(
        (a) =>
          a.pacienteId === Number(watchedPacienteId) ||
          a.paciente?.id === Number(watchedPacienteId)
      )
    : items;

  return filtered.map((a) => {
    const pacNom =
      a.pacienteNombre ||
      (a.paciente?.persona
        ? `${a.paciente.persona.nombres} ${a.paciente.persona.apellidoPaterno}`
        : "Paciente");
    const convenioText = a.convenioNombre
      ? ` · Convenio: ${a.convenioNombre}`
      : "";
    return {
      value: String(a.id),
      label: `${a.numero} · ${pacNom}`,
      description: `Fecha: ${formatDate(a.fechaHora)}${convenioText}`,
    };
  });
}

interface DispensacionDatosGeneralesSectionProps {
  readonly control: Control<FormValues>;
  readonly register: ReturnType<typeof useForm<FormValues>>["register"];
  readonly setValue: ReturnType<typeof useForm<FormValues>>["setValue"];
  readonly isWalkIn: boolean;
  readonly selectedTipo: TipoDispensacion;
  readonly watchedPacienteId?: number;
  readonly watchedAdmisionId?: number;
  readonly attemptedSubmit: boolean;
  readonly isAlmacenRequiredAndMissing: boolean;
  readonly isPacienteRequiredAndMissing: boolean;
  readonly almacenOptions: AutocompleteOption[];
  readonly pacienteOptions: AutocompleteOption[];
  readonly admisionOptions: AutocompleteOption[];
  readonly medicoOptions: AutocompleteOption[];
  readonly admisionesItems: AdmisionOptionItem[];
  readonly loadingPacientes: boolean;
  readonly loadingAdmisiones: boolean;
  readonly loadingMedicos: boolean;
  readonly onPacienteSearchChange: (val: string) => void;
  readonly onAdmisionSearchChange: (val: string) => void;
  readonly onMedicoSearchChange: (val: string) => void;
}

function DispensacionDatosGeneralesSection({
  control,
  register,
  setValue,
  isWalkIn,
  selectedTipo,
  watchedPacienteId,
  watchedAdmisionId,
  attemptedSubmit,
  isAlmacenRequiredAndMissing,
  isPacienteRequiredAndMissing,
  almacenOptions,
  pacienteOptions,
  admisionOptions,
  medicoOptions,
  admisionesItems,
  loadingPacientes,
  loadingAdmisiones,
  loadingMedicos,
  onPacienteSearchChange,
  onAdmisionSearchChange,
  onMedicoSearchChange,
}: Readonly<DispensacionDatosGeneralesSectionProps>) {
  return (
    <div className="p-4 sm:p-5 rounded-xl bg-card border border-border/50 flex flex-col gap-4 shadow-xs">
      <div className="flex items-center justify-between pb-2 border-b border-border/30">
        <span className="font-semibold text-foreground text-xs uppercase tracking-wider flex items-center gap-2">
          <Layers className="size-4 text-teal-600" />
          1. Datos de Emisión y Destinatario
        </span>
        <span className="text-[11px] text-muted-foreground">
          <span className="text-destructive font-bold">*</span> Campos obligatorios
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        <div className="space-y-1 sm:col-span-1">
          <Label
            htmlFor="almacenId"
            className="text-xs font-medium leading-none flex items-center gap-1"
          >
            <Warehouse className="size-3 text-muted-foreground" />
            Almacén Emisor <span className="text-destructive">*</span>
          </Label>
          <Controller
            name="almacenId"
            control={control}
            render={({ field }) => (
              <Autocomplete
                id="almacenId"
                value={
                  field.value && Number(field.value) > 0
                    ? String(field.value)
                    : ""
                }
                onValueChange={(v) => field.onChange(v ? Number(v) : 0)}
                options={almacenOptions}
                allowCustomValue={false}
                placeholder="Seleccionar almacén..."
                className={cn(
                  "h-8 text-xs",
                  attemptedSubmit &&
                    isAlmacenRequiredAndMissing &&
                    "border-destructive focus-visible:ring-destructive"
                )}
              />
            )}
          />
          {attemptedSubmit && isAlmacenRequiredAndMissing && (
            <p className="text-[11px] text-destructive">
              Debe seleccionar un almacén emisor.
            </p>
          )}
        </div>

        <div className="space-y-1 sm:col-span-1">
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
            className="w-full h-8 px-2.5 text-xs rounded-md border border-input bg-background text-foreground"
          >
            <option value="VentaAmbulatoria">
              Venta Mostrador (Ticket a Caja)
            </option>
            <option value="Hospitalaria">
              Hospitalización (Cargo Internación)
            </option>
            <option value="Urgencia">Urgencias (Atención Inmediata)</option>
          </select>
        </div>

        <div className="space-y-1 sm:col-span-2 lg:col-span-1">
          <Label
            htmlFor="fecha"
            className="text-xs font-medium leading-none flex items-center gap-1"
          >
            <Calendar className="size-3 text-muted-foreground" />
            Fecha y Hora <span className="text-destructive">*</span>
          </Label>
          <Input
            id="fecha"
            type="datetime-local"
            {...register("fecha")}
            className="h-8 text-xs font-mono bg-background"
          />
        </div>

        <div className="space-y-1 sm:col-span-2 lg:col-span-1">
          <Label className="text-xs font-medium leading-none flex items-center gap-1">
            <User className="size-3 text-muted-foreground" />
            Modalidad de Atención
          </Label>
          <div
            role="radiogroup"
            aria-label="Modalidad de cliente"
            className="flex items-center gap-1 bg-muted/50 p-0.5 rounded-lg border border-border/40 h-8"
          >
            <button
              type="button"
              role="radio"
              aria-checked={isWalkIn}
              onClick={() => setValue("isWalkIn", true)}
              className={cn(
                "flex-1 h-7 text-xs rounded-md font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer",
                isWalkIn
                  ? "bg-background text-teal-700 dark:text-teal-300 font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <User className="size-3.5 shrink-0" />
              <span className="truncate">Particular / Mostrador</span>
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={!isWalkIn}
              onClick={() => setValue("isWalkIn", false)}
              className={cn(
                "flex-1 h-7 text-xs rounded-md font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer",
                !isWalkIn
                  ? "bg-background text-teal-700 dark:text-teal-300 font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <FileText className="size-3.5 shrink-0" />
              <span className="truncate">Paciente con HC</span>
            </button>
          </div>
        </div>

        {isWalkIn ? (
          <>
            <div className="space-y-1 sm:col-span-1">
              <Label
                htmlFor="clienteNombre"
                className="text-xs font-medium leading-none flex items-center gap-1"
              >
                Nombre del Cliente (Opcional)
              </Label>
              <Input
                id="clienteNombre"
                {...register("clienteNombre")}
                placeholder="Ej. Juan Pérez (o Venta Mostrador)"
                className="h-8 text-xs bg-background"
              />
            </div>

            <div className="space-y-1 sm:col-span-1">
              <Label
                htmlFor="clienteDocumento"
                className="text-xs font-medium leading-none flex items-center gap-1"
              >
                <Hash className="size-3 text-muted-foreground" />
                C.I. / NIT (Opcional)
              </Label>
              <Input
                id="clienteDocumento"
                {...register("clienteDocumento")}
                placeholder="Ej. 1234567 LP"
                className="h-8 text-xs font-mono bg-background"
              />
            </div>
          </>
        ) : (
          <>
            <div className="space-y-1 sm:col-span-1">
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
                    onValueChange={(v) => {
                      field.onChange(v ? Number(v) : undefined);
                      setValue("admisionId", undefined);
                    }}
                    onSearchChange={onPacienteSearchChange}
                    isLoading={loadingPacientes}
                    options={pacienteOptions}
                    allowCustomValue={false}
                    error={attemptedSubmit && isPacienteRequiredAndMissing}
                    placeholder="Buscar por nombre, C.I. o N° de HC..."
                    emptyText="No se encontró el paciente."
                    className="h-8 text-xs"
                  />
                )}
              />
              {attemptedSubmit && isPacienteRequiredAndMissing && (
                <IssueText>
                  Debe seleccionar un paciente registrado con historia clínica.
                </IssueText>
              )}
            </div>

            <div className="space-y-1 sm:col-span-1">
              <Label
                htmlFor="admisionId"
                className="text-xs font-medium leading-none flex items-center justify-between gap-1"
              >
                <span>
                  Admisión Vinculada{" "}
                  {selectedTipo === "Hospitalaria"
                    ? "(Cargo a Cuenta)"
                    : "(Opcional)"}
                </span>
                {watchedAdmisionId &&
                  (selectedTipo === "Hospitalaria" ||
                    selectedTipo === "Urgencia") && (
                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                      ✓ Autoriza entrega
                    </span>
                  )}
              </Label>
              <Controller
                name="admisionId"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    id="admisionId"
                    value={field.value ? String(field.value) : ""}
                    onValueChange={(v) => {
                      const admId = v ? Number(v) : undefined;
                      field.onChange(admId);
                      if (admId && !watchedPacienteId) {
                        const found = admisionesItems.find(
                          (a) => a.id === admId
                        );
                        const pacId = found?.pacienteId ?? found?.paciente?.id;
                        if (pacId) {
                          setValue("pacienteId", pacId);
                        }
                      }
                    }}
                    onSearchChange={onAdmisionSearchChange}
                    isLoading={loadingAdmisiones}
                    options={admisionOptions}
                    allowCustomValue={false}
                    placeholder="Sin admisión / buscar N° ADM..."
                    emptyText="No hay admisiones activas para este filtro."
                    className="h-8 text-xs"
                  />
                )}
              />
            </div>
          </>
        )}

        <div className="space-y-1 sm:col-span-1">
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
                onSearchChange={onMedicoSearchChange}
                isLoading={loadingMedicos}
                options={medicoOptions}
                allowCustomValue={false}
                placeholder="Sin médico / buscar..."
                emptyText="No se encontró el médico."
                className="h-8 text-xs"
              />
            )}
          />
        </div>

        <div className="space-y-1 sm:col-span-1 lg:col-span-2">
          <Label
            htmlFor="observaciones"
            className="text-xs font-medium leading-none"
          >
            Observación / Indicaciones
          </Label>
          <Input
            id="observaciones"
            {...register("observaciones")}
            placeholder="Notas para el ticket de cobro y despacho..."
            className="h-8 text-xs bg-background"
          />
        </div>
      </div>
    </div>
  );
}

interface DispensacionPageFormProps {
  readonly dispensacionId?: number;
  readonly id?: number;
}

export function DispensacionPageForm({
  dispensacionId,
  id,
}: Readonly<DispensacionPageFormProps> = {}) {
  const router = useRouter();
  const editId = dispensacionId ?? id;
  const isEditMode = Boolean(editId && editId > 0);

  const { data: dispensacionExistente, isLoading: loadingExistente } =
    useDispensacion(editId ?? 0);

  const { data: almacenesData } = useAlmacenes({ pageSize: 50 });
  const almacenes = almacenesData?.items ?? [];

  const [pacienteSearch, setPacienteSearch] = React.useState("");
  const debouncedPacienteSearch = useDebouncedValue(pacienteSearch);

  const { data: pacientesData, isLoading: loadingPacientes } = usePacientes({
    search: debouncedPacienteSearch || undefined,
    pageSize: 50,
  });

  const [medicoSearch, setMedicoSearch] = React.useState("");
  const debouncedMedicoSearch = useDebouncedValue(medicoSearch);

  const { data: medicosData, isLoading: loadingMedicos } = useMedicos({
    search: debouncedMedicoSearch || undefined,
    pageSize: 50,
  });

  const [admisionSearch, setAdmisionSearch] = React.useState("");
  const debouncedAdmisionSearch = useDebouncedValue(admisionSearch);

  const { data: admisionesData, isLoading: loadingAdmisiones } = useAdmisiones({
    search: debouncedAdmisionSearch || undefined,
    pageSize: 50,
  });

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
        label: `Dr(a). ${m.empleado?.persona?.nombres ?? ""} ${m.empleado?.persona?.apellidoPaterno ?? ""
          }`.trim(),
      })),
    [medicosData]
  );

  const createMutation = useCreateDispensacion();
  const updateMutation = useUpdateDispensacion();

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
      fecha: getLocalCurrentDateTime(),
      almacenId: 0,
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

  // Si estamos en modo edición, poblar el formulario con la orden existente
  const [loadedDispensacionId, setLoadedDispensacionId] = React.useState<
    number | null
  >(null);

  React.useEffect(() => {
    if (
      isEditMode &&
      dispensacionExistente &&
      loadedDispensacionId !== dispensacionExistente.id
    ) {
      reset(mapDispensacionToFormValues(dispensacionExistente));
      setLoadedDispensacionId(dispensacionExistente.id);
    }
  }, [
    isEditMode,
    dispensacionExistente,
    loadedDispensacionId,
    reset,
  ]);

  const { fields, append, remove, insert } = useFieldArray({
    control,
    name: "detalles",
  });

  const selectedAlmacenId = Number(watch("almacenId")) || 0;
  const isWalkIn = watch("isWalkIn");
  const selectedTipo = watch("tipo");
  const watchedPacienteId = watch("pacienteId");
  const watchedAdmisionId = watch("admisionId");
  const rawDetalles = useWatch({
    control,
    name: "detalles",
  });
  const watchedDetalles = React.useMemo(() => rawDetalles ?? [], [rawDetalles]);

  // Si se cambia a Hospitalaria, cambiar automáticamente a modalidad Paciente con HC
  React.useEffect(() => {
    if (selectedTipo === "Hospitalaria" && isWalkIn) {
      setValue("isWalkIn", false);
    }
  }, [selectedTipo, isWalkIn, setValue]);

  const admisionOptions = React.useMemo<AutocompleteOption[]>(
    () => buildAdmisionOptions(admisionesData?.items ?? [], watchedPacienteId),
    [admisionesData, watchedPacienteId]
  );

  // Estados de control
  const [attemptedSubmit, setAttemptedSubmit] = React.useState(false);
  const [showConfirmClose, setShowConfirmClose] = React.useState(false);
  const [createdForCobro, setCreatedForCobro] =
    React.useState<DispensacionResponse | null>(null);
  const [createdForEntrega, setCreatedForEntrega] =
    React.useState<DispensacionResponse | null>(null);
  const [highlightedRowIndex, setHighlightedRowIndex] = React.useState<
    number | null
  >(null);
  const [unlockedPriceRows, setUnlockedPriceRows] = React.useState<
    Record<number, boolean>
  >({});

  // Existencias en el almacén seleccionado
  const { data: stockMedicamentos = [], isLoading: loadingStock } =
    useMedicamentosStock(selectedAlmacenId);

  const quickAddOptions = React.useMemo<AutocompleteOption[]>(
    () =>
      stockMedicamentos.map((med) => ({
        value: String(med.productoId),
        label: med.nombre,
        description: `${med.codigo} · Marca: ${getMedicineBrand(med)} · Bs. ${med.precioReferencial
          } · Stock ${med.stockDisponible}`,
      })),
    [stockMedicamentos]
  );
  const [quickAddKey, setQuickAddKey] = React.useState(0);

  // Verificar si hay datos cargados para evitar pérdida accidental
  const isFormDirty = React.useMemo(
    () =>
      checkIsFormDirty(
        watchedDetalles,
        watch("clienteNombre"),
        watch("clienteDocumento"),
        watch("observaciones"),
        watch("pacienteId")
      ),
    [watchedDetalles, watch]
  );

  const handleBackNavigation = React.useCallback(() => {
    if (isFormDirty) {
      setShowConfirmClose(true);
    } else {
      router.push("/farmacia/dispensaciones");
    }
  }, [isFormDirty, router]);

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
  const duplicateProductIds = React.useMemo(
    () => computeDuplicateProductIds(watchedDetalles),
    [watchedDetalles]
  );

  const hasDuplicates = duplicateProductIds.size > 0;

  // Validación de problemas por fila
  const rowsIssues = React.useMemo(() => {
    return watchedDetalles.map((detalle) =>
      validateDetalleRow(
        detalle,
        selectedAlmacenId,
        stockMedicamentos,
        isEditMode,
        dispensacionExistente
      )
    );
  }, [
    watchedDetalles,
    stockMedicamentos,
    selectedAlmacenId,
    isEditMode,
    dispensacionExistente,
  ]);

  const hasAnyRowIssues = rowsIssues.some((issue) => hasIssues(issue));
  const isAlmacenRequiredAndMissing =
    !selectedAlmacenId || Number(selectedAlmacenId) <= 0;
  const isPacienteRequiredAndMissing =
    !isWalkIn && (!watchedPacienteId || Number(watchedPacienteId) <= 0);

  // Agregar rápido sin duplicar (+1 a existente)
  const handleAddMedicineQuick = (productoId: number) => {
    const med = stockMedicamentos.find((m) => m.productoId === productoId);
    if (!med) return;

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

    if (
      fields.length === 1 &&
      (!watchedDetalles[0]?.productoId ||
        Number(watchedDetalles[0]?.productoId) === 0)
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

  const handleConsolidateDuplicates = () => {
    const newDetalles = consolidateDuplicateDetalles(watchedDetalles);
    if (newDetalles.length === 0) return;

    setValue("detalles", newDetalles);
    toast.success("Medicamentos duplicados consolidados correctamente.");
  };

  const handleSplitLots = (rowIndex: number) => {
    const { error, rows } = buildSplitLotRows(
      watchedDetalles[rowIndex],
      stockMedicamentos
    );
    if (error) {
      toast.error(error);
      return;
    }
    if (rows.length === 0) return;

    setValue(`detalles.${rowIndex}`, rows[0]);

    for (let i = 1; i < rows.length; i++) {
      insert(rowIndex + i, rows[i]);
    }

    toast.success(
      `Cantidad repartida en ${rows.length} lotes por vencimiento (FEFO).`
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

  const handlePayAndDeliver = (res: DispensacionResponse) => {
    if (isEstadoPagado(res.estado)) {
      toast.success(
        `Dispensación "${res.numero}" autorizada con cargo a Admisión ${res.admisionNumero || ""}. Confirme la entrega física.`
      );
      setCreatedForEntrega(res);
      return;
    }
    toast.success(
      `Dispensación "${res.numero}" emitida y stock reservado. Complete el cobro y despacho a continuación.`
    );
    setCreatedForCobro(res);
  };

  const handleResetForNewOrder = () => {
    setAttemptedSubmit(false);
    reset({
      tipo: "VentaAmbulatoria",
      fecha: getLocalCurrentDateTime(),
      almacenId: selectedAlmacenId,
      isWalkIn: true,
      pacienteId: undefined,
      admisionId: undefined,
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
    toast.info("Formulario reiniciado para una nueva atención.");
  };

  const handlePostSaveSuccess = (
    res: DispensacionResponse,
    action: "close" | "new_order" | "pay_and_deliver"
  ) => {
    if (action === "pay_and_deliver") {
      handlePayAndDeliver(res);
      return;
    }

    const message = isEstadoPagado(res.estado)
      ? `Dispensación "${res.numero}" emitida con cargo a Admisión ${res.admisionNumero || ""} y lista para entrega.`
      : `Dispensación "${res.numero}" emitida con stock reservado y enviada a Cobros de Caja.`;
    toast.success(message);

    if (action === "new_order") {
      handleResetForNewOrder();
    } else {
      router.push("/farmacia/dispensaciones");
    }
  };

  // Guardado y emisión de la orden
  const handleSaveOrder = async (
    values: FormValues,
    action: "close" | "new_order" | "pay_and_deliver"
  ) => {
    setAttemptedSubmit(true);

    const validationError = getOrderValidationError({
      values,
      isEditMode,
      dispensacionExistente,
      isAlmacenRequiredAndMissing,
      isPacienteRequiredAndMissing,
      hasAnyRowIssues,
    });

    if (validationError) {
      toast.error(validationError);
      return;
    }

    try {
      const payload = buildDispensacionPayload(values);

      if (isEditMode && editId) {
        const res = await updateMutation.mutateAsync({
          id: editId,
          data: payload,
        });
        toast.success(
          `Dispensación "${res.numero}" actualizada correctamente con stock reservado recalculado.`
        );
        router.push("/farmacia/dispensaciones");
        return;
      }

      const res = await createMutation.mutateAsync(payload);
      handlePostSaveSuccess(res, action);
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const handleSaveOrderRef = React.useRef(handleSaveOrder);
  handleSaveOrderRef.current = handleSaveOrder;

  // Atajos de teclado: F2 para agregar fila, Ctrl+Enter / Cmd+Enter para emitir
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F2") {
        e.preventDefault();
        handleAddRow();
      } else if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        void handleSubmit((vals) =>
          handleSaveOrderRef.current(vals, "close")
        )();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleAddRow, handleSubmit]);

  const isSaving =
    createMutation.isPending || updateMutation.isPending || isSubmitting;

  const renderDetallesRows = () => {
    if (loadingStock) {
      return (
        <tr>
          <td
            colSpan={9}
            className="px-3 py-6 text-center text-muted-foreground text-xs"
          >
            <div className="flex flex-col items-center justify-center gap-1.5">
              <Loader2 className="size-4 animate-spin text-teal-600" />
              <span className="font-medium text-xs">
                Cargando existencias...
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
                  Usa el buscador rápido de arriba o presiona{" "}
                  <kbd className="px-1 py-0.5 rounded bg-muted font-mono text-[10px] border">
                    F2
                  </kbd>{" "}
                  para agregar una línea.
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleAddRow}
                className="h-8 text-xs px-3 gap-1.5 text-teal-600 border-teal-500/30 hover:bg-teal-500/10 cursor-pointer"
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
          onSplitLots={() => handleSplitLots(idx)}
          canRemove={fields.length > 1}
          isDuplicate={isDup}
          isHighlighted={highlightedRowIndex === idx}
          issues={rowsIssues[idx]}
          showRequiredErrors={attemptedSubmit}
          stockMedicamentos={stockMedicamentos}
          isPriceUnlocked={unlockedPriceRows[idx] ?? true}
          onTogglePriceUnlock={() => {
            setUnlockedPriceRows((prev) => ({
              ...prev,
              [idx]: !(prev[idx] ?? true),
            }));
          }}
        />
      );
    });
  };

  if (isEditMode && loadingExistente) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[350px] gap-3">
        <Loader2 className="size-8 animate-spin text-teal-600" />
        <p className="text-sm font-medium text-muted-foreground">
          Cargando datos de la dispensación...
        </p>
      </div>
    );
  }

  const orderIdentifier =
    dispensacionExistente?.numero || (editId ? `#${editId}` : "");

  return (
    <div className="flex flex-col gap-4 w-full max-w-7xl mx-auto pb-12">
      <DispensacionPageHeader
        isEditMode={isEditMode}
        orderIdentifier={orderIdentifier}
        selectedTipo={selectedTipo}
        dispensacionExistente={dispensacionExistente}
        onBack={handleBackNavigation}
      />

      {/* CUERPO DEL FORMULARIO */}
      <form
        id="dispensacion-page-form"
        onSubmit={(e) => {
          e.preventDefault();
          void handleSubmit((vals) => handleSaveOrder(vals, "close"))();
        }}
        className="flex flex-col gap-4 text-xs"
      >
        {/* SECCIÓN 1: DATOS GENERALES Y DESTINATARIO */}
        <DispensacionDatosGeneralesSection
          control={control}
          register={register}
          setValue={setValue}
          isWalkIn={isWalkIn}
          selectedTipo={selectedTipo}
          watchedPacienteId={watchedPacienteId}
          watchedAdmisionId={watchedAdmisionId}
          attemptedSubmit={attemptedSubmit}
          isAlmacenRequiredAndMissing={isAlmacenRequiredAndMissing}
          isPacienteRequiredAndMissing={isPacienteRequiredAndMissing}
          almacenOptions={almacenOptions}
          pacienteOptions={pacienteOptions}
          admisionOptions={admisionOptions}
          medicoOptions={medicoOptions}
          admisionesItems={admisionesData?.items ?? []}
          loadingPacientes={loadingPacientes}
          loadingAdmisiones={loadingAdmisiones}
          loadingMedicos={loadingMedicos}
          onPacienteSearchChange={setPacienteSearch}
          onAdmisionSearchChange={setAdmisionSearch}
          onMedicoSearchChange={setMedicoSearch}
        />

        {/* SECCIÓN 2: MEDICAMENTOS E INSUMOS */}
        <div className="p-4 sm:p-5 rounded-xl bg-card border border-border/50 flex flex-col gap-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-border/30">
            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <Package className="size-4 text-teal-600" />
              <span className="text-xs font-bold text-foreground uppercase tracking-wider whitespace-nowrap">
                2. Medicamentos e Insumos a Dispensar
              </span>
              <Badge
                variant="secondary"
                className="text-[11px] h-5 px-2 font-mono font-medium whitespace-nowrap shrink-0"
              >
                {totalItemsCount} {totalItemsCount === 1 ? "artículo" : "artículos"}
              </Badge>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
              {/* Buscador Rápido (+1 a existente) */}
              <div className="w-full sm:w-64 md:w-72">
                <Autocomplete
                  key={quickAddKey}
                  value=""
                  disabled={!selectedAlmacenId}
                  onValueChange={(v) => {
                    if (!v) return;
                    handleAddMedicineQuick(Number(v));
                    setQuickAddKey((k) => k + 1);
                  }}
                  options={quickAddOptions}
                  allowCustomValue={false}
                  isLoading={loadingStock}
                  placeholder={
                    !selectedAlmacenId
                      ? "Seleccione un almacén primero..."
                      : "➕ Agregar medicamento rápido..."
                  }
                  emptyText={
                    !selectedAlmacenId
                      ? "Seleccione un almacén primero."
                      : "Sin medicamentos con stock."
                  }
                  className="h-8 text-xs border-teal-500/30 bg-teal-500/5 placeholder:text-teal-700/70 dark:placeholder:text-teal-300/70"
                />
              </div>

              <div className="flex items-center gap-2 justify-end shrink-0">
                {fields.length > 1 && (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={handleClearAllRows}
                    className="h-8 text-xs px-2 text-muted-foreground hover:text-destructive cursor-pointer shrink-0"
                  >
                    <RotateCcw className="size-3 mr-1" />
                    Reiniciar
                  </Button>
                )}

                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleAddRow}
                  title="Atajo: F2"
                  className="h-8 text-xs px-3 gap-1.5 text-teal-600 border-teal-500/30 hover:bg-teal-500/5 cursor-pointer font-medium whitespace-nowrap shrink-0"
                >
                  <Plus className="size-3.5" />
                  <span>Agregar Línea</span>
                  <kbd className="hidden sm:inline-block ml-1 text-[9px] px-1 py-0.2 rounded bg-muted/80 text-muted-foreground font-mono">
                    F2
                  </kbd>
                </Button>
              </div>
            </div>
          </div>

          {/* Alerta de duplicados con consolidación en un clic */}
          {hasDuplicates && (
            <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-800 dark:text-amber-300 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
                <span className="leading-tight">
                  Hay medicamentos repetidos en la orden. Puedes consolidar sus cantidades para evitar duplicados en el ticket.
                </span>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleConsolidateDuplicates}
                className="w-full sm:w-auto h-7 text-[11px] px-2.5 border-amber-500/40 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 font-semibold gap-1 cursor-pointer shrink-0"
              >
                <Sparkles className="size-3" />
                <span>Consolidar duplicados</span>
              </Button>
            </div>
          )}

          {/* LISTA ULTRA COMPACTA: ADAPTABLE A PANTALLAS PEQUEÑAS Y APTA PARA 20+ ITEMS */}
          <div className="rounded-xl border border-border/40 bg-card overflow-x-auto max-h-[480px] overflow-y-auto shadow-2xs">
            <table className="w-full min-w-[680px] table-fixed text-left text-xs border-collapse">
              <thead className="sticky top-0 z-10 bg-muted/95 backdrop-blur border-b border-border/40 text-muted-foreground font-semibold text-[10px] uppercase tracking-wider">
                <tr className="h-7">
                  <th className="px-1 py-1 w-6 text-center whitespace-nowrap">#</th>
                  <th className="px-1.5 py-1 min-w-[210px] whitespace-nowrap">
                    Medicamento / Insumo *
                  </th>
                  <th className="px-1 py-1 w-24 whitespace-nowrap">Lote</th>
                  <th className="px-1 py-1 w-12 text-center whitespace-nowrap">Stock</th>
                  <th className="px-1 py-1 w-14 text-center whitespace-nowrap">Cant. *</th>
                  <th className="px-1 py-1 w-20 text-right whitespace-nowrap">
                    P. Unit.
                  </th>
                  <th className="px-1 py-1 w-20 text-right whitespace-nowrap">
                    Desc.
                  </th>
                  <th className="px-1.5 py-1 w-20 text-right whitespace-nowrap">
                    Subtotal
                  </th>
                  <th className="px-0.5 py-1 w-6 text-center whitespace-nowrap">
                    <span className="sr-only">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {renderDetallesRows()}
              </tbody>
            </table>
          </div>
        </div>

        {/* FOOTER UNIFICADO DE TOTALES Y ACCIONES */}
        <DispensacionFooterSummary
          totalItemsCount={totalItemsCount}
          totalCantidad={totalCantidad}
          totalDescuento={totalDescuento}
          calculatedTotal={calculatedTotal}
          isEditMode={isEditMode}
          isSaving={isSaving}
          canSave={fields.length > 0}
          isEditableState={
            !isEditMode || isEstadoPendientePago(dispensacionExistente?.estado)
          }
          onCancel={handleBackNavigation}
          onSaveAndNew={() => {
            void handleSubmit((vals) => handleSaveOrder(vals, "new_order"))();
          }}
          onSaveAndClose={() => {
            void handleSubmit((vals) => handleSaveOrder(vals, "close"))();
          }}
        />
      </form>

      {/* MODAL DIRECTO DE COBRO Y ENTREGA TRAS EMISIÓN */}
      <DispensacionCobrarDialog
        open={Boolean(createdForCobro)}
        onOpenChange={(open) => {
          if (!open) {
            setCreatedForCobro(null);
            router.push("/farmacia/dispensaciones");
          }
        }}
        dispensacion={createdForCobro}
        onSuccessCallback={() => {
          setCreatedForCobro(null);
          router.push("/farmacia/dispensaciones");
        }}
      />

      {/* MODAL DIRECTO DE ENTREGA (SI FUE AUTORIZADA POR ADMISIÓN HOSPITALARIA) */}
      <DispensacionEntregarDialog
        open={Boolean(createdForEntrega)}
        onOpenChange={(open) => {
          if (!open) {
            setCreatedForEntrega(null);
            router.push("/farmacia/dispensaciones");
          }
        }}
        dispensacion={createdForEntrega}
        onSuccessCallback={() => {
          setCreatedForEntrega(null);
          router.push("/farmacia/dispensaciones");
        }}
      />

      {/* MODAL DE CONFIRMACIÓN PARA SALIR CON DATOS CARGADOS */}
      <Dialog open={showConfirmClose} onOpenChange={setShowConfirmClose}>
        <DialogContent className="max-w-md p-5 rounded-xl">
          <DialogHeader className="gap-1.5">
            <DialogTitle className="flex items-center gap-2 text-destructive text-base">
              <AlertTriangle className="size-5" />
              ¿Descartar orden en curso?
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
              Hay medicamentos y datos ingresados en esta orden de dispensación. Si sales ahora, se perderá la información sin emitir a Caja.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowConfirmClose(false)}
              className="text-xs h-8 cursor-pointer"
            >
              Continuar editando
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => {
                setShowConfirmClose(false);
                router.push("/farmacia/dispensaciones");
              }}
              className="text-xs h-8 cursor-pointer"
            >
              Descartar y salir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
