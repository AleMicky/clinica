"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Building2, Loader2, Tag, FileText, Hash } from "lucide-react";

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
import { cn } from "@/lib/utils";

import { tipoAreaSchema, type TipoAreaFormValues } from "../schemas/tipo-area.schema";
import { useCreateTipoArea, useUpdateTipoArea } from "../hooks/use-tipos-area";
import { getApiErrorMessage } from "@/lib/api/api-error";
import type { TipoAreaItem } from "./tipo-area-table";
import type { TipoAreaResponse } from "../types/tipo-area.types";

interface TipoAreaFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    tipoAreaToEdit?: TipoAreaResponse | TipoAreaItem | null;
    onSuccessCallback?: () => void;
}

export function TipoAreaFormDialog({
    open,
    onOpenChange,
    tipoAreaToEdit,
    onSuccessCallback,
}: TipoAreaFormDialogProps) {
    const isEditing = Boolean(tipoAreaToEdit);

    const createTipoAreaMutation = useCreateTipoArea();
    const updateTipoAreaMutation = useUpdateTipoArea();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<TipoAreaFormValues>({
        resolver: zodResolver(tipoAreaSchema),
        defaultValues: {
            codigo: "",
            nombre: "",
            descripcion: "",
            orden: 0,
        },
    });

    React.useEffect(() => {
        if (open) {
            if (tipoAreaToEdit) {
                reset({
                    codigo: tipoAreaToEdit.codigo,
                    nombre: tipoAreaToEdit.nombre,
                    descripcion: tipoAreaToEdit.descripcion ?? "",
                    orden: tipoAreaToEdit.orden ?? 0,
                });
            } else {
                reset({
                    codigo: "",
                    nombre: "",
                    descripcion: "",
                    orden: 0,
                });
            }
        }
    }, [open, tipoAreaToEdit, reset]);

    const onSubmit = async (values: TipoAreaFormValues) => {
        try {
            const payload = {
                codigo: values.codigo,
                nombre: values.nombre,
                descripcion: values.descripcion ? values.descripcion : undefined,
                orden: values.orden,
            };

            if (isEditing && tipoAreaToEdit) {
                const numericId = Number(tipoAreaToEdit.id);
                await updateTipoAreaMutation.mutateAsync({
                    id: isNaN(numericId) ? 0 : numericId,
                    data: payload,
                });
                toast.success(`Tipo de área ${values.codigo} actualizado correctamente.`);
            } else {
                await createTipoAreaMutation.mutateAsync(payload);
                toast.success(`Tipo de área ${values.codigo} creado correctamente.`);
            }
            onSuccessCallback?.();
            onOpenChange(false);
        } catch (error) {
            toast.error(getApiErrorMessage(error));
        }
    };

    const isLoading =
        createTipoAreaMutation.isPending ||
        updateTipoAreaMutation.isPending ||
        isSubmitting;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg p-6">
                <DialogHeader className="space-y-1">
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Building2 className="size-5" />
                        </div>
                        <span>
                            {isEditing ? "Editar Tipo de Área" : "Agregar Nuevo Tipo de Área"}
                        </span>
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                        {isEditing
                            ? "Modifique la información del tipo de área seleccionado."
                            : "Ingrese la información para registrar un nuevo tipo de área en el sistema."}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pt-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground bg-muted/40 px-3 py-1.5 rounded-md border border-border/40">
                        <span>Campos obligatorios</span>
                        <span className="text-destructive font-medium">* Requeridos</span>
                    </div>

                    <div className="space-y-3.5">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground uppercase tracking-wider">
                            <Tag className="size-3.5 text-primary" />
                            <span>Identificación del Tipo de Área</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="space-y-1.5 sm:col-span-1">
                                <Label htmlFor="codigo" className="text-xs flex items-center gap-1">
                                    Código <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="codigo"
                                    placeholder="ej: ADM"
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
                                    placeholder="ej: Administrativo"
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
                                placeholder="Breve descripción del tipo de área..."
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

                    <div className="space-y-3.5 pt-2 border-t border-border/40">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground uppercase tracking-wider">
                            <Hash className="size-3.5 text-primary" />
                            <span>Orden de Visualización</span>
                        </div>

                        <div className="space-y-1.5 sm:max-w-xs">
                            <Label htmlFor="orden" className="text-xs flex items-center gap-1">
                                Orden <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="orden"
                                type="number"
                                min={0}
                                step={1}
                                placeholder="ej: 1"
                                className={cn(
                                    "font-mono text-sm h-9",
                                    errors.orden && "border-destructive focus-visible:ring-destructive",
                                )}
                                aria-invalid={Boolean(errors.orden)}
                                {...register("orden", { valueAsNumber: true })}
                            />
                            {errors.orden && (
                                <p className="text-[11px] text-destructive font-medium">
                                    {errors.orden.message}
                                </p>
                            )}
                            <p className="text-[11px] text-muted-foreground">
                                Los valores más bajos aparecen primero en los listados.
                            </p>
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
                            {isEditing ? "Guardar Cambios" : "Crear Tipo de Área"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}