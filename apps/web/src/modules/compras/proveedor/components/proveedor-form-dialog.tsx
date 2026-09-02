"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Building2,
  Loader2,
  PlusCircle,
  Save,
  FileText,
  MapPin,
  User,
} from "lucide-react";

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

import {
  proveedorSchema,
  type ProveedorFormValues,
} from "../schemas/proveedor.schema";
import {
  useCreateProveedor,
  useUpdateProveedor,
} from "../hooks/use-proveedor";
import type { ProveedorResponse } from "../types/proveedor.types";

interface ProveedorFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  proveedorToEdit?: ProveedorResponse | null;
  onSuccessCallback?: () => void;
}

export function ProveedorFormDialog({
  open,
  onOpenChange,
  proveedorToEdit,
  onSuccessCallback,
}: ProveedorFormDialogProps) {
  const isEditing = Boolean(proveedorToEdit);
  const [keepOpen, setKeepOpen] = React.useState(false);

  const createMutation = useCreateProveedor();
  const updateMutation = useUpdateProveedor();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProveedorFormValues>({
    resolver: zodResolver(proveedorSchema),
    defaultValues: {
      codigo: "",
      razonSocial: "",
      nombreComercial: "",
      nit: "",
      direccion: "",
      telefono: "",
      celular: "",
      email: "",
      contacto: "",
      observacion: "",
    },
  });

  React.useEffect(() => {
    if (open) {
      setKeepOpen(false);
      if (proveedorToEdit) {
        reset({
          codigo: proveedorToEdit.codigo || "",
          razonSocial: proveedorToEdit.razonSocial || "",
          nombreComercial: proveedorToEdit.nombreComercial || "",
          nit: proveedorToEdit.nit || "",
          direccion: proveedorToEdit.direccion || "",
          telefono: proveedorToEdit.telefono || "",
          celular: proveedorToEdit.celular || "",
          email: proveedorToEdit.email || "",
          contacto: proveedorToEdit.contacto || "",
          observacion: proveedorToEdit.observacion || "",
        });
      } else {
        reset({
          codigo: "",
          razonSocial: "",
          nombreComercial: "",
          nit: "",
          direccion: "",
          telefono: "",
          celular: "",
          email: "",
          contacto: "",
          observacion: "",
        });
      }
    }
  }, [open, proveedorToEdit, reset]);

  const onSubmit = async (values: ProveedorFormValues) => {
    try {
      const payload = {
        codigo: values.codigo.trim().toUpperCase(),
        razonSocial: values.razonSocial.trim(),
        nombreComercial: values.nombreComercial?.trim() || null,
        nit: values.nit?.trim() || null,
        direccion: values.direccion?.trim() || null,
        telefono: values.telefono?.trim() || null,
        celular: values.celular?.trim() || null,
        email: values.email?.trim() || null,
        contacto: values.contacto?.trim() || null,
        observacion: values.observacion?.trim() || null,
      };

      if (isEditing && proveedorToEdit) {
        await updateMutation.mutateAsync({
          id: proveedorToEdit.id,
          data: payload,
        });
        toast.success(`Proveedor "${payload.razonSocial}" actualizado correctamente.`);
      } else {
        await createMutation.mutateAsync(payload);
        toast.success(`Proveedor "${payload.razonSocial}" registrado correctamente.`);
      }

      onSuccessCallback?.();

      if (!isEditing && keepOpen) {
        reset({
          codigo: "",
          razonSocial: "",
          nombreComercial: "",
          nit: "",
          direccion: "",
          telefono: "",
          celular: "",
          email: "",
          contacto: "",
          observacion: "",
        });
      } else {
        onOpenChange(false);
      }
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        error?.message ||
        "Ocurrió un error al guardar el proveedor.";
      toast.error(errorMsg);
    }
  };

  const isPending = isSubmitting || createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[760px] md:max-w-[820px] p-0 overflow-hidden">
        <DialogHeader className="px-5 py-3.5 border-b border-border/60 bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
              <Building2 className="size-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">
                {isEditing ? "Editar Proveedor" : "Nuevo Proveedor"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                {isEditing
                  ? "Actualiza la información comercial, fiscal o canales de contacto del proveedor."
                  : "Registra los datos corporativos, tributarios y de contacto para el catálogo de compras."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-5 py-4 max-h-[80vh] overflow-y-auto">
          {/* Sección 1: Información Corporativa y Fiscal */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground/80 border-b border-border/40 pb-1">
              <FileText className="size-3.5 text-primary" />
              <span>Datos Fiscales y Razón Social</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-4 space-y-1">
                <Label htmlFor="codigo" className="text-xs font-medium">
                  Código <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="codigo"
                  placeholder="PRV-001"
                  className="h-8 text-xs font-mono uppercase"
                  {...register("codigo", {
                    onChange: (e) => {
                      e.target.value = e.target.value.toUpperCase();
                    },
                  })}
                  disabled={isPending}
                />
                {errors.codigo && (
                  <p className="text-[10px] text-destructive leading-tight">{errors.codigo.message}</p>
                )}
              </div>

              <div className="sm:col-span-8 space-y-1">
                <Label htmlFor="nit" className="text-xs font-medium">
                  NIT / RUC / Doc. Fiscal
                </Label>
                <Input
                  id="nit"
                  placeholder="102938475"
                  className="h-8 text-xs font-mono"
                  {...register("nit")}
                  disabled={isPending}
                />
                {errors.nit && (
                  <p className="text-[10px] text-destructive leading-tight">{errors.nit.message}</p>
                )}
              </div>

              <div className="sm:col-span-7 space-y-1">
                <Label htmlFor="razonSocial" className="text-xs font-medium">
                  Razón Social <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="razonSocial"
                  placeholder="Nombre Legal o Razón Social de la Empresa"
                  className="h-8 text-xs"
                  {...register("razonSocial")}
                  disabled={isPending}
                />
                {errors.razonSocial && (
                  <p className="text-[10px] text-destructive leading-tight">{errors.razonSocial.message}</p>
                )}
              </div>

              <div className="sm:col-span-5 space-y-1">
                <Label htmlFor="nombreComercial" className="text-xs font-medium">
                  Nombre Comercial / Marca
                </Label>
                <Input
                  id="nombreComercial"
                  placeholder="Nombre de fantasía"
                  className="h-8 text-xs"
                  {...register("nombreComercial")}
                  disabled={isPending}
                />
                {errors.nombreComercial && (
                  <p className="text-[10px] text-destructive leading-tight">{errors.nombreComercial.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Sección 2: Contacto y Comunicaciones */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground/80 border-b border-border/40 pb-1">
              <User className="size-3.5 text-primary" />
              <span>Canales de Comunicación y Contacto</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-6 space-y-1">
                <Label htmlFor="contacto" className="text-xs font-medium">
                  Persona de Contacto
                </Label>
                <Input
                  id="contacto"
                  placeholder="Ej. Lic. Carlos Mendoza (Ejecutivo de Ventas)"
                  className="h-8 text-xs"
                  {...register("contacto")}
                  disabled={isPending}
                />
                {errors.contacto && (
                  <p className="text-[10px] text-destructive leading-tight">{errors.contacto.message}</p>
                )}
              </div>

              <div className="sm:col-span-6 space-y-1">
                <Label htmlFor="email" className="text-xs font-medium">
                  Correo Electrónico
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="ventas@proveedor.com"
                  className="h-8 text-xs"
                  {...register("email")}
                  disabled={isPending}
                />
                {errors.email && (
                  <p className="text-[10px] text-destructive leading-tight">{errors.email.message}</p>
                )}
              </div>

              <div className="sm:col-span-6 space-y-1">
                <Label htmlFor="telefono" className="text-xs font-medium">
                  Teléfono Fijo / Central
                </Label>
                <Input
                  id="telefono"
                  placeholder="22445566"
                  className="h-8 text-xs"
                  {...register("telefono")}
                  disabled={isPending}
                />
                {errors.telefono && (
                  <p className="text-[10px] text-destructive leading-tight">{errors.telefono.message}</p>
                )}
              </div>

              <div className="sm:col-span-6 space-y-1">
                <Label htmlFor="celular" className="text-xs font-medium">
                  Celular / WhatsApp
                </Label>
                <Input
                  id="celular"
                  placeholder="+591 70000000"
                  className="h-8 text-xs"
                  {...register("celular")}
                  disabled={isPending}
                />
                {errors.celular && (
                  <p className="text-[10px] text-destructive leading-tight">{errors.celular.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Sección 3: Dirección y Observaciones */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground/80 border-b border-border/40 pb-1">
              <MapPin className="size-3.5 text-primary" />
              <span>Dirección y Condiciones Comerciales</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-12 space-y-1">
                <Label htmlFor="direccion" className="text-xs font-medium">
                  Dirección Física
                </Label>
                <Input
                  id="direccion"
                  placeholder="Av. Industrial #456, Parque Industrial"
                  className="h-8 text-xs"
                  {...register("direccion")}
                  disabled={isPending}
                />
                {errors.direccion && (
                  <p className="text-[10px] text-destructive leading-tight">{errors.direccion.message}</p>
                )}
              </div>

              <div className="sm:col-span-12 space-y-1">
                <Label htmlFor="observacion" className="text-xs font-medium">
                  Observaciones Comerciales / Términos de Pago
                </Label>
                <Textarea
                  id="observacion"
                  placeholder="Plazos de crédito acordados, tiempos estimados de entrega, datos bancarios u observaciones internas..."
                  rows={2}
                  className="text-xs resize-none min-h-[50px]"
                  {...register("observacion")}
                  disabled={isPending}
                />
                {errors.observacion && (
                  <p className="text-[10px] text-destructive leading-tight">{errors.observacion.message}</p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="pt-3 border-t border-border/60 flex flex-col-reverse sm:flex-row sm:justify-between items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              className="h-8 text-xs w-full sm:w-auto cursor-pointer"
            >
              Cancelar
            </Button>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              {!isEditing && (
                <Button
                  type="submit"
                  variant="secondary"
                  size="sm"
                  disabled={isPending}
                  onClick={() => setKeepOpen(true)}
                  className="h-8 text-xs gap-1.5 cursor-pointer w-full sm:w-auto"
                >
                  {isPending && keepOpen ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <PlusCircle className="size-3.5 text-muted-foreground" />
                  )}
                  <span>Guardar y agregar otro</span>
                </Button>
              )}

              <Button
                type="submit"
                size="sm"
                disabled={isPending}
                onClick={() => setKeepOpen(false)}
                className="h-8 text-xs gap-1.5 cursor-pointer w-full sm:w-auto"
              >
                {isPending && !keepOpen ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Save className="size-3.5" />
                )}
                <span>{isEditing ? "Guardar Cambios" : "Guardar"}</span>
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
