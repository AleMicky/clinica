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
  Minus,
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
  LayoutList,
  Table as TableIcon,
  CreditCard,
  PackageCheck,
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
import { useAuth } from "@/providers/auth-provider";

import {
  useCreateDispensacion,
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
import type {
  CreateDispensacionRequest,
  DispensacionResponse,
  TipoDispensacion,
  MedicamentoStockResponse,
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
  readonly canEditPriceRole: boolean;
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
  canEditPriceRole,
  isPriceUnlocked,
  onTogglePriceUnlock,
}: DetalleRowProps) {
  const {
    currentProductoId,
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

  const isPercentage = descuentoTipo === "porcentaje";

  const hasVisibleError = Boolean(
    productoError || cantidadError || loteError || descuentoError
  );

  return (
    <tr
      id={`detalle-row-${index}`}
      className={cn(
        "group align-middle hover:bg-muted/30 transition-colors border-b border-border/40 last:border-0",
        isDuplicate && "bg-amber-500/5 hover:bg-amber-500/10",
        hasVisibleError && "bg-destructive/5 hover:bg-destructive/10",
        isHighlighted && "bg-teal-500/15 ring-1 ring-teal-500/30"
      )}
    >
      {/* Index */}
      <td className="px-1 py-1.5 text-center text-muted-foreground font-mono text-[11px] w-7">
        <span
          className={cn(
            "size-5 rounded inline-flex items-center justify-center bg-muted/80 text-[10px] font-semibold text-foreground/80",
            hasVisibleError && "bg-destructive/15 text-destructive font-bold"
          )}
        >
          {index + 1}
        </span>
      </td>

      {/* Producto Selector con Autocomplete */}
      <td className="px-2 py-1.5 min-w-0">
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
                placeholder={
                  !almacenId
                    ? "Seleccione un almacén..."
                    : "Buscar por nombre, código..."
                }
                className="h-7 text-xs"
              />
            )}
          />
          <IssueText>{productoError}</IssueText>

          {/* Badges metadata en una sola línea compacta */}
          {selectedMed && (
            <div className="flex items-center gap-1 truncate pt-0.5 text-[9px] text-muted-foreground">
              {selectedMed.codigo && (
                <span className="font-mono bg-muted px-1 py-0.2 rounded text-muted-foreground font-medium shrink-0">
                  {selectedMed.codigo}
                </span>
              )}
              <span className="font-medium text-teal-700 dark:text-teal-300 truncate">
                {getMedicineBrand(selectedMed)}
              </span>
              {selectedMed.unidadMedida && (
                <span className="font-mono text-muted-foreground shrink-0">
                  • {selectedMed.unidadMedida}
                </span>
              )}
              {isDuplicate && (
                <span className="inline-flex items-center gap-0.5 text-amber-600 dark:text-amber-400 font-semibold bg-amber-500/10 px-1 py-0.2 rounded shrink-0">
                  <AlertTriangle className="size-2.5" />
                  Dup
                </span>
              )}
            </div>
          )}
        </div>
      </td>

      {/* Lote / Vencimiento */}
      <td className="px-1.5 py-1.5 w-36">
        {lotes.length > 0 ? (
          <div className="space-y-0.5">
            <select
              {...register(`detalles.${index}.partidaInventarioId`, {
                setValueAs: (v) =>
                  v === "" || v === null ? undefined : Number(v),
              })}
              className={cn(
                "w-full h-7 text-[11px] px-1 rounded-md border border-input bg-background font-mono truncate",
                loteError && "border-destructive text-destructive font-medium"
              )}
            >
              {lotes.map((lt) => (
                <option
                  key={lt.partidaInventarioId}
                  value={lt.partidaInventarioId}
                >
                  {lt.lote || "S/N"} ({lt.cantidadDisponible}
                  {(lt.cantidadReservada ?? 0) > 0 ? ` · Res:${lt.cantidadReservada}` : ""})
                </option>
              ))}
            </select>
            {loteError && (
              <div className="flex items-center gap-1 flex-wrap">
                <span className="text-[10px] leading-tight font-medium text-destructive">
                  {loteError}
                </span>
                {lotes.length > 1 && (
                  <button
                    type="button"
                    onClick={onSplitLots}
                    className="text-[10px] font-semibold text-teal-700 dark:text-teal-300 underline underline-offset-2 hover:text-teal-600 cursor-pointer"
                  >
                    Repartir FEFO
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          <span className="text-[11px] text-muted-foreground italic block text-center truncate">
            {currentProductoId ? "Sin lotes" : "—"}
          </span>
        )}
      </td>

      {/* Stock Disponible */}
      <td className="px-1 py-1.5 w-14 text-center">
        <Badge
          variant="outline"
          className={cn(
            "font-mono text-[10px] px-1 py-0 font-semibold tabular-nums border",
            getStockBadgeClass(stockDisponible)
          )}
        >
          {stockDisponible}
        </Badge>
      </td>

      {/* Cantidad */}
      <td className="px-1 py-1.5 w-16 text-center">
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
            "h-7 text-xs font-mono text-center font-bold px-1 w-12 mx-auto [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
            cantidadError &&
            "border-destructive text-destructive font-bold focus-visible:ring-destructive"
          )}
        />
        <IssueText>{cantidadError}</IssueText>
      </td>

      {/* Precio Unitario */}
      <td className="px-1.5 py-1.5 w-28 text-right">
        <div className="relative flex items-center">
          <span className="absolute left-2 text-[9px] text-muted-foreground font-mono select-none pointer-events-none">
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
              "h-7 text-xs font-mono text-right pl-7 pr-6 font-medium w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
              !isPriceUnlocked &&
              "bg-muted/50 text-foreground cursor-not-allowed opacity-90"
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

      {/* Descuento */}
      <td className="px-1.5 py-1.5 w-26 text-right">
        <div className="space-y-0.5">
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
                "h-7 text-xs font-mono text-right pl-1 pr-1 w-full rounded-r-none border-r-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
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
              className="h-7 px-1.5 text-[9px] font-bold rounded-r-md border border-input bg-muted/40 hover:bg-muted text-foreground transition-colors cursor-pointer shrink-0"
            >
              {isPercentage ? "%" : "Bs"}
            </button>
          </div>
          {isPercentage && descuento > 0 && (
            <p className="text-[8px] text-right text-muted-foreground font-mono leading-none">
              -Bs.{formatBs(descMonto)}
            </p>
          )}
          <IssueText>{descuentoError}</IssueText>
        </div>
      </td>

      {/* Subtotal */}
      <td className="px-1.5 py-1.5 w-24 text-right">
        <div className="h-7 flex items-center justify-end font-mono text-xs font-bold text-teal-600 dark:text-teal-400 tabular-nums whitespace-nowrap">
          Bs. {formatBs(subtotal)}
        </div>
      </td>

      {/* Acciones */}
      <td className="px-1 py-1.5 text-center w-10">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemove}
          disabled={!canRemove}
          title={canRemove ? "Eliminar fila" : "Mínimo 1 fila requerida"}
          className="size-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed transition-colors rounded p-0 mx-auto"
        >
          <Trash2 className="size-3" />
          <span className="sr-only">Eliminar</span>
        </Button>
      </td>
    </tr>
  );
}

/** Tarjeta / Fila de lista individual optimizada para edición cómoda en cualquier pantalla */
function DetalleItemCard({
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
  canEditPriceRole,
  isPriceUnlocked,
  onTogglePriceUnlock,
}: DetalleRowProps) {
  const {
    currentProductoId,
    cantidad,
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

  const isPercentage = descuentoTipo === "porcentaje";

  return (
    <div
      className={cn(
        "p-3.5 sm:p-4 rounded-xl border border-border/80 bg-card space-y-3 shadow-2xs transition-all hover:border-border",
        isDuplicate && "border-amber-500/40 bg-amber-500/5",
        hasIssues(issues) && "border-destructive/40 bg-destructive/5",
        isHighlighted && "bg-teal-500/10 ring-2 ring-teal-500/40 border-teal-500/40"
      )}
    >
      {/* Fila superior: Número, Medicamento Autocomplete y Badges, Botón Eliminar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 pb-2.5 border-b border-border/40">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="size-6 rounded-md inline-flex items-center justify-center bg-teal-500/10 text-teal-700 dark:text-teal-300 text-xs font-bold shrink-0">
            #{index + 1}
          </span>
          <div className="flex-1 min-w-0">
            <Controller
              name={`detalles.${index}.productoId`}
              control={control}
              render={({ field, fieldState }) => (
                <MedicamentoAutocomplete
                  id={`detalle-med-card-${index}`}
                  almacenId={almacenId}
                  value={field.value}
                  onValueChange={(val, med) => {
                    field.onChange(val || 0);
                    handleMedicineChange(med ?? null);
                  }}
                  error={Boolean(fieldState.error) || Boolean(productoError)}
                  placeholder={
                    !almacenId
                      ? "Seleccione un almacén primero..."
                      : "Buscar medicamento o insumo por nombre o código..."
                  }
                  className="h-8.5 text-xs w-full"
                />
              )}
            />
            <IssueText>{productoError}</IssueText>
          </div>
        </div>

        {/* Badges de metadata del medicamento */}
        <div className="flex items-center gap-1.5 flex-wrap shrink-0">
          {selectedMed?.codigo && (
            <span className="font-mono text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground font-medium">
              {selectedMed.codigo}
            </span>
          )}
          {selectedMed && (
            <span className="font-mono text-[10px] bg-teal-500/10 text-teal-700 dark:text-teal-300 px-1.5 py-0.5 rounded font-semibold">
              Marca: {getMedicineBrand(selectedMed)}
            </span>
          )}
          {selectedMed?.unidadMedida && (
            <span className="font-mono text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-semibold">
              {selectedMed.unidadMedida}
            </span>
          )}
          {currentProductoId > 0 && (
            <Badge
              variant="outline"
              className={cn(
                "font-mono text-[10px] px-2 py-0.5 font-semibold",
                getStockBadgeClass(stockDisponible)
              )}
              title={
                (selectedMed?.stockReservado ?? 0) > 0
                  ? `Físico: ${selectedMed?.stockFisico ?? stockDisponible} · Reservado en órdenes pendientes: ${selectedMed?.stockReservado}`
                  : undefined
              }
            >
              Disp: {stockDisponible}
              {(selectedMed?.stockReservado ?? 0) > 0 && ` (Res: ${selectedMed?.stockReservado})`}
            </Badge>
          )}

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onRemove}
            disabled={!canRemove}
            title={canRemove ? "Eliminar artículo de la lista" : "Mínimo 1 artículo requerido"}
            className="size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md cursor-pointer disabled:opacity-20 shrink-0 ml-1"
          >
            <Trash2 className="size-3.5" />
            <span className="sr-only">Eliminar</span>
          </Button>
        </div>
      </div>

      {/* Fila inferior: Controles organizados y cómodos para editar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
        {/* Lote & Vencimiento */}
        <div className={cn(lotes.length > 0 ? "lg:col-span-4" : "lg:col-span-3", "space-y-1")}>
          <div className="flex items-center justify-between">
            <Label className="text-[11px] text-muted-foreground font-medium">
              Lote & Vencimiento
            </Label>
            {lotes.length > 1 && (
              <button
                type="button"
                onClick={onSplitLots}
                className="text-[10px] text-teal-700 dark:text-teal-300 underline font-semibold hover:text-teal-800 cursor-pointer"
              >
                Repartir FEFO
              </button>
            )}
          </div>
          {lotes.length > 0 ? (
            <>
              <select
                {...register(`detalles.${index}.partidaInventarioId`, {
                  setValueAs: (v) =>
                    v === "" || v === null ? undefined : Number(v),
                })}
                className={cn(
                  "w-full h-8.5 text-xs px-2.5 rounded-md border border-input bg-background font-mono truncate focus-visible:ring-1 focus-visible:ring-teal-500",
                  loteError && "border-destructive text-destructive font-medium"
                )}
              >
                {lotes.map((lt) => (
                  <option
                    key={lt.partidaInventarioId}
                    value={lt.partidaInventarioId}
                  >
                    {lt.lote || "S/N"} · {lt.fechaVencimiento ? formatDate(lt.fechaVencimiento) : "S/V"} (Disp: {lt.cantidadDisponible}
                    {(lt.cantidadReservada ?? 0) > 0 ? ` · Res: ${lt.cantidadReservada}` : ""})
                  </option>
                ))}
              </select>
              <IssueText>{loteError}</IssueText>
            </>
          ) : (
            <div className="h-8.5 px-2.5 rounded-md border border-border/40 bg-muted/30 text-muted-foreground text-xs font-mono flex items-center">
              {currentProductoId ? "Sin lotes disponibles" : "—"}
            </div>
          )}
        </div>

        {/* Cantidad (+/- táctil y numérico) */}
        <div className={cn(lotes.length > 0 ? "lg:col-span-2" : "lg:col-span-2", "space-y-1")}>
          <Label className="text-[11px] text-muted-foreground font-medium">
            Cantidad *
          </Label>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => {
                const nextVal = Math.max(1, cantidad - 1);
                setValue(`detalles.${index}.cantidad`, nextVal);
              }}
              disabled={cantidad <= 1}
              className="size-8.5 shrink-0 cursor-pointer"
            >
              <Minus className="size-3" />
            </Button>
            <Input
              type="number"
              step="any"
              min="1"
              onWheel={blurOnWheel}
              {...register(`detalles.${index}.cantidad`, {
                valueAsNumber: true,
              })}
              className={cn(
                "h-8.5 text-xs font-mono text-center font-bold px-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                cantidadError && "border-destructive focus-visible:ring-destructive text-destructive"
              )}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => {
                setValue(`detalles.${index}.cantidad`, cantidad + 1);
              }}
              className="size-8.5 shrink-0 cursor-pointer"
            >
              <Plus className="size-3" />
            </Button>
          </div>
          <IssueText>{cantidadError}</IssueText>
        </div>

        {/* Precio Unitario */}
        <div className={cn(lotes.length > 0 ? "lg:col-span-2" : "lg:col-span-3", "space-y-1")}>
          <div className="flex items-center justify-between">
            <Label className="text-[11px] text-muted-foreground font-medium">
              P. Unitario
            </Label>
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
              className="text-muted-foreground hover:text-foreground cursor-pointer p-0.5"
            >
              {isPriceUnlocked ? (
                <Unlock className="size-3 text-teal-600" />
              ) : (
                <Lock className="size-3" />
              )}
            </button>
          </div>
          <div className="relative flex items-center">
            <span className="absolute left-2.5 text-[10px] text-muted-foreground font-medium pointer-events-none select-none">
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
              className={cn(
                "h-8.5 text-xs font-mono text-right pl-8 pr-2.5 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                !isPriceUnlocked && "bg-muted/50 cursor-not-allowed opacity-90"
              )}
            />
          </div>
        </div>

        {/* Descuento */}
        <div className={cn(lotes.length > 0 ? "lg:col-span-2" : "lg:col-span-2", "space-y-1")}>
          <div className="flex items-center justify-between">
            <Label className="text-[11px] text-muted-foreground font-medium">
              Descuento
            </Label>
            <button
              type="button"
              onClick={() => {
                setValue(
                  `detalles.${index}.descuentoTipo`,
                  isPercentage ? "monto" : "porcentaje"
                );
                setValue(`detalles.${index}.descuento`, 0);
              }}
              className="text-[10px] font-bold text-teal-700 dark:text-teal-300 underline cursor-pointer"
            >
              {isPercentage ? "% Porc." : "Bs. Monto"}
            </button>
          </div>
          <div className="relative flex items-center">
            <span className="absolute left-2.5 text-[10px] text-muted-foreground font-medium pointer-events-none select-none">
              {isPercentage ? "%" : "Bs."}
            </span>
            <Input
              type="number"
              step={isPercentage ? "1" : "0.01"}
              min="0"
              max={isPercentage ? 100 : undefined}
              onWheel={blurOnWheel}
              {...register(`detalles.${index}.descuento`, {
                setValueAs: (v) => (v === "" || v === null ? 0 : Number(v)),
              })}
              className="h-8.5 text-xs font-mono text-right pl-7 pr-2.5 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
          <IssueText>{descuentoError}</IssueText>
        </div>

        {/* Subtotal */}
        <div className={cn(lotes.length > 0 ? "lg:col-span-2" : "lg:col-span-2", "text-right space-y-0.5 pb-0.5")}>
          <Label className="text-[11px] text-muted-foreground font-medium block">
            Subtotal
          </Label>
          <div className="font-mono font-bold text-teal-600 dark:text-teal-400 text-sm h-8.5 flex items-center justify-end">
            Bs. {formatBs(subtotal)}
          </div>
          {descMonto > 0 && (
            <p className="text-[9px] text-amber-600 dark:text-amber-400 font-mono -mt-1">
              Desc: -Bs. {formatBs(descMonto)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export function DispensacionPageForm() {
  const router = useRouter();
  const { hasAnyRole } = useAuth();
  const canEditPriceRole = hasAnyRole([
    "admin",
    "administrador",
    "farmaceutico_jefe",
    "supervisor",
    "gerente",
  ]);

  const { data: almacenesData } = useAlmacenes({ pageSize: 50 });
  const almacenes = almacenesData?.items ?? [];

  // Búsqueda de Pacientes con debounce
  const [pacienteSearch, setPacienteSearch] = React.useState("");
  const [debouncedPacienteSearch, setDebouncedPacienteSearch] =
    React.useState("");

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

  // Búsqueda de Médicos con debounce
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

  // Búsqueda de Admisiones hospitalarias / emergencias
  const [admisionSearch, setAdmisionSearch] = React.useState("");
  const [debouncedAdmisionSearch, setDebouncedAdmisionSearch] = React.useState("");

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedAdmisionSearch(admisionSearch.trim());
    }, 250);
    return () => clearTimeout(timer);
  }, [admisionSearch]);

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

  const admisionOptions = React.useMemo<AutocompleteOption[]>(() => {
    const items = admisionesData?.items ?? [];
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
      return {
        value: String(a.id),
        label: `${a.numero} · ${pacNom}`,
        description: `Fecha: ${formatDate(a.fechaHora)}${
          a.convenioNombre ? ` · Convenio: ${a.convenioNombre}` : ""
        }`,
      };
    });
  }, [admisionesData, watchedPacienteId]);

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
  const [viewMode, setViewMode] = React.useState<"lista" | "tabla">("lista");

  // Verificar si hay datos cargados para evitar pérdida accidental
  const isFormDirty = React.useMemo(() => {
    const hasProducts = watchedDetalles.some(
      (d) => Number(d?.productoId) > 0 || (Number(d?.cantidad) || 0) > 1
    );
    const hasMultipleRows = watchedDetalles.length > 1;
    const hasClientText =
      Boolean(watch("clienteNombre")?.trim()) ||
      Boolean(watch("clienteDocumento")?.trim());
    const hasObs = Boolean(watch("observaciones")?.trim());
    const hasPatient = Boolean(watch("pacienteId"));
    return (
      hasProducts || hasMultipleRows || hasClientText || hasObs || hasPatient
    );
  }, [watchedDetalles, watch]);

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
      if (!selectedAlmacenId) {
        issues.producto = "Seleccione un almacén emisor primero";
      } else if (!pid || pid <= 0) {
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
            issues.lote = `El lote ${chosenLot.lote || "S/N"
              } no tiene existencias`;
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
          issues.descuento = `Descuento supera el subtotal bruto (Bs. ${formatBs(
            subtotalBruto
          )})`;
        }
      }

      return issues;
    });
  }, [watchedDetalles, stockMedicamentos, selectedAlmacenId]);

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
        const totalCant =
          (Number(existing.cantidad) || 0) + (Number(d.cantidad) || 0);
        const totalDesc =
          getRowDescuentoMonto(existing) + getRowDescuentoMonto(d);
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

  const handleSplitLots = (rowIndex: number) => {
    const item = watchedDetalles[rowIndex];
    if (!item) return;

    const med = stockMedicamentos.find(
      (m) => m.productoId === Number(item.productoId)
    );
    if (!med || med.lotes.length <= 1) return;

    let requestedTotal = Number(item.cantidad) || 0;
    if (requestedTotal > med.stockDisponible) {
      toast.error(
        `La cantidad (${requestedTotal}) supera el stock total disponible (${med.stockDisponible}).`
      );
      return;
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

    if (splitRows.length === 0) return;

    setValue(`detalles.${rowIndex}`, splitRows[0]);

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
  const handleSaveOrder = async (
    values: FormValues,
    action: "close" | "new_order" | "pay_and_deliver"
  ) => {
    setAttemptedSubmit(true);

    if (isAlmacenRequiredAndMissing) {
      toast.error("Debe seleccionar un almacén emisor.");
      return;
    }

    if (values.detalles.length === 0) {
      toast.error("Debe agregar al menos un medicamento a la orden.");
      return;
    }

    if (isPacienteRequiredAndMissing) {
      toast.error(
        "Debe seleccionar un paciente registrado con historia clínica."
      );
      return;
    }

    if (hasAnyRowIssues) {
      toast.error(
        "Existen filas con errores de stock, lotes o descuentos. Corríjalos para continuar."
      );
      return;
    }

    try {
      const payload: CreateDispensacionRequest = {
        tipo: values.tipo,
        fecha: values.fecha
          ? new Date(values.fecha).toISOString()
          : new Date().toISOString(),
        almacenId: Number(values.almacenId),
        pacienteId:
          !values.isWalkIn && values.pacienteId
            ? Number(values.pacienteId)
            : undefined,
        admisionId:
          !values.isWalkIn && values.admisionId
            ? Number(values.admisionId)
            : undefined,
        clienteNombre: values.isWalkIn
          ? values.clienteNombre?.trim()
          : undefined,
        clienteDocumento: values.isWalkIn
          ? values.clienteDocumento?.trim()
          : undefined,
        medicoId: values.medicoId ? Number(values.medicoId) : undefined,
        observaciones: values.observaciones?.trim(),
        detalles: values.detalles.map((d) => {
          const descMonto = getRowDescuentoMonto(d);
          return {
            productoId: Number(d.productoId),
            partidaInventarioId: d.partidaInventarioId
              ? Number(d.partidaInventarioId)
              : undefined,
            cantidad: Number(d.cantidad),
            precioUnitario: Number(d.precioUnitario),
            descuento: Number(descMonto.toFixed(2)),
            indicaciones: d.indicaciones?.trim(),
          };
        }),
      };

      const res = await createMutation.mutateAsync(payload);

      if (action === "pay_and_deliver") {
        if (res.estado === "Pagado") {
          toast.success(
            `Dispensación "${res.numero}" autorizada con cargo a Admisión ${res.admisionNumero || ""}. Confirme la entrega física.`
          );
          setCreatedForEntrega(res);
        } else {
          toast.success(
            `Dispensación "${res.numero}" emitida y stock reservado. Complete el cobro y despacho a continuación.`
          );
          setCreatedForCobro(res);
        }
        return;
      }

      toast.success(
        res.estado === "Pagado"
          ? `Dispensación "${res.numero}" emitida con cargo a Admisión ${res.admisionNumero || ""} y lista para entrega.`
          : `Dispensación "${res.numero}" emitida con stock reservado y enviada a Cobros de Caja.`
      );

      if (action === "new_order") {
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
      } else {
        router.push("/farmacia/dispensaciones");
      }
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error));
    }
  };

  // Atajos de teclado: F2 para agregar fila, Ctrl+Enter / Cmd+Enter para emitir
  React.useEffect(() => {
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
  }, [handleAddRow, handleSubmit]);

  const isSaving = createMutation.isPending || isSubmitting;

  const renderDetallesRows = () => {
    if (loadingStock) {
      return (
        <tr>
          <td
            colSpan={9}
            className="px-3 py-8 text-center text-muted-foreground text-xs"
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
            className="px-3 py-10 text-center text-muted-foreground text-xs"
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
          canEditPriceRole={canEditPriceRole}
          isPriceUnlocked={Boolean(unlockedPriceRows[idx] || canEditPriceRole)}
          onTogglePriceUnlock={() => {
            if (!canEditPriceRole) {
              toast.warning(
                "Permiso restringido: solo administradores o farmacéuticos jefes pueden modificar precios de venta."
              );
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
    <div className="flex flex-col gap-4 w-full max-w-7xl mx-auto pb-12">
      {/* HEADER DE PÁGINA */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3.5 bg-card border border-border/60 rounded-xl p-3.5 sm:p-4 shadow-2xs">
        <div className="flex items-start sm:items-center gap-3 min-w-0">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleBackNavigation}
            className="size-8.5 rounded-lg border border-border/60 hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer shrink-0 mt-0.5 sm:mt-0"
            title="Volver al listado"
          >
            <ArrowLeft className="size-4" />
          </Button>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-foreground">
                Nueva Dispensación y Venta de Farmacia
              </h1>
              <Badge
                variant="outline"
                className="text-[10px] h-5 px-2 font-semibold text-teal-700 dark:text-teal-300 border-teal-500/30 bg-teal-500/10 shrink-0 gap-1"
              >
                <ShoppingBag className="size-2.5" />
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
                className="text-[10px] h-5 px-2 font-medium text-amber-700 dark:text-amber-300 border-amber-500/30 bg-amber-500/10 shrink-0 gap-1"
              >
                <Clock className="size-2.5" />
                <span>Pase a Cobro en Caja</span>
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground leading-normal mt-0.5">
              Emisión con control FEFO de lotes, cálculo automático de importes y ticket para cobro en caja central.
            </p>
          </div>
        </div>
      </div>

      {/* CUERPO DEL FORMULARIO */}
      <form
        id="dispensacion-page-form"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit((vals) => handleSaveOrder(vals, "close"))();
        }}
        className="flex flex-col gap-4 text-xs"
      >
        {/* SECCIÓN 1: DATOS GENERALES Y DESTINATARIO */}
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

          {/* Grid responsive de 1 columna (móvil), 2 columnas (tablet) y 3 columnas (desktop) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {/* Almacén */}
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

            {/* Tipo */}
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

            {/* Fecha y Hora */}
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

            {/* Modalidad de Cliente */}
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

            {/* Datos según modalidad */}
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
                          const nextPacId = v ? Number(v) : undefined;
                          field.onChange(nextPacId);
                          setValue("admisionId", undefined);
                        }}
                        onSearchChange={setPacienteSearch}
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
                            const found = (admisionesData?.items ?? []).find(
                              (a) => a.id === admId
                            );
                            const pacId =
                              found?.pacienteId ?? found?.paciente?.id;
                            if (pacId) {
                              setValue("pacienteId", pacId);
                            }
                          }
                        }}
                        onSearchChange={setAdmisionSearch}
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

            {/* Médico Prescriptor */}
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
                    onValueChange={(v) =>
                      field.onChange(v ? Number(v) : undefined)
                    }
                    onSearchChange={setMedicoSearch}
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

            {/* Observaciones */}
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

              {/* Selector de modo de vista: Lista vs Tabla */}
              <div className="hidden sm:inline-flex items-center bg-muted/60 p-0.5 rounded-lg border border-border/40 ml-1">
                <button
                  type="button"
                  onClick={() => setViewMode("lista")}
                  className={cn(
                    "px-2 py-0.5 text-[11px] rounded-md font-medium transition-all flex items-center gap-1 cursor-pointer",
                    viewMode === "lista"
                      ? "bg-background text-teal-700 dark:text-teal-300 shadow-xs font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  title="Vista lista / tarjetas amplias (más cómoda para editar)"
                >
                  <LayoutList className="size-3" />
                  <span>Lista</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("tabla")}
                  className={cn(
                    "px-2 py-0.5 text-[11px] rounded-md font-medium transition-all flex items-center gap-1 cursor-pointer",
                    viewMode === "tabla"
                      ? "bg-background text-teal-700 dark:text-teal-300 shadow-xs font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  title="Vista tabla compacta POS"
                >
                  <TableIcon className="size-3" />
                  <span>Tabla</span>
                </button>
              </div>
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

          {/* VISTA LISTA / TARJETAS (Predeterminada, cómoda y amplia para editar en cualquier pantalla) */}
          {viewMode === "lista" ? (
            <div className="space-y-3">
              {fields.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground border border-dashed rounded-xl bg-muted/10 space-y-2">
                  <Package className="size-8 text-muted-foreground/40 mx-auto" />
                  <p className="text-xs font-medium">No hay medicamentos en la orden.</p>
                  <p className="text-[11px] text-muted-foreground">
                    Usa el buscador rápido de arriba o presiona{" "}
                    <kbd className="px-1 py-0.5 rounded bg-muted font-mono text-[10px] border">
                      F2
                    </kbd>{" "}
                    para agregar una línea.
                  </p>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleAddRow}
                    className="mt-2 text-xs h-8 text-teal-600 border-teal-500/30 hover:bg-teal-500/10 cursor-pointer"
                  >
                    <Plus className="size-3.5 mr-1" />
                    Agregar Medicamento
                  </Button>
                </div>
              ) : (
                fields.map((field, idx) => (
                  <DetalleItemCard
                    key={field.id}
                    index={idx}
                    almacenId={selectedAlmacenId}
                    control={control}
                    register={register}
                    setValue={setValue}
                    onRemove={() => remove(idx)}
                    onSplitLots={() => handleSplitLots(idx)}
                    canRemove={fields.length > 1}
                    isDuplicate={duplicateProductIds.has(
                      Number(watchedDetalles[idx]?.productoId)
                    )}
                    isHighlighted={highlightedRowIndex === idx}
                    issues={rowsIssues[idx]}
                    showRequiredErrors={attemptedSubmit}
                    stockMedicamentos={stockMedicamentos}
                    canEditPriceRole={canEditPriceRole}
                    isPriceUnlocked={Boolean(
                      unlockedPriceRows[idx] || canEditPriceRole
                    )}
                    onTogglePriceUnlock={() => {
                      if (!canEditPriceRole) {
                        toast.warning(
                          "Solo administradores pueden modificar precios."
                        );
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
          ) : (
            /* VISTA TABLA (Activa cuando se selecciona el modo 'Tabla') */
            <>
              {/* En móviles siempre muestra tarjetas cómodas */}
              <div className="lg:hidden space-y-3">
                {fields.map((field, idx) => (
                  <DetalleItemCard
                    key={field.id}
                    index={idx}
                    almacenId={selectedAlmacenId}
                    control={control}
                    register={register}
                    setValue={setValue}
                    onRemove={() => remove(idx)}
                    onSplitLots={() => handleSplitLots(idx)}
                    canRemove={fields.length > 1}
                    isDuplicate={duplicateProductIds.has(
                      Number(watchedDetalles[idx]?.productoId)
                    )}
                    isHighlighted={highlightedRowIndex === idx}
                    issues={rowsIssues[idx]}
                    showRequiredErrors={attemptedSubmit}
                    stockMedicamentos={stockMedicamentos}
                    canEditPriceRole={canEditPriceRole}
                    isPriceUnlocked={Boolean(
                      unlockedPriceRows[idx] || canEditPriceRole
                    )}
                    onTogglePriceUnlock={() => {
                      if (!canEditPriceRole) {
                        toast.warning(
                          "Solo administradores pueden modificar precios."
                        );
                        return;
                      }
                      setUnlockedPriceRows((prev) => ({
                        ...prev,
                        [idx]: !prev[idx],
                      }));
                    }}
                  />
                ))}
              </div>

              {/* En pantallas grandes (lg+) muestra la tabla mejorada sin solapamientos */}
              <div className="hidden lg:block rounded-xl border border-border/40 bg-card overflow-x-auto shadow-2xs">
                <table className="w-full min-w-[960px] table-fixed text-left text-xs border-collapse">
                  <thead className="bg-muted/40 border-b border-border/40 text-muted-foreground font-semibold text-[10px] uppercase tracking-wider">
                    <tr>
                      <th className="px-1 py-2 w-8 text-center whitespace-nowrap">#</th>
                      <th className="px-2 py-2 min-w-0 whitespace-nowrap">
                        Medicamento / Insumo *
                      </th>
                      <th className="px-1.5 py-2 w-36 whitespace-nowrap">
                        Lote / Vcto
                      </th>
                      <th className="px-1 py-2 w-14 text-center whitespace-nowrap">Stock</th>
                      <th className="px-1 py-2 w-16 text-center whitespace-nowrap">Cant. *</th>
                      <th className="px-1.5 py-2 w-28 text-right whitespace-nowrap">
                        P. Unit.
                      </th>
                      <th className="px-1.5 py-2 w-26 text-right whitespace-nowrap">
                        Desc.
                      </th>
                      <th className="px-1.5 py-2 w-24 text-right whitespace-nowrap">
                        Subtotal
                      </th>
                      <th className="px-1 py-2 w-10 text-center whitespace-nowrap">
                        <span className="sr-only">Acciones</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {renderDetallesRows()}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* FOOTER UNIFICADO DE TOTALES Y ACCIONES */}
        <div className="rounded-xl bg-card border border-border/50 p-3.5 sm:p-5 flex flex-col gap-4 shadow-xs">
          {/* Fila 1: Resumen y Total a Cobrar */}
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

          {/* Fila 2: Acciones de emisión */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleBackNavigation}
              disabled={isSaving}
              className="w-full sm:w-auto h-8.5 px-4 text-xs cursor-pointer order-2 sm:order-1"
            >
              Cancelar
            </Button>

            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2.5 justify-end order-1 sm:order-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isSaving || fields.length === 0}
                onClick={() =>
                  handleSubmit((vals) => handleSaveOrder(vals, "new_order"))()
                }
                className="w-full sm:w-auto h-8.5 px-4 text-xs text-teal-700 dark:text-teal-300 border-teal-500/30 hover:bg-teal-500/10 font-medium cursor-pointer"
              >
                {isSaving ? (
                  <Loader2 className="size-3.5 animate-spin mr-1.5" />
                ) : (
                  <Plus className="size-3.5 mr-1.5" />
                )}
                <span>Emitir y nueva</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isSaving || fields.length === 0}
                onClick={() =>
                  handleSubmit((vals) =>
                    handleSaveOrder(vals, "pay_and_deliver")
                  )()
                }
                className="w-full sm:w-auto h-8.5 px-4 text-xs text-amber-700 dark:text-amber-300 border-amber-500/40 bg-amber-500/5 hover:bg-amber-500/15 font-semibold cursor-pointer gap-1.5"
              >
                {watchedAdmisionId &&
                (selectedTipo === "Hospitalaria" ||
                  selectedTipo === "Urgencia") ? (
                  <>
                    <PackageCheck className="size-3.5 text-emerald-600" />
                    <span>Emitir y Entregar Stock</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="size-3.5 text-amber-600" />
                    <span>Emitir y Cobrar / Despachar</span>
                  </>
                )}
              </Button>

              <Button
                type="button"
                size="sm"
                disabled={isSaving || fields.length === 0}
                onClick={() =>
                  handleSubmit((vals) => handleSaveOrder(vals, "close"))()
                }
                className="w-full sm:w-auto h-8.5 px-5 text-xs bg-teal-600 hover:bg-teal-700 text-white font-medium gap-1.5 cursor-pointer shadow-xs transition-all"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>Emitiendo...</span>
                  </>
                ) : (
                  <>
                    <Check className="size-3.5" />
                    <span>Emitir Orden</span>
                    <kbd className="hidden sm:inline-block ml-1 text-[9px] px-1 py-0.2 rounded bg-teal-800 text-white font-mono opacity-90">
                      Ctrl+↵
                    </kbd>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
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
