"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Briefcase, Loader2, Tag, FileText } from "lucide-react";

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

import { cargoSchema, type CargoFormValues } from "../schemas/cargo.schema";
import { useCreateCargo, useUpdateCargo } from "../hooks/use-cargos";
import type { CargoItem } from "./cargo-table";
import type { CargoResponse } from "../types/cargo.types";

interface CargoFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    cargoToEdit?: CargoResponse | CargoItem | null;
    onSuccessCallback?: () => void;
}

export function CargoFormDialog({
    open,
    onOpenChange,
    cargoToEdit,
    onSuccessCallback,
}: CargoFormDialogProps) {
    const isEditing = Boolean(cargoToEdit);

    const createCargoMutation = useCreateCargo();
    const updateCargoMutation = useUpdateCargo();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<CargoFormValues>({
        resolver: zodResolver(cargoSchema),
        defaultValues: {
            codigo: "",
            nombre: "",
            descripcion: "",
        },
    });

    React.useEffect(() => {
        if (open) {
            if (cargoToEdit) {
                reset({
                    codigo: cargoToEdit.codigo,
                    nombre: cargoToEdit.nombre,
                    descripcion: cargoToEdit.descripcion ?? "",
                });
            } else {
                reset({
                    codigo: "",
                    nombre: "",
                    descripcion: "",
                });
            }
        }
    }, [open, cargoToEdit, reset]);

    const onSubmit = async (values: CargoFormValues) => {
        try {
            const payload = {
                codigo: values.codigo,
                nombre: values.nombre,
                descripcion: values.descripcion ? values.descripcion : undefined,
            };

            if (isEditing && cargoToEdit) {
                const numericId = Number(cargoToEdit.id);
                await updateCargoMutation.mutateAsync({
                    id: isNaN(numericId) ? 0 : numericId,
                    data: payload,
                });
                toast.success(`Cargo ${values.codigo} actualizado correctamente.`);
            } else {
                await createCargoMutation.mutateAsync(payload);
                toast.success(`Cargo ${values.codigo} creado correctamente.`);
            }
            onSuccessCallback?.();
            onOpenChange(false);
        } catch {
        }
    };

    const isLoading =
        createCargoMutation.isPending || updateCargoMutation.isPending || isSubmitting;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg p-6">
                <DialogHeader className="space-y-1">
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Briefcase className="size-5" />
                        </div>
                        <span>{isEditing ? "Editar Cargo" : "Agregar Nuevo Cargo"}</span>
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                        {isEditing
                            ? "Modifique la información del cargo seleccionado."
                            : "Ingrese la información para registrar un nuevo cargo en el sistema."}
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
                            <span>Identificación del Cargo</span>
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
                                    Nombre del Cargo <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="nombre"
                                    placeholder="ej: Médico General"
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
                                placeholder="Breve descripción de las responsabilidades del cargo..."
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
                            className="text-xs"
                        >
                            Cancelar
                        </Button>

                        <Button type="submit" disabled={isLoading} className="text-xs gap-1.5">
                            {isLoading && <Loader2 className="size-3.5 animate-spin" />}
                            {isEditing ? "Guardar Cambios" : "Crear Cargo"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}