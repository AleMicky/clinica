"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Network, Loader2, Tag, FileText, Layers } from "lucide-react";

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

import { areaSchema, type AreaFormValues } from "../schemas/area.schema";
import { useCreateArea, useUpdateArea } from "../hooks/use-areas";
import type { AreaItem } from "./area-table";
import type { AreaResponse } from "../types/area.types";
import { useTiposArea } from "@/modules/recursos-humanos/tipo-area";

interface AreaFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    areaToEdit?: AreaResponse | AreaItem | null;
    defaultTipoAreaId?: number | null;
    defaultAreaPadreId?: number | null;
    onSuccessCallback?: () => void;
}

export function AreaFormDialog({
    open,
    onOpenChange,
    areaToEdit,
    defaultTipoAreaId,
    defaultAreaPadreId,
    onSuccessCallback,
}: AreaFormDialogProps) {
    const isEditing = Boolean(areaToEdit);

    const createAreaMutation = useCreateArea();
    const updateAreaMutation = useUpdateArea();

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<AreaFormValues>({
        resolver: zodResolver(areaSchema),
        defaultValues: {
            codigo: "",
            nombre: "",
            descripcion: "",
            tipoAreaId: 0,
            areaPadreId: null,
        },
    });

    const tiposAreaQuery = useTiposArea({ page: 1, pageSize: 100 });
    const tiposArea = tiposAreaQuery.data?.items ?? [];

    React.useEffect(() => {
        if (open) {
            if (areaToEdit) {
                const taId = areaToEdit.tipoAreaId;
                reset({
                    codigo: areaToEdit.codigo,
                    nombre: areaToEdit.nombre,
                    descripcion: areaToEdit.descripcion ?? "",
                    tipoAreaId: taId,
                    areaPadreId: areaToEdit.areaPadreId ?? null,
                });
            } else {
                const taId = defaultTipoAreaId ?? 0;
                reset({
                    codigo: "",
                    nombre: "",
                    descripcion: "",
                    tipoAreaId: taId,
                    areaPadreId: defaultAreaPadreId ?? null,
                });
            }
        }
    }, [open, areaToEdit, defaultTipoAreaId, defaultAreaPadreId, reset]);

    const onSubmit = async (values: AreaFormValues) => {
        try {
            const payload = {
                codigo: values.codigo,
                nombre: values.nombre,
                descripcion: values.descripcion ? values.descripcion : undefined,
                tipoAreaId: values.tipoAreaId,
                areaPadreId: values.areaPadreId && values.areaPadreId > 0
                    ? values.areaPadreId
                    : null,
            };

            if (isEditing && areaToEdit) {
                const numericId = Number(areaToEdit.id);
                await updateAreaMutation.mutateAsync({
                    id: isNaN(numericId) ? 0 : numericId,
                    data: payload,
                });
                toast.success(`Área ${values.codigo} actualizada correctamente.`);
            } else {
                await createAreaMutation.mutateAsync(payload);
                toast.success(`Área ${values.codigo} creada correctamente.`);
            }
            onSuccessCallback?.();
            onOpenChange(false);
        } catch {
        }
    };

    const isLoading =
        createAreaMutation.isPending ||
        updateAreaMutation.isPending ||
        isSubmitting;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg p-6">
                <DialogHeader className="space-y-1">
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Network className="size-5" />
                        </div>
                        <span>{isEditing ? "Editar Área" : "Agregar Nueva Área"}</span>
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                        {isEditing
                            ? "Modifique la información del área seleccionada."
                            : "Ingrese la información para registrar un nueva área en el sistema."}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pt-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground bg-muted/40 px-3 py-1.5 rounded-md border border-border/40">
                        <span>Campos obligatorios</span>
                        <span className="text-destructive font-medium">* Requeridos</span>
                    </div>

                    <div className="space-y-3.5">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground uppercase tracking-wider">
                            <Layers className="size-3.5 text-primary" />
                            <span>Clasificación</span>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="tipoAreaId" className="text-xs flex items-center gap-1">
                                Tipo de Área <span className="text-destructive">*</span>
                            </Label>
                            <Select
                                value={String(watch("tipoAreaId") ?? 0)}
                                onValueChange={(val) => {
                                    setValue("tipoAreaId", Number(val));
                                }}
                            >
                                <SelectTrigger id="tipoAreaId" className={cn("w-full h-9 text-sm", errors.tipoAreaId && "border-destructive")}>
                                    <SelectValue placeholder="Seleccione un tipo de área">
                                        {(() => {
                                            const taId = watch("tipoAreaId");
                                            const selected = tiposArea.find((t) => t.id === taId);
                                            if (!selected) return null;
                                            return (
                                                <span className="text-xs font-medium truncate">
                                                    {selected.nombre}
                                                    <span className="text-[11px] text-muted-foreground ml-1 font-mono">
                                                        ({selected.codigo})
                                                    </span>
                                                </span>
                                            );
                                        })()}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    {tiposArea.map((t) => (
                                        <SelectItem key={t.id} value={String(t.id)}>
                                            <span className="text-xs font-medium">{t.nombre}</span>
                                            <span className="text-[11px] text-muted-foreground ml-1">({t.codigo})</span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.tipoAreaId && (
                                <p className="text-[11px] text-destructive font-medium">
                                    {errors.tipoAreaId.message}
                                </p>
                            )}
                        </div>

                        {(() => {
                            const pid = watch("areaPadreId");
                            const esSubarea = pid != null && pid > 0;
                            if (!esSubarea) return null;
                            return (
                                <div className="flex items-center gap-2 rounded-md border border-primary/30 bg-primary/5 px-3 py-2 text-xs">
                                    <Network className="size-3.5 text-primary shrink-0" />
                                    <span className="text-muted-foreground">
                                        Subárea de área padre ID:{" "}
                                        <span className="font-mono font-semibold text-foreground">
                                            #{pid}
                                        </span>
                                    </span>
                                </div>
                            );
                        })()}
                    </div>

                    <div className="space-y-3.5 pt-2 border-t border-border/40">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground uppercase tracking-wider">
                            <Tag className="size-3.5 text-primary" />
                            <span>Identificación del Área</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="space-y-1.5 sm:col-span-1">
                                <Label htmlFor="codigo" className="text-xs flex items-center gap-1">
                                    Código <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="codigo"
                                    placeholder="ej: MED01"
                                    className={cn(
                                        "uppercase font-mono text-sm h-9",
                                        errors.codigo && "border-destructive focus-visible:ring-destructive",
                                    )}
                                    aria-invalid={Boolean(errors.codigo)}
                                    {...register("codigo")}
                                />
                                {errors.codigo && (
                                    <p className="text-[11px] text-destructive font-medium">
                                        {errors.codigo.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1.5 sm:col-span-2">
                                <Label htmlFor="nombre" className="text-xs flex items-center gap-1">
                                    Nombre <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="nombre"
                                    placeholder="ej: Cardiología"
                                    className={cn(
                                        "text-sm h-9",
                                        errors.nombre && "border-destructive focus-visible:ring-destructive",
                                    )}
                                    aria-invalid={Boolean(errors.nombre)}
                                    {...register("nombre")}
                                />
                                {errors.nombre && (
                                    <p className="text-[11px] text-destructive font-medium">
                                        {errors.nombre.message}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3.5 pt-2 border-t border-border/40">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground uppercase tracking-wider">
                            <FileText className="size-3.5 text-primary" />
                            <span>Descripción</span>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="descripcion" className="text-xs">
                                Descripción (opcional)
                            </Label>
                            <Textarea
                                id="descripcion"
                                placeholder="Breve descripción del área..."
                                className={cn(
                                    "text-sm min-h-20",
                                    errors.descripcion && "border-destructive focus-visible:ring-destructive",
                                )}
                                {...register("descripcion")}
                            />
                            {errors.descripcion && (
                                <p className="text-[11px] text-destructive font-medium">
                                    {errors.descripcion.message}
                                </p>
                            )}
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

                        <Button type="submit" disabled={isLoading} className="gap-2">
                            {isLoading && <Loader2 className="size-4 animate-spin" />}
                            {isEditing ? "Guardar Cambios" : "Crear Área"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}