/** Roles devueltos por el backend en `User.roles`. */
export const AppRole = {
    Admin: 'Administrador',
    Medico: 'Medico',
    Recepcion: 'Recepcionista',
} as const

export type AppRoleName = (typeof AppRole)[keyof typeof AppRole]

export function canAccessRoles(
    userRoles: string[],
    required?: AppRoleName[],
): boolean {
    if (!required?.length) return true
    return required.some((role) => userRoles.includes(role))
}
