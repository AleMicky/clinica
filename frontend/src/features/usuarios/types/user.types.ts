export type User = {
    id: string
    userName: string
    nombreCompleto: string
    email?: string | null
    activo: boolean
    roles: string[]
}

export type CreateUserPayload = {
    userName: string
    nombreCompleto: string
    password: string
    rol: string
}

export type UpdateUserPayload = {
    nombreCompleto: string
    activo: boolean
    email?: string | null
}

export type CreateUserApiPayload = {
    userName: string
    password: string
    nombreCompleto: string
    role?: string | null
    email?: string | null
}

export type UpdateUserApiPayload = {
    nombreCompleto: string
    activo: boolean
    email?: string | null
}
