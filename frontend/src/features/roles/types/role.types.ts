export type Role = {
    id: string
    name: string
    descripcion?: string | null
}

export type CreateRolePayload = {
    name: string
    descripcion?: string | null
}

export type UpdateRolePayload = {
    name: string
    descripcion?: string | null
}

export type CreateRoleApiPayload = {
    name: string
    descripcion?: string | null
}

export type UpdateRoleApiPayload = {
    name: string
    descripcion?: string | null
}
