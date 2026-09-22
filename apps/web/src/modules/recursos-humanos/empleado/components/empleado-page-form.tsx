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
  UserCheck,
  Briefcase,
  Phone,
  MapPin,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CatalogoAutocomplete } from "@/components/ui/catalogo-autocomplete";
import { DatePicker } from "@/components/ui/date-picker";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

import {
  empleadoSchema,
  type EmpleadoFormValues,
} from "../schemas/empleado.schema";
import {
  useCreateEmpleadoConPersona,
  useUpdateEmpleadoConPersona,
  useEmpleado,
} from "../hooks/use-empleados";
import { nombreCompleto } from "../types/empleado.types";

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

function getTodayISO(): string {
  const now = new Date();
  const tz = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - tz).toISOString().slice(0, 10);
}

export function EmpleadoPageForm({ id }: EmpleadoPageFormProps) {
  const router = useRouter();
  const isEditing = Boolean(id && id > 0);

  const { data: empleadoData, isLoading: isLoadingEmpleado } = useEmpleado(
    id || 0,
    isEditing
  );

  const createMutation = useCreateEmpleadoConPersona();
  const updateMutation = useUpdateEmpleadoConPersona();

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
      nombres: "",
      apellidoPaterno: "",
      apellidoMaterno: "",
      tipoDocumento: "CI",
      numeroDocumento: "",
      extensionDocumento: "",
      complementoDocumento: "",
      fechaNacimiento: "",
      genero: "",
      estadoCivil: "",
      telefono: "",
      direccion: "",
      fechaIngreso: getTodayISO(),
      fechaRetiro: "",
    },
  });

  const tipoDocumentoVal = watch("tipoDocumento") || "";
  const extensionDocumentoVal = watch("extensionDocumento") || "";
  const generoVal = watch("genero") || "";
  const estadoCivilVal = watch("estadoCivil") || "";
  const fechaNacimientoVal = watch("fechaNacimiento") || "";
  const fechaIngresoVal = watch("fechaIngreso") || "";
  const fechaRetiroVal = watch("fechaRetiro") || "";

  // Register custom autocompletes / pickers
  React.useEffect(() => {
    register("tipoDocumento");
    register("extensionDocumento");
    register("genero");
    register("estadoCivil");
    register("fechaNacimiento");
    register("fechaIngreso");
    register("fechaRetiro");
  }, [register]);

  // Load existing empleado data in edit mode
  React.useEffect(() => {
    if (empleadoData && isEditing) {
      const p = empleadoData.persona;
      reset({
        nombres: p?.nombres || "",
        apellidoPaterno: p?.apellidoPaterno || "",
        apellidoMaterno: p?.apellidoMaterno || "",
        tipoDocumento: p?.tipoDocumento || "CI",
        numeroDocumento: p?.numeroDocumento || "",
        extensionDocumento: p?.extensionDocumento || "",
        complementoDocumento: p?.complementoDocumento || "",
        fechaNacimiento: toISODate(p?.fechaNacimiento),
        genero: p?.genero || "",
        estadoCivil: p?.estadoCivil || "",
        telefono: p?.telefono || "",
        direccion: p?.direccion || "",
        fechaIngreso: toISODate(empleadoData.fechaIngreso),
        fechaRetiro: toISODate(empleadoData.fechaRetiro),
      });
    }
  }, [empleadoData, isEditing, reset]);

  const onSubmit = async (values: EmpleadoFormValues) => {
    try {
      const payload = {
        fechaIngreso: values.fechaIngreso.trim(),
        fechaRetiro: values.fechaRetiro?.trim() || null,
        persona: {
          nombres: values.nombres.trim(),
          apellidoPaterno: values.apellidoPaterno.trim(),
          apellidoMaterno: values.apellidoMaterno?.trim() || null,
          tipoDocumento: values.tipoDocumento.trim(),
          numeroDocumento: values.numeroDocumento.trim(),
          extensionDocumento: values.extensionDocumento?.trim() || null,
          complementoDocumento: values.complementoDocumento?.trim() || null,
          fechaNacimiento: values.fechaNacimiento.trim(),
          genero: values.genero?.trim() || null,
          estadoCivil: values.estadoCivil?.trim() || null,
          telefono: values.telefono?.trim() || null,
          direccion: values.direccion?.trim() || null,
        },
      };

      if (isEditing && id) {
        await updateMutation.mutateAsync({
          id,
          data: payload,
        });
        toast.success(`Empleado "${values.nombres} ${values.apellidoPaterno}" actualizado correctamente.`);
      } else {
        await createMutation.mutateAsync(payload);
        toast.success(`Empleado "${values.nombres} ${values.apellidoPaterno}" registrado exitosamente.`);
      }

      router.push("/recursos-humanos/empleados");
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { detail?: string; message?: string } };
        message?: string;
      };
      const errorMsg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        "Ocurrió un error al procesar el registro del empleado.";
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

  const empleadoNombre = empleadoData
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
              <UserCheck className="size-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-bold text-foreground truncate">
                  {isEditing ? `Editar Empleado: ${empleadoNombre}` : "Registrar Nuevo Empleado"}
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
                  ? "Actualice los datos personales, de contacto y parámetros laborales del empleado."
                  : "Complete los datos filiatorios de la persona y sus fechas de contratación laboral."}
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

      {/* Unified Form Container */}
      <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4">
        <Card className="border border-border/70 shadow-2xs rounded-xl overflow-hidden bg-card">
          <CardContent className="p-4 sm:p-5 space-y-6">
            
            {/* SECCIÓN 1: DATOS PERSONALES Y DOCUMENTO DE IDENTIDAD */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-border/60">
                <div className="size-6 rounded-md bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <User className="size-3.5" />
                </div>
                <div>
                  <h2 className="text-xs sm:text-sm font-bold text-foreground">
                    1. Información Filiatoria y de Identidad
                  </h2>
                  <p className="text-[11px] text-muted-foreground">
                    Datos personales y documento oficial de identificación.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-12 gap-3">
                {/* Nombres */}
                <div className="space-y-1 sm:col-span-1 md:col-span-1 lg:col-span-4">
                  <Label htmlFor="nombres" className="text-xs font-medium flex items-center gap-0.5">
                    Nombres <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="nombres"
                    placeholder="ej. Juan Carlos"
                    className={cn(
                      "w-full h-8 text-xs bg-background",
                      errors.nombres && "border-destructive focus-visible:ring-destructive"
                    )}
                    {...register("nombres")}
                    disabled={isSaving}
                  />
                  {errors.nombres && (
                    <p className="text-[10px] text-destructive font-medium">{errors.nombres.message}</p>
                  )}
                </div>

                {/* Apellido Paterno */}
                <div className="space-y-1 sm:col-span-1 md:col-span-1 lg:col-span-4">
                  <Label htmlFor="apellidoPaterno" className="text-xs font-medium flex items-center gap-0.5">
                    Apellido Paterno <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="apellidoPaterno"
                    placeholder="ej. Quispe"
                    className={cn(
                      "w-full h-8 text-xs bg-background",
                      errors.apellidoPaterno && "border-destructive focus-visible:ring-destructive"
                    )}
                    {...register("apellidoPaterno")}
                    disabled={isSaving}
                  />
                  {errors.apellidoPaterno && (
                    <p className="text-[10px] text-destructive font-medium">{errors.apellidoPaterno.message}</p>
                  )}
                </div>

                {/* Apellido Materno */}
                <div className="space-y-1 sm:col-span-2 md:col-span-1 lg:col-span-4">
                  <Label htmlFor="apellidoMaterno" className="text-xs font-medium">
                    Apellido Materno
                  </Label>
                  <Input
                    id="apellidoMaterno"
                    placeholder="ej. Mamani"
                    className="w-full h-8 text-xs bg-background"
                    {...register("apellidoMaterno")}
                    disabled={isSaving}
                  />
                </div>

                {/* Tipo Documento */}
                <div className="space-y-1 sm:col-span-1 md:col-span-1 lg:col-span-3">
                  <Label htmlFor="tipoDocumento" className="text-xs font-medium flex items-center gap-0.5">
                    Tipo Documento <span className="text-destructive">*</span>
                  </Label>
                  <CatalogoAutocomplete
                    id="tipoDocumento"
                    codigo="TIPO_DOCUMENTO"
                    value={tipoDocumentoVal}
                    onValueChange={(val) =>
                      setValue("tipoDocumento", val || "", { shouldValidate: true })
                    }
                    fallbackOptions={["CI", "PASAPORTE", "EXTRANJERO", "NIT"]}
                    placeholder="Seleccionar tipo"
                    emptyText="Sin tipos"
                    className="h-8 text-xs bg-background"
                    error={Boolean(errors.tipoDocumento)}
                    disabled={isSaving}
                  />
                  {errors.tipoDocumento && (
                    <p className="text-[10px] text-destructive font-medium">{errors.tipoDocumento.message}</p>
                  )}
                </div>

                {/* Número Documento */}
                <div className="space-y-1 sm:col-span-1 md:col-span-1 lg:col-span-3">
                  <Label htmlFor="numeroDocumento" className="text-xs font-medium flex items-center gap-0.5">
                    Número <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="numeroDocumento"
                    placeholder="12345678"
                    className={cn(
                      "w-full font-mono h-8 text-xs bg-background",
                      errors.numeroDocumento && "border-destructive focus-visible:ring-destructive"
                    )}
                    {...register("numeroDocumento")}
                    disabled={isSaving}
                  />
                  {errors.numeroDocumento && (
                    <p className="text-[10px] text-destructive font-medium">{errors.numeroDocumento.message}</p>
                  )}
                </div>

                {/* Extensión */}
                <div className="space-y-1 sm:col-span-1 md:col-span-1 lg:col-span-3">
                  <Label htmlFor="extensionDocumento" className="text-xs font-medium">
                    Extensión
                  </Label>
                  <CatalogoAutocomplete
                    id="extensionDocumento"
                    codigo="EXTENSION_BOLIVIA"
                    value={extensionDocumentoVal}
                    onValueChange={(val) =>
                      setValue("extensionDocumento", val || "", { shouldValidate: true })
                    }
                    fallbackOptions={["LP", "CB", "SC", "OR", "PT", "TJ", "CH", "BE", "PD"]}
                    placeholder="Extensión (ej. LP)"
                    emptyText="Sin extensión"
                    className="h-8 text-xs bg-background"
                    disabled={isSaving}
                  />
                </div>

                {/* Complemento */}
                <div className="space-y-1 sm:col-span-1 md:col-span-1 lg:col-span-3">
                  <Label htmlFor="complementoDocumento" className="text-xs font-medium">
                    Complemento
                  </Label>
                  <Input
                    id="complementoDocumento"
                    placeholder="ej. 1A"
                    className="w-full font-mono h-8 text-xs uppercase bg-background"
                    {...register("complementoDocumento")}
                    disabled={isSaving}
                  />
                </div>

                {/* Fecha Nacimiento */}
                <div className="space-y-1 sm:col-span-1 md:col-span-1 lg:col-span-4">
                  <Label htmlFor="fechaNacimiento" className="text-xs font-medium flex items-center gap-0.5">
                    Fecha de Nacimiento <span className="text-destructive">*</span>
                  </Label>
                  <DatePicker
                    id="fechaNacimiento"
                    value={fechaNacimientoVal}
                    onChange={(val) =>
                      setValue("fechaNacimiento", val, { shouldValidate: true })
                    }
                    placeholder="DD/MM/AAAA"
                    error={Boolean(errors.fechaNacimiento)}
                    maxDate={new Date().toISOString().split("T")[0]}
                    fromYear={1930}
                    toYear={new Date().getFullYear()}
                    className="h-8 text-xs bg-background"
                    disabled={isSaving}
                  />
                  {errors.fechaNacimiento && (
                    <p className="text-[10px] text-destructive font-medium">{errors.fechaNacimiento.message}</p>
                  )}
                </div>

                {/* Género */}
                <div className="space-y-1 sm:col-span-1 md:col-span-1 lg:col-span-4">
                  <Label htmlFor="genero" className="text-xs font-medium">
                    Género
                  </Label>
                  <CatalogoAutocomplete
                    id="genero"
                    codigo="GENERO"
                    value={generoVal}
                    onValueChange={(val) =>
                      setValue("genero", val || "", { shouldValidate: true })
                    }
                    fallbackOptions={["MASCULINO", "FEMENINO", "OTRO"]}
                    placeholder="Seleccione género"
                    emptyText="Sin datos"
                    className="h-8 text-xs bg-background"
                    disabled={isSaving}
                  />
                </div>

                {/* Estado Civil */}
                <div className="space-y-1 sm:col-span-2 md:col-span-1 lg:col-span-4">
                  <Label htmlFor="estadoCivil" className="text-xs font-medium">
                    Estado Civil
                  </Label>
                  <CatalogoAutocomplete
                    id="estadoCivil"
                    codigo="ESTADO_CIVIL"
                    value={estadoCivilVal}
                    onValueChange={(val) =>
                      setValue("estadoCivil", val || "", { shouldValidate: true })
                    }
                    fallbackOptions={["SOLTERO(A)", "CASADO(A)", "DIVORCIADO(A)", "VIUDO(A)", "UNION LIBRE"]}
                    placeholder="Seleccione estado civil"
                    emptyText="Sin datos"
                    className="h-8 text-xs bg-background"
                    disabled={isSaving}
                  />
                </div>
              </div>
            </div>

            {/* SECCIÓN 2: CONTACTO Y UBICACIÓN */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2 pb-2 border-b border-border/60">
                <div className="size-6 rounded-md bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <Phone className="size-3.5" />
                </div>
                <div>
                  <h2 className="text-xs sm:text-sm font-bold text-foreground">
                    2. Datos de Contacto y Ubicación
                  </h2>
                  <p className="text-[11px] text-muted-foreground">
                    Información de contacto telefónico y dirección residencial.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-12 gap-3">
                {/* Teléfono */}
                <div className="space-y-1 sm:col-span-1 md:col-span-1 lg:col-span-4">
                  <Label htmlFor="telefono" className="text-xs font-medium flex items-center gap-0.5">
                    Teléfono / Celular
                  </Label>
                  <Input
                    id="telefono"
                    placeholder="ej. 77712345"
                    className="w-full h-8 text-xs bg-background"
                    {...register("telefono")}
                    disabled={isSaving}
                  />
                </div>

                {/* Dirección */}
                <div className="space-y-1 sm:col-span-2 md:col-span-2 lg:col-span-8">
                  <Label htmlFor="direccion" className="text-xs font-medium flex items-center gap-1">
                    <MapPin className="size-3 text-muted-foreground" />
                    Dirección Residencial
                  </Label>
                  <Input
                    id="direccion"
                    placeholder="ej. Av. América #123, Zona Central"
                    className="w-full h-8 text-xs bg-background"
                    {...register("direccion")}
                    disabled={isSaving}
                  />
                </div>
              </div>
            </div>

            {/* SECCIÓN 3: PARÁMETROS LABORALES */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2 pb-2 border-b border-border/60">
                <div className="size-6 rounded-md bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <Briefcase className="size-3.5" />
                </div>
                <div>
                  <h2 className="text-xs sm:text-sm font-bold text-foreground">
                    3. Parámetros Laborales
                  </h2>
                  <p className="text-[11px] text-muted-foreground">
                    Parámetros de contratación y código institucional.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Fecha de Ingreso */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="fechaIngreso" className="text-xs font-medium flex items-center gap-0.5">
                      Fecha Ingreso <span className="text-destructive">*</span>
                    </Label>
                    <button
                      type="button"
                      onClick={() => setValue("fechaIngreso", getTodayISO(), { shouldValidate: true })}
                      className="text-[10px] font-semibold text-primary hover:underline cursor-pointer bg-primary/10 px-1.5 py-0.2 rounded"
                    >
                      Hoy
                    </button>
                  </div>
                  <DatePicker
                    id="fechaIngreso"
                    value={fechaIngresoVal}
                    onChange={(val) => setValue("fechaIngreso", val, { shouldValidate: true })}
                    placeholder="DD/MM/AAAA"
                    error={Boolean(errors.fechaIngreso)}
                    className="h-8 text-xs bg-background"
                    disabled={isSaving}
                  />
                  {errors.fechaIngreso && (
                    <p className="text-[10px] text-destructive font-medium">{errors.fechaIngreso.message}</p>
                  )}
                </div>

                {/* Fecha de Retiro */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="fechaRetiro" className="text-xs font-medium flex items-center gap-1 text-muted-foreground">
                      Fecha Retiro <span className="text-[10px] font-normal">(Opcional)</span>
                    </Label>
                    {fechaRetiroVal && (
                      <button
                        type="button"
                        onClick={() => setValue("fechaRetiro", "", { shouldValidate: true })}
                        className="text-[10px] font-semibold text-destructive hover:underline cursor-pointer"
                      >
                        Limpiar
                      </button>
                    )}
                  </div>
                  <DatePicker
                    id="fechaRetiro"
                    value={fechaRetiroVal}
                    onChange={(val) => setValue("fechaRetiro", val, { shouldValidate: true })}
                    placeholder="DD/MM/AAAA (Opcional)"
                    error={Boolean(errors.fechaRetiro)}
                    allowClear
                    className="h-8 text-xs bg-background"
                    disabled={isSaving}
                  />
                  {errors.fechaRetiro && (
                    <p className="text-[10px] text-destructive font-medium">{errors.fechaRetiro.message}</p>
                  )}
                </div>
              </div>
            </div>

          </CardContent>
        </Card>
      </form>
    </div>
  );
}
