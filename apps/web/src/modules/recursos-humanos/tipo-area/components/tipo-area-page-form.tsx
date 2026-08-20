"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  ArrowLeft,
  Loader2,
  Save,
  Layers,
  FileText,
  ListOrdered,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

import {
  tipoAreaSchema,
  type TipoAreaFormValues,
} from "../schemas/tipo-area.schema";
import {
  useCreateTipoArea,
  useUpdateTipoArea,
  useTipoArea,
} from "../hooks/use-tipos-area";

interface TipoAreaPageFormProps {
  id?: number;
}

export function TipoAreaPageForm({ id }: TipoAreaPageFormProps) {
  const router = useRouter();
  const isEditing = Boolean(id && id > 0);

  const { data: tipoAreaData, isLoading: isLoadingTipoArea } = useTipoArea(
    id || 0,
    isEditing
  );

  const createMutation = useCreateTipoArea();
  const updateMutation = useUpdateTipoArea();

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

  // Load existing tipoArea data in edit mode
  React.useEffect(() => {
    if (tipoAreaData && isEditing) {
      reset({
        codigo: tipoAreaData.codigo || "",
        nombre: tipoAreaData.nombre || "",
        descripcion: tipoAreaData.descripcion || "",
        orden: tipoAreaData.orden ?? 0,
      });
    }
  }, [tipoAreaData, isEditing, reset]);

  const onSubmit = async (values: TipoAreaFormValues) => {
    try {
      const payload = {
        codigo: values.codigo.trim().toUpperCase(),
        nombre: values.nombre.trim(),
        descripcion: values.descripcion?.trim() || undefined,
        orden: Number(values.orden) || 0,
      };

      if (isEditing && id) {
        await updateMutation.mutateAsync({
          id,
          data: payload,
        });
        toast.success("Tipo de área actualizado correctamente.");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Tipo de área registrado exitosamente.");
      }
      router.push("/recursos-humanos/tipos-area");
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        error?.message ||
        "Ocurrió un error al procesar la solicitud.";
      toast.error(errorMsg);
    }
  };

  const isSaving =
    createMutation.isPending || updateMutation.isPending || isSubmitting;

  if (isEditing && isLoadingTipoArea) {
    return (
      <div className="flex flex-col gap-4 w-full p-2">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3.5 w-full pb-8">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/recursos-humanos/tipos-area")}
            className="h-8 px-2 text-xs gap-1.5 cursor-pointer text-muted-foreground hover:text-foreground shrink-0 rounded-lg"
          >
            <ArrowLeft className="size-4" />
            <span className="hidden sm:inline">Volver a Tipos de Área</span>
          </Button>

          <div className="h-5 w-px bg-border/60 shrink-0" />

          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0 shadow-2xs">
              <Layers className="size-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-bold text-foreground truncate">
                  {isEditing
                    ? `Editar Tipo de Área: ${tipoAreaData?.nombre || ""} (#${tipoAreaData?.codigo || ""})`
                    : "Registrar Nuevo Tipo de Área"}
                </h1>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px] px-1.5 py-0 font-semibold h-4.5 hidden sm:inline-flex",
                    isEditing
                      ? "bg-primary/5 text-primary border-primary/20"
                      : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                  )}
                >
                  {isEditing ? "Modo Edición" : "Nuevo Registro"}
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground truncate">
                {isEditing
                  ? "Actualice los parámetros de clasificación y orden de este tipo de área."
                  : "Defina una nueva categoría para agrupar áreas organizacionales."}
              </p>
            </div>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.push("/recursos-humanos/tipos-area")}
            disabled={isSaving}
            className="h-8 px-3 text-xs cursor-pointer rounded-lg"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSubmit(onSubmit)}
            disabled={isSaving}
            className="h-8 px-3.5 text-xs gap-1.5 cursor-pointer shadow-2xs font-semibold rounded-lg"
          >
            {isSaving ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Save className="size-3.5" />
            )}
            <span>{isEditing ? "Guardar Cambios" : "Registrar Tipo de Área"}</span>
          </Button>
        </div>
      </div>

      {/* Unified Form Card Container */}
      <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4">
        <Card className="border border-border/70 shadow-2xs rounded-xl overflow-hidden bg-card">
          <CardContent className="p-4 sm:p-5 space-y-6">
            {/* SECCIÓN 1: DATOS PRINCIPALES */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-border/60">
                <div className="size-6 rounded-md bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <Layers className="size-3.5" />
                </div>
                <div>
                  <h2 className="text-xs sm:text-sm font-bold text-foreground">
                    Identificación del Tipo de Área
                  </h2>
                  <p className="text-[11px] text-muted-foreground">
                    Código de identificación único, denominación y orden de visualización.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                {/* Código */}
                <div className="space-y-1">
                  <Label htmlFor="codigo" className="text-xs font-medium flex items-center gap-0.5">
                    Código <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="codigo"
                    placeholder="ej. MED"
                    className={cn("w-full font-mono uppercase h-8 text-xs", errors.codigo && "border-destructive focus-visible:ring-destructive")}
                    {...register("codigo")}
                  />
                  {errors.codigo && (
                    <p className="text-[10px] text-destructive font-medium">{errors.codigo.message}</p>
                  )}
                </div>

                {/* Nombre */}
                <div className="space-y-1 sm:col-span-2">
                  <Label htmlFor="nombre" className="text-xs font-medium flex items-center gap-0.5">
                    Nombre del Tipo de Área <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="nombre"
                    placeholder="ej. Área Médica Asistencial"
                    className={cn("w-full h-8 text-xs", errors.nombre && "border-destructive focus-visible:ring-destructive")}
                    {...register("nombre")}
                  />
                  {errors.nombre && (
                    <p className="text-[10px] text-destructive font-medium">{errors.nombre.message}</p>
                  )}
                </div>

                {/* Orden */}
                <div className="space-y-1">
                  <Label htmlFor="orden" className="text-xs font-medium flex items-center gap-0.5">
                    Orden Jerárquico <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="orden"
                    type="number"
                    min="0"
                    placeholder="0"
                    className={cn("w-full h-8 text-xs font-mono", errors.orden && "border-destructive focus-visible:ring-destructive")}
                    {...register("orden", { valueAsNumber: true })}
                  />
                  {errors.orden && (
                    <p className="text-[10px] text-destructive font-medium">{errors.orden.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* SECCIÓN 2: DESCRIPCIÓN */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2 pb-2 border-b border-border/60">
                <div className="size-6 rounded-md bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <FileText className="size-3.5" />
                </div>
                <div>
                  <h2 className="text-xs sm:text-sm font-bold text-foreground">
                    Descripción y Alcance
                  </h2>
                  <p className="text-[11px] text-muted-foreground">
                    Detalle del tipo de servicios o áreas comprendidas en esta categoría.
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="descripcion" className="text-xs font-medium">
                  Descripción
                </Label>
                <Textarea
                  id="descripcion"
                  placeholder="Detalle breve de la clasificación de este tipo de área..."
                  className="w-full text-xs min-h-[90px] resize-y"
                  {...register("descripcion")}
                />
                {errors.descripcion && (
                  <p className="text-[10px] text-destructive font-medium">{errors.descripcion.message}</p>
                )}
              </div>
            </div>

            {/* Bottom Actions inside Card */}
            <div className="flex items-center justify-end gap-2 pt-4 border-t border-border/60">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => router.push("/recursos-humanos/tipos-area")}
                disabled={isSaving}
                className="h-8 px-3.5 text-xs cursor-pointer rounded-lg"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSaving}
                className="h-8 px-4 text-xs gap-1.5 cursor-pointer shadow-2xs font-semibold rounded-lg"
              >
                {isSaving ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Save className="size-3.5" />
                )}
                <span>{isEditing ? "Guardar Cambios" : "Registrar Tipo de Área"}</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
