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
  CreditCard,
  Phone,
  MapPin,
  Calendar,
  Heart,
  HeartPulse,
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

import { pacienteSchema, type PacienteFormValues } from "../schemas/paciente.schema";
import {
  useCreatePaciente,
  useUpdatePaciente,
  usePaciente,
} from "../hooks/use-pacientes";

interface PacientePageFormProps {
  id?: number;
}

export function PacientePageForm({ id }: PacientePageFormProps) {
  const router = useRouter();
  const isEditing = Boolean(id && id > 0);

  const { data: pacienteData, isLoading: isLoadingPaciente } = usePaciente(
    id || 0,
    isEditing
  );

  const createMutation = useCreatePaciente();
  const updateMutation = useUpdatePaciente();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PacienteFormValues>({
    resolver: zodResolver(pacienteSchema),
    defaultValues: {
      nombres: "",
      apellidoPaterno: "",
      apellidoMaterno: "",
      fechaNacimiento: "",
      telefono: "",
      direccion: "",
      tipoDocumento: "",
      numeroDocumento: "",
      extensionDocumento: "",
      complementoDocumento: "",
      genero: "",
      estadoCivil: "",
    },
  });

  const tipoDocumentoValue: string = watch("tipoDocumento") || "";
  const extensionDocumentoValue: string = watch("extensionDocumento") || "";
  const generoValue: string = watch("genero") || "";
  const estadoCivilValue: string = watch("estadoCivil") || "";
  const fechaNacimientoValue: string = watch("fechaNacimiento") || "";

  // Register custom autocompletes
  React.useEffect(() => {
    register("tipoDocumento");
    register("extensionDocumento");
    register("genero");
    register("estadoCivil");
    register("fechaNacimiento");
  }, [register]);

  // Load existing paciente data in edit mode
  React.useEffect(() => {
    if (pacienteData && isEditing) {
      const persona = pacienteData.persona;
      reset({
        nombres: persona?.nombres || "",
        apellidoPaterno: persona?.apellidoPaterno || "",
        apellidoMaterno: persona?.apellidoMaterno || "",
        fechaNacimiento: persona?.fechaNacimiento
          ? persona.fechaNacimiento.split("T")[0]
          : "",
        telefono: persona?.telefono || "",
        direccion: persona?.direccion || "",
        tipoDocumento: persona?.tipoDocumento || "",
        numeroDocumento: persona?.numeroDocumento || "",
        extensionDocumento: persona?.extensionDocumento || "",
        complementoDocumento: persona?.complementoDocumento || "",
        genero: persona?.genero || "",
        estadoCivil: persona?.estadoCivil || "",
      });
    }
  }, [pacienteData, isEditing, reset]);

  const onSubmit = async (values: PacienteFormValues) => {
    try {
      const payload = {
        nombres: values.nombres.trim(),
        apellidoPaterno: values.apellidoPaterno.trim(),
        apellidoMaterno: values.apellidoMaterno?.trim() || undefined,
        tipoDocumento: values.tipoDocumento.trim(),
        numeroDocumento: values.numeroDocumento.trim(),
        extensionDocumento: values.extensionDocumento?.trim() || undefined,
        complementoDocumento: values.complementoDocumento?.trim() || undefined,
        fechaNacimiento: values.fechaNacimiento.trim(),
        genero: values.genero?.trim() || undefined,
        estadoCivil: values.estadoCivil?.trim() || undefined,
        telefono: values.telefono?.trim() || undefined,
        direccion: values.direccion?.trim() || undefined,
      };

      if (isEditing && id) {
        await updateMutation.mutateAsync({
          id,
          data: payload,
        });
        toast.success(`Paciente "${values.nombres} ${values.apellidoPaterno}" actualizado correctamente.`);
      } else {
        await createMutation.mutateAsync(payload);
        toast.success(`Paciente "${values.nombres} ${values.apellidoPaterno}" registrado exitosamente.`);
      }
      router.push("/recepcion/pacientes");
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

  if (isEditing && isLoadingPaciente) {
    return (
      <div className="flex flex-col gap-4 w-full p-2">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  const pacienteNombreCompleto = pacienteData?.persona
    ? [
        pacienteData.persona.nombres,
        pacienteData.persona.apellidoPaterno,
        pacienteData.persona.apellidoMaterno,
      ]
        .filter(Boolean)
        .join(" ")
    : "";

  return (
    <div className="flex flex-col gap-3.5 w-full pb-8">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/recepcion/pacientes")}
            className="h-8 px-2 text-xs gap-1.5 cursor-pointer text-muted-foreground hover:text-foreground shrink-0 rounded-lg"
          >
            <ArrowLeft className="size-4" />
            <span className="hidden sm:inline">Volver a Pacientes</span>
          </Button>

          <div className="h-5 w-px bg-border/60 shrink-0" />

          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0 shadow-2xs">
              <HeartPulse className="size-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-bold text-foreground truncate">
                  {isEditing
                    ? `Editar Paciente: ${pacienteNombreCompleto} (#${pacienteData?.numeroHistoriaClinica || ""})`
                    : "Registrar Nuevo Paciente"}
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
                  ? "Actualice los datos personales, de contacto e identificación del paciente."
                  : "Defina los datos filiatorios y de contacto para generar su historia clínica."}
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
            onClick={() => router.push("/recepcion/pacientes")}
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
            <span>{isEditing ? "Guardar Cambios" : "Registrar Paciente"}</span>
          </Button>
        </div>
      </div>

      {/* Unified Form Card Container */}
      <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4">
        <Card className="border border-border/70 shadow-2xs rounded-xl overflow-hidden bg-card">
          <CardContent className="p-4 sm:p-5 space-y-6">
            {/* SECCIÓN 1: DATOS PERSONALES Y DOCUMENTO */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-border/60">
                <div className="size-6 rounded-md bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <User className="size-3.5" />
                </div>
                <div>
                  <h2 className="text-xs sm:text-sm font-bold text-foreground">
                    Información Filiatoria y de Identidad
                  </h2>
                  <p className="text-[11px] text-muted-foreground">
                    Datos personales y documento oficial de identidad del paciente.
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
                    placeholder="ej. María Elena"
                    className={cn("w-full h-8 text-xs", errors.nombres && "border-destructive focus-visible:ring-destructive")}
                    {...register("nombres")}
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
                    placeholder="ej. Gómez"
                    className={cn("w-full h-8 text-xs", errors.apellidoPaterno && "border-destructive focus-visible:ring-destructive")}
                    {...register("apellidoPaterno")}
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
                    placeholder="ej. Pérez"
                    className="w-full h-8 text-xs"
                    {...register("apellidoMaterno")}
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
                    value={tipoDocumentoValue}
                    onValueChange={(val) => setValue("tipoDocumento", val || "", { shouldValidate: true })}
                    placeholder="Seleccionar tipo"
                    emptyText="Sin tipos"
                    error={Boolean(errors.tipoDocumento)}
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
                    className={cn("w-full font-mono h-8 text-xs", errors.numeroDocumento && "border-destructive focus-visible:ring-destructive")}
                    {...register("numeroDocumento")}
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
                    value={extensionDocumentoValue}
                    onValueChange={(val) => setValue("extensionDocumento", val || "", { shouldValidate: true })}
                    placeholder="Extensión"
                    emptyText="Sin extensión"
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
                    className="w-full font-mono h-8 text-xs uppercase"
                    {...register("complementoDocumento")}
                  />
                </div>

                {/* Fecha Nacimiento */}
                <div className="space-y-1 sm:col-span-1 md:col-span-1 lg:col-span-4">
                  <Label htmlFor="fechaNacimiento" className="text-xs font-medium flex items-center gap-0.5">
                    Fecha de Nacimiento <span className="text-destructive">*</span>
                  </Label>
                  <DatePicker
                    id="fechaNacimiento"
                    value={fechaNacimientoValue}
                    onChange={(val) =>
                      setValue("fechaNacimiento", val, { shouldValidate: true })
                    }
                    placeholder="DD/MM/AAAA"
                    error={Boolean(errors.fechaNacimiento)}
                    maxDate={new Date().toISOString().split("T")[0]}
                    fromYear={1920}
                    toYear={new Date().getFullYear()}
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
                    value={generoValue}
                    onValueChange={(val) => setValue("genero", val || "", { shouldValidate: true })}
                    placeholder="Seleccione género"
                    emptyText="Sin datos"
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
                    value={estadoCivilValue}
                    onValueChange={(val) => setValue("estadoCivil", val || "", { shouldValidate: true })}
                    placeholder="Seleccione estado civil"
                    emptyText="Sin datos"
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
                    Datos de Contacto y Residencia
                  </h2>
                  <p className="text-[11px] text-muted-foreground">
                    Información para localización, llamadas y notificaciones del paciente.
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
                    placeholder="ej. +591 71234567"
                    className="w-full h-8 text-xs"
                    {...register("telefono")}
                  />
                  {errors.telefono && (
                    <p className="text-[10px] text-destructive font-medium">{errors.telefono.message}</p>
                  )}
                </div>

                {/* Dirección */}
                <div className="space-y-1 sm:col-span-1 md:col-span-2 lg:col-span-8">
                  <Label htmlFor="direccion" className="text-xs font-medium">
                    Dirección Residencial
                  </Label>
                  <Input
                    id="direccion"
                    placeholder="ej. Calle Los Álamos #456, Zona Central"
                    className="w-full h-8 text-xs"
                    {...register("direccion")}
                  />
                  {errors.direccion && (
                    <p className="text-[10px] text-destructive font-medium">{errors.direccion.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Actions inside Card */}
            <div className="flex items-center justify-end gap-2 pt-4 border-t border-border/60">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => router.push("/recepcion/pacientes")}
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
                <span>{isEditing ? "Guardar Cambios" : "Registrar Paciente"}</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
