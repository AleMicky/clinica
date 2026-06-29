import { useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { useAppMutation } from "../../../shared/hooks/use-app-mutation"
import { authService } from "../services/auth.service"
import { queryKeys } from "../../../shared/constants/query-keys"
import { authStore } from "../../../stores/auth.store"
import { notify } from "../../../shared/utils/notify"
import type { LoginFormValues } from "../schemas/login.schema"
import type { ChangePasswordFormValues } from "../schemas/change-password.schema"
import { useAppQuery } from "../../../shared/hooks/use-app-query"
import { getApiErrorMessage } from "../../../shared/utils/api-error"

export const useLogin = () => {
    const queryClient = useQueryClient()
    const navigate = useNavigate()

    return useAppMutation({
        mutationFn: (credentials: LoginFormValues) => authService.login(credentials),
        onSuccess: (auth) => {
            authStore.getState().setAuth(auth)
            queryClient.setQueryData(queryKeys.auth.me, auth.user)
            notify.success(
                'Bienvenido',
                `Hola ${auth.user.nombreCompleto}`,
            )
            navigate({ to: '/' })
        },

        onError: (error) => {
            notify.error(
                'Error al iniciar sesión',
                getApiErrorMessage(error),
                'auth-login-error',
            )
        },
    })
}

export function useLogout() {
    const queryClient = useQueryClient()
    const navigate = useNavigate()

    return async () => {
        try {
            await authService.logout()
        } catch {
            // Si falla la red o el servidor, igual se cierra la sesión local.
        }

        authStore.getState().logout()
        queryClient.clear()
        notify.info(
            'Sesión cerrada',
            'Has cerrado sesión correctamente.',
        )
        navigate({ to: '/login' })
    }
}

export function useMe() {
    const accessToken = authStore((state) => state.accessToken)
    return useAppQuery({
        queryKey: queryKeys.auth.me,
        queryFn: () => authService.me(),
        enabled: !!accessToken,
    })

}

export function useChangePassword() {
    const queryClient = useQueryClient()
    const navigate = useNavigate()

    return useAppMutation({
        mutationFn: (values: ChangePasswordFormValues) =>
            authService.changePassword({
                currentPassword: values.currentPassword,
                newPassword: values.newPassword,
            }),
        onSuccess: () => {
            authStore.getState().logout()
            queryClient.clear()
            notify.success(
                'Contraseña actualizada',
                'Su contraseña se cambió correctamente. Inicie sesión nuevamente.',
            )
            navigate({ to: '/login' })
        },
        onError: (error) => {
            notify.error(
                'Error al cambiar la contraseña',
                getApiErrorMessage(error),
                'change-password-error',
            )
        },
    })
}