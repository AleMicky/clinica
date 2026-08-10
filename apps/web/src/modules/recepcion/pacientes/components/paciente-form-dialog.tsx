"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { HeartPulse, Loader2, CreditCard, User, Phone } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CatalogoAutocomplete } from "@/components/ui/catalogo-autocomplete";
import { cn } from "@/lib/utils";

import { pacienteSchema, type PacienteFormValues } from "../schemas/paciente.schema";
import { useCreatePaciente, useUpdatePaciente } from "../hooks/use-pacientes";
import type { PacienteResponse } from "../types/paciente.types";

interface PacienteFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pacienteToEdit?: PacienteResponse | null;
  onSuccessCallback?: () => void;
}

export function PacienteFormDialog({
  open,
  onOpenChange,
  pacienteToEdit,
  onSuccessCallback,
}: PacienteFormDialogProps) {
  const isEditing = Boolean(pacienteToEdit);

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

  // Dynamic preview of initials and Document
  const nombresVal = watch("nombres");
  const paternoVal = watch("apellidoPaterno");
  const maternoVal = watch("apellidoMaterno");
  const docVal = watch("numeroDocumento");

  const hcPreview = React.useMemo(() => {
    const i1 = (nombresVal?.[0] || "").toUpperCase();
    const i2 = (paternoVal?.[0] || "").toUpperCase();
    const i3 = (maternoVal?.[0] || "").toUpperCase();
    const docClean = (docVal || "").trim().toUpperCase();
    return `${i1}${i2}${i3}-${docClean || "DOC"}`;
  }, [nombresVal, paternoVal, maternoVal, docVal]);

  // Register custom catalog autocomplete fields
  React.useEffect(() => {
    register("tipoDocumento");
    register("extensionDocumento");
    register("genero");
    register("estadoCivil");
  }, [register]);

  // Reset form state when drawer opens or editing item changes
  React.useEffect(() => {
    if (open) {
      if (pacienteToEdit && pacienteToEdit.persona) {
        const p = pacienteToEdit.persona;
        reset({
          nombres: p.nombres || "",
          apellidoPaterno: p.apellidoPaterno || "",
          apellidoMaterno: p.apellidoMaterno || "",
          fechaNacimiento: p.fechaNacimiento ? p.fechaNacimiento.split("T")[0] : "",
          telefono: p.telefono || "",
          direccion: p.direccion || "",
          tipoDocumento: p.tipoDocumento || "",
          numeroDocumento: p.numeroDocumento || "",
          extensionDocumento: p.extensionDocumento || "",
          complementoDocumento: p.complementoDocumento || "",
          genero: p.genero || "",
          estadoCivil: p.estadoCivil || "",
        });
      } else {
        reset({
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
        });
      }
    }
  }, [open, pacienteToEdit, reset]);

  const onSubmit = async (values: PacienteFormValues) => {
    try {
      if (isEditing && pacienteToEdit) {
        await updateMutation.mutateAsync({
          id: pacienteToEdit.id,
          data: values,
        });
        toast.success("Expediente del paciente actualizado correctamente.");
      } else {
        await createMutation.mutateAsync(values);
        toast.success("Paciente registrado correctamente.");
      }

      onOpenChange(false);
      onSuccessCallback?.();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Error al procesar la solicitud.";
      toast.error(errorMsg);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending || isSubmitting;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="sm:!max-w-2xl md:!max-w-3xl lg:!max-w-4xl w-full p-0 flex flex-col justify-between overflow-y-auto"
      >
        <div className="space-y-6">
          {/* Header */}
          <SheetHeader className="p-5 border-b border-border/60 bg-muted/20">
            <div className="flex items-center gap-2.5">
              <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <HeartPulse className="size-5" />
              </div>
              <div>
                <SheetTitle className="text-base font-bold">
                  {isEditing ? "Editar Expediente de Paciente" : "Nuevo Registro de Paciente"}
                </SheetTitle>
                <SheetDescription className="text-xs">
                  {isEditing
                    ? `Modificando datos clínicos e identificación de ${pacienteToEdit?.persona?.nombres || ""}`
                    : "Complete la filiación personal y datos de identidad del paciente."}
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          {/* Form Content */}
          <form id="paciente-form" onSubmit={handleSubmit(onSubmit)} className="px-7 space-y-6">
            {/* Auto HC Preview Badge */}
            <div className="flex items-center justify-between p-3.5 rounded-lg bg-primary/5 border border-primary/20">
              <div className="flex items-center gap-2">
                <HeartPulse className="size-4 text-primary" />
                <span className="text-xs font-semibold text-foreground">Formato HC Sugerido:</span>
              </div>
              <Badge variant="outline" className="bg-background font-mono font-bold text-primary text-xs">
                {isEditing ? pacienteToEdit?.numeroHistoriaClinica : hcPreview}
              </Badge>
            </div>

            {/* Section 1: Identificación y Documento */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 border-b border-border/40 pb-1.5">
                <CreditCard className="size-4 text-primary" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Documento de Identidad
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                {/* Tipo de Documento */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">
                    Tipo Documento <span className="text-destructive">*</span>
                  </Label>
                  <CatalogoAutocomplete
                    codigo="TIPO_DOCUMENTO"
                    value={tipoDocumentoValue}
                    onValueChange={(val: string) =>
                      setValue("tipoDocumento", val, {
                        shouldValidate: true,
                        shouldDirty: true,
                      })
                    }
                    placeholder="Seleccionar tipo..."
                    error={Boolean(errors.tipoDocumento)}
                  />
                  {errors.tipoDocumento && (
                    <p className="text-[11px] text-destructive font-medium">
                      {errors.tipoDocumento.message}
                    </p>
                  )}
                </div>

                {/* Número de Documento */}
                <div className="space-y-1.5">
                  <Label htmlFor="numeroDocumento" className="text-xs font-semibold">
                    Número de Documento <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="numeroDocumento"
                    placeholder="Ej. 8492042"
                    {...register("numeroDocumento")}
                    className={cn("h-9 text-xs", errors.numeroDocumento && "border-destructive")}
                  />
                  {errors.numeroDocumento && (
                    <p className="text-[11px] text-destructive font-medium">
                      {errors.numeroDocumento.message}
                    </p>
                  )}
                </div>

                {/* Extensión de Documento */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Extensión (Lugar Expedición)</Label>
                  <CatalogoAutocomplete
                    codigo="EXTENSIONES"
                    value={extensionDocumentoValue}
                    onValueChange={(val: string) =>
                      setValue("extensionDocumento", val, {
                        shouldValidate: true,
                        shouldDirty: true,
                      })
                    }
                    placeholder="Ej. LP, CB, SC..."
                    error={Boolean(errors.extensionDocumento)}
                  />
                </div>

                {/* Complemento */}
                <div className="space-y-1.5">
                  <Label htmlFor="complementoDocumento" className="text-xs font-semibold">
                    Complemento
                  </Label>
                  <Input
                    id="complementoDocumento"
                    placeholder="Ej. 1A"
                    {...register("complementoDocumento")}
                    className="h-9 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Datos Filiatorios */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2 border-b border-border/40 pb-1.5">
                <User className="size-4 text-primary" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Datos Personales
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                {/* Nombres */}
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="nombres" className="text-xs font-semibold">
                    Nombres <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="nombres"
                    placeholder="Ej. Juan Carlos"
                    {...register("nombres")}
                    className={cn("h-9 text-xs", errors.nombres && "border-destructive")}
                  />
                  {errors.nombres && (
                    <p className="text-[11px] text-destructive font-medium">
                      {errors.nombres.message}
                    </p>
                  )}
                </div>

                {/* Apellido Paterno */}
                <div className="space-y-1.5">
                  <Label htmlFor="apellidoPaterno" className="text-xs font-semibold">
                    Apellido Paterno <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="apellidoPaterno"
                    placeholder="Ej. Pérez"
                    {...register("apellidoPaterno")}
                    className={cn("h-9 text-xs", errors.apellidoPaterno && "border-destructive")}
                  />
                  {errors.apellidoPaterno && (
                    <p className="text-[11px] text-destructive font-medium">
                      {errors.apellidoPaterno.message}
                    </p>
                  )}
                </div>

                {/* Apellido Materno */}
                <div className="space-y-1.5">
                  <Label htmlFor="apellidoMaterno" className="text-xs font-semibold">
                    Apellido Materno
                  </Label>
                  <Input
                    id="apellidoMaterno"
                    placeholder="Ej. Gómez"
                    {...register("apellidoMaterno")}
                    className="h-9 text-xs"
                  />
                </div>

                {/* Fecha Nacimiento */}
                <div className="space-y-1.5">
                  <Label htmlFor="fechaNacimiento" className="text-xs font-semibold">
                    Fecha de Nacimiento <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="fechaNacimiento"
                    type="date"
                    {...register("fechaNacimiento")}
                    className={cn("h-9 text-xs", errors.fechaNacimiento && "border-destructive")}
                  />
                  {errors.fechaNacimiento && (
                    <p className="text-[11px] text-destructive font-medium">
                      {errors.fechaNacimiento.message}
                    </p>
                  )}
                </div>

                {/* Género */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Género</Label>
                  <CatalogoAutocomplete
                    codigo="GENERO"
                    value={generoValue}
                    onValueChange={(val: string) =>
                      setValue("genero", val, {
                        shouldValidate: true,
                        shouldDirty: true,
                      })
                    }
                    placeholder="Seleccionar género..."
                  />
                </div>

                {/* Estado Civil */}
                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="text-xs font-semibold">Estado Civil</Label>
                  <CatalogoAutocomplete
                    codigo="ESTADO_CIVIL"
                    value={estadoCivilValue}
                    onValueChange={(val: string) =>
                      setValue("estadoCivil", val, {
                        shouldValidate: true,
                        shouldDirty: true,
                      })
                    }
                    placeholder="Seleccionar estado civil..."
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Contacto y Ubicación */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2 border-b border-border/40 pb-1.5">
                <Phone className="size-4 text-primary" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Contacto y Dirección
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                {/* Teléfono */}
                <div className="space-y-1.5">
                  <Label htmlFor="telefono" className="text-xs font-semibold">
                    Teléfono / Celular
                  </Label>
                  <Input
                    id="telefono"
                    placeholder="Ej. 76543210"
                    {...register("telefono")}
                    className="h-9 text-xs"
                  />
                </div>

                {/* Dirección */}
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="direccion" className="text-xs font-semibold">
                    Dirección Domiciliaria
                  </Label>
                  <Input
                    id="direccion"
                    placeholder="Ej. Av. 6 de Agosto #245"
                    {...register("direccion")}
                    className="h-9 text-xs"
                  />
                </div>
              </div>
            </div>
          </form>

          {/* Footer Actions */}
          <SheetFooter className="p-5 border-t border-border/60 bg-muted/20 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              className="h-9 text-xs font-semibold"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              form="paciente-form"
              disabled={isPending}
              className="h-9 text-xs font-semibold gap-2"
            >
              {isPending && <Loader2 className="size-3.5 animate-spin" />}
              {isEditing ? "Guardar Cambios" : "Registrar Paciente"}
            </Button>
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  );
}
