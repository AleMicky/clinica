"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  User,
  Shield,
  KeyRound,
  Mail,
  Phone,
  MapPin,
  Calendar,
  IdCard,
  CheckCircle2,
  AlertCircle,
  LoaderCircle,
  LogOut,
  Sparkles,
  Lock,
  Eye,
  EyeOff,
  Copy,
  Check,
  RotateCw,
  ShieldCheck,
  Fingerprint,
  HeartPulse,
  BadgeCheck,
  CheckCheck,
} from "lucide-react";

import { useAuth } from "@/providers/auth-provider";
import { useChangePassword } from "@/modules/auth/hooks/use-change-password";
import { useLogout } from "@/modules/auth/hooks/use-logout";
import { useQueryClient } from "@tanstack/react-query";
import { authKeys } from "../api/auth.keys";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

function getInitials(name?: string | null): string {
  if (!name || !name.trim()) return "US";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function PerfilView() {
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") === "password" ? "password" : "info";

  const queryClient = useQueryClient();
  const { user, isLoading } = useAuth();
  const logoutMutation = useLogout();
  const changePasswordMutation = useChangePassword();

  const [activeTab, setActiveTab] = useState(defaultTab);
  const [copiedDocument, setCopiedDocument] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  if (isLoading) {
    return (
      <div className="flex h-72 w-full flex-col items-center justify-center gap-3">
        <LoaderCircle className="size-10 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted-foreground">Cargando perfil de usuario...</p>
      </div>
    );
  }

  const displayName = user?.nombreCompleto || user?.userName || "Usuario";
  const initials = getInitials(displayName);
  const persona = user?.persona;

  async function handleRefreshProfile() {
    setIsRefreshing(true);
    try {
      await queryClient.invalidateQueries({ queryKey: authKeys.me() });
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  }

  async function handleLogout() {
    try {
      await logoutMutation.mutateAsync();
    } finally {
      window.location.href = "/login";
    }
  }

  function copyToClipboard(text: string) {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedDocument(true);
    setTimeout(() => setCopiedDocument(false), 2000);
  }

  // Password validation checks
  const isMinLength = newPassword.length >= 6;
  const hasNumber = /\d/.test(newPassword);
  const isMatching = newPassword !== "" && newPassword === confirmPassword;

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!currentPassword) {
      setPasswordError("Por favor, ingrese su contraseña actual.");
      return;
    }

    if (!isMinLength) {
      setPasswordError("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (!isMatching) {
      setPasswordError("Las nuevas contraseñas no coinciden.");
      return;
    }

    try {
      const res = await changePasswordMutation.mutateAsync({
        currentPassword,
        newPassword,
      });

      setPasswordSuccess(res.message || "Contraseña actualizada exitosamente.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        "Error al cambiar la contraseña. Verifique su contraseña actual.";
      setPasswordError(errorMessage);
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-in fade-in-50 duration-300">
      {/* Cover Header & Profile Highlight */}
      <Card className="overflow-hidden border border-border/60 shadow-sm bg-card">
        {/* Banner with gradient mesh & subtle backdrop pattern */}
        <div className="relative h-28 md:h-32 bg-gradient-to-r from-primary/90 via-primary/70 to-primary/50 p-4 md:p-6 flex items-start justify-between">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
          
          <Badge className="relative z-10 bg-background/85 text-foreground backdrop-blur-md shadow-xs border border-border/40 text-xs font-semibold px-3 py-1">
            <Sparkles className="size-3.5 mr-1.5 text-primary animate-pulse" />
            Perfil Oficial de Usuario
          </Badge>

          <div className="relative z-10 flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshProfile}
              disabled={isRefreshing}
              className="bg-background/85 backdrop-blur-md border-border/40 hover:bg-background h-8 text-xs font-medium"
            >
              <RotateCw className={`size-3.5 mr-1.5 ${isRefreshing ? "animate-spin" : ""}`} />
              Actualizar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
              className="bg-background/85 backdrop-blur-md border-border/40 hover:bg-destructive hover:text-destructive-foreground text-destructive h-8 text-xs font-medium"
            >
              {logoutMutation.isPending ? (
                <LoaderCircle className="size-3.5 animate-spin mr-1.5" />
              ) : (
                <LogOut className="size-3.5 mr-1.5" />
              )}
              Cerrar sesión
            </Button>
          </div>
        </div>

        <CardContent className="p-6 pt-0 relative">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 -mt-12">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="relative shrink-0">
                <Avatar className="size-20 md:size-24 border-4 border-background shadow-md rounded-2xl">
                  <AvatarFallback className="bg-primary text-primary-foreground font-bold text-2xl md:text-3xl rounded-2xl">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="absolute bottom-1 right-1 size-3.5 rounded-full bg-emerald-500 border-2 border-background shadow-xs" title="Usuario En Línea" />
              </div>

              <div className="space-y-2 pt-2 sm:pt-11">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl font-bold tracking-tight text-foreground">{displayName}</h1>
                  <Badge variant={user?.activo !== false ? "default" : "secondary"} className="text-[11px] font-semibold">
                    {user?.activo !== false ? "Cuenta Activa" : "Inactivo"}
                  </Badge>
                  {user?.roles?.map((role) => (
                    <Badge key={role} variant="outline" className="gap-1 px-2.5 py-0.5 text-xs border-primary/30 bg-primary/5 text-primary font-medium">
                      <Shield className="size-3 text-primary" />
                      {role}
                    </Badge>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1 font-medium bg-muted/60 px-2.5 py-1 rounded-md">
                    <User className="size-3.5 text-primary" />
                    @{user?.userName}
                  </span>
                  {user?.email && (
                    <span className="flex items-center gap-1 font-medium bg-muted/60 px-2.5 py-1 rounded-md">
                      <Mail className="size-3.5 text-primary" />
                      {user.email}
                    </span>
                  )}
                  {persona?.numeroDocumento && (
                    <span className="flex items-center gap-1 font-medium bg-muted/60 px-2.5 py-1 rounded-md">
                      <IdCard className="size-3.5 text-primary" />
                      {persona.tipoDocumento} {persona.numeroDocumento}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-xl bg-muted/40 p-1 rounded-xl border border-border/50">
          <TabsTrigger value="info" className="flex items-center gap-2 rounded-lg text-xs font-semibold py-2">
            <User className="size-3.5" />
            <span>Información General</span>
          </TabsTrigger>
          <TabsTrigger value="password" className="flex items-center gap-2 rounded-lg text-xs font-semibold py-2">
            <KeyRound className="size-3.5" />
            <span>Seguridad</span>
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex items-center gap-2 rounded-lg text-xs font-semibold py-2">
            <ShieldCheck className="size-3.5" />
            <span>Roles y Accesos</span>
          </TabsTrigger>
        </TabsList>

        {/* ================= TAB 1: INFORMACIÓN GENERAL ================= */}
        <TabsContent value="info" className="mt-6 space-y-6 animate-in fade-in-50 duration-200">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Card: Ficha Personal */}
            <Card className="shadow-xs border-border/60">
              <CardHeader className="pb-3 border-b border-border/40">
                <CardTitle className="text-base flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <IdCard className="size-4 text-primary" />
                    Ficha de Datos Personales
                  </span>
                  <Badge variant="outline" className="text-[10px] font-normal">
                    Ficha #{persona?.id || user?.id}
                  </Badge>
                </CardTitle>
                <CardDescription>Información registrada en el expediente de la persona</CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-2.5 rounded-lg bg-muted/30 border border-border/30">
                    <p className="text-xs text-muted-foreground font-medium mb-0.5">Nombres</p>
                    <p className="text-sm font-semibold text-foreground">
                      {persona?.nombres || user?.nombres || "No especificado"}
                    </p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-muted/30 border border-border/30">
                    <p className="text-xs text-muted-foreground font-medium mb-0.5">Apellidos</p>
                    <p className="text-sm font-semibold text-foreground">
                      {persona
                        ? `${persona.apellidoPaterno} ${persona.apellidoMaterno || ""}`.trim()
                        : user?.apellidoPaterno
                        ? `${user.apellidoPaterno} ${user.apellidoMaterno || ""}`.trim()
                        : "No especificado"}
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-muted/30 border border-border/30 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium mb-0.5">Documento Identidad</p>
                    <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                      <Fingerprint className="size-4 text-primary shrink-0" />
                      {persona?.numeroDocumento
                        ? `${persona.tipoDocumento} ${persona.numeroDocumento} ${
                            persona.extensionDocumento ? `(${persona.extensionDocumento})` : ""
                          }`.trim()
                        : "No registrado"}
                    </p>
                  </div>
                  {persona?.numeroDocumento && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => copyToClipboard(persona.numeroDocumento)}
                      className="h-7 w-7 text-muted-foreground hover:text-foreground"
                      title="Copiar número"
                    >
                      {copiedDocument ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-2.5 rounded-lg bg-muted/30 border border-border/30">
                    <p className="text-xs text-muted-foreground font-medium mb-0.5">Teléfono / Celular</p>
                    <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                      <Phone className="size-3.5 text-muted-foreground shrink-0" />
                      {persona?.telefono || "No especificado"}
                    </p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-muted/30 border border-border/30">
                    <p className="text-xs text-muted-foreground font-medium mb-0.5">Fecha Nacimiento</p>
                    <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                      <Calendar className="size-3.5 text-muted-foreground shrink-0" />
                      {persona?.fechaNacimiento || "No especificado"}
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
                  <p className="text-xs text-muted-foreground font-medium mb-0.5">Dirección de Domicilio</p>
                  <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                    <MapPin className="size-3.5 text-muted-foreground shrink-0" />
                    {persona?.direccion || "No registrada"}
                  </p>
                </div>

                {(persona?.genero || persona?.estadoCivil) && (
                  <div className="grid grid-cols-2 gap-4 pt-1">
                    {persona.genero && (
                      <div className="p-2.5 rounded-lg bg-muted/20 border border-border/20">
                        <p className="text-xs text-muted-foreground font-medium">Género</p>
                        <p className="text-sm font-medium">{persona.genero}</p>
                      </div>
                    )}
                    {persona.estadoCivil && (
                      <div className="p-2.5 rounded-lg bg-muted/20 border border-border/20">
                        <p className="text-xs text-muted-foreground font-medium">Estado Civil</p>
                        <p className="text-sm font-medium">{persona.estadoCivil}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Card: Cuenta de Sistema */}
            <Card className="shadow-xs border-border/60">
              <CardHeader className="pb-3 border-b border-border/40">
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="size-4 text-primary" />
                  Credenciales y Cuenta de Usuario
                </CardTitle>
                <CardDescription>Detalles técnicos de autenticación e identidad</CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-2.5 rounded-lg bg-muted/30 border border-border/30">
                    <p className="text-xs text-muted-foreground font-medium mb-0.5">Nombre de Usuario</p>
                    <p className="text-sm font-semibold font-mono text-foreground">@{user?.userName}</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-muted/30 border border-border/30">
                    <p className="text-xs text-muted-foreground font-medium mb-0.5">ID de Usuario</p>
                    <p className="text-sm font-semibold font-mono text-foreground">#{user?.id}</p>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
                  <p className="text-xs text-muted-foreground font-medium mb-0.5">Correo Electrónico</p>
                  <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                    <Mail className="size-4 text-primary shrink-0" />
                    {user?.email || "No especificado"}
                  </p>
                </div>

                <Separator />

                <div className="p-3 rounded-lg bg-muted/20 border border-border/30 space-y-2">
                  <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <ShieldCheck className="size-4 text-emerald-500" />
                    Estado de Seguridad de la Cuenta
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <BadgeCheck className="size-3.5 text-emerald-500" />
                      <span>Autenticación JWT</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <CheckCheck className="size-3.5 text-emerald-500" />
                      <span>Cuenta Habilitada</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ================= TAB 2: SEGURIDAD Y CONTRASEÑA ================= */}
        <TabsContent value="password" className="mt-6 animate-in fade-in-50 duration-200">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-2 shadow-xs border-border/60">
              <CardHeader className="pb-3 border-b border-border/40">
                <CardTitle className="text-base flex items-center gap-2">
                  <Lock className="size-4 text-primary" />
                  Actualización de Contraseña
                </CardTitle>
                <CardDescription>
                  Cambie su contraseña periódicamente para mantener protegida su cuenta de usuario.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <form onSubmit={handleChangePassword} className="space-y-4">
                  {passwordError && (
                    <Alert variant="destructive" className="animate-in fade-in-50">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{passwordError}</AlertDescription>
                    </Alert>
                  )}

                  {passwordSuccess && (
                    <Alert className="border-emerald-500 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800 animate-in fade-in-50">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      <AlertTitle>¡Éxito!</AlertTitle>
                      <AlertDescription>{passwordSuccess}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Contraseña Actual</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showCurrentPassword ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="absolute right-1 top-1 h-7 w-7 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">Nueva Contraseña</Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showNewPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          className="absolute right-1 top-1 h-7 w-7 text-muted-foreground hover:text-foreground"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
                      <Input
                        id="confirmPassword"
                        type={showNewPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </div>

                  <div className="pt-3 flex justify-end gap-3 border-t border-border/40">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setCurrentPassword("");
                        setNewPassword("");
                        setConfirmPassword("");
                        setPasswordError(null);
                        setPasswordSuccess(null);
                      }}
                    >
                      Limpiar
                    </Button>
                    <Button
                      type="submit"
                      disabled={changePasswordMutation.isPending}
                      className="min-w-[160px] font-semibold"
                    >
                      {changePasswordMutation.isPending ? (
                        <>
                          <LoaderCircle className="size-4 animate-spin mr-2" />
                          Guardando...
                        </>
                      ) : (
                        "Guardar Contraseña"
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Checklist de Requisitos de Contraseña */}
            <Card className="shadow-xs border-border/60 bg-muted/15">
              <CardHeader className="pb-3 border-b border-border/40">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Shield className="size-4 text-primary" />
                  Requisitos de Seguridad
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3 text-xs">
                <div className="flex items-center gap-2">
                  {isMinLength ? (
                    <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                  ) : (
                    <div className="size-4 rounded-full border border-muted-foreground/40 shrink-0" />
                  )}
                  <span className={isMinLength ? "text-foreground font-medium" : "text-muted-foreground"}>
                    Mínimo 6 caracteres
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {hasNumber ? (
                    <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                  ) : (
                    <div className="size-4 rounded-full border border-muted-foreground/40 shrink-0" />
                  )}
                  <span className={hasNumber ? "text-foreground font-medium" : "text-muted-foreground"}>
                    Al menos un número (0-9)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {isMatching ? (
                    <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                  ) : (
                    <div className="size-4 rounded-full border border-muted-foreground/40 shrink-0" />
                  )}
                  <span className={isMatching ? "text-foreground font-medium" : "text-muted-foreground"}>
                    Las contraseñas coinciden
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ================= TAB 3: ROLES Y PERMISOS ================= */}
        <TabsContent value="roles" className="mt-6 animate-in fade-in-50 duration-200">
          <Card className="shadow-xs border-border/60">
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-base flex items-center gap-2">
                <ShieldCheck className="size-4 text-primary" />
                Matriz de Roles y Accesos del Sistema
              </CardTitle>
              <CardDescription>
                Consulte los niveles de acceso asignados a su cuenta institucional
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                {user?.roles && user.roles.length > 0 ? (
                  user.roles.map((role) => (
                    <div key={role} className="p-3.5 rounded-xl border border-primary/20 bg-primary/5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                          <Shield className="size-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">{role}</p>
                          <p className="text-xs text-muted-foreground">Rol activo de usuario</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[10px] bg-background">
                        Asignado
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Sin roles asignados en el sistema.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
