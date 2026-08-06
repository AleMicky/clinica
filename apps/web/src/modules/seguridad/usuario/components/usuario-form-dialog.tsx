"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Users, Loader2, KeyRound, UserCheck, Shield } from "lucide-react";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

import { usuarioSchema, type UsuarioFormValues } from "../schemas/usuario.schema";
import { useCreateUsuario, useUpdateUsuario } from "../hooks/use-usuarios";
import type { UsuarioResponse } from "../types/usuario.types";

interface UsuarioFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  usuarioToEdit?: UsuarioResponse | null;
  onSuccessCallback?: () => void;
}

const ROL_DEFECTO = "RECEPCION";

const ROLES_DISPONIBLES = [
  { value: "ADMINISTRADOR", label: "Administrador del Sistema" },
  { value: "RECEPCION", label: "Recepción / Admisión" },
  { value: "CAJA", label: "Contabilidad / Caja" },
  { value: "FARMACIA", label: "Farmacia" },
  { value: "ALMACEN", label: "Almacén" },
  { value: "RECURSOS_HUMANOS", label: "Recursos Humanos" },
];

const TIPOS_DOCUMENTO = ["CI", "DNI", "PASAPORTE", "NIT", "OTRO"];

export function UsuarioFormDialog({
  open,
  onOpenChange,
  usuarioToEdit,
  onSuccessCallback,
}: UsuarioFormDialogProps) {
  const isEditing = Boolean(usuarioToEdit);

  const createMutation = useCreateUsuario();
  const updateMutation = useUpdateUsuario();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<UsuarioFormValues>({
    resolver: zodResolver(usuarioSchema),
    defaultValues: {
      userName: "",
      email: "",
      password: "",
      activo: true,
      nombres: "",
      apellidoPaterno: "",
      apellidoMaterno: "",
      tipoDocumento: "CI",
      numeroDocumento: "",
      rol: ROL_DEFECTO,
    },
  });

  const rolValue: string = watch("rol") || ROL_DEFECTO;
  const tipoDocumentoValue: string = watch("tipoDocumento") || "CI";

  // Reset form state when drawer opens or editing item changes
  React.useEffect(() => {
    if (open) {
      if (usuarioToEdit) {
        reset({
          userName: usuarioToEdit.userName || "",
          email: usuarioToEdit.email || "",
          password: "",
          activo: usuarioToEdit.activo ?? true,
          nombres: usuarioToEdit.persona?.nombres || "",
          apellidoPaterno: usuarioToEdit.persona?.apellidoPaterno || "",
          apellidoMaterno: usuarioToEdit.persona?.apellidoMaterno || "",
          tipoDocumento: usuarioToEdit.persona?.tipoDocumento || "CI",
          numeroDocumento: usuarioToEdit.persona?.numeroDocumento || "",
          rol: usuarioToEdit.roles?.[0] || ROL_DEFECTO,
        });
      } else {
        reset({
          userName: "",
          email: "",
          password: "",
          activo: true,
          nombres: "",
          apellidoPaterno: "",
          apellidoMaterno: "",
          tipoDocumento: "CI",
          numeroDocumento: "",
          rol: ROL_DEFECTO,
        });
      }
    }
  }, [open, usuarioToEdit, reset]);

  const onSubmit = async (values: UsuarioFormValues) => {
    try {
      if (isEditing && usuarioToEdit) {
        await updateMutation.mutateAsync({
          id: usuarioToEdit.id,
          data: {
            userName: values.userName.trim(),
            email: values.email.trim(),
            activo: values.activo,
            roles: [values.rol],
          },
        });
        toast.success(`Cuenta @${values.userName} actualizada correctamente.`);
      } else {
        await createMutation.mutateAsync({
          userName: values.userName.trim(),
          email: values.email.trim(),
          password: values.password || "Clinica123*",
          roles: [values.rol],
          persona: {
            nombres: values.nombres.trim(),
            apellidoPaterno: values.apellidoPaterno.trim(),
            apellidoMaterno: values.apellidoMaterno?.trim() || undefined,
            tipoDocumento: values.tipoDocumento.trim(),
            numeroDocumento: values.numeroDocumento.trim(),
            fechaNacimiento: new Date().toISOString().split("T")[0],
          },
        });
        toast.success(`Cuenta @${values.userName} creada correctamente.`);
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
        className="sm:!max-w-2xl md:!max-w-3xl lg:!max-w-4xl w-full p-7 flex flex-col h-full overflow-y-auto"
      >
        <SheetHeader className="p-0 space-y-1.5 pb-4 border-b">
          <SheetTitle className="flex items-center gap-2.5 text-xl font-bold">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Users className="size-5" />
            </div>
            <span>{isEditing ? "Editar Usuario" : "Registrar Nuevo Usuario"}</span>
          </SheetTitle>
          <SheetDescription className="text-xs sm:text-sm text-muted-foreground">
            {isEditing
              ? "Modifique los parámetros de la cuenta, roles asignados y credenciales de acceso."
              : "Ingrese la información de cuenta y persona vinculada para el nuevo usuario."}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 space-y-6 pt-4 overflow-y-auto pr-1">
          {/* Indicador de campos requeridos */}
          <div className="flex items-center justify-between text-xs text-muted-foreground bg-muted/40 px-3.5 py-2 rounded-lg border border-border/50">
            <span>Formulario de credenciales y usuario</span>
            <span className="text-destructive font-semibold">* Requeridos</span>
          </div>

          {/* Bloque 1: Credenciales de Cuenta */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-foreground uppercase tracking-wider">
              <KeyRound className="size-4 text-primary" />
              <span>Credenciales de Acceso</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="userName" className="text-sm font-medium flex items-center gap-1">
                  Nombre de Usuario <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="userName"
                  placeholder="ej. crodriguez"
                  className={cn("w-full font-mono h-10 text-sm", errors.userName && "border-destructive focus-visible:ring-destructive")}
                  {...register("userName")}
                />
                {errors.userName && (
                  <p className="text-xs text-destructive font-medium">{errors.userName.message}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium flex items-center gap-1">
                  Correo Electrónico <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="carlos@clinica.com"
                  className={cn("w-full h-10 text-sm", errors.email && "border-destructive focus-visible:ring-destructive")}
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-xs text-destructive font-medium">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  {isEditing ? "Nueva Contraseña (Opcional)" : "Contraseña"}
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={isEditing ? "Dejar en blanco para mantener" : "••••••••"}
                  className="w-full h-10 text-sm"
                  {...register("password")}
                />
              </div>
            </div>
          </div>

          {/* Bloque 2: Asignación de Roles */}
          <div className="space-y-4 pt-4 border-t border-border/50">
            <div className="flex items-center gap-2 text-xs font-bold text-foreground uppercase tracking-wider">
              <Shield className="size-4 text-primary" />
              <span>Rol y Permisos del Sistema</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Rol */}
              <div className="space-y-2">
                <Label htmlFor="rol" className="text-sm font-medium flex items-center gap-1">
                  Rol Principal <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={rolValue}
                  onValueChange={(val) => setValue("rol", val || ROL_DEFECTO)}
                >
                  <SelectTrigger id="rol" className="w-full h-10 text-sm">
                    <SelectValue placeholder="Seleccione un rol" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES_DISPONIBLES.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.rol && (
                  <p className="text-xs text-destructive font-medium">{errors.rol.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Bloque 3: Datos de Persona Vinculada */}
          <div className="space-y-4 pt-4 border-t border-border/50">
            <div className="flex items-center gap-2 text-xs font-bold text-foreground uppercase tracking-wider">
              <UserCheck className="size-4 text-primary" />
              <span>Persona Titular / Vinculada</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Nombres */}
              <div className="space-y-2">
                <Label htmlFor="nombres" className="text-sm font-medium flex items-center gap-1">
                  Nombres <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="nombres"
                  placeholder="ej. Carlos Andrés"
                  className={cn("w-full h-10 text-sm", errors.nombres && "border-destructive focus-visible:ring-destructive")}
                  {...register("nombres")}
                />
                {errors.nombres && (
                  <p className="text-xs text-destructive font-medium">{errors.nombres.message}</p>
                )}
              </div>

              {/* Apellido Paterno */}
              <div className="space-y-2">
                <Label htmlFor="apellidoPaterno" className="text-sm font-medium flex items-center gap-1">
                  Apellido Paterno <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="apellidoPaterno"
                  placeholder="ej. Rodríguez"
                  className={cn("w-full h-10 text-sm", errors.apellidoPaterno && "border-destructive focus-visible:ring-destructive")}
                  {...register("apellidoPaterno")}
                />
                {errors.apellidoPaterno && (
                  <p className="text-xs text-destructive font-medium">{errors.apellidoPaterno.message}</p>
                )}
              </div>

              {/* Apellido Materno */}
              <div className="space-y-2">
                <Label htmlFor="apellidoMaterno" className="text-sm font-medium">
                  Apellido Materno
                </Label>
                <Input
                  id="apellidoMaterno"
                  placeholder="ej. Vargas"
                  className="w-full h-10 text-sm"
                  {...register("apellidoMaterno")}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Tipo Documento */}
              <div className="space-y-2">
                <Label htmlFor="tipoDocumento" className="text-sm font-medium flex items-center gap-1">
                  Tipo Doc. <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={tipoDocumentoValue}
                  onValueChange={(val) => setValue("tipoDocumento", val || "CI")}
                >
                  <SelectTrigger id="tipoDocumento" className="w-full h-10 text-sm">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPOS_DOCUMENTO.map((tipo) => (
                      <SelectItem key={tipo} value={tipo}>
                        {tipo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Número Documento */}
              <div className="space-y-2">
                <Label htmlFor="numeroDocumento" className="text-sm font-medium flex items-center gap-1">
                  Número Documento <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="numeroDocumento"
                  placeholder="1712987654"
                  className={cn("w-full font-mono h-10 text-sm", errors.numeroDocumento && "border-destructive focus-visible:ring-destructive")}
                  {...register("numeroDocumento")}
                />
                {errors.numeroDocumento && (
                  <p className="text-xs text-destructive font-medium">{errors.numeroDocumento.message}</p>
                )}
              </div>
            </div>
          </div>

          <SheetFooter className="p-0 pt-5 border-t gap-2 flex-row justify-end">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="cursor-pointer"
            >
              Cancelar
            </Button>

            <Button type="submit" size="lg" disabled={isLoading} className="gap-2 cursor-pointer">
              {isLoading && <Loader2 className="size-4 animate-spin" />}
              {isEditing ? "Guardar Cambios" : "Crear Usuario"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
