"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  UserCheck,
  Building2,
  Briefcase,
  Calendar,
  FileText,
  Loader2,
  Plus,
  CheckCircle2,
  Clock,
  Trash2,
  Edit2,
  X,
  Layers,
  User,
  AlertCircle,
  CalendarCheck,
  CalendarX,
} from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Autocomplete, type AutocompleteOption } from "@/components/ui/autocomplete";
import { cn } from "@/lib/utils";

import {
  asignacionEmpleadoSchema,
  type AsignacionEmpleadoFormValues,
} from "@/modules/recursos-humanos/asignacion-empleado/schemas/asignacion-empleado.schema";
import {
  useAsignacionesEmpleado,
  useCreateAsignacionEmpleado,
  useUpdateAsignacionEmpleado,
  useDeleteAsignacionEmpleado,
} from "@/modules/recursos-humanos/asignacion-empleado/hooks/use-asignaciones-empleado";
import { AreaTreeSelect } from "@/modules/recursos-humanos/area";
import { useCargos } from "@/modules/recursos-humanos/cargo/hooks/use-cargos";
import type { AsignacionEmpleadoResponse } from "@/modules/recursos-humanos/asignacion-empleado/types/asignacion-empleado.types";
import type { EmpleadoItem } from "../types/empleado.types";

interface EmpleadoAsignacionesDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  empleado: EmpleadoItem | null;
}

function toISODate(value?: string | Date | null): string {
  if (!value) return "";
  const d = value instanceof Date ? value : new Date(value);
  if (isNaN(d.getTime())) return typeof value === "string" ? value : "";
  const tz = d.getTimezoneOffset() * 60000;
  const local = new Date(d.getTime() - tz);
  return local.toISOString().slice(0, 10);
}

function getTodayISO(): string {
  const now = new Date();
  const tz = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - tz).toISOString().slice(0, 10);
}

function getInitials(name?: string | null): string {
  if (!name) return "E";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return (parts[0][0] || "E").toUpperCase();
}

export function EmpleadoAsignacionesDrawer({
  open,
  onOpenChange,
  empleado,
}: EmpleadoAsignacionesDrawerProps) {
  const empleadoId = empleado ? Number(empleado.id) : 0;

  const [editingAsignacion, setEditingAsignacion] =
    React.useState<AsignacionEmpleadoResponse | null>(null);

  // Queries & Mutations
  const asignacionesQuery = useAsignacionesEmpleado({
    empleadoId: empleadoId || undefined,
    page: 1,
    pageSize: 50,
  });

  const cargosQuery = useCargos({ page: 1, pageSize: 200 });

  const createMutation = useCreateAsignacionEmpleado();
  const updateMutation = useUpdateAsignacionEmpleado();
  const deleteMutation = useDeleteAsignacionEmpleado();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AsignacionEmpleadoFormValues>({
    resolver: zodResolver(asignacionEmpleadoSchema),
    defaultValues: {
      empleadoId: empleadoId,
      areaId: 0,
      cargoId: 0,
      fechaInicio: getTodayISO(),
      fechaFin: "",
      observacion: "",
    },
  });

  const areaIdWatch = watch("areaId");
  const cargoIdWatch = watch("cargoId");
  const fechaInicioVal = watch("fechaInicio");
  const fechaFinVal = watch("fechaFin");

  const cargos = React.useMemo(
    () => cargosQuery.data?.items ?? [],
    [cargosQuery.data]
  );

  // Autocomplete Options for Cargos
  const cargoOptions: AutocompleteOption[] = React.useMemo(() => {
    return cargos.map((c) => ({
      value: String(c.id),
      label: `${c.nombre} (${c.codigo})`,
      description: `Código: ${c.codigo} • ${c.descripcion || "Puesto de trabajo"}`,
    }));
  }, [cargos]);

  const selectedCargo = React.useMemo(
    () => cargos.find((c) => c.id === cargoIdWatch) ?? null,
    [cargos, cargoIdWatch]
  );

  // Sync form values when drawer opens or editing state changes
  React.useEffect(() => {
    if (open && empleadoId) {
      if (editingAsignacion) {
        reset({
          empleadoId: empleadoId,
          areaId: editingAsignacion.area?.id ?? 0,
          cargoId: editingAsignacion.cargo?.id ?? 0,
          fechaInicio: toISODate(editingAsignacion.fechaInicio),
          fechaFin: editingAsignacion.fechaFin
            ? toISODate(editingAsignacion.fechaFin)
            : "",
          observacion: editingAsignacion.observacion ?? "",
        });
      } else {
        reset({
          empleadoId: empleadoId,
          areaId: 0,
          cargoId: 0,
          fechaInicio: getTodayISO(),
          fechaFin: "",
          observacion: "",
        });
      }
    }
  }, [open, empleadoId, editingAsignacion, reset]);

  const handleAreaChange = React.useCallback(
    (val: number) => {
      setValue("areaId", val, { shouldValidate: true });
    },
    [setValue]
  );

  const handleCargoChange = React.useCallback(
    (val: string) => {
      setValue("cargoId", Number(val), { shouldValidate: true });
    },
    [setValue]
  );

  const handleCancelEdit = () => {
    setEditingAsignacion(null);
    reset({
      empleadoId: empleadoId,
      areaId: 0,
      cargoId: 0,
      fechaInicio: getTodayISO(),
      fechaFin: "",
      observacion: "",
    });
  };

  const onSubmit = async (values: AsignacionEmpleadoFormValues) => {
    if (!empleadoId) return;

    try {
      const payload = {
        empleadoId: empleadoId,
        areaId: values.areaId,
        cargoId: values.cargoId,
        fechaInicio: values.fechaInicio,
        fechaFin: values.fechaFin || null,
        observacion: values.observacion?.trim() || null,
      };

      if (editingAsignacion) {
        await updateMutation.mutateAsync({
          id: editingAsignacion.id,
          data: payload,
        });
        toast.success("Asignación laboral actualizada correctamente.");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Asignación laboral registrada correctamente.");
      }

      handleCancelEdit();
      asignacionesQuery.refetch();
    } catch (error: any) {
      const msg =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        error?.message ||
        "Error al guardar la asignación.";
      toast.error(msg);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Asignación laboral eliminada correctamente.");
      asignacionesQuery.refetch();
    } catch (error: any) {
      const msg =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        error?.message ||
        "Error al eliminar la asignación.";
      toast.error(msg);
    }
  };

  const isLoading =
    createMutation.isPending ||
    updateMutation.isPending ||
    isSubmitting;

  const asignaciones = asignacionesQuery.data?.items ?? [];
  const asignacionesActivas = asignaciones.filter((a) => !a.fechaFin).length;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full data-[side=right]:sm:max-w-[700px] lg:data-[side=right]:sm:max-w-[800px] p-0 flex flex-col h-full bg-card overflow-hidden border-l border-border/70 shadow-2xl"
      >
        {/* Header con Perfil del Empleado */}
        <SheetHeader className="p-5 border-b border-border/60 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="size-11 rounded-2xl bg-primary/15 text-primary flex items-center justify-center font-bold text-sm shadow-xs border border-primary/20 shrink-0">
                {getInitials(empleado?.nombreCompleto)}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <SheetTitle className="text-base sm:text-lg font-bold truncate text-foreground">
                    {empleado?.nombreCompleto || "Empleado"}
                  </SheetTitle>
                  {empleado?.codigoEmpleado && (
                    <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">
                      #{empleado.codigoEmpleado}
                    </span>
                  )}
                </div>
                <SheetDescription className="text-xs text-muted-foreground truncate mt-0.5 flex items-center gap-2">
                  <span>Asignación de Áreas Operativas y Cargos Laborales</span>
                  <span>•</span>
                  <span className="text-primary font-medium">
                    {asignacionesActivas} activa{asignacionesActivas !== 1 ? "s" : ""}
                  </span>
                </SheetDescription>
              </div>
            </div>

            <Badge
              variant="outline"
              className="bg-background text-primary border-primary/30 text-xs px-2.5 py-1 hidden sm:inline-flex items-center gap-1 font-semibold"
            >
              <Layers className="size-3" />
              <span>RH & Asignaciones</span>
            </Badge>
          </div>
        </SheetHeader>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Card del Formulario de Asignación */}
          <div
            className={cn(
              "border rounded-2xl p-4 sm:p-5 space-y-4 shadow-xs transition-all",
              editingAsignacion
                ? "bg-blue-500/[0.04] border-blue-500/30"
                : "bg-muted/20 border-border/60"
            )}
          >
            <div className="flex items-center justify-between pb-2 border-b border-border/40">
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                {editingAsignacion ? (
                  <>
                    <Edit2 className="size-3.5 text-blue-600" />
                    <span className="text-blue-700 dark:text-blue-300">Modificar Asignación</span>
                  </>
                ) : (
                  <>
                    <Plus className="size-3.5 text-primary" />
                    <span>Nueva Asignación Laboral</span>
                  </>
                )}
              </h3>

              {editingAsignacion && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelEdit}
                  className="h-7 text-xs text-muted-foreground hover:text-foreground cursor-pointer gap-1 px-2"
                >
                  <X className="size-3" />
                  Cancelar edición
                </Button>
              )}
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Autocomplete de Área y Cargo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Selector Jerárquico de Área en Árbol */}
                <div className="space-y-1.5">
                  <Label htmlFor="areaId" className="text-xs font-semibold flex items-center gap-1.5">
                    <Building2 className="size-3.5 text-primary" />
                    <span>Área / Departamento</span>
                    <span className="text-destructive">*</span>
                  </Label>
                  <AreaTreeSelect
                    id="areaId"
                    value={areaIdWatch}
                    onValueChange={handleAreaChange}
                    placeholder="Seleccionar área en el árbol jerárquico..."
                    disabled={isLoading}
                    error={Boolean(errors.areaId)}
                  />
                  {errors.areaId && (
                    <p className="text-[11px] text-destructive font-medium flex items-center gap-1">
                      <AlertCircle className="size-3" />
                      {errors.areaId.message}
                    </p>
                  )}
                </div>

                {/* Autocomplete de Cargo */}
                <div className="space-y-1.5">
                  <Label htmlFor="cargoId" className="text-xs font-semibold flex items-center gap-1.5">
                    <Briefcase className="size-3.5 text-primary" />
                    <span>Cargo / Puesto</span>
                    <span className="text-destructive">*</span>
                  </Label>
                  <Autocomplete
                    id="cargoId"
                    value={cargoIdWatch ? String(cargoIdWatch) : ""}
                    onValueChange={handleCargoChange}
                    options={cargoOptions}
                    placeholder="Buscar por nombre o código de cargo..."
                    emptyText="No se encontraron cargos registrados"
                    allowCustomValue={false}
                    isLoading={cargosQuery.isLoading}
                    disabled={isLoading}
                    error={Boolean(errors.cargoId)}
                  />
                  {selectedCargo && (
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground bg-background/80 px-2 py-1 rounded-md border border-border/50">
                      <span className="font-semibold text-foreground">{selectedCargo.nombre}</span>
                      <span className="font-mono text-primary text-[10px]">({selectedCargo.codigo})</span>
                      {selectedCargo.descripcion && (
                        <span className="text-[10px] text-muted-foreground truncate">• {selectedCargo.descripcion}</span>
                      )}
                    </div>
                  )}
                  {errors.cargoId && (
                    <p className="text-[11px] text-destructive font-medium flex items-center gap-1">
                      <AlertCircle className="size-3" />
                      {errors.cargoId.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Fechas de Inicio y Fin */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {/* Fecha Inicio */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="fechaInicio" className="text-xs font-semibold flex items-center gap-1.5">
                      <Calendar className="size-3.5 text-primary" />
                      <span>Fecha de Inicio</span>
                      <span className="text-destructive">*</span>
                    </Label>
                    <button
                      type="button"
                      onClick={() => setValue("fechaInicio", getTodayISO(), { shouldValidate: true })}
                      className="text-[10px] font-semibold text-primary hover:underline cursor-pointer bg-primary/10 px-1.5 py-0.2 rounded"
                    >
                      Hoy
                    </button>
                  </div>
                  <Input
                    id="fechaInicio"
                    type="date"
                    value={fechaInicioVal}
                    onChange={(e) => setValue("fechaInicio", e.target.value, { shouldValidate: true })}
                    className={cn(
                      "h-9 text-xs font-mono bg-background",
                      errors.fechaInicio && "border-destructive focus-visible:ring-destructive"
                    )}
                    disabled={isLoading}
                  />
                  {errors.fechaInicio && (
                    <p className="text-[11px] text-destructive font-medium flex items-center gap-1">
                      <AlertCircle className="size-3" />
                      {errors.fechaInicio.message}
                    </p>
                  )}
                </div>

                {/* Fecha Fin */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="fechaFin" className="text-xs font-semibold flex items-center gap-1.5 text-muted-foreground">
                      <Calendar className="size-3.5" />
                      <span>Fecha de Fin</span>
                      <span className="text-[10px] font-normal">(Opcional)</span>
                    </Label>
                    {fechaFinVal && (
                      <button
                        type="button"
                        onClick={() => setValue("fechaFin", "", { shouldValidate: true })}
                        className="text-[10px] font-semibold text-destructive hover:underline cursor-pointer"
                      >
                        Vigente (Limpiar)
                      </button>
                    )}
                  </div>
                  <Input
                    id="fechaFin"
                    type="date"
                    value={fechaFinVal || ""}
                    onChange={(e) => setValue("fechaFin", e.target.value, { shouldValidate: true })}
                    className={cn(
                      "h-9 text-xs font-mono bg-background",
                      errors.fechaFin && "border-destructive focus-visible:ring-destructive"
                    )}
                    disabled={isLoading}
                  />
                  {errors.fechaFin && (
                    <p className="text-[11px] text-destructive font-medium flex items-center gap-1">
                      <AlertCircle className="size-3" />
                      {errors.fechaFin.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Observaciones */}
              <div className="space-y-1.5">
                <Label htmlFor="observacion" className="text-xs font-semibold flex items-center gap-1.5 text-muted-foreground">
                  <FileText className="size-3.5" />
                  <span>Observaciones y Notas</span>
                </Label>
                <Textarea
                  id="observacion"
                  placeholder="Detalles sobre funciones, turnos o condiciones de la asignación..."
                  rows={2}
                  className="text-xs resize-none bg-background"
                  {...register("observacion")}
                  disabled={isLoading}
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className={cn(
                  "w-full h-9 text-xs font-semibold gap-2 cursor-pointer shadow-xs transition-all",
                  editingAsignacion
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-primary hover:bg-primary/90 text-primary-foreground"
                )}
              >
                {isLoading && <Loader2 className="size-3.5 animate-spin" />}
                <span>
                  {editingAsignacion
                    ? "Guardar Cambios en Asignación"
                    : "Registrar Asignación Laboral"}
                </span>
              </Button>
            </form>
          </div>

          {/* Historial de Asignaciones */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                <Clock className="size-3.5 text-primary" />
                <span>Historial de Asignaciones</span>
                <span className="text-muted-foreground font-normal font-mono">
                  ({asignaciones.length})
                </span>
              </h3>
            </div>

            {asignacionesQuery.isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="p-3.5 rounded-xl border border-border/60 bg-card space-y-2">
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <Skeleton className="h-3 w-56" />
                  </div>
                ))}
              </div>
            ) : asignaciones.length === 0 ? (
              <div className="py-10 text-center border-2 border-dashed border-border/60 rounded-2xl bg-muted/10 space-y-2">
                <Briefcase className="size-8 text-muted-foreground/40 mx-auto" />
                <p className="font-bold text-xs text-foreground">
                  Sin asignaciones registradas
                </p>
                <p className="text-[11px] text-muted-foreground max-w-xs mx-auto">
                  Utilice el formulario superior para asignar al empleado su primera área y cargo laboral.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {asignaciones.map((asig) => {
                  const isActiva = !asig.fechaFin;
                  const isSelectedForEdit = editingAsignacion?.id === asig.id;

                  return (
                    <div
                      key={asig.id}
                      className={cn(
                        "p-4 rounded-xl border transition-all flex flex-col gap-2.5 text-xs shadow-2xs",
                        isActiva
                          ? "bg-card border-emerald-500/40 hover:border-emerald-500/60 shadow-xs"
                          : "bg-muted/15 border-border/60 opacity-85 hover:opacity-100",
                        isSelectedForEdit && "ring-2 ring-primary border-primary bg-primary/[0.04]"
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-foreground text-xs sm:text-sm">
                              {asig.area?.nombre || "Área no especificada"}
                            </span>
                            <span className="text-muted-foreground/40 font-bold">•</span>
                            <span className="font-semibold text-primary text-xs sm:text-sm">
                              {asig.cargo?.nombre || "Cargo no especificado"}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-[11px] text-muted-foreground flex-wrap pt-0.5">
                            <span className="flex items-center gap-1 font-mono">
                              <CalendarCheck className="size-3 text-emerald-600 shrink-0" />
                              <span>Desde: {asig.fechaInicio ? asig.fechaInicio.split("T")[0] : "—"}</span>
                            </span>

                            {asig.fechaFin ? (
                              <span className="flex items-center gap-1 font-mono text-rose-600 dark:text-rose-400">
                                <CalendarX className="size-3 shrink-0" />
                                <span>Hasta: {asig.fechaFin.split("T")[0]}</span>
                              </span>
                            ) : (
                              <span className="text-emerald-600 dark:text-emerald-400 font-semibold italic text-[10.5px]">
                                (Vigente actualmente)
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Badges y Acciones */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {isActiva ? (
                            <Badge
                              variant="outline"
                              className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 text-[10px] py-0.5 px-2 font-semibold gap-1"
                            >
                              <CheckCircle2 className="size-3 text-emerald-600" />
                              <span>Activa</span>
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="bg-muted text-muted-foreground border-border/50 text-[10px] py-0.5 px-2 font-medium"
                            >
                              Finalizada
                            </Badge>
                          )}

                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditingAsignacion(asig)}
                            className="size-7 text-muted-foreground hover:text-foreground hover:bg-accent cursor-pointer"
                            title="Editar asignación"
                          >
                            <Edit2 className="size-3.5" />
                          </Button>

                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(asig.id)}
                            className="size-7 text-destructive/70 hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                            title="Eliminar asignación"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </div>

                      {asig.observacion && (
                        <div className="border-t border-border/30 pt-2 mt-0.5 text-[11px] text-muted-foreground italic flex items-start gap-1.5">
                          <FileText className="size-3 text-muted-foreground/60 shrink-0 mt-0.5" />
                          <span>"{asig.observacion}"</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
