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
  KeyRound,
  Eye,
  EyeOff,
  Users,
  AtSign,
  Mail,
  Shield,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CatalogoAutocomplete } from "@/components/ui/catalogo-autocomplete";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

import { usuarioSchema, type UsuarioFormValues } from "../schemas/usuario.schema";
import {
  useCreateUsuario,
  useUpdateUsuario,
  useUsuario,
} from "../hooks/use-usuarios";
import { useRoles } from "@/modules/seguridad/rol";

interface UsuarioPageFormProps {
  id?: number;
}

export function UsuarioPageForm({ id }: UsuarioPageFormProps) {
  const router = useRouter();
  const isEditing = Boolean(id && id > 0);

  const [showPassword, setShowPassword] = React.useState(false);

  // Queries & Mutations
  const { data: usuarioData, isLoading: isLoadingUsuario } = useUsuario(
    id || 0,
    isEditing
  );
  const { data: rolesData, isLoading: isLoadingRoles } = useRoles({
    pageSize: 100,
  });
  const roles = rolesData?.items ?? [];

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
      fechaNacimiento: "",
      tipoDocumento: "",
      numeroDocumento: "",
      extensionDocumento: "",
      complementoDocumento: "",
      genero: "",
      estadoCivil: "",
      rol: "",
    },
  });

  const rolValue: string = watch("rol") || "";
  const tipoDocumentoValue: string = watch("tipoDocumento") || "";
  const extensionDocumentoValue: string = watch("extensionDocumento") || "";
  const generoValue: string = watch("genero") || "";
  const estadoCivilValue: string = watch("estadoCivil") || "";
  const activoValue: boolean = watch("activo") ?? true;

  // Register custom select & autocompletes
  React.useEffect(() => {
    register("tipoDocumento");
    register("extensionDocumento");
    register("genero");
    register("estadoCivil");
    register("rol");
    register("activo");
  }, [register]);

  // Load existing user data in edit mode
  React.useEffect(() => {
    if (usuarioData && isEditing) {
      reset({
        userName: usuarioData.userName || "",
        email: usuarioData.email || "",
        password: "",
        activo: usuarioData.activo ?? true,
        nombres: usuarioData.persona?.nombres || "",
        apellidoPaterno: usuarioData.persona?.apellidoPaterno || "",
        apellidoMaterno: usuarioData.persona?.apellidoMaterno || "",
        fechaNacimiento: usuarioData.persona?.fechaNacimiento
          ? usuarioData.persona.fechaNacimiento.split("T")[0]
          : "",
        tipoDocumento: usuarioData.persona?.tipoDocumento || "",
        numeroDocumento: usuarioData.persona?.numeroDocumento || "",
        extensionDocumento: usuarioData.persona?.extensionDocumento || "",
        complementoDocumento: usuarioData.persona?.complementoDocumento || "",
        genero: usuarioData.persona?.genero || "",
        estadoCivil: usuarioData.persona?.estadoCivil || "",
        rol: usuarioData.roles?.[0] || "",
      });
    }
  }, [usuarioData, isEditing, reset]);

  const onSubmit = async (values: UsuarioFormValues) => {
    try {
      if (isEditing && id) {
        await updateMutation.mutateAsync({
          id,
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
          toast.error("Por favor complete los campos requeridos de la persona.");
          return;
        }

        await createMutation.mutateAsync({
          userName: values.userName.trim(),
          email: values.email.trim(),
          password: values.password?.trim() || undefined,
          roles: values.rol ? [values.rol] : [],
          persona: {
            nombres: values.nombres.trim(),
            apellidoPaterno: values.apellidoPaterno.trim(),
            apellidoMaterno: values.apellidoMaterno?.trim() || undefined,
            tipoDocumento: values.tipoDocumento.trim(),
            numeroDocumento: values.numeroDocumento.trim(),
            extensionDocumento: values.extensionDocumento?.trim() || undefined,
            complementoDocumento: values.complementoDocumento?.trim() || undefined,
            fechaNacimiento: values.fechaNacimiento?.trim() || undefined,
            genero: values.genero?.trim() || undefined,
            estadoCivil: values.estadoCivil?.trim() || undefined,
          },
        });
        toast.success(`Cuenta @${values.userName} creada exitosamente.`);
      }
      router.push("/seguridad/usuarios");
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

  if (isEditing && isLoadingUsuario) {
    return (
      <div className="flex flex-col gap-4 w-full p-2">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 w-full pb-8">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/seguridad/usuarios")}
            className="h-8 px-2 text-xs gap-1.5 cursor-pointer text-muted-foreground hover:text-foreground shrink-0 rounded-lg"
          >
            <ArrowLeft className="size-4" />
            <span className="hidden sm:inline">Volver a Usuarios</span>
          </Button>

          <div className="h-5 w-px bg-border/60 shrink-0" />

          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0 shadow-2xs">
              <Users className="size-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-bold text-foreground truncate">
                  {isEditing ? `Editar Usuario: @${usuarioData?.userName || ""}` : "Registrar Nuevo Usuario"}
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
                  {isEditing ? "Modo Edición" : "Nueva Cuenta"}
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground truncate">
                {isEditing
                  ? "Actualice los parámetros de acceso, roles y estado de la cuenta."
                  : "Defina los datos de filiación, credenciales de acceso y rol del usuario."}
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
            onClick={() => router.push("/seguridad/usuarios")}
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
            <span>{isEditing ? "Guardar Cambios" : "Crear Usuario"}</span>
          </Button>
        </div>
      </div>

      {/* Unified Form Card Container */}
      <form onSubmit={handleSubmit(onSubmit)} className="w-full">
        <Card className="border border-border/70 shadow-2xs rounded-xl overflow-hidden bg-card">
          <CardContent className="p-4 sm:p-5 space-y-6">
            {/* SECCIÓN 1: DATOS PERSONALES */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-border/60">
                <div className="size-6 rounded-md bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <User className="size-3.5" />
                </div>
                <div>
                  <h2 className="text-xs sm:text-sm font-bold text-foreground">
                    Información Personal y Filiatoria
                  </h2>
                  <p className="text-[11px] text-muted-foreground">
                    {isEditing
                      ? "Datos filiatorios de la persona vinculada."
                      : "Datos personales del titular de la cuenta."}
                  </p>
                </div>
              </div>

              {/* Grid de Nombres y Documento */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-12 gap-3">
                {/* Nombres */}
                <div className="space-y-1 sm:col-span-1 md:col-span-1 lg:col-span-4">
                  <Label htmlFor="nombres" className="text-xs font-medium flex items-center gap-0.5">
                    Nombres {!isEditing && <span className="text-destructive">*</span>}
                  </Label>
                  <Input
                    id="nombres"
                    placeholder="ej. María Elena"
                    disabled={isEditing}
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
                    Apellido Paterno {!isEditing && <span className="text-destructive">*</span>}
                  </Label>
                  <Input
                    id="apellidoPaterno"
                    placeholder="ej. Gómez"
                    disabled={isEditing}
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
                    disabled={isEditing}
                    className="w-full h-8 text-xs"
                    {...register("apellidoMaterno")}
                  />
                </div>

                {/* Tipo Documento */}
                <div className="space-y-1 sm:col-span-1 md:col-span-1 lg:col-span-3">
                  <Label htmlFor="tipoDocumento" className="text-xs font-medium flex items-center gap-0.5">
                    Tipo Documento {!isEditing && <span className="text-destructive">*</span>}
                  </Label>
                  <CatalogoAutocomplete
                    id="tipoDocumento"
                    codigo="TIPO_DOCUMENTO"
                    value={tipoDocumentoValue}
                    onValueChange={(val) => setValue("tipoDocumento", val || "", { shouldValidate: true })}
                    placeholder="Seleccionar tipo"
                    emptyText="Sin tipos"
                    disabled={isEditing}
                    error={Boolean(errors.tipoDocumento)}
                  />
                  {errors.tipoDocumento && (
                    <p className="text-[10px] text-destructive font-medium">{errors.tipoDocumento.message}</p>
                  )}
                </div>

                {/* Número Documento */}
                <div className="space-y-1 sm:col-span-1 md:col-span-1 lg:col-span-3">
                  <Label htmlFor="numeroDocumento" className="text-xs font-medium flex items-center gap-0.5">
                    Número {!isEditing && <span className="text-destructive">*</span>}
                  </Label>
                  <Input
                    id="numeroDocumento"
                    placeholder="12345678"
                    disabled={isEditing}
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
                    disabled={isEditing}
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
                    disabled={isEditing}
                    className="w-full font-mono h-8 text-xs uppercase"
                    {...register("complementoDocumento")}
                  />
                </div>

                {/* Fecha Nacimiento */}
                <div className="space-y-1 sm:col-span-1 md:col-span-1 lg:col-span-4">
                  <Label htmlFor="fechaNacimiento" className="text-xs font-medium">
                    Fecha de Nacimiento
                  </Label>
                  <Input
                    id="fechaNacimiento"
                    type="date"
                    disabled={isEditing}
                    className={cn("w-full h-8 text-xs", errors.fechaNacimiento && "border-destructive focus-visible:ring-destructive")}
                    {...register("fechaNacimiento")}
                  />
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
                    disabled={isEditing}
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
                    disabled={isEditing}
                  />
                </div>
              </div>
            </div>

            {/* SECCIÓN 2: CREDENCIALES Y ACCESO */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2 pb-2 border-b border-border/60">
                <div className="size-6 rounded-md bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <KeyRound className="size-3.5" />
                </div>
                <div>
                  <h2 className="text-xs sm:text-sm font-bold text-foreground">
                    Credenciales de Cuenta y Seguridad
                  </h2>
                  <p className="text-[11px] text-muted-foreground">
                    Configuración de acceso al sistema, asignación de rol y estado.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-12 gap-3">
                {/* Nombre de Usuario */}
                <div className="space-y-1 sm:col-span-1 md:col-span-1 lg:col-span-4">
                  <Label htmlFor="userName" className="text-xs font-medium flex items-center gap-0.5">
                    Nombre de Usuario <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-muted-foreground">
                      <AtSign className="size-3.5" />
                    </div>
                    <Input
                      id="userName"
                      placeholder="crodriguez"
                      className={cn("w-full pl-8 font-mono h-8 text-xs", errors.userName && "border-destructive focus-visible:ring-destructive")}
                      {...register("userName")}
                    />
                  </div>
                  {errors.userName && (
                    <p className="text-[10px] text-destructive font-medium">{errors.userName.message}</p>
                  )}
                </div>

                {/* Correo Electrónico */}
                <div className="space-y-1 sm:col-span-1 md:col-span-1 lg:col-span-4">
                  <Label htmlFor="email" className="text-xs font-medium flex items-center gap-0.5">
                    Correo Electrónico <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-muted-foreground">
                      <Mail className="size-3.5" />
                    </div>
                    <Input
                      id="email"
                      type="email"
                      placeholder="usuario@clinica.com"
                      className={cn("w-full pl-8 h-8 text-xs", errors.email && "border-destructive focus-visible:ring-destructive")}
                      {...register("email")}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-[10px] text-destructive font-medium">{errors.email.message}</p>
                  )}
                </div>

                {/* Rol Asignado */}
                <div className="space-y-1 sm:col-span-2 md:col-span-1 lg:col-span-4">
                  <Label htmlFor="rol" className="text-xs font-medium flex items-center gap-0.5">
                    Rol Principal <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={rolValue}
                    onValueChange={(val) => setValue("rol", val || "", { shouldValidate: true })}
                    disabled={isLoadingRoles}
                  >
                    <SelectTrigger id="rol" className="w-full h-8 text-xs">
                      <SelectValue placeholder={isLoadingRoles ? "Cargando roles..." : "Seleccione un rol"} />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.length === 0 ? (
                        <div className="p-2 text-xs text-muted-foreground text-center">
                          {isLoadingRoles ? "Cargando..." : "Sin roles disponibles"}
                        </div>
                      ) : (
                        roles.map((r) => (
                          <SelectItem key={r.id} value={r.name} className="text-xs cursor-pointer">
                            {r.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {errors.rol && (
                    <p className="text-[10px] text-destructive font-medium">{errors.rol.message}</p>
                  )}
                </div>

                {/* Contraseña (solo al crear) */}
                {!isEditing && (
                  <div className="space-y-1 sm:col-span-1 md:col-span-2 lg:col-span-6">
                    <Label htmlFor="password" className="text-xs font-medium flex items-center gap-0.5">
                      Contraseña Temporal
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="w-full h-8 text-xs pr-8"
                        {...register("password")}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-0 top-0 h-8 w-8 px-0 text-muted-foreground hover:text-foreground cursor-pointer"
                        title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                      >
                        {showPassword ? (
                          <EyeOff className="size-3.5" />
                        ) : (
                          <Eye className="size-3.5" />
                        )}
                        <span className="sr-only">
                          {showPassword ? "Ocultar" : "Mostrar"}
                        </span>
                      </Button>
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      Opcional. Si se deja en blanco, se solicitará al primer inicio de sesión.
                    </p>
                  </div>
                )}

                {/* Estado Activo */}
                <div className={cn("space-y-1", !isEditing ? "sm:col-span-1 md:col-span-1 lg:col-span-6" : "sm:col-span-2 md:col-span-3 lg:col-span-12")}>
                  <Label htmlFor="activo" className="text-xs font-medium">
                    Estado de la Cuenta
                  </Label>
                  <div className="flex items-center justify-between h-8 px-3 rounded-md border border-input bg-muted/20">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="activo"
                        checked={activoValue}
                        onCheckedChange={(checked) => setValue("activo", Boolean(checked))}
                      />
                      <Label htmlFor="activo" className="text-xs font-medium cursor-pointer">
                        {activoValue ? "Cuenta Habilitada" : "Cuenta Bloqueada"}
                      </Label>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[9px] px-1.5 py-0 font-semibold uppercase tracking-wider",
                        activoValue
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                          : "bg-destructive/10 text-destructive border-destructive/20"
                      )}
                    >
                      {activoValue ? "Activo" : "Inactivo"}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions inside Card */}
            <div className="flex items-center justify-end gap-2 pt-4 border-t border-border/60">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => router.push("/seguridad/usuarios")}
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
                <span>{isEditing ? "Guardar Cambios" : "Crear Usuario"}</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
