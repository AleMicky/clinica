"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Loader2,
  ArrowLeftRight,
  Store,
  Coins,
  Wallet,
  FileText,
  CheckCircle2,
  Plus,
  Tag,
  AlertTriangle,
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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useTurnosCaja } from "../../turno-caja/hooks/use-turnos-caja";
import { useMonedas } from "@/modules/parametros/moneda/hooks/use-monedas";
import {
  movimientoCajaSchema,
  type MovimientoCajaFormValues,
} from "../schemas/movimiento-caja.schema";
import {
  useCreateMovimientoCaja,
  useUpdateMovimientoCaja,
  useTiposMovimientoCaja,
  useConceptosMovimientoCaja,
} from "../hooks/use-movimientos-caja";
import { useCreateConceptoMovimientoCaja } from "../../tipo-movimiento";
import type {
  MovimientoCajaResponse,
  TipoMovimientoCajaInfo,
} from "../types/movimiento-caja.types";
import type { ConceptoMovimientoCajaInfo } from "../../tipo-movimiento/types/concepto-movimiento.types";

interface MovimientoCajaFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  movimientoToEdit?: MovimientoCajaResponse | null;
  onSuccessCallback?: () => void;
}

interface QuickCreateConceptoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tipoPadre: TipoMovimientoCajaInfo | null;
  conceptosExistentes: ConceptoMovimientoCajaInfo[];
  onConceptoCreated: (concepto: ConceptoMovimientoCajaInfo) => void;
}

function QuickCreateConceptoDialog({
  open,
  onOpenChange,
  tipoPadre,
  conceptosExistentes,
  onConceptoCreated,
}: Readonly<QuickCreateConceptoDialogProps>) {
  const [nombre, setNombre] = React.useState("");
  const [codigo, setCodigo] = React.useState("");
  const [descripcion, setDescripcion] = React.useState("");
  const [errorNombre, setErrorNombre] = React.useState<string | null>(null);
  const [errorCodigo, setErrorCodigo] = React.useState<string | null>(null);
  const [duplicateMatch, setDuplicateMatch] =
    React.useState<ConceptoMovimientoCajaInfo | null>(null);

  const createMutation = useCreateConceptoMovimientoCaja();

  const handleNombreChange = (val: string) => {
    setNombre(val);
    const trimmed = val.trim().toLowerCase();
    if (!trimmed) {
      setErrorNombre(null);
      setDuplicateMatch(null);
      return;
    }

    const match = conceptosExistentes.find(
      (c) => c.nombre.trim().toLowerCase() === trimmed
    );

    if (match) {
      setErrorNombre(
        `Ya existe un concepto registrado con el nombre "${match.nombre}" para este tipo.`
      );
      setDuplicateMatch(match);
    } else {
      setErrorNombre(null);
      setDuplicateMatch(null);
    }
  };

  const handleCodigoChange = (val: string) => {
    setCodigo(val);
    const upper = val.trim().toUpperCase();
    if (!upper) {
      setErrorCodigo(null);
      return;
    }

    const matchCode = conceptosExistentes.find(
      (c) => c.codigo.trim().toUpperCase() === upper
    );
    if (matchCode) {
      setErrorCodigo(`El código "${upper}" ya está en uso por otro concepto.`);
    } else {
      setErrorCodigo(null);
    }
  };

  const handleSelectExisting = (match: ConceptoMovimientoCajaInfo) => {
    onConceptoCreated(match);
    toast.info(`Se seleccionó el concepto existente "${match.nombre}".`);
    onOpenChange(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tipoPadre) return;

    const trimmedNombre = nombre.trim();
    if (!trimmedNombre) {
      setErrorNombre("El nombre del concepto es obligatorio.");
      return;
    }

    // Validación estricta de no duplicidad
    const match = conceptosExistentes.find(
      (c) => c.nombre.trim().toLowerCase() === trimmedNombre.toLowerCase()
    );
    if (match) {
      setErrorNombre(
        `No se puede duplicar: Ya existe el concepto "${match.nombre}".`
      );
      setDuplicateMatch(match);
      return;
    }

    // Generar o validar código
    let finalCodigo = codigo.trim().toUpperCase();
    if (!finalCodigo) {
      const prefix = tipoPadre.codigo?.slice(0, 3).toUpperCase() || "MOV";
      const slug =
        trimmedNombre.replace(/[^a-zA-Z0-9]/g, "").slice(0, 4).toUpperCase() ||
        "CON";
      finalCodigo = `${prefix}-${slug}`;

      if (
        conceptosExistentes.some((c) => c.codigo.toUpperCase() === finalCodigo)
      ) {
        finalCodigo = `${finalCodigo}-${conceptosExistentes.length + 1}`;
      }
    } else {
      if (
        conceptosExistentes.some((c) => c.codigo.toUpperCase() === finalCodigo)
      ) {
        setErrorCodigo(`El código "${finalCodigo}" ya existe.`);
        return;
      }
    }

    try {
      const nuevo = await createMutation.mutateAsync({
        tipoMovimientoCajaId: tipoPadre.id,
        codigo: finalCodigo,
        nombre: trimmedNombre,
        descripcion: descripcion.trim() || null,
      });

      toast.success(
        `Concepto "${nuevo.nombre}" registrado y seleccionado correctamente.`
      );
      onConceptoCreated(nuevo);
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { detail?: string; message?: string } };
        message?: string;
      };
      toast.error(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          err.message ||
          "Error al registrar el concepto."
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary">
            <Tag className="size-4" />
            <DialogTitle className="text-sm font-bold">
              Nuevo Concepto para: {tipoPadre?.nombre || "Movimiento"}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs">
            Registre un nuevo motivo o concepto contable para clasificar este movimiento de caja.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-3 py-1">
          {/* Nombre */}
          <div className="space-y-1.5">
            <Label htmlFor="quick-nombre" className="required font-medium text-xs">
              Nombre del Concepto
            </Label>
            <Input
              id="quick-nombre"
              placeholder="Ej: Pago de flete, Servicios de aseo..."
              value={nombre}
              onChange={(e) => handleNombreChange(e.target.value)}
              className="h-9 text-xs"
              autoFocus
              disabled={createMutation.isPending}
            />
            {errorNombre && (
              <p className="text-xs text-destructive font-medium">{errorNombre}</p>
            )}
          </div>

          {/* Alerta de duplicidad con acción rápida */}
          {duplicateMatch && (
            <div className="rounded-md bg-amber-500/10 border border-amber-500/30 p-2.5 text-xs text-amber-800 dark:text-amber-400 space-y-2">
              <div className="flex items-center gap-1.5 font-semibold">
                <AlertTriangle className="size-3.5 text-amber-600" />
                <span>Concepto existente detectado</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                El concepto <strong>&quot;{duplicateMatch.nombre}&quot;</strong> ya se encuentra registrado. Para evitar duplicados en los reportes contables, puede seleccionarlo directamente:
              </p>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => handleSelectExisting(duplicateMatch)}
                className="h-7 text-xs w-full bg-background font-semibold"
              >
                Seleccionar &quot;{duplicateMatch.nombre}&quot;
              </Button>
            </div>
          )}

          {/* Código (Opcional) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="quick-codigo" className="font-medium text-xs">
                Código Contable <span className="text-[10px] text-muted-foreground">(Opcional)</span>
              </Label>
              <span className="text-[10px] text-muted-foreground">
                Se autogenerará si se deja vacío
              </span>
            </div>
            <Input
              id="quick-codigo"
              placeholder={`Ej: ${tipoPadre?.codigo || "MOV"}-FLET`}
              value={codigo}
              onChange={(e) => handleCodigoChange(e.target.value)}
              className="h-9 text-xs font-mono uppercase"
              disabled={createMutation.isPending}
            />
            {errorCodigo && (
              <p className="text-xs text-destructive font-medium">{errorCodigo}</p>
            )}
          </div>

          {/* Descripción */}
          <div className="space-y-1.5">
            <Label htmlFor="quick-desc" className="font-medium text-xs">
              Descripción / Notas <span className="text-[10px] text-muted-foreground">(Opcional)</span>
            </Label>
            <Textarea
              id="quick-desc"
              rows={2}
              placeholder="Notas aclaratorias sobre cuándo aplicar este concepto..."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="text-xs resize-none min-h-[44px]"
              disabled={createMutation.isPending}
            />
          </div>

          <DialogFooter className="pt-2 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={createMutation.isPending}
              className="h-8 text-xs"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={
                createMutation.isPending ||
                !nombre.trim() ||
                Boolean(errorNombre) ||
                Boolean(errorCodigo)
              }
              className="h-8 gap-1.5 text-xs font-semibold"
            >
              {createMutation.isPending && (
                <Loader2 className="size-3.5 animate-spin" />
              )}
              <span>Guardar y Seleccionar</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function MovimientoCajaFormDialog({
  open,
  onOpenChange,
  movimientoToEdit,
  onSuccessCallback,
}: Readonly<MovimientoCajaFormDialogProps>) {
  const isEditing = !!movimientoToEdit;
  const [createConceptoDialogOpen, setCreateConceptoDialogOpen] =
    React.useState(false);

  // Turnos de Caja
  const { data: turnosData, isLoading: isLoadingTurnos } = useTurnosCaja(
    { page: 1, pageSize: 100 },
    open
  );

  // Tipos de Movimiento
  const { data: tiposData, isLoading: isLoadingTipos } =
    useTiposMovimientoCaja(undefined, open);

  // Monedas
  const { data: monedasData, isLoading: isLoadingMonedas } = useMonedas({
    page: 1,
    pageSize: 50,
  });

  const createMutation = useCreateMovimientoCaja();
  const updateMutation = useUpdateMovimientoCaja();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<MovimientoCajaFormValues>({
    resolver: zodResolver(movimientoCajaSchema),
    defaultValues: {
      turnoCajaId: 0,
      tipoMovimientoCajaId: 0,
      conceptoMovimientoCajaId: 0,
      monedaId: 0,
      monto: 0,
      tipoCambio: 1,
      referencia: "",
      observacion: "",
    },
  });

  const selectedTurnoId = watch("turnoCajaId");
  const selectedTipoId = watch("tipoMovimientoCajaId");
  const selectedConceptoId = watch("conceptoMovimientoCajaId");
  const selectedMonedaId = watch("monedaId");
  const enteredMonto = watch("monto");
  const enteredTipoCambio = watch("tipoCambio");

  // Conceptos filtrados por Tipo
  const { data: conceptosData, isLoading: isLoadingConceptos } =
    useConceptosMovimientoCaja(
      selectedTipoId ? Number(selectedTipoId) : undefined,
      open && !!selectedTipoId
    );

  const turnosList = React.useMemo(() => {
    return Array.isArray(turnosData?.items)
      ? turnosData.items
      : Array.isArray(turnosData)
      ? turnosData
      : [];
  }, [turnosData]);

  const selectedTurno = React.useMemo(() => {
    const found = turnosList.find((t) => t.id === Number(selectedTurnoId));
    if (found) return found;
    if (
      movimientoToEdit?.turnoCaja &&
      movimientoToEdit.turnoCaja.id === Number(selectedTurnoId)
    ) {
      return movimientoToEdit.turnoCaja;
    }
    return null;
  }, [turnosList, selectedTurnoId, movimientoToEdit]);

  // Lista de turnos disponibles incluyendo el turno histórico en caso de edición
  const availableTurnos = React.useMemo(() => {
    const list = [...turnosList];
    if (
      movimientoToEdit?.turnoCaja &&
      !list.some((t) => t.id === movimientoToEdit.turnoCaja?.id)
    ) {
      list.unshift(movimientoToEdit.turnoCaja);
    }
    return list;
  }, [turnosList, movimientoToEdit]);

  const monedasList = React.useMemo(() => {
    return Array.isArray(monedasData?.items)
      ? monedasData.items
      : Array.isArray(monedasData)
      ? monedasData
      : [];
  }, [monedasData]);

  const monedaBase = React.useMemo(() => {
    return monedasList.find((m) => m.esBase) || monedasList[0];
  }, [monedasList]);

  const selectedMoneda = React.useMemo(() => {
    return monedasList.find((m) => m.id === Number(selectedMonedaId));
  }, [monedasList, selectedMonedaId]);

  const isMonedaBase = !selectedMoneda || selectedMoneda.esBase;
  const monedaSimbolo = selectedMoneda?.simbolo || (monedaBase?.simbolo ?? "Bs.");

  // Info del Tipo seleccionado
  const selectedTipo = React.useMemo(() => {
    return tiposData?.find((t) => t.id === Number(selectedTipoId));
  }, [tiposData, selectedTipoId]);

  // Info del Concepto seleccionado
  const selectedConcepto = React.useMemo(() => {
    return conceptosData?.find((c) => c.id === Number(selectedConceptoId));
  }, [conceptosData, selectedConceptoId]);

  // Auto-selección de turno cuando sólo hay uno disponible al crear
  React.useEffect(() => {
    if (open && !isEditing && availableTurnos.length === 1 && !selectedTurnoId) {
      setValue("turnoCajaId", availableTurnos[0].id, { shouldValidate: true });
    }
  }, [open, isEditing, availableTurnos, selectedTurnoId, setValue]);

  // Auto-selección de moneda base por defecto
  React.useEffect(() => {
    if (open && !isEditing && monedaBase && !selectedMonedaId) {
      setValue("monedaId", monedaBase.id, { shouldValidate: true });
    }
  }, [open, isEditing, monedaBase, selectedMonedaId, setValue]);

  // Inicialización o reseteo de formulario
  React.useEffect(() => {
    if (open) {
      if (movimientoToEdit) {
        reset({
          turnoCajaId: movimientoToEdit.turnoCaja?.id || 0,
          tipoMovimientoCajaId: movimientoToEdit.tipoMovimientoCajaId,
          conceptoMovimientoCajaId: movimientoToEdit.conceptoMovimientoCajaId,
          monedaId: movimientoToEdit.monedaId,
          monto: Number(movimientoToEdit.monto),
          tipoCambio: Number(movimientoToEdit.tipoCambio || 1),
          referencia: movimientoToEdit.referencia || "",
          observacion: movimientoToEdit.observacion || "",
        });
      } else {
        reset({
          turnoCajaId: availableTurnos.length === 1 ? availableTurnos[0].id : 0,
          tipoMovimientoCajaId: 0,
          conceptoMovimientoCajaId: 0,
          monedaId: monedaBase?.id || 0,
          monto: 0,
          tipoCambio: 1,
          referencia: "",
          observacion: "",
        });
      }
    }
  }, [open, movimientoToEdit, monedaBase, availableTurnos, reset]);

  const handleConceptoCreated = (nuevoConcepto: ConceptoMovimientoCajaInfo) => {
    setValue("conceptoMovimientoCajaId", nuevoConcepto.id, {
      shouldValidate: true,
    });
  };

  const onSubmit = async (values: MovimientoCajaFormValues) => {
    try {
      const payload = {
        turnoCajaId: Number(values.turnoCajaId),
        tipoMovimientoCajaId: Number(values.tipoMovimientoCajaId),
        conceptoMovimientoCajaId: Number(values.conceptoMovimientoCajaId),
        monedaId: Number(values.monedaId),
        monto: Number(values.monto),
        tipoCambio: Number(values.tipoCambio || 1),
        referencia: values.referencia?.trim() || null,
        observacion: values.observacion?.trim() || null,
      };

      if (isEditing && movimientoToEdit) {
        await updateMutation.mutateAsync({
          id: movimientoToEdit.id,
          data: payload,
        });
        toast.success("Movimiento de caja actualizado correctamente.");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Movimiento de caja registrado correctamente.");
      }

      onSuccessCallback?.();
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { detail?: string; title?: string } };
        message?: string;
      };
      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.title ||
        err?.message ||
        "Ocurrió un error al guardar el movimiento de caja.";
      toast.error(message);
    }
  };

  const isEntrada = selectedTipo?.naturaleza?.toUpperCase() === "ENTRADA";

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[620px] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-2 border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                <ArrowLeftRight className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground">
                  {isEditing ? "Editar Movimiento de Caja" : "Registrar Movimiento de Caja"}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  {isEditing
                    ? "Modifique los detalles del movimiento registrado en el turno."
                    : "Seleccione el turno, motivo y el importe a registrar en caja."}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
            {/* SECCIÓN 1: TURNO DE CAJA */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="turnoCajaId" className="required font-medium text-xs flex items-center gap-1.5">
                  <Store className="size-3.5 text-primary" />
                  <span>Caja y Turno de Operación</span>
                </Label>
                {selectedTurno && (
                  <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="size-3" />
                    <span>Turno Activo</span>
                  </span>
                )}
              </div>

              <Select
                value={selectedTurnoId ? String(selectedTurnoId) : ""}
                onValueChange={(val) =>
                  setValue("turnoCajaId", Number(val), { shouldValidate: true })
                }
                disabled={isSubmitting || isLoadingTurnos}
              >
                <SelectTrigger id="turnoCajaId" className="w-full h-auto min-h-10 py-2 text-xs bg-background">
                  <SelectValue placeholder="Seleccione la caja y cajero activo...">
                    {selectedTurno ? (
                      <div className="flex flex-col text-left">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground text-xs">
                            {selectedTurno.caja?.nombre || "Caja"}
                          </span>
                          {selectedTurno.caja?.codigo && (
                            <Badge variant="outline" className="text-[10px] py-0 px-1 font-mono">
                              {selectedTurno.caja.codigo}
                            </Badge>
                          )}
                        </div>
                        <span className="text-[11px] text-muted-foreground">
                          Cajero: {selectedTurno.empleado?.nombreCompleto || "Cajero Asignado"}
                        </span>
                      </div>
                    ) : undefined}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {availableTurnos.length === 0 ? (
                    <div className="py-4 text-center text-xs text-muted-foreground">
                      No hay turnos de caja abiertos actualmente.
                    </div>
                  ) : (
                    availableTurnos.map((t) => (
                      <SelectItem key={t.id} value={String(t.id)} className="py-2.5">
                        <div className="flex flex-col gap-0.5 text-left">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-xs text-foreground">
                              {t.caja?.nombre || "Caja"}
                            </span>
                            {t.caja?.codigo && (
                              <Badge variant="secondary" className="text-[10px] py-0 px-1 font-mono">
                                {t.caja.codigo}
                              </Badge>
                            )}
                          </div>
                          <span className="text-[11px] text-muted-foreground">
                            Cajero: {t.empleado?.nombreCompleto || "Cajero Asignado"}
                          </span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>

              {errors.turnoCajaId && (
                <p className="text-xs text-destructive">{errors.turnoCajaId.message}</p>
              )}
            </div>

            {/* SECCIÓN 2: TIPO Y CONCEPTO A ANCHO COMPLETO */}
            <div className="space-y-3">
              {/* Tipo de Movimiento */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="tipoMovimientoCajaId" className="required font-medium text-xs">
                    Tipo de Movimiento
                  </Label>
                  {selectedTipo && (
                    <span
                      className={`inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        isEntrada
                          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                          : "bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/20"
                      }`}
                    >
                      {isEntrada ? "+ Entrada (Suma a Caja)" : "- Salida (Resta de Caja)"}
                    </span>
                  )}
                </div>

                <Select
                  value={selectedTipoId ? String(selectedTipoId) : ""}
                  onValueChange={(val) => {
                    setValue("tipoMovimientoCajaId", Number(val), { shouldValidate: true });
                    // Reset concepto al cambiar de tipo
                    setValue("conceptoMovimientoCajaId", 0, { shouldValidate: true });
                  }}
                  disabled={isSubmitting || isLoadingTipos}
                >
                  <SelectTrigger id="tipoMovimientoCajaId" className="w-full h-9 text-xs bg-background">
                    <SelectValue placeholder="Seleccionar tipo de movimiento...">
                      {selectedTipo ? (
                        <span className="font-medium text-xs">{selectedTipo.nombre}</span>
                      ) : movimientoToEdit?.tipoMovimientoCaja ? (
                        <span className="font-medium text-xs">{movimientoToEdit.tipoMovimientoCaja.nombre}</span>
                      ) : undefined}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {tiposData?.map((tipo) => {
                      const tipoIsEntrada = tipo.naturaleza?.toUpperCase() === "ENTRADA";
                      return (
                        <SelectItem key={tipo.id} value={String(tipo.id)} className="py-2">
                          <div className="flex items-center justify-between w-full gap-4">
                            <span className="font-medium text-xs text-foreground">{tipo.nombre}</span>
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                                tipoIsEntrada
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                  : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                              }`}
                            >
                              {tipoIsEntrada ? "Entrada (+)" : "Salida (-)"}
                            </span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                {errors.tipoMovimientoCajaId && (
                  <p className="text-xs text-destructive">{errors.tipoMovimientoCajaId.message}</p>
                )}
              </div>

              {/* Concepto / Motivo a Ancho Completo con Botón para Crear */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="conceptoMovimientoCajaId" className="required font-medium text-xs">
                    Concepto / Motivo Específico
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setCreateConceptoDialogOpen(true)}
                    disabled={!selectedTipoId || isSubmitting}
                    className="h-6 px-2 text-[11px] text-primary hover:text-primary gap-1 font-semibold hover:bg-primary/10 transition-colors"
                  >
                    <Plus className="size-3" />
                    <span>Nuevo Concepto</span>
                  </Button>
                </div>

                <Select
                  value={selectedConceptoId ? String(selectedConceptoId) : ""}
                  onValueChange={(val) => {
                    if (val === "__create_new__") {
                      setCreateConceptoDialogOpen(true);
                      return;
                    }
                    setValue("conceptoMovimientoCajaId", Number(val), { shouldValidate: true });
                  }}
                  disabled={isSubmitting || !selectedTipoId || isLoadingConceptos}
                >
                  <SelectTrigger id="conceptoMovimientoCajaId" className="w-full h-9 text-xs bg-background">
                    <SelectValue
                      placeholder={
                        !selectedTipoId
                          ? "Seleccione primero el tipo de movimiento arriba..."
                          : isLoadingConceptos
                          ? "Cargando conceptos disponibles..."
                          : "Seleccione el motivo o concepto..."
                      }
                    >
                      {selectedConcepto ? (
                        <span className="font-medium text-xs text-foreground">{selectedConcepto.nombre}</span>
                      ) : movimientoToEdit?.conceptoMovimientoCaja ? (
                        <span className="font-medium text-xs text-foreground">{movimientoToEdit.conceptoMovimientoCaja.nombre}</span>
                      ) : undefined}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {conceptosData && conceptosData.length > 0 ? (
                      conceptosData.map((conc) => (
                        <SelectItem key={conc.id} value={String(conc.id)} className="py-2 text-xs">
                          <span className="font-medium text-foreground">{conc.nombre}</span>
                        </SelectItem>
                      ))
                    ) : (
                      <div className="py-3 px-2 text-center text-xs text-muted-foreground">
                        No hay conceptos registrados para este tipo.
                      </div>
                    )}
                    {selectedTipo && (
                      <div className="p-1 border-t border-border/60">
                        <button
                          type="button"
                          onClick={() => setCreateConceptoDialogOpen(true)}
                          className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs font-semibold text-primary rounded-md hover:bg-primary/10 transition-colors cursor-pointer"
                        >
                          <Plus className="size-3.5" />
                          <span>+ Registrar nuevo concepto para {selectedTipo.nombre}</span>
                        </button>
                      </div>
                    )}
                  </SelectContent>
                </Select>
                {errors.conceptoMovimientoCajaId && (
                  <p className="text-xs text-destructive">{errors.conceptoMovimientoCajaId.message}</p>
                )}
              </div>
            </div>

            {/* SECCIÓN 3: IMPORTE Y MONEDA DESTACADA */}
            <div className="rounded-lg border border-border/70 bg-muted/20 p-3.5 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Moneda */}
                <div className="space-y-1.5">
                  <Label htmlFor="monedaId" className="required font-medium text-xs flex items-center gap-1.5">
                    <Coins className="size-3.5 text-muted-foreground" />
                    <span>Moneda</span>
                  </Label>
                  <Select
                    value={selectedMonedaId ? String(selectedMonedaId) : ""}
                    onValueChange={(val) => {
                      const mId = Number(val);
                      setValue("monedaId", mId, { shouldValidate: true });
                      const m = monedasList.find((x) => x.id === mId);
                      if (m?.esBase) {
                        setValue("tipoCambio", 1, { shouldValidate: true });
                      }
                    }}
                    disabled={isSubmitting || isLoadingMonedas}
                  >
                    <SelectTrigger id="monedaId" className="w-full h-9 text-xs bg-background">
                      <SelectValue placeholder="Seleccionar moneda...">
                        {selectedMoneda ? (
                          <span className="font-medium">
                            {selectedMoneda.nombre} ({selectedMoneda.simbolo})
                          </span>
                        ) : movimientoToEdit?.moneda ? (
                          <span className="font-medium">
                            {movimientoToEdit.moneda.nombre} ({movimientoToEdit.moneda.simbolo})
                          </span>
                        ) : undefined}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {monedasList.map((m) => (
                        <SelectItem key={m.id} value={String(m.id)}>
                          <span className="font-medium">{m.nombre}</span>{" "}
                          <span className="text-[11px] text-muted-foreground font-mono">
                            ({m.simbolo}) {m.esBase ? "• Base" : ""}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.monedaId && (
                    <p className="text-xs text-destructive">{errors.monedaId.message}</p>
                  )}
                </div>

                {/* Monto */}
                <div className="space-y-1.5">
                  <Label htmlFor="monto" className="required font-medium text-xs flex items-center gap-1.5">
                    <Wallet className="size-3.5 text-muted-foreground" />
                    <span>Monto a Registrar ({monedaSimbolo})</span>
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground font-semibold text-xs font-mono">
                      {monedaSimbolo}
                    </div>
                    <Input
                      id="monto"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      {...register("monto", { valueAsNumber: true })}
                      className="pl-11 h-9 text-sm font-bold font-mono bg-background"
                      disabled={isSubmitting}
                    />
                  </div>
                  {errors.monto && (
                    <p className="text-xs text-destructive">{errors.monto.message}</p>
                  )}
                </div>
              </div>

              {/* Tipo de cambio y conversión si moneda no es base */}
              {!isMonedaBase && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-border/50">
                  <div className="space-y-1.5">
                    <Label htmlFor="tipoCambio" className="required font-medium text-xs">
                      Tipo de Cambio (a Bolivianos)
                    </Label>
                    <Input
                      id="tipoCambio"
                      type="number"
                      step="0.0001"
                      min="0.0001"
                      placeholder="1.0000"
                      {...register("tipoCambio", { valueAsNumber: true })}
                      className="h-9 text-xs font-mono bg-background"
                      disabled={isSubmitting}
                    />
                    {errors.tipoCambio && (
                      <p className="text-xs text-destructive">{errors.tipoCambio.message}</p>
                    )}
                  </div>

                  <div className="flex flex-col justify-end">
                    <div className="rounded-md bg-background p-2 border border-border/70 text-xs flex flex-col justify-center h-9">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-muted-foreground">Total en Bs.:</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono text-xs">
                          Bs.{" "}
                          {(
                            Number(enteredMonto || 0) * Number(enteredTipoCambio || 1)
                          ).toLocaleString("es-BO", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* SECCIÓN 4: COMPROBANTE Y OBSERVACIÓN */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="referencia" className="font-medium text-xs flex items-center gap-1.5">
                  <FileText className="size-3.5 text-muted-foreground" />
                  <span>N° Comprobante / Referencia</span>
                </Label>
                <Input
                  id="referencia"
                  placeholder="Ej: REC-00124, Vale N° 55..."
                  {...register("referencia")}
                  className="h-9 text-xs font-mono bg-background"
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="observacion" className="font-medium text-xs">
                  Observaciones adicionales
                </Label>
                <Textarea
                  id="observacion"
                  rows={2}
                  placeholder="Detalle o justificación del movimiento..."
                  {...register("observacion")}
                  className="text-xs resize-none min-h-[36px] max-h-[75px] bg-background"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <DialogFooter className="pt-3 border-t border-border/50 gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
                className="h-9 text-xs"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-9 gap-2 text-xs font-semibold px-4"
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                <span>
                  {isEditing ? "Guardar Cambios" : "Registrar Movimiento"}
                </span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Sub-diálogo para creación rápida de concepto con validación de no duplicidad */}
      {createConceptoDialogOpen && (
        <QuickCreateConceptoDialog
          open={createConceptoDialogOpen}
          onOpenChange={setCreateConceptoDialogOpen}
          tipoPadre={selectedTipo ?? null}
          conceptosExistentes={conceptosData || []}
          onConceptoCreated={handleConceptoCreated}
        />
      )}
    </>
  );
}
