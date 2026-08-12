"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { HeartPulse, Loader2, CreditCard, User, Phone, X } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  initialSearchQuery?: string;
  onSuccessCallback?: (createdPaciente?: PacienteResponse) => void;
}

export function PacienteFormDialog({
  open,
  onOpenChange,
  pacienteToEdit,
  initialSearchQuery,
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
        const q = (initialSearchQuery || "").trim();
        const isDigits = /^\d+$/.test(q);
        const parts = q.split(" ");

        reset({
          nombres: !isDigits && parts[0] ? parts[0] : "",
          apellidoPaterno: !isDigits && parts.length > 1 ? parts.slice(1).join(" ") : "",
          apellidoMaterno: "",
          fechaNacimiento: "",
          telefono: "",
          direccion: "",
          tipoDocumento: "",
          numeroDocumento: isDigits ? q : "",
          extensionDocumento: "",
          complementoDocumento: "",
          genero: "",
          estadoCivil: "",
        });
      }
    }
  }, [open, pacienteToEdit, initialSearchQuery, reset]);

  const onSubmit = async (values: PacienteFormValues) => {
    try {
      if (isEditing && pacienteToEdit) {
        const res = await updateMutation.mutateAsync({
          id: pacienteToEdit.id,
          data: values,
        });
        toast.success("Expediente del paciente actualizado correctamente.");
        onOpenChange(false);
        onSuccessCallback?.(res);
      } else {
        const res = await createMutation.mutateAsync(values);
        toast.success("Paciente registrado correctamente.");
        onOpenChange(false);
        onSuccessCallback?.(res);
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Error al procesar la solicitud.";
      toast.error(errorMsg);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending || isSubmitting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-3xl md:max-w-4xl w-[92vw] max-h-[88vh] flex flex-col p-0 gap-0 overflow-hidden bg-card border-border/80 shadow-2xl"
      >
        {/* Header Modal Amplio */}
        <DialogHeader className="shrink-0 p-4 bg-muted/40 border-b border-border/70 flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <HeartPulse className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">
                {isEditing ? "Editar Expediente de Paciente" : "Nuevo Registro de Paciente"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                {isEditing
                  ? `Modificando datos clínicos e identificación de ${pacienteToEdit?.persona?.nombres || ""}`
                  : "Complete la filiación personal y datos de identidad del paciente."}
              </DialogDescription>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="size-8 text-muted-foreground hover:text-foreground rounded-lg"
          >
            <X className="size-4" />
          </Button>
        </DialogHeader>

        {/* Form Content - Amplio y Scrolleable */}
        <form
          id="paciente-form"
          onSubmit={handleSubmit(onSubmit)}
          className="p-5 space-y-5 overflow-y-auto min-h-0 flex-1 bg-background"
        >
          {/* Auto HC Preview Badge Banner */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-primary/5 border border-primary/20 text-xs">
            <div className="flex items-center gap-2">
              <HeartPulse className="size-4 text-primary" />
              <span className="font-semibold text-foreground text-xs">Formato N° Historia Clínica Sugerido:</span>
            </div>
            <Badge variant="outline" className="bg-background font-mono font-bold text-primary text-xs py-0.5 px-2.5">
              {isEditing ? pacienteToEdit?.numeroHistoriaClinica : hcPreview}
            </Badge>
          </div>

          {/* Section 1: Identificación y Documento (4 Cols Amplias) */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 border-b border-border/40 pb-1.5">
              <CreditCard className="size-4 text-primary" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                1. Documento de Identidad
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">
                  Tipo Doc. <span className="text-destructive">*</span>
                </Label>
                <CatalogoAutocomplete
                  codigo="TIPOS_DOCUMENTO"
                  value={tipoDocumentoValue}
                  onValueChange={(val: string) =>
                    setValue("tipoDocumento", val, {
                      shouldValidate: true,
                      shouldDirty: true,
                    })
                  }
                  placeholder="Seleccionar tipo..."
                  error={Boolean(errors.tipoDocumento)}
                  className="h-9 text-xs"
                />
                {errors.tipoDocumento && (
                  <p className="text-[11px] text-destructive font-medium mt-0.5">
                    {errors.tipoDocumento.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="numeroDocumento" className="text-xs font-semibold">
                  N° Documento <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="numeroDocumento"
                  placeholder="Ej. 8492042"
                  {...register("numeroDocumento")}
                  className={cn("h-9 text-xs font-mono bg-background", errors.numeroDocumento && "border-destructive")}
                />
                {errors.numeroDocumento && (
                  <p className="text-[11px] text-destructive font-medium mt-0.5">
                    {errors.numeroDocumento.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Extensión (Expedición)</Label>
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
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="complementoDocumento" className="text-xs font-semibold">
                  Complemento
                </Label>
                <Input
                  id="complementoDocumento"
                  placeholder="Ej. 1A"
                  {...register("complementoDocumento")}
                  className="h-9 text-xs bg-background"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Datos Personales (3 Cols Amplias) */}
          <div className="space-y-2.5 pt-1">
            <div className="flex items-center gap-2 border-b border-border/40 pb-1.5">
              <User className="size-4 text-primary" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                2. Datos Personales / Filiación
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="space-y-1">
                <Label htmlFor="nombres" className="text-xs font-semibold">
                  Nombres <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="nombres"
                  placeholder="Ej. Juan Carlos"
                  {...register("nombres")}
                  className={cn("h-9 text-xs bg-background", errors.nombres && "border-destructive")}
                />
                {errors.nombres && (
                  <p className="text-[11px] text-destructive font-medium mt-0.5">
                    {errors.nombres.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="apellidoPaterno" className="text-xs font-semibold">
                  Apellido Paterno <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="apellidoPaterno"
                  placeholder="Ej. Pérez"
                  {...register("apellidoPaterno")}
                  className={cn("h-9 text-xs bg-background", errors.apellidoPaterno && "border-destructive")}
                />
                {errors.apellidoPaterno && (
                  <p className="text-[11px] text-destructive font-medium mt-0.5">
                    {errors.apellidoPaterno.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="apellidoMaterno" className="text-xs font-semibold">
                  Apellido Materno
                </Label>
                <Input
                  id="apellidoMaterno"
                  placeholder="Ej. Gómez"
                  {...register("apellidoMaterno")}
                  className="h-9 text-xs bg-background"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="fechaNacimiento" className="text-xs font-semibold">
                  Fecha de Nacimiento <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="fechaNacimiento"
                  type="date"
                  {...register("fechaNacimiento")}
                  className={cn("h-9 text-xs bg-background", errors.fechaNacimiento && "border-destructive")}
                />
                {errors.fechaNacimiento && (
                  <p className="text-[11px] text-destructive font-medium mt-0.5">
                    {errors.fechaNacimiento.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
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
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1">
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
                  className="h-9 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Contacto y Ubicación (3 Cols Amplias) */}
          <div className="space-y-2.5 pt-1">
            <div className="flex items-center gap-2 border-b border-border/40 pb-1.5">
              <Phone className="size-4 text-primary" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                3. Contacto y Dirección
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="space-y-1 sm:col-span-1">
                <Label htmlFor="telefono" className="text-xs font-semibold">
                  Teléfono / Celular
                </Label>
                <Input
                  id="telefono"
                  placeholder="Ej. 76543210"
                  {...register("telefono")}
                  className="h-9 text-xs bg-background"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <Label htmlFor="direccion" className="text-xs font-semibold">
                  Dirección Domiciliaria
                </Label>
                <Input
                  id="direccion"
                  placeholder="Ej. Av. 6 de Agosto #245"
                  {...register("direccion")}
                  className="h-9 text-xs bg-background"
                />
              </div>
            </div>
          </div>
        </form>

        {/* Footer Modal Amplio */}
        <div className="shrink-0 p-4 bg-muted/40 border-t border-border/70 flex items-center justify-end gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
            className="h-9 px-4 text-xs font-medium"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form="paciente-form"
            size="sm"
            disabled={isPending}
            className="h-9 px-5 text-xs font-semibold gap-2 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 text-primary-foreground shadow-md shadow-primary/20"
          >
            {isPending && <Loader2 className="size-3.5 animate-spin" />}
            {isEditing ? "Guardar Cambios" : "Registrar Paciente"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
