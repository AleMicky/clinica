"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
    UserPlus,
    Loader2,
    Tag,
    CalendarDays,
    IdCard,
    Search,
    X,
    Check,
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
import { Skeleton } from "@/components/ui/skeleton";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

import {
    empleadoSchema,
    type EmpleadoFormValues,
} from "../schemas/empleado.schema";
import {
    useCreateEmpleado,
    useUpdateEmpleado,
    useEmpleados as useEmpleadosLista,
} from "../hooks/use-empleados";
import { usePersonas } from "@/modules/seguridad/persona";
import { getApiErrorMessage } from "@/lib/api/api-error";
import {
    nombreCompleto,
    documentoCompleto,
    type EmpleadoResponse,
} from "../types/empleado.types";
import type { EmpleadoItem } from "./empleado-table";

type EmpleadoEditable = EmpleadoResponse | EmpleadoItem;

interface EmpleadoFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    empleadoToEdit?: EmpleadoEditable | null;
    onSuccessCallback?: () => void;
}

function toISODate(value?: string | null): string {
    if (!value) return "";
    const d = new Date(value);
    if (isNaN(d.getTime())) return value;
    const tz = d.getTimezoneOffset() * 60000;
    const local = new Date(d.getTime() - tz);
    return local.toISOString().slice(0, 10);
}

export function EmpleadoFormDialog({
    open,
    onOpenChange,
    empleadoToEdit,
    onSuccessCallback,
}: EmpleadoFormDialogProps) {
    const isEditing = Boolean(empleadoToEdit);

    const createMutation = useCreateEmpleado();
    const updateMutation = useUpdateEmpleado();

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<EmpleadoFormValues>({
        resolver: zodResolver(empleadoSchema),
        defaultValues: {
            personaId: 0,
            codigoEmpleado: "",
            fechaIngreso: toISODate(new Date()),
            fechaRetiro: "",
        },
    });

    const personasQuery = usePersonas({ page: 1, pageSize: 100 });
    const personas = React.useMemo(
        () => personasQuery.data?.items ?? [],
        [personasQuery.data],
    );

    // Empleados existentes para evitar seleccionar personas que ya son
    // empleados (la validación del backend rechaza este caso con 409).
    const empleadosExistentesQuery = useEmpleadosLista({
        page: 1,
        pageSize: 500,
    });
    const personasOcupadas = React.useMemo(() => {
        const ids = new Set<number>();
        const editingId = Number(empleadoToEdit?.id);
        empleadosExistentesQuery.data?.items?.forEach((emp) => {
            if (emp.id !== editingId) ids.add(emp.personaId);
        });
        return ids;
    }, [empleadosExistentesQuery.data, empleadoToEdit]);

    const [busquedaPersona, setBusquedaPersona] = React.useState("");
    const [comboOpen, setComboOpen] = React.useState(false);

    const personaIdWatch = watch("personaId");
    const selectedPersona = React.useMemo(
        () => personas.find((p) => p.id === personaIdWatch) ?? null,
        [personas, personaIdWatch],
    );

    const personasFiltradas = React.useMemo(() => {
        const t = busquedaPersona.trim().toLowerCase();
        return personas.filter((p) => {
            // Excluir personas que ya son empleado de otro registro.
            if (
                personasOcupadas.has(p.id) &&
                p.id !== personaIdWatch
            ) {
                return false;
            }
            if (!t) return true;
            const nombre = nombreCompleto(p).toLowerCase();
            const doc = documentoCompleto(p).toLowerCase();
            return (
                nombre.includes(t) ||
                doc.includes(t) ||
                p.nombres.toLowerCase().includes(t)
            );
        });
    }, [personas, busquedaPersona, personasOcupadas, personaIdWatch]);

    React.useEffect(() => {
        if (open) {
            if (empleadoToEdit) {
                reset({
                    personaId: empleadoToEdit.personaId,
                    codigoEmpleado: empleadoToEdit.codigoEmpleado,
                    fechaIngreso: toISODate(empleadoToEdit.fechaIngreso),
                    fechaRetiro: empleadoToEdit.fechaRetiro
                        ? toISODate(empleadoToEdit.fechaRetiro)
                        : "",
                });
            } else {
                reset({
                    personaId: 0,
                    codigoEmpleado: "",
                    fechaIngreso: toISODate(new Date()),
                    fechaRetiro: "",
                });
            }
            setBusquedaPersona("");
            setComboOpen(false);
        }
    }, [open, empleadoToEdit, reset]);

    const onSubmit = async (values: EmpleadoFormValues) => {
        try {
            const payload = {
                personaId: values.personaId,
                codigoEmpleado: values.codigoEmpleado,
                fechaIngreso: values.fechaIngreso,
                fechaRetiro: values.fechaRetiro || null,
            };

            if (isEditing && empleadoToEdit) {
                const numericId = Number(empleadoToEdit.id);
                await updateMutation.mutateAsync({
                    id: isNaN(numericId) ? 0 : numericId,
                    data: payload,
                });
                toast.success(
                    `Empleado ${values.codigoEmpleado} actualizado correctamente.`,
                );
            } else {
                await createMutation.mutateAsync(payload);
                toast.success(
                    `Empleado ${values.codigoEmpleado} creado correctamente.`,
                );
            }
            onSuccessCallback?.();
            onOpenChange(false);
        } catch (error) {
            toast.error(getApiErrorMessage(error));
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
                            <UserPlus className="size-5" />
                        </div>
                        <span>
                            {isEditing
                                ? "Editar Empleado"
                                : "Agregar Nuevo Empleado"}
                        </span>
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                        {isEditing
                            ? "Modifique la información del empleado seleccionado."
                            : "Ingrese la información para registrar un nuevo empleado en el sistema."}
                    </DialogDescription>
                </DialogHeader>

                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-5 pt-2"
                >
                    <div className="flex items-center justify-between text-xs text-muted-foreground bg-muted/40 px-3 py-1.5 rounded-md border border-border/40">
                        <span>Campos obligatorios</span>
                        <span className="text-destructive font-medium">
                            * Requeridos
                        </span>
                    </div>

                    <div className="space-y-3.5">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground uppercase tracking-wider">
                            <IdCard className="size-3.5 text-primary" />
                            <span>Persona</span>
                        </div>

                        <div className="space-y-1.5">
                            <Label
                                htmlFor="persona"
                                className="text-xs flex items-center gap-1"
                            >
                                Persona <span className="text-destructive">*</span>
                            </Label>

                            {selectedPersona ? (
                                <div className="flex items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 py-2">
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-sm font-medium truncate">
                                            {nombreCompleto(selectedPersona)}
                                        </span>
                                        <span className="text-[11px] text-muted-foreground font-mono">
                                            {documentoCompleto(selectedPersona)}
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setValue("personaId", 0);
                                            setBusquedaPersona("");
                                        }}
                                        title="Quitar selección"
                                        className="inline-flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer shrink-0"
                                    >
                                        <X className="size-4" />
                                    </button>
                                </div>
                            ) : (
                                <DropdownMenu
                                    open={comboOpen}
                                    onOpenChange={setComboOpen}
                                >
                                    <DropdownMenuTrigger
                                        className="flex w-full h-9 items-center justify-between rounded-lg border border-input bg-transparent px-3 text-sm text-muted-foreground transition-colors hover:bg-accent/40 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 cursor-pointer"
                                    >
                                        <span className="text-sm">
                                            Buscar y seleccionar persona...
                                        </span>
                                        <Search className="size-4 text-muted-foreground" />
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                        align="start"
                                        className="min-w-[--anchor-width] max-w-[--anchor-width] p-2"
                                    >
                                        <DropdownMenuLabel className="px-0 pb-2 pt-0">
                                            <div className="relative">
                                                <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                                                <Input
                                                    value={busquedaPersona}
                                                    onChange={(e) =>
                                                        setBusquedaPersona(
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="Nombre o documento..."
                                                    className="h-8 pl-8 text-xs"
                                                    autoFocus
                                                />
                                            </div>
                                        </DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <div className="max-h-60 overflow-y-auto">
                                            {personasQuery.isLoading ? (
                                                <div className="space-y-1.5 p-1">
                                                    {Array.from({
                                                        length: 4,
                                                    }).map((_, i) => (
                                                        <Skeleton
                                                            key={i}
                                                            className="h-8 w-full"
                                                        />
                                                    ))}
                                                </div>
                                            ) : personasFiltradas.length ===
                                              0 ? (
                                                <p className="px-2 py-6 text-center text-xs text-muted-foreground">
                                                    No se encontraron
                                                    coincidencias. Las personas
                                                    ya registradas como empleado
                                                    se ocultan.
                                                </p>
                                            ) : (
                                                personasFiltradas
                                                    .slice(0, 50)
                                                    .map((p) => (
                                                        <DropdownMenuItem
                                                            key={p.id}
                                                            onClick={() => {
                                                                setValue(
                                                                    "personaId",
                                                                    p.id,
                                                                );
                                                                setComboOpen(
                                                                    false,
                                                                );
                                                                setBusquedaPersona(
                                                                    "",
                                                                );
                                                            }}
                                                            className="gap-2 cursor-pointer rounded-md py-1.5"
                                                        >
                                                            <span className="flex flex-1 flex-col min-w-0">
                                                                <span className="text-xs font-medium truncate">
                                                                    {nombreCompleto(
                                                                        p,
                                                                    )}
                                                                </span>
                                                                <span className="text-[10px] text-muted-foreground font-mono truncate">
                                                                    {documentoCompleto(
                                                                        p,
                                                                    )}
                                                                </span>
                                                            </span>
                                                            {p.id ===
                                                                personaIdWatch && (
                                                                <Check className="size-3.5 text-primary" />
                                                            )}
                                                        </DropdownMenuItem>
                                                    ))
                                            )}
                                        </div>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}

                            {errors.personaId && (
                                <p className="text-[11px] text-destructive font-medium">
                                    {errors.personaId.message}
                                </p>
                            )}
                            <p className="text-[11px] text-muted-foreground">
                                Busque por nombre o documento. Las personas ya
                                registradas como empleado se ocultan
                                automáticamente.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-3.5 pt-2 border-t border-border/40">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground uppercase tracking-wider">
                            <Tag className="size-3.5 text-primary" />
                            <span>Datos del Empleado</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="space-y-1.5 sm:col-span-1">
                                <Label
                                    htmlFor="codigoEmpleado"
                                    className="text-xs flex items-center gap-1"
                                >
                                    Código Empleado{" "}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="codigoEmpleado"
                                    placeholder="ej: EMP001"
                                    className={cn(
                                        "uppercase font-mono text-sm h-9",
                                        errors.codigoEmpleado &&
                                            "border-destructive focus-visible:ring-destructive",
                                    )}
                                    aria-invalid={Boolean(
                                        errors.codigoEmpleado,
                                    )}
                                    {...register("codigoEmpleado")}
                                />
                                {errors.codigoEmpleado && (
                                    <p className="text-[11px] text-destructive font-medium">
                                        {errors.codigoEmpleado.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1.5 sm:col-span-1">
                                <Label
                                    htmlFor="fechaIngreso"
                                    className="text-xs flex items-center gap-1"
                                >
                                    Fecha Ingreso{" "}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="fechaIngreso"
                                    type="date"
                                    className={cn(
                                        "text-sm h-9",
                                        errors.fechaIngreso &&
                                            "border-destructive focus-visible:ring-destructive",
                                    )}
                                    aria-invalid={Boolean(
                                        errors.fechaIngreso,
                                    )}
                                    {...register("fechaIngreso")}
                                />
                                {errors.fechaIngreso && (
                                    <p className="text-[11px] text-destructive font-medium">
                                        {errors.fechaIngreso.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1.5 sm:col-span-1">
                                <Label
                                    htmlFor="fechaRetiro"
                                    className="text-xs flex items-center gap-1"
                                >
                                    <CalendarDays className="size-3.5" /> Fecha
                                    Retiro
                                </Label>
                                <Input
                                    id="fechaRetiro"
                                    type="date"
                                    className={cn(
                                        "text-sm h-9",
                                        errors.fechaRetiro &&
                                            "border-destructive focus-visible:ring-destructive",
                                    )}
                                    aria-invalid={Boolean(
                                        errors.fechaRetiro,
                                    )}
                                    {...register("fechaRetiro")}
                                />
                                {errors.fechaRetiro && (
                                    <p className="text-[11px] text-destructive font-medium">
                                        {errors.fechaRetiro.message}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="pt-4 border-t gap-2 sm:gap-0">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isLoading}
                        >
                            Cancelar
                        </Button>

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="gap-2"
                        >
                            {isLoading && (
                                <Loader2 className="size-4 animate-spin" />
                            )}
                            {isEditing ? "Guardar Cambios" : "Crear Empleado"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}