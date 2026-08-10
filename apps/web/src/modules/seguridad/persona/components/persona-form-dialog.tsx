"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { User, Loader2, CreditCard, UserCheck, Phone } from "lucide-react";

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
import { CatalogoAutocomplete } from "@/components/ui/catalogo-autocomplete";
import { cn } from "@/lib/utils";

import { personaSchema, type PersonaFormValues } from "../schemas/persona.schema";
import { useCreatePersona, useUpdatePersona } from "../hooks/use-personas";
import type { PersonaResponse } from "../types/persona.types";

interface PersonaFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  personaToEdit?: PersonaResponse | null;
  onSuccessCallback?: () => void;
}
export function PersonaFormDialog({
  open,
  onOpenChange,
  personaToEdit,
  onSuccessCallback,
}: PersonaFormDialogProps) {
  const isEditing = Boolean(personaToEdit);

  const createMutation = useCreatePersona();
  const updateMutation = useUpdatePersona();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PersonaFormValues>({
    resolver: zodResolver(personaSchema),
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
      activo: true,
    },
  });

  const tipoDocumentoValue: string = watch("tipoDocumento") || "";
  const extensionDocumentoValue: string = watch("extensionDocumento") || "";
  const generoValue: string = watch("genero") || "";
  const estadoCivilValue: string = watch("estadoCivil") || "";

  // Reset form state when drawer opens or editing item changes
  React.useEffect(() => {
    if (open) {
      if (personaToEdit) {
        reset({
          nombres: personaToEdit.nombres || "",
          apellidoPaterno: personaToEdit.apellidoPaterno || "",
          apellidoMaterno: personaToEdit.apellidoMaterno || "",
          fechaNacimiento: personaToEdit.fechaNacimiento
            ? personaToEdit.fechaNacimiento.split("T")[0]
            : "",
          telefono: personaToEdit.telefono || "",
          direccion: personaToEdit.direccion || "",
          tipoDocumento: personaToEdit.tipoDocumento || "",
          numeroDocumento: personaToEdit.numeroDocumento || "",
          extensionDocumento: personaToEdit.extensionDocumento || "",
          complementoDocumento: personaToEdit.complementoDocumento || "",
          genero: personaToEdit.genero || "",
          estadoCivil: personaToEdit.estadoCivil || "",
          activo: personaToEdit.activo ?? true,
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
          activo: true,
        });
      }
    }
  }, [open, personaToEdit, reset]);

  const onSubmit = async (values: PersonaFormValues) => {
    try {
      const payload = {
        nombres: values.nombres.trim(),
        apellidoPaterno: values.apellidoPaterno.trim(),
        apellidoMaterno: values.apellidoMaterno?.trim() || undefined,
        fechaNacimiento: values.fechaNacimiento,
        telefono: values.telefono?.trim() || undefined,
        direccion: values.direccion?.trim() || undefined,
        tipoDocumento: values.tipoDocumento.trim(),
        numeroDocumento: values.numeroDocumento.trim(),
        extensionDocumento: values.extensionDocumento?.trim() || undefined,
        complementoDocumento: values.complementoDocumento?.trim() || undefined,
        genero: values.genero?.trim() || undefined,
        estadoCivil: values.estadoCivil?.trim() || undefined,
      };

      if (isEditing && personaToEdit) {
        await updateMutation.mutateAsync({
          id: personaToEdit.id,
          data: payload,
        });
        toast.success(`Persona "${values.nombres} ${values.apellidoPaterno}" actualizada correctamente.`);
      } else {
        await createMutation.mutateAsync(payload);
        toast.success(`Persona "${values.nombres} ${values.apellidoPaterno}" registrada correctamente.`);
      }
      onSuccessCallback?.();
      onOpenChange(false);
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        error?.message ||
        "Ocurrió un error al procesar la solicitud.";
      toast.error(errorMsg);
    }
  };

  const isLoading =
    createMutation.isPending || updateMutation.isPending || isSubmitting;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="sm:!max-w-2xl md:!max-w-3xl lg:!max-w-4xl w-full p-5 flex flex-col h-full overflow-y-auto"
      >
        <SheetHeader className="p-0 space-y-1.5 pb-4 border-b">
          <SheetTitle className="flex items-center gap-2.5 text-xl font-bold">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <User className="size-5" />
            </div>
            <span>{isEditing ? "Editar Persona" : "Registrar Nueva Persona"}</span>
          </SheetTitle>
          <SheetDescription className="text-xs sm:text-sm text-muted-foreground">
            {isEditing
              ? "Modifique los datos personales, de identificación y contacto del registro."
              : "Ingrese la información personal y de identificación requerida para la persona."}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 space-y-6 pt-4 overflow-y-auto pr-1">
          {/* Indicador de campos requeridos */}
          <div className="flex items-center justify-between text-xs text-muted-foreground bg-muted/40 px-3.5 py-2 rounded-lg border border-border/50">
            <span>Formulario filiatorio de persona</span>
            <span className="text-destructive font-semibold">* Requeridos</span>
          </div>

          {/* Bloque 1: Nombres y Apellidos */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-foreground uppercase tracking-wider">
              <UserCheck className="size-4 text-primary" />
              <span>Nombres y Apellidos</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Nombres */}
              <div className="space-y-1">
                <Label htmlFor="nombres" className="text-sm font-medium flex items-center gap-1">
                  Nombres <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="nombres"
                  placeholder="ej. María Elena"
                  className={cn("w-full h-9 text-sm", errors.nombres && "border-destructive focus-visible:ring-destructive")}
                  {...register("nombres")}
                />
                {errors.nombres && (
                  <p className="text-xs text-destructive font-medium">{errors.nombres.message}</p>
                )}
              </div>

              {/* Apellido Paterno */}
              <div className="space-y-1">
                <Label htmlFor="apellidoPaterno" className="text-sm font-medium flex items-center gap-1">
                  Apellido Paterno <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="apellidoPaterno"
                  placeholder="ej. Gómez"
                  className={cn("w-full h-9 text-sm", errors.apellidoPaterno && "border-destructive focus-visible:ring-destructive")}
                  {...register("apellidoPaterno")}
                />
                {errors.apellidoPaterno && (
                  <p className="text-xs text-destructive font-medium">{errors.apellidoPaterno.message}</p>
                )}
              </div>

              {/* Apellido Materno */}
              <div className="space-y-1">
                <Label htmlFor="apellidoMaterno" className="text-sm font-medium">
                  Apellido Materno
                </Label>
                <Input
                  id="apellidoMaterno"
                  placeholder="ej. Pérez"
                  className="w-full h-9 text-sm"
                  {...register("apellidoMaterno")}
                />
              </div>
            </div>
          </div>

          {/* Bloque 2: Identificación y Documento */}
          <div className="space-y-2.5 pt-4 border-t border-border/50">
            <div className="flex items-center gap-2 text-xs font-bold text-foreground uppercase tracking-wider">
              <CreditCard className="size-4 text-primary" />
              <span>Documento de Identidad</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              {/* Tipo Documento */}
              <div className="space-y-1 sm:col-span-1">
                <Label htmlFor="tipoDocumento" className="text-sm font-medium flex items-center gap-1">
                  Tipo Doc. <span className="text-destructive">*</span>
                </Label>
                <CatalogoAutocomplete
                  id="tipoDocumento"
                  codigo="TIPOS_DOCUMENTO"
                  value={tipoDocumentoValue}
                  onValueChange={(val) => setValue("tipoDocumento", val || "", { shouldValidate: true })}
                  placeholder="Tipo"
                  emptyText="Sin tipos"
                  error={Boolean(errors.tipoDocumento)}
                />
                {errors.tipoDocumento && (
                  <p className="text-xs text-destructive font-medium">{errors.tipoDocumento.message}</p>
                )}
              </div>

              {/* Número Documento */}
              <div className="space-y-1 sm:col-span-1">
                <Label htmlFor="numeroDocumento" className="text-sm font-medium flex items-center gap-1">
                  Número <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="numeroDocumento"
                  placeholder="12345678"
                  className={cn("w-full font-mono h-9 text-sm", errors.numeroDocumento && "border-destructive focus-visible:ring-destructive")}
                  {...register("numeroDocumento")}
                />
                {errors.numeroDocumento && (
                  <p className="text-xs text-destructive font-medium">{errors.numeroDocumento.message}</p>
                )}
              </div>

              {/* Extensión */}
              <div className="space-y-1 sm:col-span-1">
                <Label htmlFor="extensionDocumento" className="text-sm font-medium">
                  Extensión (Dpto.)
                </Label>
                <CatalogoAutocomplete
                  id="extensionDocumento"
                  codigo="EXTENSIONES"
                  value={extensionDocumentoValue}
                  onValueChange={(val) => setValue("extensionDocumento", val || "", { shouldValidate: true })}
                  placeholder="Sin ext."
                  emptyText="Sin extensiones"
                />
              </div>

              {/* Complemento */}
              <div className="space-y-1 sm:col-span-1">
                <Label htmlFor="complementoDocumento" className="text-sm font-medium">
                  Complemento
                </Label>
                <Input
                  id="complementoDocumento"
                  placeholder="1A"
                  className="w-full font-mono h-9 text-sm uppercase"
                  {...register("complementoDocumento")}
                />
              </div>
            </div>
          </div>

          {/* Bloque 3: Información Filiatoria */}
          <div className="space-y-2.5 pt-4 border-t border-border/50">
            <div className="flex items-center gap-2 text-xs font-bold text-foreground uppercase tracking-wider">
              <User className="size-4 text-primary" />
              <span>Información Personal y Filiatoria</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Fecha Nacimiento */}
              <div className="space-y-1">
                <Label htmlFor="fechaNacimiento" className="text-sm font-medium flex items-center gap-1">
                  Fecha de Nacimiento <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="fechaNacimiento"
                  type="date"
                  className={cn("w-full h-9 text-sm", errors.fechaNacimiento && "border-destructive focus-visible:ring-destructive")}
                  {...register("fechaNacimiento")}
                />
                {errors.fechaNacimiento && (
                  <p className="text-xs text-destructive font-medium">{errors.fechaNacimiento.message}</p>
                )}
              </div>

              {/* Género */}
              <div className="space-y-1">
                <Label htmlFor="genero" className="text-sm font-medium">
                  Género
                </Label>
                <CatalogoAutocomplete
                  id="genero"
                  codigo="GENEROS"
                  value={generoValue}
                  onValueChange={(val) => setValue("genero", val || "", { shouldValidate: true })}
                  placeholder="Seleccione género"
                  emptyText="Sin géneros"
                />
              </div>

              {/* Estado Civil */}
              <div className="space-y-1">
                <Label htmlFor="estadoCivil" className="text-sm font-medium">
                  Estado Civil
                </Label>
                <CatalogoAutocomplete
                  id="estadoCivil"
                  codigo="ESTADOS_CIVILES"
                  value={estadoCivilValue}
                  onValueChange={(val) => setValue("estadoCivil", val || "", { shouldValidate: true })}
                  placeholder="Seleccione estado civil"
                  emptyText="Sin estados civiles"
                />
              </div>
            </div>
          </div>

          {/* Bloque 4: Contacto */}
          <div className="space-y-2.5 pt-4 border-t border-border/50">
            <div className="flex items-center gap-2 text-xs font-bold text-foreground uppercase tracking-wider">
              <Phone className="size-4 text-primary" />
              <span>Contacto y Ubicación</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Teléfono */}
              <div className="space-y-1">
                <Label htmlFor="telefono" className="text-sm font-medium">
                  Teléfono / Celular
                </Label>
                <Input
                  id="telefono"
                  placeholder="+593 99 123 4567"
                  className="w-full h-9 text-sm"
                  {...register("telefono")}
                />
              </div>

              {/* Dirección */}
              <div className="space-y-1">
                <Label htmlFor="direccion" className="text-sm font-medium">
                  Dirección de Domicilio
                </Label>
                <Input
                  id="direccion"
                  placeholder="Av. Principal #123"
                  className="w-full h-9 text-sm"
                  {...register("direccion")}
                />
              </div>
            </div>
          </div>

          <SheetFooter className="p-0 pt-5 border-t gap-2 flex-row justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="cursor-pointer"
            >
              Cancelar
            </Button>

            <Button type="submit" disabled={isLoading} className="gap-2 cursor-pointer">
              {isLoading && <Loader2 className="size-4 animate-spin" />}
              {isEditing ? "Guardar Cambios" : "Registrar Persona"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
