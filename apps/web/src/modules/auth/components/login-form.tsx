"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, LogIn } from "lucide-react";
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

    const [serverError, setServerError] =
        useState<string | null>(null);

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

    async function onSubmit(
        values: LoginFormValues,
    ): Promise<void> {
        setServerError(null);

        try {
            await loginMutation.mutateAsync(values);
            window.location.href = "/dashboard";
        } catch (error) {
            setServerError(
                getApiErrorMessage(error),
            );
        }
    }


    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle className="text-2xl">
                    Iniciar sesión
                </CardTitle>

                <CardDescription>
                    Ingresa tus credenciales para acceder al sistema.
                </CardDescription>
            </CardHeader>

            <CardContent>
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-5"
                    noValidate
                >
                    {serverError && (
                        <Alert variant="destructive">
                            <AlertDescription>
                                {serverError}
                            </AlertDescription>
                        </Alert>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="userName">
                            Usuario
                        </Label>

                        <Input
                            id="userName"
                            type="text"
                            autoComplete="username"
                            placeholder="Ingresa tu usuario"
                            disabled={loginMutation.isPending}
                            aria-invalid={Boolean(
                                errors.userName,
                            )}
                            {...register("userName")}
                        />

                        {errors.userName && (
                            <p className="text-sm text-destructive">
                                {errors.userName.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">
                            Contraseña
                        </Label>

                        <Input
                            id="password"
                            type="password"
                            autoComplete="current-password"
                            placeholder="Ingresa tu contraseña"
                            disabled={loginMutation.isPending}
                            aria-invalid={Boolean(
                                errors.password,
                            )}
                            {...register("password")}
                        />

                        {errors.password && (
                            <p className="text-sm text-destructive">
                                {errors.password.message}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
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
                            className="cursor-pointer font-normal"
                        >
                            Mantener sesión iniciada
                        </Label>
                    </div>

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={loginMutation.isPending}
                    >
                        {loginMutation.isPending ? (
                            <>
                                <LoaderCircle className="animate-spin" />
                                Ingresando...
                            </>
                        ) : (
                            <>
                                <LogIn />
                                Ingresar
                            </>
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}