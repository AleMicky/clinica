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
  User,
  Briefcase,
  IdCard,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

import {
  empleadoSchema,
  type EmpleadoFormValues,
} from "../schemas/empleado.schema";
import {
  useCreateEmpleado,
  useUpdateEmpleado,
  useEmpleado,
  useEmpleados as useEmpleadosLista,
} from "../hooks/use-empleados";
import { usePersonas } from "@/modules/seguridad/persona";
import { nombreCompleto, documentoCompleto } from "../types/empleado.types";

interface EmpleadoPageFormProps {
  id?: number;
}

function toISODate(value?: string | Date | null): string {
  if (!value) return "";
  const d = value instanceof Date ? value : new Date(value);
  if (isNaN(d.getTime())) return typeof value === "string" ? value : "";
  const tz = d.getTimezoneOffset() * 60000;
  const local = new Date(d.getTime() - tz);
  return local.toISOString().slice(0, 10);
}

export function EmpleadoPageForm({ id }: EmpleadoPageFormProps) {
  const router = useRouter();
  const isEditing = Boolean(id && id > 0);

  const { data: empleadoData, isLoading: isLoadingEmpleado } = useEmpleado(
    id || 0,
    isEditing
  );

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
    [personasQuery.data]
  );

  const empleadosExistentesQuery = useEmpleadosLista({
    page: 1,
    pageSize: 500,
  });
  const personasOcupadas = React.useMemo(() => {
    const ids = new Set<number>();
    const editingId = Number(id);
    empleadosExistentesQuery.data?.items?.forEach((emp) => {
      if (emp.id !== editingId) ids.add(emp.personaId);
    });
    return ids;
  }, [empleadosExistentesQuery.data, id]);

  const personaIdWatch = watch("personaId");

  // Load existing empleado data in edit mode
  React.useEffect(() => {
    if (empleadoData && isEditing) {
      reset({
        personaId: empleadoData.personaId,
        codigoEmpleado: empleadoData.codigoEmpleado || "",
        fechaIngreso: toISODate(empleadoData.fechaIngreso),
        fechaRetiro: toISODate(empleadoData.fechaRetiro),
      });
    }
  }, [empleadoData, isEditing, reset]);

  const onSubmit = async (values: EmpleadoFormValues) => {
    try {
      const payload = {
        personaId: values.personaId,
        codigoEmpleado: values.codigoEmpleado?.trim() || null,
        fechaIngreso: values.fechaIngreso.trim(),
        fechaRetiro: values.fechaRetiro?.trim() || null,
      };

      if (isEditing && id) {
        await updateMutation.mutateAsync({
          id,
          data: payload,
        });
        toast.success("Empleado actualizado correctamente.");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Empleado registrado exitosamente.");
      }
      router.push("/recursos-humanos/empleados");
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

  if (isEditing && isLoadingEmpleado) {
    return (
      <div className="flex flex-col gap-4 w-full p-2">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  const empleadoNombre = empleadoData?.persona
    ? nombreCompleto(empleadoData.persona)
    : "";

  return (
    <div className="flex flex-col gap-3.5 w-full pb-8">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/recursos-humanos/empleados")}
            className="h-8 px-2 text-xs gap-1.5 cursor-pointer text-muted-foreground hover:text-foreground shrink-0 rounded-lg"
          >
            <ArrowLeft className="size-4" />
            <span className="hidden sm:inline">Volver a Empleados</span>
          </Button>

          <div className="h-5 w-px bg-border/60 shrink-0" />

          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0 shadow-2xs">
              <Briefcase className="size-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-bold text-foreground truncate">
                  {isEditing
                    ? `Editar Empleado: ${empleadoNombre} (#${empleadoData?.codigoEmpleado || ""})`
                    : "Registrar Nuevo Empleado"}
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
                  ? "Actualice los parámetros laborales del empleado registrado."
                  : "Vincule una persona titular y configure sus datos de contratación."}
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
            onClick={() => router.push("/recursos-humanos/empleados")}
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
            <span>{isEditing ? "Guardar Cambios" : "Registrar Empleado"}</span>
          </Button>
        </div>
      </div>

      {/* Unified Form Card Container */}
      <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4">
        <Card className="border border-border/70 shadow-2xs rounded-xl overflow-hidden bg-card">
          <CardContent className="p-4 sm:p-5 space-y-6">
            {/* SECCIÓN 1: SELECCIÓN DE PERSONA */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-border/60">
                <div className="size-6 rounded-md bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <User className="size-3.5" />
                </div>
                <div>
                  <h2 className="text-xs sm:text-sm font-bold text-foreground">
                    Persona Titular
                  </h2>
                  <p className="text-[11px] text-muted-foreground">
                    {isEditing
                      ? "Persona asociada a esta ficha de empleado (solo lectura)."
                      : "Seleccione una persona registrada del directorio para vincularla como empleado."}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="personaId" className="text-xs font-medium flex items-center gap-0.5">
                  Persona Titular <span className="text-destructive">*</span>
                </Label>

                {isEditing ? (
                  <div className="p-3 rounded-lg border border-border/70 bg-muted/20 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                        {empleadoData?.persona?.nombres?.[0] || "E"}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">
                          {empleadoData?.persona ? nombreCompleto(empleadoData.persona) : "—"}
                        </p>
                        <p className="text-[11px] text-muted-foreground font-mono">
                          {empleadoData?.persona ? documentoCompleto(empleadoData.persona) : ""}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px] bg-muted">
                      No modificable
                    </Badge>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <Select
                      value={personaIdWatch ? String(personaIdWatch) : ""}
                      onValueChange={(val) => setValue("personaId", Number(val), { shouldValidate: true })}
                      disabled={personasQuery.isLoading}
                    >
                      <SelectTrigger
                        id="personaId"
                        className={cn(
                          "w-full h-8.5 text-xs",
                          errors.personaId && "border-destructive focus-visible:ring-destructive"
                        )}
                      >
                        <SelectValue placeholder={personasQuery.isLoading ? "Cargando personas..." : "Seleccione una persona..."} />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {personas.length === 0 ? (
                          <div className="p-2 text-xs text-muted-foreground text-center">
                            No hay personas disponibles.
                          </div>
                        ) : (
                          personas.map((p) => {
                            const isOcupada = personasOcupadas.has(p.id);
                            return (
                              <SelectItem
                                key={p.id}
                                value={String(p.id)}
                                disabled={isOcupada}
                                className="text-xs cursor-pointer"
                              >
                                {p.nombres} {p.apellidoPaterno} {p.apellidoMaterno || ""} ({p.tipoDocumento}: {p.numeroDocumento})
                                {isOcupada ? " [Ya es empleado]" : ""}
                              </SelectItem>
                            );
                          })
                        )}
                      </SelectContent>
                    </Select>

                    {errors.personaId && (
                      <p className="text-[10px] text-destructive font-medium">{errors.personaId.message}</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* SECCIÓN 2: DATOS LABORALES */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2 pb-2 border-b border-border/60">
                <div className="size-6 rounded-md bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <IdCard className="size-3.5" />
                </div>
                <div>
                  <h2 className="text-xs sm:text-sm font-bold text-foreground">
                    Datos Laborales y Contractuales
                  </h2>
                  <p className="text-[11px] text-muted-foreground">
                    Parámetros de contratación, código interno y fechas laborales.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Código de Empleado */}
                <div className="space-y-1">
                  <Label htmlFor="codigoEmpleado" className="text-xs font-medium">
                    Código de Empleado
                  </Label>
                  <Input
                    id="codigoEmpleado"
                    placeholder="ej. EMP-001"
                    className="w-full font-mono uppercase h-8 text-xs"
                    {...register("codigoEmpleado")}
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Opcional. Si se deja vacío se generará automáticamente.
                  </p>
                </div>

                {/* Fecha de Ingreso */}
                <div className="space-y-1">
                  <Label htmlFor="fechaIngreso" className="text-xs font-medium flex items-center gap-0.5">
                    Fecha de Ingreso <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="fechaIngreso"
                    type="date"
                    className={cn("w-full h-8 text-xs", errors.fechaIngreso && "border-destructive focus-visible:ring-destructive")}
                    {...register("fechaIngreso")}
                  />
                  {errors.fechaIngreso && (
                    <p className="text-[10px] text-destructive font-medium">{errors.fechaIngreso.message}</p>
                  )}
                </div>

                {/* Fecha de Retiro */}
                <div className="space-y-1">
                  <Label htmlFor="fechaRetiro" className="text-xs font-medium">
                    Fecha de Retiro / Término
                  </Label>
                  <Input
                    id="fechaRetiro"
                    type="date"
                    className="w-full h-8 text-xs"
                    {...register("fechaRetiro")}
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Opcional. Dejar vacío si el contrato sigue vigente.
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Actions inside Card */}
            <div className="flex items-center justify-end gap-2 pt-4 border-t border-border/60">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => router.push("/recursos-humanos/empleados")}
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
                <span>{isEditing ? "Guardar Cambios" : "Registrar Empleado"}</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
