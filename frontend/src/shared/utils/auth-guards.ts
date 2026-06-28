import { redirect } from '@tanstack/react-router'
import { authStore } from '../../stores/auth.store'
import { AppRole, type AppRoleName } from '../constants/app-roles'

export function requireAuth() {

    const { accessToken, expiresAt } = authStore.getState()

    if (!accessToken ||
        !expiresAt ||
        new Date(expiresAt) <= new Date()
    ) {
        throw redirect({
            to: '/login',
        })
    }

}

export function redirectIfAuthenticated() {

    const { accessToken, expiresAt } = authStore.getState()

    if ( accessToken &&
        expiresAt &&
        new Date(expiresAt) > new Date()
    ) {
        throw redirect({
            to: '/',
        })
    }

}

export function requireAdmin() {
    requireAuth()

    const { user } = authStore.getState()
    const isAdmin = user?.roles.includes(AppRole.Admin) ?? false

    if (!isAdmin) {
        throw redirect({ to: '/' })
    }
}

const staffRoles: AppRoleName[] = [
    AppRole.Admin,
    AppRole.Medico,
    AppRole.Recepcion,
]

export function requireStaff() {
    requireAuth()

    const { user } = authStore.getState()
    const isStaff =
        user?.roles.some((role) =>
            staffRoles.includes(role as AppRoleName),
        ) ?? false

    if (!isStaff) {
        throw redirect({ to: '/' })
    }
}