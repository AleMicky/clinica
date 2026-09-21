"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Loader2,
  Save,
  User,
  Phone,
  HeartPulse,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CatalogoAutocomplete } from "@/components/ui/catalogo-autocomplete";
import { DatePicker } from "@/components/ui/date-picker";
import { cn } from "@/lib/utils";

import { pacienteSchema, type PacienteFormValues } from "../schemas/paciente.schema";
import { useCreatePaciente, useUpdatePaciente } from "../hooks/use-pacientes";
import type { PacienteResponse } from "../types/paciente.types";
import { getApiErrorMessage } from "@/lib/api/api-error";

export interface PacienteFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paciente?: PacienteResponse | null;
  initialSearch?: string;
  onSuccess?: (paciente: PacienteResponse) => void;
}

export function PacienteFormDialog({
  open,
  onOpenChange,
  paciente,
  initialSearch = "",
  onSuccess,
}: PacienteFormDialogProps) {
  const isEditing = Boolean(paciente && paciente.id > 0);

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
      tipoDocumento: "CI",
      numeroDocumento: "",
      extensionDocumento: "",
      complementoDocumento: "",
      genero: "",
      estadoCivil: "",
    },
  });

  const tipoDocumentoValue = watch("tipoDocumento") || "";
  const extensionDocumentoValue = watch("extensionDocumento") || "";
  const generoValue = watch("genero") || "";
  const estadoCivilValue = watch("estadoCivil") || "";
  const fechaNacimientoValue = watch("fechaNacimiento") || "";

  // Register custom autocompletes / pickers
  React.useEffect(() => {
    register("tipoDocumento");
    register("extensionDocumento");
    register("genero");
    register("estadoCivil");
    register("fechaNacimiento");
  }, [register]);

  // Sync form when modal opens or target patient changes
  React.useEffect(() => {
    if (!open) return;

    if (paciente && isEditing) {
      const persona = paciente.persona;
      reset({
        nombres: persona?.nombres || "",
        apellidoPaterno: persona?.apellidoPaterno || "",
        apellidoMaterno: persona?.apellidoMaterno || "",
        fechaNacimiento: persona?.fechaNacimiento
          ? persona.fechaNacimiento.split("T")[0]
          : "",
        telefono: persona?.telefono || "",
        direccion: persona?.direccion || "",
        tipoDocumento: persona?.tipoDocumento || "CI",
        numeroDocumento: persona?.numeroDocumento || "",
        extensionDocumento: persona?.extensionDocumento || "",
        complementoDocumento: persona?.complementoDocumento || "",
        genero: persona?.genero || "",
        estadoCivil: persona?.estadoCivil || "",
      });
    } else {
      // Smart pre-fill for new registration based on search query
      const trimmedSearch = initialSearch.trim();
      const isDigitsOnly = /^\d+$/.test(trimmedSearch);

      reset({
        nombres: isDigitsOnly ? "" : trimmedSearch,
        apellidoPaterno: "",
        apellidoMaterno: "",
        fechaNacimiento: "",
        telefono: "",
        direccion: "",
        tipoDocumento: "CI",
        numeroDocumento: isDigitsOnly ? trimmedSearch : "",
        extensionDocumento: "",
        complementoDocumento: "",
        genero: "",
        estadoCivil: "",
      });
    }
  }, [open, paciente, isEditing, initialSearch, reset]);

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

      let result: PacienteResponse;

      if (isEditing && paciente?.id) {
        result = await updateMutation.mutateAsync({
          id: paciente.id,
          data: payload,
        });
        toast.success(`Paciente "${values.nombres} ${values.apellidoPaterno}" actualizado correctamente.`);
      } else {
        result = await createMutation.mutateAsync(payload);
        toast.success(`Paciente "${values.nombres} ${values.apellidoPaterno}" registrado exitosamente.`);
      }

      onOpenChange(false);
      if (onSuccess) {
        onSuccess(result);
      }
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending || isSubmitting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl md:max-w-4xl lg:max-w-4xl w-[95vw] max-h-[88vh] flex flex-col p-0 gap-0 overflow-hidden rounded-xl border border-border/80 shadow-xl bg-card">
        {/* Header Compacto y Elegante */}
        <DialogHeader className="px-4 py-3 sm:px-5 sm:py-3.5 border-b border-border/70 bg-muted/20 shrink-0">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                <HeartPulse className="size-4" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <DialogTitle className="text-xs sm:text-sm font-bold text-foreground">
                    {isEditing ? "Editar Información del Paciente" : "Registrar Nuevo Paciente"}
                  </DialogTitle>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[9.5px] px-1.5 py-0 font-bold h-4 shrink-0",
                      isEditing
                        ? "bg-primary/10 text-primary border-primary/20"
                        : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                    )}
                  >
                    {isEditing ? "Modo Edición" : "Nuevo Registro"}
                  </Badge>
                </div>
                <DialogDescription className="text-[11px] text-muted-foreground">
                  {isEditing
                    ? "Actualice los datos personales, de contacto e identificación del paciente."
                    : "Complete los datos para generar la ficha e historia clínica."}
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Scrollable Form Body Compacto */}
        <div className="overflow-y-auto px-4 py-3 sm:px-5 sm:py-4 space-y-3.5 scrollbar-thin">
          <form id="paciente-dialog-form" onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
            
            {/* SECCIÓN 1: INFORMACIÓN FILIATORIA Y DE IDENTIDAD */}
            <div className="p-3 sm:p-3.5 rounded-lg border border-border/70 bg-muted/15 space-y-2.5">
              <div className="flex items-center gap-2 pb-1.5 border-b border-border/50">
                <div className="size-5 rounded-md bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <User className="size-3" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-foreground">
                    Información Filiatoria y de Identidad
                  </h3>
                  <p className="text-[10px] text-muted-foreground">
                    Nombres, apellidos y documento oficial de identidad.
                  </p>
                </div>
              </div>

              {/* Fila 1: Nombres y Apellidos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {/* Nombres */}
                <div className="space-y-1">
                  <Label htmlFor="dlg-nombres" className="text-[11px] font-semibold flex items-center gap-0.5 text-foreground/80">
                    Nombres <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="dlg-nombres"
                    placeholder="ej. María Elena"
                    className={cn(
                      "w-full h-8 text-xs bg-background shadow-2xs font-medium",
                      errors.nombres && "border-destructive focus-visible:ring-destructive"
                    )}
                    {...register("nombres")}
                  />
                  {errors.nombres && (
                    <p className="text-[10px] text-destructive font-medium">{errors.nombres.message}</p>
                  )}
                </div>

                {/* Apellido Paterno */}
                <div className="space-y-1">
                  <Label htmlFor="dlg-apellidoPaterno" className="text-[11px] font-semibold flex items-center gap-0.5 text-foreground/80">
                    Apellido Paterno <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="dlg-apellidoPaterno"
                    placeholder="ej. Gómez"
                    className={cn(
                      "w-full h-8 text-xs bg-background shadow-2xs font-medium",
                      errors.apellidoPaterno && "border-destructive focus-visible:ring-destructive"
                    )}
                    {...register("apellidoPaterno")}
                  />
                  {errors.apellidoPaterno && (
                    <p className="text-[10px] text-destructive font-medium">{errors.apellidoPaterno.message}</p>
                  )}
                </div>

                {/* Apellido Materno */}
                <div className="space-y-1 sm:col-span-2 md:col-span-1">
                  <Label htmlFor="dlg-apellidoMaterno" className="text-[11px] font-semibold text-foreground/80">
                    Apellido Materno
                  </Label>
                  <Input
                    id="dlg-apellidoMaterno"
                    placeholder="ej. Pérez"
                    className="w-full h-8 text-xs bg-background shadow-2xs font-medium"
                    {...register("apellidoMaterno")}
                  />
                </div>
              </div>

              {/* Fila 2: Documento de Identidad */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 pt-0.5">
                {/* Tipo Documento */}
                <div className="space-y-1">
                  <Label htmlFor="dlg-tipoDocumento" className="text-[11px] font-semibold flex items-center gap-0.5 text-foreground/80">
                    Tipo Documento <span className="text-destructive">*</span>
                  </Label>
                  <CatalogoAutocomplete
                    id="dlg-tipoDocumento"
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
                <div className="space-y-1">
                  <Label htmlFor="dlg-numeroDocumento" className="text-[11px] font-semibold flex items-center gap-0.5 text-foreground/80">
                    N° Documento <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="dlg-numeroDocumento"
                    placeholder="12345678"
                    className={cn(
                      "w-full font-mono h-8 text-xs bg-background shadow-2xs font-semibold",
                      errors.numeroDocumento && "border-destructive focus-visible:ring-destructive"
                    )}
                    {...register("numeroDocumento")}
                  />
                  {errors.numeroDocumento && (
                    <p className="text-[10px] text-destructive font-medium">{errors.numeroDocumento.message}</p>
                  )}
                </div>

                {/* Extensión */}
                <div className="space-y-1">
                  <Label htmlFor="dlg-extensionDocumento" className="text-[11px] font-semibold text-foreground/80">
                    Extensión (Depto.)
                  </Label>
                  <CatalogoAutocomplete
                    id="dlg-extensionDocumento"
                    codigo="EXTENSION_BOLIVIA"
                    value={extensionDocumentoValue}
                    onValueChange={(val) => setValue("extensionDocumento", val || "", { shouldValidate: true })}
                    placeholder="Extensión"
                    emptyText="Sin extensión"
                  />
                </div>

                {/* Complemento */}
                <div className="space-y-1">
                  <Label htmlFor="dlg-complementoDocumento" className="text-[11px] font-semibold text-foreground/80">
                    Complemento
                  </Label>
                  <Input
                    id="dlg-complementoDocumento"
                    placeholder="ej. 1A"
                    className="w-full font-mono h-8 text-xs uppercase bg-background shadow-2xs font-semibold"
                    {...register("complementoDocumento")}
                  />
                </div>
              </div>

              {/* Fila 3: Fecha Nacimiento, Género y Estado Civil */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-0.5">
                {/* Fecha Nacimiento */}
                <div className="space-y-1">
                  <Label htmlFor="dlg-fechaNacimiento" className="text-[11px] font-semibold flex items-center gap-0.5 text-foreground/80">
                    Fecha Nacimiento <span className="text-destructive">*</span>
                  </Label>
                  <DatePicker
                    id="dlg-fechaNacimiento"
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
                <div className="space-y-1">
                  <Label htmlFor="dlg-genero" className="text-[11px] font-semibold text-foreground/80">
                    Género
                  </Label>
                  <CatalogoAutocomplete
                    id="dlg-genero"
                    codigo="GENERO"
                    value={generoValue}
                    onValueChange={(val) => setValue("genero", val || "", { shouldValidate: true })}
                    placeholder="Seleccione género"
                    emptyText="Sin datos"
                  />
                </div>

                {/* Estado Civil */}
                <div className="space-y-1 sm:col-span-2 md:col-span-1">
                  <Label htmlFor="dlg-estadoCivil" className="text-[11px] font-semibold text-foreground/80">
                    Estado Civil
                  </Label>
                  <CatalogoAutocomplete
                    id="dlg-estadoCivil"
                    codigo="ESTADO_CIVIL"
                    value={estadoCivilValue}
                    onValueChange={(val) => setValue("estadoCivil", val || "", { shouldValidate: true })}
                    placeholder="Seleccione estado"
                    emptyText="Sin datos"
                  />
                </div>
              </div>
            </div>

            {/* SECCIÓN 2: CONTACTO Y UBICACIÓN */}
            <div className="p-3 sm:p-3.5 rounded-lg border border-border/70 bg-muted/15 space-y-2.5">
              <div className="flex items-center gap-2 pb-1.5 border-b border-border/50">
                <div className="size-5 rounded-md bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <Phone className="size-3" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-foreground">
                    Datos de Contacto y Residencia
                  </h3>
                  <p className="text-[10px] text-muted-foreground">
                    Teléfono y dirección del paciente.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5">
                {/* Teléfono */}
                <div className="space-y-1 md:col-span-4">
                  <Label htmlFor="dlg-telefono" className="text-[11px] font-semibold text-foreground/80">
                    Teléfono / Celular
                  </Label>
                  <Input
                    id="dlg-telefono"
                    placeholder="ej. +591 71234567"
                    className="w-full h-8 text-xs bg-background shadow-2xs font-mono"
                    {...register("telefono")}
                  />
                  {errors.telefono && (
                    <p className="text-[10px] text-destructive font-medium">{errors.telefono.message}</p>
                  )}
                </div>

                {/* Dirección */}
                <div className="space-y-1 md:col-span-8">
                  <Label htmlFor="dlg-direccion" className="text-[11px] font-semibold text-foreground/80">
                    Dirección Residencial
                  </Label>
                  <Input
                    id="dlg-direccion"
                    placeholder="ej. Calle Los Álamos #456, Zona Central"
                    className="w-full h-8 text-xs bg-background shadow-2xs font-medium"
                    {...register("direccion")}
                  />
                  {errors.direccion && (
                    <p className="text-[10px] text-destructive font-medium">{errors.direccion.message}</p>
                  )}
                </div>
              </div>
            </div>

          </form>
        </div>

        {/* Footer Compacto */}
        <div className="px-4 py-2.5 sm:px-5 sm:py-3 border-t border-border/70 bg-muted/20 flex items-center justify-end gap-2 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
            className="h-8 px-3 text-xs font-medium cursor-pointer rounded-lg hover:bg-muted"
          >
            Cancelar
          </Button>

          <Button
            form="paciente-dialog-form"
            type="submit"
            size="sm"
            disabled={isSaving}
            className="h-8 px-4 text-xs gap-1.5 cursor-pointer shadow-xs font-semibold rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {isSaving ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <Save className="size-3.5" />
                <span>{isEditing ? "Guardar Cambios" : "Registrar Paciente"}</span>
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
