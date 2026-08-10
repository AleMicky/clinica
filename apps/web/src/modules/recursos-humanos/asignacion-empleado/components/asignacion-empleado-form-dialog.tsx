"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
    UserCheck,
    Loader2,
    Building2,
    Briefcase,
    Calendar,
    FileText,
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

import {
    asignacionEmpleadoSchema,
    type AsignacionEmpleadoFormValues,
} from "../schemas/asignacion-empleado.schema";
import {
    useCreateAsignacionEmpleado,
    useUpdateAsignacionEmpleado,
} from "../hooks/use-asignaciones-empleado";
import { useEmpleados } from "@/modules/recursos-humanos/empleado/hooks/use-empleados";
import { useAreas } from "@/modules/recursos-humanos/area/hooks/use-areas";
import { useCargos } from "@/modules/recursos-humanos/cargo/hooks/use-cargos";
import type { AsignacionEmpleadoResponse } from "../types/asignacion-empleado.types";

interface AsignacionEmpleadoFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    asignacionToEdit?: AsignacionEmpleadoResponse | null;
    onSuccessCallback?: () => void;
}

function toISODate(value?: string | Date | null): string {
    if (!value) return "";
    const d = value instanceof Date ? value : new Date(value);
    if (isNaN(d.getTime())) return typeof value === "string" ? value : "";
    const tz = d.getTimezoneOffset() * 60000;
    const local = new Date(d.getTime() - tz);
    return local.toISOString().slice(0, 10);
}

export function AsignacionEmpleadoFormDialog({
    open,
    onOpenChange,
    asignacionToEdit,
    onSuccessCallback,
}: AsignacionEmpleadoFormDialogProps) {
    const isEditing = Boolean(asignacionToEdit);

    const createMutation = useCreateAsignacionEmpleado();
    const updateMutation = useUpdateAsignacionEmpleado();

    // Queries to populate dropdown options
    const empleadosQuery = useEmpleados({ page: 1, pageSize: 200 });
    const areasQuery = useAreas({ page: 1, pageSize: 200 });
    const cargosQuery = useCargos({ page: 1, pageSize: 200 });

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
            empleadoId: 0,
            areaId: 0,
            cargoId: 0,
            fechaInicio: toISODate(new Date()),
            fechaFin: "",
            observacion: "",
        },
    });

    const empleadoIdWatch = watch("empleadoId");
    const areaIdWatch = watch("areaId");
    const cargoIdWatch = watch("cargoId");

    React.useEffect(() => {
        if (open) {
            if (asignacionToEdit) {
                reset({
                    empleadoId: asignacionToEdit.empleado?.id ?? 0,
                    areaId: asignacionToEdit.area?.id ?? 0,
                    cargoId: asignacionToEdit.cargo?.id ?? 0,
                    fechaInicio: toISODate(asignacionToEdit.fechaInicio),
                    fechaFin: asignacionToEdit.fechaFin
                        ? toISODate(asignacionToEdit.fechaFin)
                        : "",
                    observacion: asignacionToEdit.observacion ?? "",
                });
            } else {
                reset({
                    empleadoId: 0,
                    areaId: 0,
                    cargoId: 0,
                    fechaInicio: toISODate(new Date()),
                    fechaFin: "",
                    observacion: "",
                });
            }
        }
    }, [open, asignacionToEdit, reset]);

    const onSubmit = async (values: AsignacionEmpleadoFormValues) => {
        try {
            const payload = {
                empleadoId: values.empleadoId,
                areaId: values.areaId,
                cargoId: values.cargoId,
                fechaInicio: values.fechaInicio,
                fechaFin: values.fechaFin || null,
                observacion: values.observacion || null,
            };

            if (isEditing && asignacionToEdit) {
                await updateMutation.mutateAsync({
                    id: asignacionToEdit.id,
                    data: payload,
                });
                toast.success("Asignación de empleado actualizada correctamente.");
            } else {
                await createMutation.mutateAsync(payload);
                toast.success("Asignación de empleado creada correctamente.");
            }
            onSuccessCallback?.();
            onOpenChange(false);
        } catch {
            // Intercepted by query client or backend handler
        }
    };

    const isLoading =
        createMutation.isPending ||
        updateMutation.isPending ||
        isSubmitting;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg p-6">
                <DialogHeader className="space-y-1">
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <UserCheck className="size-5" />
                        </div>
                        <span>
                            {isEditing
                                ? "Editar Asignación"
                                : "Nueva Asignación de Empleado"}
                        </span>
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                        {isEditing
                            ? "Modifique los detalles de la asignación del empleado."
                            : "Asigne un empleado a un área y cargo específico. Si ya posee una asignación activa, se finalizará automáticamente."}
                    </DialogDescription>
                </DialogHeader>

                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-4 pt-2"
                >
                    {/* Empleado */}
                    <div className="space-y-1.5">
                        <Label
                            htmlFor="empleado"
                            className="text-xs flex items-center gap-1"
                        >
                            <UserCheck className="size-3.5 text-primary" />
                            Empleado <span className="text-destructive">*</span>
                        </Label>
                        <Select
                            value={empleadoIdWatch ? String(empleadoIdWatch) : ""}
                            onValueChange={(val) =>
                                val &&
                                setValue("empleadoId", Number(val), {
                                    shouldValidate: true,
                                })
                            }
                        >
                            <SelectTrigger className="h-9 text-xs">
                                <SelectValue placeholder="Seleccione un empleado..." />
                            </SelectTrigger>
                            <SelectContent>
                                {empleadosQuery.data?.items.map((emp) => {
                                    const nombre = emp.persona
                                        ? `${emp.persona.apellidoPaterno} ${emp.persona.apellidoMaterno ?? ""}, ${emp.persona.nombres}`.trim()
                                        : emp.codigoEmpleado;
                                    return (
                                        <SelectItem
                                            key={emp.id}
                                            value={String(emp.id)}
                                            className="text-xs"
                                        >
                                            {nombre} ({emp.codigoEmpleado})
                                        </SelectItem>
                                    );
                                })}
                            </SelectContent>
                        </Select>
                        {errors.empleadoId && (
                            <p className="text-[11px] text-destructive font-medium">
                                {errors.empleadoId.message}
                            </p>
                        )}
                    </div>

                    {/* Area y Cargo Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Area */}
                        <div className="space-y-1.5">
                            <Label
                                htmlFor="area"
                                className="text-xs flex items-center gap-1"
                            >
                                <Building2 className="size-3.5 text-primary" />
                                Área <span className="text-destructive">*</span>
                            </Label>
                            <Select
                                value={areaIdWatch ? String(areaIdWatch) : ""}
                                onValueChange={(val) =>
                                    val &&
                                    setValue("areaId", Number(val), {
                                        shouldValidate: true,
                                    })
                                }
                            >
                                <SelectTrigger className="h-9 text-xs">
                                    <SelectValue placeholder="Seleccione área..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {areasQuery.data?.items.map((area) => (
                                        <SelectItem
                                            key={area.id}
                                            value={String(area.id)}
                                            className="text-xs"
                                        >
                                            {area.nombre} ({area.codigo})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.areaId && (
                                <p className="text-[11px] text-destructive font-medium">
                                    {errors.areaId.message}
                                </p>
                            )}
                        </div>

                        {/* Cargo */}
                        <div className="space-y-1.5">
                            <Label
                                htmlFor="cargo"
                                className="text-xs flex items-center gap-1"
                            >
                                <Briefcase className="size-3.5 text-primary" />
                                Cargo <span className="text-destructive">*</span>
                            </Label>
                            <Select
                                value={cargoIdWatch ? String(cargoIdWatch) : ""}
                                onValueChange={(val) =>
                                    val &&
                                    setValue("cargoId", Number(val), {
                                        shouldValidate: true,
                                    })
                                }
                            >
                                <SelectTrigger className="h-9 text-xs">
                                    <SelectValue placeholder="Seleccione cargo..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {cargosQuery.data?.items.map((cargo) => (
                                        <SelectItem
                                            key={cargo.id}
                                            value={String(cargo.id)}
                                            className="text-xs"
                                        >
                                            {cargo.nombre} ({cargo.codigo})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.cargoId && (
                                <p className="text-[11px] text-destructive font-medium">
                                    {errors.cargoId.message}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Fechas Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label
                                htmlFor="fechaInicio"
                                className="text-xs flex items-center gap-1"
                            >
                                <Calendar className="size-3.5 text-primary" />
                                Fecha Inicio <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="fechaInicio"
                                type="date"
                                className={cn(
                                    "text-xs h-9",
                                    errors.fechaInicio &&
                                        "border-destructive focus-visible:ring-destructive",
                                )}
                                {...register("fechaInicio")}
                            />
                            {errors.fechaInicio && (
                                <p className="text-[11px] text-destructive font-medium">
                                    {errors.fechaInicio.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label
                                htmlFor="fechaFin"
                                className="text-xs flex items-center gap-1"
                            >
                                <Calendar className="size-3.5 text-muted-foreground" />
                                Fecha Fin (Opcional)
                            </Label>
                            <Input
                                id="fechaFin"
                                type="date"
                                className={cn(
                                    "text-xs h-9",
                                    errors.fechaFin &&
                                        "border-destructive focus-visible:ring-destructive",
                                )}
                                {...register("fechaFin")}
                            />
                            {errors.fechaFin && (
                                <p className="text-[11px] text-destructive font-medium">
                                    {errors.fechaFin.message}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Observación */}
                    <div className="space-y-1.5">
                        <Label
                            htmlFor="observacion"
                            className="text-xs flex items-center gap-1"
                        >
                            <FileText className="size-3.5 text-muted-foreground" />
                            Observación
                        </Label>
                        <Textarea
                            id="observacion"
                            placeholder="Notas o detalles adicionales..."
                            rows={2}
                            className={cn(
                                "text-xs resize-none",
                                errors.observacion &&
                                    "border-destructive focus-visible:ring-destructive",
                            )}
                            {...register("observacion")}
                        />
                        {errors.observacion && (
                            <p className="text-[11px] text-destructive font-medium">
                                {errors.observacion.message}
                            </p>
                        )}
                    </div>

                    <DialogFooter className="pt-4 border-t gap-2 sm:gap-0">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isLoading}
                            className="text-xs cursor-pointer"
                        >
                            Cancelar
                        </Button>

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="text-xs gap-1.5 cursor-pointer"
                        >
                            {isLoading && (
                                <Loader2 className="size-3.5 animate-spin" />
                            )}
                            {isEditing ? "Guardar Cambios" : "Crear Asignación"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
