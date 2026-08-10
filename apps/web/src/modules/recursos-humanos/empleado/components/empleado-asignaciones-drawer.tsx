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
    Search,
    Check,
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
    asignacionEmpleadoSchema,
    type AsignacionEmpleadoFormValues,
} from "@/modules/recursos-humanos/asignacion-empleado/schemas/asignacion-empleado.schema";
import {
    useAsignacionesEmpleado,
    useCreateAsignacionEmpleado,
    useUpdateAsignacionEmpleado,
    useDeleteAsignacionEmpleado,
} from "@/modules/recursos-humanos/asignacion-empleado/hooks/use-asignaciones-empleado";
import { useAreas } from "@/modules/recursos-humanos/area/hooks/use-areas";
import { useCargos } from "@/modules/recursos-humanos/cargo/hooks/use-cargos";
import type { AsignacionEmpleadoResponse } from "@/modules/recursos-humanos/asignacion-empleado/types/asignacion-empleado.types";
import type { EmpleadoItem } from "./empleado-table";

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

export function EmpleadoAsignacionesDrawer({
    open,
    onOpenChange,
    empleado,
}: EmpleadoAsignacionesDrawerProps) {
    const empleadoId = empleado ? Number(empleado.id) : 0;

    const [editingAsignacion, setEditingAsignacion] =
        React.useState<AsignacionEmpleadoResponse | null>(null);

    // Combo & Search states
    const [busquedaArea, setBusquedaArea] = React.useState("");
    const [areaComboOpen, setAreaComboOpen] = React.useState(false);

    const [busquedaCargo, setBusquedaCargo] = React.useState("");
    const [cargoComboOpen, setCargoComboOpen] = React.useState(false);

    // Queries & Mutations
    const asignacionesQuery = useAsignacionesEmpleado({
        empleadoId: empleadoId || undefined,
        page: 1,
        pageSize: 50,
    });

    const areasQuery = useAreas({ page: 1, pageSize: 200 });
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
            fechaInicio: toISODate(new Date()),
            fechaFin: "",
            observacion: "",
        },
    });

    const areaIdWatch = watch("areaId");
    const cargoIdWatch = watch("cargoId");

    // Area resolution & search filter
    const areas = React.useMemo(
        () => areasQuery.data?.items ?? [],
        [areasQuery.data],
    );
    const selectedArea = React.useMemo(
        () => areas.find((a) => a.id === areaIdWatch) ?? null,
        [areas, areaIdWatch],
    );
    const areasFiltradas = React.useMemo(() => {
        const t = busquedaArea.trim().toLowerCase();
        if (!t) return areas;
        return areas.filter(
            (a) =>
                a.nombre.toLowerCase().includes(t) ||
                a.codigo.toLowerCase().includes(t),
        );
    }, [areas, busquedaArea]);

    // Cargo resolution & search filter
    const cargos = React.useMemo(
        () => cargosQuery.data?.items ?? [],
        [cargosQuery.data],
    );
    const selectedCargo = React.useMemo(
        () => cargos.find((c) => c.id === cargoIdWatch) ?? null,
        [cargos, cargoIdWatch],
    );
    const cargosFiltrados = React.useMemo(() => {
        const t = busquedaCargo.trim().toLowerCase();
        if (!t) return cargos;
        return cargos.filter(
            (c) =>
                c.nombre.toLowerCase().includes(t) ||
                c.codigo.toLowerCase().includes(t),
        );
    }, [cargos, busquedaCargo]);

    // Sync form values when drawer opens or when editing an item
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
                    fechaInicio: toISODate(new Date()),
                    fechaFin: "",
                    observacion: "",
                });
            }
            setBusquedaArea("");
            setAreaComboOpen(false);
            setBusquedaCargo("");
            setCargoComboOpen(false);
        }
    }, [open, empleadoId, editingAsignacion, reset]);

    const handleCancelEdit = () => {
        setEditingAsignacion(null);
        reset({
            empleadoId: empleadoId,
            areaId: 0,
            cargoId: 0,
            fechaInicio: toISODate(new Date()),
            fechaFin: "",
            observacion: "",
        });
        setBusquedaArea("");
        setBusquedaCargo("");
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
                observacion: values.observacion || null,
            };

            if (editingAsignacion) {
                await updateMutation.mutateAsync({
                    id: editingAsignacion.id,
                    data: payload,
                });
                toast.success("Asignación actualizada correctamente.");
            } else {
                await createMutation.mutateAsync(payload);
                toast.success("Asignación registrada correctamente.");
            }

            handleCancelEdit();
            asignacionesQuery.refetch();
        } catch {
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await deleteMutation.mutateAsync(id);
            toast.success("Asignación eliminada.");
            asignacionesQuery.refetch();
        } catch {
        }
    };

    const isLoading =
        createMutation.isPending ||
        updateMutation.isPending ||
        isSubmitting;

    const asignaciones = asignacionesQuery.data?.items ?? [];

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                className="w-full data-[side=right]:sm:max-w-[750px] lg:data-[side=right]:sm:max-w-[900px] p-0 flex flex-col h-full bg-card overflow-hidden border-l shadow-2xl"
            >
                {/* Header */}
                <SheetHeader className="p-4 sm:p-5 border-b bg-muted/30">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                            <UserCheck className="size-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <SheetTitle className="text-base sm:text-lg font-bold truncate">
                                Asignación de Área y Cargo
                            </SheetTitle>
                            <SheetDescription className="text-xs text-muted-foreground truncate">
                                {empleado?.nombreCompleto || "Empleado"}{" "}
                                {empleado?.codigoEmpleado && (
                                    <span className="font-mono text-primary font-medium">
                                        ({empleado.codigoEmpleado})
                                    </span>
                                )}
                            </SheetDescription>
                        </div>
                    </div>
                </SheetHeader>

                {/* Main Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
                    {/* Top Section: Form */}
                    <div className="bg-muted/20 border border-border/60 rounded-xl p-4 sm:p-5 space-y-4 shadow-xs">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                                <Plus className="size-3.5 text-primary" />
                                {editingAsignacion
                                    ? "Editar Asignación"
                                    : "Nueva Asignación"}
                            </h3>

                            {editingAsignacion && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleCancelEdit}
                                    className="h-7 text-xs text-muted-foreground hover:text-foreground cursor-pointer gap-1"
                                >
                                    <X className="size-3" />
                                    Cancelar edición
                                </Button>
                            )}
                        </div>

                        <form
                            onSubmit={handleSubmit(onSubmit)}
                            className="space-y-4"
                        >
                            {/* Area & Cargo Autocomplete Comboboxes */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Area Autocomplete */}
                                <div className="space-y-1.5">
                                    <Label className="text-xs flex items-center gap-1">
                                        <Building2 className="size-3 text-primary" />
                                        Área <span className="text-destructive">*</span>
                                    </Label>
                                    <DropdownMenu
                                        open={areaComboOpen}
                                        onOpenChange={setAreaComboOpen}
                                    >
                                        <DropdownMenuTrigger
                                            className={cn(
                                                "flex w-full h-9 items-center justify-between rounded-md border border-input bg-background px-3 text-xs text-muted-foreground transition-colors hover:bg-accent/40 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 cursor-pointer",
                                                errors.areaId &&
                                                    "border-destructive focus-visible:ring-destructive",
                                            )}
                                        >
                                            <span className="text-xs font-medium text-foreground truncate">
                                                {selectedArea
                                                    ? `${selectedArea.nombre} (${selectedArea.codigo})`
                                                    : "Buscar y seleccionar área..."}
                                            </span>
                                            <Search className="size-3.5 text-muted-foreground shrink-0 ml-2" />
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent
                                            align="start"
                                            className="min-w-[--anchor-width] max-w-[--anchor-width] p-2"
                                        >
                                            <DropdownMenuLabel className="px-0 pb-2 pt-0">
                                                <div className="relative">
                                                    <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                                                    <Input
                                                        value={busquedaArea}
                                                        onChange={(e) =>
                                                            setBusquedaArea(
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder="Buscar por nombre o código..."
                                                        className="h-8 pl-8 text-xs"
                                                        autoFocus
                                                    />
                                                </div>
                                            </DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            <div className="max-h-56 overflow-y-auto">
                                                {areasQuery.isLoading ? (
                                                    <div className="p-2 space-y-1.5">
                                                        <Skeleton className="h-7 w-full" />
                                                        <Skeleton className="h-7 w-full" />
                                                    </div>
                                                ) : areasFiltradas.length ===
                                                  0 ? (
                                                    <p className="px-2 py-4 text-center text-xs text-muted-foreground">
                                                        No se encontraron áreas.
                                                    </p>
                                                ) : (
                                                    areasFiltradas.map((a) => (
                                                        <DropdownMenuItem
                                                            key={a.id}
                                                            onClick={() => {
                                                                setValue(
                                                                    "areaId",
                                                                    a.id,
                                                                    {
                                                                        shouldValidate: true,
                                                                    },
                                                                );
                                                                setAreaComboOpen(
                                                                    false,
                                                                );
                                                                setBusquedaArea(
                                                                    "",
                                                                );
                                                            }}
                                                            className="gap-2 cursor-pointer rounded-md py-1.5 text-xs"
                                                        >
                                                            <span className="flex flex-1 items-center justify-between min-w-0">
                                                                <span className="font-medium truncate">
                                                                    {a.nombre}
                                                                </span>
                                                                <span className="text-[10px] text-muted-foreground font-mono truncate">
                                                                    {a.codigo}
                                                                </span>
                                                            </span>
                                                            {a.id ===
                                                                areaIdWatch && (
                                                                <Check className="size-3.5 text-primary shrink-0" />
                                                            )}
                                                        </DropdownMenuItem>
                                                    ))
                                                )}
                                            </div>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                    {errors.areaId && (
                                        <p className="text-[11px] text-destructive font-medium">
                                            {errors.areaId.message}
                                        </p>
                                    )}
                                </div>

                                {/* Cargo Autocomplete */}
                                <div className="space-y-1.5">
                                    <Label className="text-xs flex items-center gap-1">
                                        <Briefcase className="size-3 text-primary" />
                                        Cargo <span className="text-destructive">*</span>
                                    </Label>
                                    <DropdownMenu
                                        open={cargoComboOpen}
                                        onOpenChange={setCargoComboOpen}
                                    >
                                        <DropdownMenuTrigger
                                            className={cn(
                                                "flex w-full h-9 items-center justify-between rounded-md border border-input bg-background px-3 text-xs text-muted-foreground transition-colors hover:bg-accent/40 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 cursor-pointer",
                                                errors.cargoId &&
                                                    "border-destructive focus-visible:ring-destructive",
                                            )}
                                        >
                                            <span className="text-xs font-medium text-foreground truncate">
                                                {selectedCargo
                                                    ? `${selectedCargo.nombre} (${selectedCargo.codigo})`
                                                    : "Buscar y seleccionar cargo..."}
                                            </span>
                                            <Search className="size-3.5 text-muted-foreground shrink-0 ml-2" />
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent
                                            align="start"
                                            className="min-w-[--anchor-width] max-w-[--anchor-width] p-2"
                                        >
                                            <DropdownMenuLabel className="px-0 pb-2 pt-0">
                                                <div className="relative">
                                                    <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                                                    <Input
                                                        value={busquedaCargo}
                                                        onChange={(e) =>
                                                            setBusquedaCargo(
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder="Buscar por nombre o código..."
                                                        className="h-8 pl-8 text-xs"
                                                        autoFocus
                                                    />
                                                </div>
                                            </DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            <div className="max-h-56 overflow-y-auto">
                                                {cargosQuery.isLoading ? (
                                                    <div className="p-2 space-y-1.5">
                                                        <Skeleton className="h-7 w-full" />
                                                        <Skeleton className="h-7 w-full" />
                                                    </div>
                                                ) : cargosFiltrados.length ===
                                                  0 ? (
                                                    <p className="px-2 py-4 text-center text-xs text-muted-foreground">
                                                        No se encontraron cargos.
                                                    </p>
                                                ) : (
                                                    cargosFiltrados.map((c) => (
                                                        <DropdownMenuItem
                                                            key={c.id}
                                                            onClick={() => {
                                                                setValue(
                                                                    "cargoId",
                                                                    c.id,
                                                                    {
                                                                        shouldValidate: true,
                                                                    },
                                                                );
                                                                setCargoComboOpen(
                                                                    false,
                                                                );
                                                                setBusquedaCargo(
                                                                    "",
                                                                );
                                                            }}
                                                            className="gap-2 cursor-pointer rounded-md py-1.5 text-xs"
                                                        >
                                                            <span className="flex flex-1 items-center justify-between min-w-0">
                                                                <span className="font-medium truncate">
                                                                    {c.nombre}
                                                                </span>
                                                                <span className="text-[10px] text-muted-foreground font-mono truncate">
                                                                    {c.codigo}
                                                                </span>
                                                            </span>
                                                            {c.id ===
                                                                cargoIdWatch && (
                                                                <Check className="size-3.5 text-primary shrink-0" />
                                                            )}
                                                        </DropdownMenuItem>
                                                    ))
                                                )}
                                            </div>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                    {errors.cargoId && (
                                        <p className="text-[11px] text-destructive font-medium">
                                            {errors.cargoId.message}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Fechas */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label className="text-xs flex items-center gap-1">
                                        <Calendar className="size-3 text-primary" />
                                        Fecha Inicio <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        type="date"
                                        className={cn(
                                            "h-8 text-xs bg-background",
                                            errors.fechaInicio &&
                                                "border-destructive",
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
                                    <Label className="text-xs flex items-center gap-1">
                                        <Calendar className="size-3 text-muted-foreground" />
                                        Fecha Fin (Opcional)
                                    </Label>
                                    <Input
                                        type="date"
                                        className={cn(
                                            "h-8 text-xs bg-background",
                                            errors.fechaFin &&
                                                "border-destructive",
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
                                <Label className="text-xs flex items-center gap-1">
                                    <FileText className="size-3 text-muted-foreground" />
                                    Observación
                                </Label>
                                <Textarea
                                    placeholder="Notas opcionales sobre la asignación..."
                                    rows={2}
                                    className="text-xs resize-none bg-background"
                                    {...register("observacion")}
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-8 text-xs gap-1.5 cursor-pointer"
                            >
                                {isLoading && (
                                    <Loader2 className="size-3.5 animate-spin" />
                                )}
                                {editingAsignacion
                                    ? "Actualizar Asignación"
                                    : "Guardar Nueva Asignación"}
                            </Button>
                        </form>
                    </div>

                    {/* Bottom Section: History List */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                            <Clock className="size-3.5 text-primary" />
                            Historial de Asignaciones ({asignaciones.length})
                        </h3>

                        {asignacionesQuery.isLoading ? (
                            <div className="space-y-2">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <Skeleton key={i} className="h-16 w-full rounded-lg" />
                                ))}
                            </div>
                        ) : asignaciones.length === 0 ? (
                            <p className="text-xs text-muted-foreground text-center py-6 border border-dashed rounded-lg">
                                No hay asignaciones registradas para este empleado.
                            </p>
                        ) : (
                            <div className="space-y-2.5">
                                {asignaciones.map((asig) => {
                                    const isActiva = !asig.fechaFin;
                                    const isSelectedForEdit =
                                        editingAsignacion?.id === asig.id;

                                    return (
                                        <div
                                            key={asig.id}
                                            className={cn(
                                                "p-3 rounded-lg border transition-all flex flex-col gap-2 text-xs",
                                                isActiva
                                                    ? "bg-card border-primary/40 shadow-2xs"
                                                    : "bg-muted/10 border-border/60 opacity-90",
                                                isSelectedForEdit &&
                                                    "ring-2 ring-primary/50",
                                            )}
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="font-bold text-foreground">
                                                            {asig.area?.nombre || "—"}
                                                        </span>
                                                        <span className="text-muted-foreground">·</span>
                                                        <span className="font-semibold text-primary">
                                                            {asig.cargo?.nombre || "—"}
                                                        </span>
                                                    </div>
                                                    <p className="text-[11px] text-muted-foreground mt-0.5 font-mono">
                                                        Desde: {asig.fechaInicio}{" "}
                                                        {asig.fechaFin
                                                            ? `hasta: ${asig.fechaFin}`
                                                            : "(Vigente / Actual)"}
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-1.5 shrink-0">
                                                    {isActiva ? (
                                                        <Badge
                                                            variant="outline"
                                                            className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] py-0 px-1.5"
                                                        >
                                                            <CheckCircle2 className="size-3 mr-1" />
                                                            Activa
                                                        </Badge>
                                                    ) : (
                                                        <Badge
                                                            variant="outline"
                                                            className="bg-muted text-muted-foreground border-border/40 text-[10px] py-0 px-1.5"
                                                        >
                                                            Finalizada
                                                        </Badge>
                                                    )}

                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() =>
                                                            setEditingAsignacion(asig)
                                                        }
                                                        className="size-6 text-muted-foreground hover:text-foreground cursor-pointer"
                                                        title="Editar asignación"
                                                    >
                                                        <Edit2 className="size-3" />
                                                    </Button>

                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() =>
                                                            handleDelete(asig.id)
                                                        }
                                                        className="size-6 text-destructive/70 hover:text-destructive cursor-pointer"
                                                        title="Eliminar asignación"
                                                    >
                                                        <Trash2 className="size-3" />
                                                    </Button>
                                                </div>
                                            </div>

                                            {asig.observacion && (
                                                <p className="text-[11px] text-muted-foreground italic border-t border-border/30 pt-1.5 mt-0.5">
                                                    "{asig.observacion}"
                                                </p>
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
