"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Activity, AlertCircle, Eye, EyeOff, LoaderCircle, Lock, LogIn, Receipt, ShieldCheck, User } from "lucide-react";
import { useForm } from "react-hook-form";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getApiErrorMessage } from "@/lib/api/api-error";
import { useAuth } from "@/providers/auth-provider";

import { useLogin } from "../hooks/use-login";
import {
    loginSchema,
    type LoginFormValues,
} from "../schemas/login.schema";

export function LoginForm() {
    const router = useRouter();
    const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
    const loginMutation = useLogin();

    const [serverError, setServerError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (!isAuthLoading && isAuthenticated) {
            window.location.href = "/dashboard";
        }
    }, [isAuthenticated, isAuthLoading]);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            userName: "",
            password: "",
            rememberMe: false,
        },
    });

    const rememberMe = watch("rememberMe");

    async function onSubmit(values: LoginFormValues): Promise<void> {
        setServerError(null);

        try {
            await loginMutation.mutateAsync(values);
            window.location.href = "/dashboard";
        } catch (error) {
            setServerError(getApiErrorMessage(error));
        }
    }

    return (
        <div className="w-full space-y-6">
            {/* Mobile Header Logo (Visible on mobile screens) */}
            <div className="flex lg:hidden items-center justify-center gap-3 mb-2">
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md">
                    <Receipt className="size-5" />
                </div>
                <div>
                    <h1 className="text-lg font-bold">MediServ</h1>
                    <p className="text-xs text-muted-foreground">Venta y Facturación de Servicios</p>
                </div>
            </div>

            <Card className="w-full shadow-xl border-border/60 backdrop-blur-sm bg-card/95 transition-all">
                <CardHeader className="space-y-1.5 pb-6">
                    <CardTitle className="text-2xl font-bold tracking-tight">
                        Bienvenido de nuevo
                    </CardTitle>

                    <CardDescription className="text-sm text-muted-foreground">
                        Ingresa tus credenciales autorizadas para acceder al sistema.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="space-y-5"
                        noValidate
                    >
                        {serverError && (
                            <Alert variant="destructive" className="border-destructive/40 bg-destructive/10 text-destructive dark:bg-destructive/20">
                                <AlertCircle className="size-4" />
                                <AlertDescription className="text-xs font-medium ml-2">
                                    {serverError}
                                </AlertDescription>
                            </Alert>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="userName" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Usuario
                            </Label>

                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/70" />
                                <Input
                                    id="userName"
                                    type="text"
                                    autoComplete="username"
                                    placeholder="Nombre de usuario"
                                    disabled={loginMutation.isPending}
                                    className="pl-9 h-10 transition-all focus-visible:ring-primary/30"
                                    aria-invalid={Boolean(errors.userName)}
                                    {...register("userName")}
                                />
                            </div>

                            {errors.userName && (
                                <p className="text-xs font-medium text-destructive mt-1">
                                    {errors.userName.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Contraseña
                                </Label>
                            </div>

                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/70" />
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    placeholder="••••••••"
                                    disabled={loginMutation.isPending}
                                    className="pl-9 pr-10 h-10 transition-all focus-visible:ring-primary/30"
                                    aria-invalid={Boolean(errors.password)}
                                    {...register("password")}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    tabIndex={-1}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground transition-colors p-1 rounded-md"
                                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                                >
                                    {showPassword ? (
                                        <EyeOff className="size-4" />
                                    ) : (
                                        <Eye className="size-4" />
                                    )}
                                </button>
                            </div>

                            {errors.password && (
                                <p className="text-xs font-medium text-destructive mt-1">
                                    {errors.password.message}
                                </p>
                            )}
                        </div>

                        <div className="flex items-center justify-between pt-1">
                            <div className="flex items-center gap-2.5">
                                <Checkbox
                                    id="rememberMe"
                                    checked={rememberMe}
                                    disabled={loginMutation.isPending}
                                    onCheckedChange={(checked: boolean) => {
                                        setValue(
                                            "rememberMe",
                                            checked,
                                            {
                                                shouldDirty: true,
                                            },
                                        );
                                    }}
                                />

                                <Label
                                    htmlFor="rememberMe"
                                    className="cursor-pointer text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Mantener sesión iniciada
                                </Label>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            size="lg"
                            className="w-full font-semibold shadow-md hover:shadow-lg transition-all"
                            disabled={loginMutation.isPending}
                        >
                            {loginMutation.isPending ? (
                                <>
                                    <LoaderCircle className="size-4 animate-spin mr-2" />
                                    Iniciando sesión...
                                </>
                            ) : (
                                <>
                                    <LogIn className="size-4 mr-2" />
                                    Ingresar al Sistema
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground/80 pt-2">
                <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
                <span>Acceso seguro con cifrado SSL de grado médico</span>
            </div>
        </div>
    );
}