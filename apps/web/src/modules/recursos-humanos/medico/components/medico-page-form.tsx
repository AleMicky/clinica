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
  Stethoscope,
  FileBadge,
  Award,
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
  medicoSchema,
  type MedicoFormValues,
} from "../schemas/medico.schema";
import {
  useCreateMedico,
  useUpdateMedico,
  useMedico,
  useMedicos,
} from "../hooks/use-medicos";
import { useEmpleados } from "@/modules/recursos-humanos/empleado";
import { getMedicoFullName } from "./medico-list";

interface MedicoPageFormProps {
  id?: number;
}

export function MedicoPageForm({ id }: MedicoPageFormProps) {
  const router = useRouter();
  const isEditing = Boolean(id && id > 0);

  const { data: medicoData, isLoading: isLoadingMedico } = useMedico(
    id || 0,
    isEditing
  );

  const createMutation = useCreateMedico();
  const updateMutation = useUpdateMedico();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<MedicoFormValues>({
    resolver: zodResolver(medicoSchema),
    defaultValues: {
      empleadoId: 0,
      matriculaProfesional: "",
      registroMinisterioSalud: "",
    },
  });

  const empleadosQuery = useEmpleados({ pageSize: 100 });
  const empleados = React.useMemo(
    () => empleadosQuery.data?.items ?? [],
    [empleadosQuery.data]
  );

  const medicosExistentesQuery = useMedicos({ pageSize: 500 });
  const empleadosOcupados = React.useMemo(() => {
    const ids = new Set<number>();
    const editingId = Number(id);
    medicosExistentesQuery.data?.items?.forEach((m) => {
      if (m.id !== editingId) ids.add(m.empleadoId);
    });
    return ids;
  }, [medicosExistentesQuery.data, id]);

  const empleadoIdWatch = watch("empleadoId");

  // Load existing medico data in edit mode
  React.useEffect(() => {
    if (medicoData && isEditing) {
      reset({
        empleadoId: medicoData.empleadoId,
        matriculaProfesional: medicoData.matriculaProfesional || "",
        registroMinisterioSalud: medicoData.registroMinisterioSalud || "",
      });
    }
  }, [medicoData, isEditing, reset]);

  const onSubmit = async (values: MedicoFormValues) => {
    try {
      const payload = {
        empleadoId: values.empleadoId,
        matriculaProfesional: values.matriculaProfesional.trim(),
        registroMinisterioSalud: values.registroMinisterioSalud?.trim() || null,
      };

      if (isEditing && id) {
        await updateMutation.mutateAsync({
          id,
          request: payload,
        });
      } else {
        await createMutation.mutateAsync(payload);
      }
      router.push("/recursos-humanos/medicos");
    } catch {
      // Error handled by mutation toast
    }
  };

  const isSaving =
    createMutation.isPending || updateMutation.isPending || isSubmitting;

  if (isEditing && isLoadingMedico) {
    return (
      <div className="flex flex-col gap-4 w-full p-2">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  const doctorNombre = medicoData ? getMedicoFullName(medicoData) : "";

  return (
    <div className="flex flex-col gap-3.5 w-full pb-8">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/recursos-humanos/medicos")}
            className="h-8 px-2 text-xs gap-1.5 cursor-pointer text-muted-foreground hover:text-foreground shrink-0 rounded-lg"
          >
            <ArrowLeft className="size-4" />
            <span className="hidden sm:inline">Volver a Médicos</span>
          </Button>

          <div className="h-5 w-px bg-border/60 shrink-0" />

          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0 shadow-2xs">
              <Stethoscope className="size-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-bold text-foreground truncate">
                  {isEditing
                    ? `Editar Médico: Dr(a). ${doctorNombre} (#${medicoData?.matriculaProfesional || ""})`
                    : "Registrar Nuevo Médico"}
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
                  ? "Actualice los datos de matrícula profesional y registros ministeriales."
                  : "Vincule un empleado de la clínica y registre sus credenciales médicas."}
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
            onClick={() => router.push("/recursos-humanos/medicos")}
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
            <span>{isEditing ? "Guardar Cambios" : "Registrar Médico"}</span>
          </Button>
        </div>
      </div>

      {/* Unified Form Card Container */}
      <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4">
        <Card className="border border-border/70 shadow-2xs rounded-xl overflow-hidden bg-card">
          <CardContent className="p-4 sm:p-5 space-y-6">
            {/* SECCIÓN 1: SELECCIÓN DE EMPLEADO */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-border/60">
                <div className="size-6 rounded-md bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <User className="size-3.5" />
                </div>
                <div>
                  <h2 className="text-xs sm:text-sm font-bold text-foreground">
                    Empleado Vinculado
                  </h2>
                  <p className="text-[11px] text-muted-foreground">
                    {isEditing
                      ? "Empleado asociado a este expediente médico (solo lectura)."
                      : "Seleccione un empleado de la clínica para registrarlo como médico."}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="empleadoId" className="text-xs font-medium flex items-center gap-0.5">
                  Empleado de la Clínica <span className="text-destructive">*</span>
                </Label>

                {isEditing ? (
                  <div className="p-3 rounded-lg border border-border/70 bg-muted/20 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                        {medicoData?.empleado?.persona?.nombres?.[0] || "DR"}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">
                          {doctorNombre}
                        </p>
                        <p className="text-[11px] text-muted-foreground font-mono">
                          Código Empleado: {medicoData?.empleado?.codigoEmpleado || "—"}
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
                      value={empleadoIdWatch ? String(empleadoIdWatch) : ""}
                      onValueChange={(val) => setValue("empleadoId", Number(val), { shouldValidate: true })}
                      disabled={empleadosQuery.isLoading}
                    >
                      <SelectTrigger
                        id="empleadoId"
                        className={cn(
                          "w-full h-8.5 text-xs",
                          errors.empleadoId && "border-destructive focus-visible:ring-destructive"
                        )}
                      >
                        <SelectValue placeholder={empleadosQuery.isLoading ? "Cargando empleados..." : "Seleccione un empleado..."} />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {empleados.length === 0 ? (
                          <div className="p-2 text-xs text-muted-foreground text-center">
                            No hay empleados disponibles.
                          </div>
                        ) : (
                          empleados.map((emp) => {
                            const isOcupado = empleadosOcupados.has(emp.id);
                            const nom = emp.persona
                              ? `${emp.persona.nombres} ${emp.persona.apellidoPaterno} ${emp.persona.apellidoMaterno || ""}`
                              : `Empleado #${emp.id}`;
                            return (
                              <SelectItem
                                key={emp.id}
                                value={String(emp.id)}
                                disabled={isOcupado}
                                className="text-xs cursor-pointer"
                              >
                                {nom} (#{emp.codigoEmpleado})
                                {isOcupado ? " [Ya es médico]" : ""}
                              </SelectItem>
                            );
                          })
                        )}
                      </SelectContent>
                    </Select>

                    {errors.empleadoId && (
                      <p className="text-[10px] text-destructive font-medium">{errors.empleadoId.message}</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* SECCIÓN 2: COLEGIATURA Y REGISTROS */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2 pb-2 border-b border-border/60">
                <div className="size-6 rounded-md bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <Award className="size-3.5" />
                </div>
                <div>
                  <h2 className="text-xs sm:text-sm font-bold text-foreground">
                    Registros y Colegiatura Profesional
                  </h2>
                  <p className="text-[11px] text-muted-foreground">
                    Matrícula del colegio médico y registro ante el ministerio de salud.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Matrícula Profesional */}
                <div className="space-y-1">
                  <Label htmlFor="matriculaProfesional" className="text-xs font-medium flex items-center gap-0.5">
                    Matrícula Profesional <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="matriculaProfesional"
                    placeholder="ej. MP-12345"
                    className={cn("w-full font-mono uppercase h-8 text-xs", errors.matriculaProfesional && "border-destructive focus-visible:ring-destructive")}
                    {...register("matriculaProfesional")}
                  />
                  {errors.matriculaProfesional && (
                    <p className="text-[10px] text-destructive font-medium">{errors.matriculaProfesional.message}</p>
                  )}
                </div>

                {/* Registro Ministerio de Salud */}
                <div className="space-y-1">
                  <Label htmlFor="registroMinisterioSalud" className="text-xs font-medium">
                    Registro Ministerio de Salud
                  </Label>
                  <Input
                    id="registroMinisterioSalud"
                    placeholder="ej. MS-98765"
                    className="w-full font-mono uppercase h-8 text-xs"
                    {...register("registroMinisterioSalud")}
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Opcional. Registro nacional oficial ante el ministerio.
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
                onClick={() => router.push("/recursos-humanos/medicos")}
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
                <span>{isEditing ? "Guardar Cambios" : "Registrar Médico"}</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
