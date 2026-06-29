export type User = {
    id: string
    userName: string
    nombreCompleto: string
    email?: string | null
    activo?: boolean
    roles: string[]
}

/** Respuesta cruda del endpoint `/auth/login` y `/auth/refresh`. */
export type LoginApiResponse = {
    token: string
    expiresAt: string
    refreshToken: string
    refreshTokenExpiresAt: string
    userId: string
    userName: string
    nombreCompleto: string
    roles: string[]
}

/** Sesión normalizada usada por el store y la UI. */
export type AuthSession = {
    accessToken: string
    refreshToken: string
    expiresAt: string
    refreshTokenExpiresAt: string
    user: User
}

export type RefreshTokenRequest = {
    refreshToken: string
}

export type ChangePasswordPayload = {
    currentPassword: string
    newPassword: string
}
