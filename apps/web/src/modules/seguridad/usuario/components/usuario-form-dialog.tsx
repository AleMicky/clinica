"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Users,
  Loader2,
  KeyRound,
  UserCheck,
  Shield,
  CreditCard,
  User,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
} from "lucide-react";

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
import { Checkbox } from "@/components/ui/checkbox";
import { Stepper, type StepItem } from "@/components/ui/stepper";
import { CatalogoAutocomplete } from "@/components/ui/catalogo-autocomplete";
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

const STEPS: StepItem[] = [
  {
    id: 1,
    title: "Paso 1: Persona",
    description: "Datos filiatorios e identificación",
    icon: User,
  },
  {
    id: 2,
    title: "Paso 2: Cuenta",
    description: "Credenciales y rol asignado",
    icon: KeyRound,
  },
];

export function UsuarioFormDialog({
  open,
  onOpenChange,
  usuarioToEdit,
  onSuccessCallback,
}: UsuarioFormDialogProps) {
  const isEditing = Boolean(usuarioToEdit);
  const [currentStep, setCurrentStep] = React.useState<1 | 2>(1);
  const [showPassword, setShowPassword] = React.useState(false);

  const createMutation = useCreateUsuario();
  const updateMutation = useUpdateUsuario();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    trigger,
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
      fechaNacimiento: "",
      tipoDocumento: "",
      numeroDocumento: "",
      extensionDocumento: "",
      complementoDocumento: "",
      genero: "",
      estadoCivil: "",
      rol: ROL_DEFECTO,
    },
  });

  const rolValue: string = watch("rol") || ROL_DEFECTO;
  const tipoDocumentoValue: string = watch("tipoDocumento") || "";
  const extensionDocumentoValue: string = watch("extensionDocumento") || "";
  const generoValue: string = watch("genero") || "";
  const estadoCivilValue: string = watch("estadoCivil") || "";

  // Register custom autocomplete and select fields
  React.useEffect(() => {
    register("tipoDocumento");
    register("extensionDocumento");
    register("genero");
    register("estadoCivil");
    register("rol");
    register("activo");
  }, [register]);

  // Reset form state when drawer opens or editing item changes
  React.useEffect(() => {
    if (open) {
      setCurrentStep(usuarioToEdit ? 2 : 1);
      setShowPassword(false);
      if (usuarioToEdit) {
        reset({
          userName: usuarioToEdit.userName || "",
          email: usuarioToEdit.email || "",
          password: "",
          activo: usuarioToEdit.activo ?? true,
          nombres: usuarioToEdit.persona?.nombres || "",
          apellidoPaterno: usuarioToEdit.persona?.apellidoPaterno || "",
          apellidoMaterno: usuarioToEdit.persona?.apellidoMaterno || "",
          fechaNacimiento: usuarioToEdit.persona?.fechaNacimiento
            ? usuarioToEdit.persona.fechaNacimiento.split("T")[0]
            : "",
          tipoDocumento: usuarioToEdit.persona?.tipoDocumento || "",
          numeroDocumento: usuarioToEdit.persona?.numeroDocumento || "",
          extensionDocumento: usuarioToEdit.persona?.extensionDocumento || "",
          complementoDocumento: usuarioToEdit.persona?.complementoDocumento || "",
          genero: usuarioToEdit.persona?.genero || "",
          estadoCivil: usuarioToEdit.persona?.estadoCivil || "",
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
          fechaNacimiento: "",
          tipoDocumento: "",
          numeroDocumento: "",
          extensionDocumento: "",
          complementoDocumento: "",
          genero: "",
          estadoCivil: "",
          rol: ROL_DEFECTO,
        });
      }
    }
  }, [open, usuarioToEdit, reset]);

  const handleNextStep = async () => {
    if (isEditing) {
      setCurrentStep(2);
      return;
    }

    const isValid = await trigger([
      "nombres",
      "apellidoPaterno",
      "tipoDocumento",
      "numeroDocumento",
    ]);

    if (isValid) {
      setCurrentStep(2);
    } else {
      toast.error("Por favor complete todos los campos obligatorios de la persona.");
    }
  };

  const handleStepClick = (stepId: number) => {
    if (stepId === 1) {
      setCurrentStep(1);
    } else if (stepId === 2) {
      handleNextStep();
    }
  };

  const onSubmit = async (values: UsuarioFormValues) => {
    try {
      if (isEditing && usuarioToEdit) {
        await updateMutation.mutateAsync({
          id: usuarioToEdit.id,
          data: {
            userName: values.userName.trim(),
            email: values.email.trim(),
            roles: values.rol ? [values.rol] : [],
            activo: values.activo,
          },
        });
        toast.success(`Cuenta @${values.userName} actualizada correctamente.`);
      } else {
        if (
          !values.nombres?.trim() ||
          !values.apellidoPaterno?.trim() ||
          !values.tipoDocumento?.trim() ||
          !values.numeroDocumento?.trim()
        ) {
          setCurrentStep(1);
          toast.error("Por favor complete los campos obligatorios de la persona.");
          return;
        }

        await createMutation.mutateAsync({
          userName: values.userName.trim(),
          email: values.email.trim(),
          password: values.password || "Clinica123*",
          roles: values.rol ? [values.rol] : [],
          persona: {
            nombres: values.nombres.trim(),
            apellidoPaterno: values.apellidoPaterno.trim(),
            apellidoMaterno: values.apellidoMaterno?.trim() || undefined,
            tipoDocumento: values.tipoDocumento.trim(),
            numeroDocumento: values.numeroDocumento.trim(),
            extensionDocumento: values.extensionDocumento?.trim() || undefined,
            complementoDocumento: values.complementoDocumento?.trim() || undefined,
            fechaNacimiento: values.fechaNacimiento || new Date().toISOString().split("T")[0],
            genero: values.genero?.trim() || undefined,
            estadoCivil: values.estadoCivil?.trim() || undefined,
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
        className="sm:!max-w-2xl md:!max-w-3xl lg:!max-w-4xl w-full p-5 flex flex-col h-full overflow-y-auto"
      >
        <SheetHeader className="p-0 space-y-1.5 pb-3 border-b">
          <SheetTitle className="flex items-center gap-2.5 text-xl font-bold">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Users className="size-5" />
            </div>
            <span>{isEditing ? "Editar Usuario" : "Registrar Nuevo Usuario"}</span>
          </SheetTitle>
          <SheetDescription className="text-xs sm:text-sm text-muted-foreground">
            {isEditing
              ? "Modifique los parámetros de la cuenta, roles asignados y credenciales de acceso."
              : "Complete el registro por pasos: primero la información personal y luego las credenciales de usuario."}
          </SheetDescription>
        </SheetHeader>

        {/* Componente Global de Stepper (solo al crear) */}
        {!isEditing && (
          <Stepper
            steps={STEPS}
            currentStep={currentStep}
            onStepClick={handleStepClick}
          />
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 space-y-6 pt-4 overflow-y-auto pr-1">
          {/* Indicador de campos requeridos (solo al crear) */}
          {!isEditing && (
            <div className="flex items-center justify-between text-xs text-muted-foreground bg-muted/40 px-3.5 py-2 rounded-lg border border-border/50">
              <span>
                {currentStep === 1
                  ? "Paso 1 de 2: Información filiatoria de la persona"
                  : "Paso 2 de 2: Credenciales y permisos de usuario"}
              </span>
              <span className="text-destructive font-semibold">* Requeridos</span>
            </div>
          )}

          {!isEditing && currentStep === 1 && (
            <div className="space-y-6">
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

              {/* Bloque 2: Documento de Identidad */}
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

              {/* Bloque 3: Información Personal y Filiatoria */}
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
            </div>
          )}

          {(isEditing || currentStep === 2) && (
            <div className="space-y-6">
              {/* Bloque 1: Credenciales y Estado */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-bold text-foreground uppercase tracking-wider">
                  <KeyRound className="size-4 text-primary" />
                  <span>Credenciales y Estado de la Cuenta</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Username */}
                  <div className="space-y-1">
                    <Label htmlFor="userName" className="text-sm font-medium flex items-center gap-1">
                      Nombre de Usuario <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="userName"
                      placeholder="ej. crodriguez"
                      className={cn("w-full font-mono h-9 text-sm", errors.userName && "border-destructive focus-visible:ring-destructive")}
                      {...register("userName")}
                    />
                    {errors.userName && (
                      <p className="text-xs text-destructive font-medium">{errors.userName.message}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-1">
                    <Label htmlFor="email" className="text-sm font-medium flex items-center gap-1">
                      Correo Electrónico <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="carlos@clinica.com"
                      className={cn("w-full h-9 text-sm", errors.email && "border-destructive focus-visible:ring-destructive")}
                      {...register("email")}
                    />
                    {errors.email && (
                      <p className="text-xs text-destructive font-medium">{errors.email.message}</p>
                    )}
                  </div>

                  {/* Password (only on creation) */}
                  {!isEditing && (
                    <div className="space-y-1">
                      <Label htmlFor="password" className="text-sm font-medium">
                        Contraseña
                      </Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="w-full h-9 text-sm pr-9"
                          {...register("password")}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => setShowPassword((prev) => !prev)}
                          className="absolute right-0 top-0 h-9 w-9 px-0 text-muted-foreground hover:text-foreground cursor-pointer"
                          title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                        >
                          {showPassword ? (
                            <EyeOff className="size-4" />
                          ) : (
                            <Eye className="size-4" />
                          )}
                          <span className="sr-only">
                            {showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                          </span>
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Estado Activo */}
                  <div className="space-y-1">
                    <Label htmlFor="activo" className="text-sm font-medium">
                      Estado de la Cuenta
                    </Label>
                    <div className="flex items-center gap-3 h-9 px-3 rounded-md border border-input bg-background/50">
                      <Checkbox
                        id="activo"
                        checked={watch("activo")}
                        onCheckedChange={(checked) => setValue("activo", Boolean(checked))}
                      />
                      <Label htmlFor="activo" className="text-sm font-medium cursor-pointer flex items-center gap-2">
                        <span>{watch("activo") ? "Cuenta Activa" : "Cuenta Inactiva (Bloqueada)"}</span>
                        <span
                          className={cn(
                            "text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider",
                            watch("activo")
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                              : "bg-destructive/10 text-destructive border border-destructive/20"
                          )}
                        >
                          {watch("activo") ? "Activo" : "Inactivo"}
                        </span>
                      </Label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bloque 2: Asignación de Roles */}
              <div className="space-y-2.5 pt-4 border-t border-border/50">
                <div className="flex items-center gap-2 text-xs font-bold text-foreground uppercase tracking-wider">
                  <Shield className="size-4 text-primary" />
                  <span>Rol y Permisos del Sistema</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Rol */}
                  <div className="space-y-1">
                    <Label htmlFor="rol" className="text-sm font-medium flex items-center gap-1">
                      Rol Principal <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={rolValue}
                      onValueChange={(val) => setValue("rol", val || ROL_DEFECTO)}
                    >
                      <SelectTrigger id="rol" className="w-full h-9 text-sm">
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
            </div>
          )}

          <SheetFooter className="p-0 pt-5 border-t flex flex-row justify-between items-center gap-2">
            <div>
              {!isEditing && currentStep === 2 ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(1)}
                  disabled={isLoading}
                  className="gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="size-4" />
                  Anterior
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isLoading}
                  className="cursor-pointer"
                >
                  Cancelar
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {!isEditing && currentStep === 1 ? (
                <Button
                  type="button"
                  onClick={handleNextStep}
                  disabled={isLoading}
                  className="gap-1.5 cursor-pointer"
                >
                  Siguiente
                  <ArrowRight className="size-4" />
                </Button>
              ) : (
                <>
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
                    {isEditing ? "Guardar Cambios" : "Crear Usuario"}
                  </Button>
                </>
              )}
            </div>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
