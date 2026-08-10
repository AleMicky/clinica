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
} from "lucide-react";

import { useAuth } from "@/providers/auth-provider";
import { useChangePassword } from "@/modules/auth/hooks/use-change-password";
import { useLogout } from "@/modules/auth/hooks/use-logout";

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

  const { user, isLoading } = useAuth();
  const logoutMutation = useLogout();
  const changePasswordMutation = useChangePassword();

  const [activeTab, setActiveTab] = useState(defaultTab);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <LoaderCircle className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  const displayName = user?.nombreCompleto || user?.userName || "Usuario";
  const initials = getInitials(displayName);
  const persona = user?.persona;

  async function handleLogout() {
    try {
      await logoutMutation.mutateAsync();
    } finally {
      window.location.href = "/login";
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!currentPassword) {
      setPasswordError("Debe ingresar su contraseña actual.");
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setPasswordError("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Las nuevas contraseñas no coinciden.");
      return;
    }

    try {
      const res = await changePasswordMutation.mutateAsync({
        currentPassword,
        newPassword,
      });

      setPasswordSuccess(res.message || "Contraseña modificada exitosamente.");
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
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      {/* Top Banner & Header Profile */}
      <Card className="overflow-hidden border border-border/60 shadow-sm">
        <div className="h-28 bg-gradient-to-r from-primary/80 via-primary/60 to-primary/40 p-6 flex items-end justify-between">
          <Badge className="bg-background/80 text-foreground backdrop-blur-sm shadow-none border-none text-xs font-semibold">
            <Sparkles className="size-3 mr-1 text-primary" />
            Perfil de Usuario
          </Badge>
        </div>

        <CardContent className="p-6 pt-0 relative">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 -mt-10 mb-4">
            <div className="flex items-end gap-4">
              <Avatar className="size-20 border-4 border-background shadow-md">
                <AvatarFallback className="bg-primary text-primary-foreground font-bold text-2xl">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <div className="space-y-1 pb-1">
                <h1 className="text-2xl font-bold tracking-tight">{displayName}</h1>
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <User className="size-3.5" />
                    @{user?.userName}
                  </span>
                  {user?.email && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Mail className="size-3.5" />
                        {user.email}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant={user?.activo !== false ? "default" : "secondary"}>
                {user?.activo !== false ? "Activo" : "Inactivo"}
              </Badge>
              {user?.roles?.map((role) => (
                <Badge key={role} variant="outline" className="gap-1">
                  <Shield className="size-3 text-primary" />
                  {role}
                </Badge>
              ))}

              <Button
                variant="outline"
                size="sm"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                disabled={logoutMutation.isPending}
                onClick={handleLogout}
              >
                {logoutMutation.isPending ? (
                  <LoaderCircle className="size-4 animate-spin mr-1" />
                ) : (
                  <LogOut className="size-4 mr-1" />
                )}
                Cerrar sesión
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="info" className="flex items-center gap-2">
            <User className="size-4" />
            Información Personal
          </TabsTrigger>
          <TabsTrigger value="password" className="flex items-center gap-2">
            <KeyRound className="size-4" />
            Cambiar Contraseña
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: INFORMACIÓN PERSONAL */}
        <TabsContent value="info" className="mt-6 space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Card: Datos de Cuenta */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="size-4 text-primary" />
                  Datos de Cuenta
                </CardTitle>
                <CardDescription>Detalles de acceso y rol en el sistema</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Nombre de Usuario</p>
                    <p className="text-sm font-semibold">{user?.userName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">ID de Usuario</p>
                    <p className="text-sm font-semibold">#{user?.id}</p>
                  </div>
                </div>

                <Separator />

                <div>
                  <p className="text-xs text-muted-foreground font-medium mb-1">Correo Electrónico</p>
                  <p className="text-sm font-semibold">{user?.email || "No especificado"}</p>
                </div>

                <Separator />

                <div>
                  <p className="text-xs text-muted-foreground font-medium mb-1.5">Roles Asignados</p>
                  <div className="flex flex-wrap gap-1.5">
                    {user?.roles && user.roles.length > 0 ? (
                      user.roles.map((r) => (
                        <Badge key={r} variant="secondary" className="text-xs">
                          {r}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground">Sin roles asignados</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Card: Datos Personales (Persona) */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <IdCard className="size-4 text-primary" />
                  Información Personal
                </CardTitle>
                <CardDescription>Información registrada en la ficha de persona</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Nombres</p>
                    <p className="text-sm font-semibold">
                      {persona?.nombres || user?.nombres || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Apellidos</p>
                    <p className="text-sm font-semibold">
                      {persona
                        ? `${persona.apellidoPaterno} ${persona.apellidoMaterno || ""}`.trim()
                        : user?.apellidoPaterno
                        ? `${user.apellidoPaterno} ${user.apellidoMaterno || ""}`.trim()
                        : "—"}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Documento de Identidad</p>
                    <p className="text-sm font-semibold">
                      {persona?.numeroDocumento
                        ? `${persona.tipoDocumento} ${persona.numeroDocumento} ${
                            persona.extensionDocumento || ""
                          }`.trim()
                        : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Teléfono / Celular</p>
                    <p className="text-sm font-semibold flex items-center gap-1">
                      <Phone className="size-3.5 text-muted-foreground" />
                      {persona?.telefono || "—"}
                    </p>
                  </div>
                </div>

                <Separator />

                <div>
                  <p className="text-xs text-muted-foreground font-medium mb-1">Dirección</p>
                  <p className="text-sm font-semibold flex items-center gap-1">
                    <MapPin className="size-3.5 text-muted-foreground shrink-0" />
                    {persona?.direccion || "—"}
                  </p>
                </div>

                {persona?.fechaNacimiento && (
                  <>
                    <Separator />
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground font-medium">Fecha Nacimiento</p>
                        <p className="text-sm font-semibold flex items-center gap-1">
                          <Calendar className="size-3.5 text-muted-foreground" />
                          {persona.fechaNacimiento}
                        </p>
                      </div>
                      {persona.genero && (
                        <div>
                          <p className="text-xs text-muted-foreground font-medium">Género</p>
                          <p className="text-sm font-semibold">{persona.genero}</p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB 2: CAMBIAR CONTRASEÑA */}
        <TabsContent value="password" className="mt-6">
          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Lock className="size-4 text-primary" />
                Actualizar Contraseña
              </CardTitle>
              <CardDescription>
                Cambie su contraseña periódicamente para mantener segura su cuenta.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4">
                {passwordError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{passwordError}</AlertDescription>
                  </Alert>
                )}

                {passwordSuccess && (
                  <Alert className="border-green-500 bg-green-50 text-green-900 dark:bg-green-950/30 dark:text-green-300 dark:border-green-800">
                    <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <AlertTitle>Éxito</AlertTitle>
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
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="size-4 text-muted-foreground" />
                      ) : (
                        <Eye className="size-4 text-muted-foreground" />
                      )}
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
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? (
                          <EyeOff className="size-4 text-muted-foreground" />
                        ) : (
                          <Eye className="size-4 text-muted-foreground" />
                        )}
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

                <div className="pt-2 flex justify-end">
                  <Button
                    type="submit"
                    disabled={changePasswordMutation.isPending}
                    className="min-w-[160px]"
                  >
                    {changePasswordMutation.isPending ? (
                      <>
                        <LoaderCircle className="size-4 animate-spin mr-2" />
                        Actualizando...
                      </>
                    ) : (
                      "Guardar Contraseña"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
