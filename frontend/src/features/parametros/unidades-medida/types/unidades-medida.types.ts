export type UnidadMedida = {
    id: string
    codigo: string
    nombre: string
    simbolo: string
}

export type CreateUnidadMedidaPayload = {
    codigo: string
    nombre: string
    simbolo: string
}

export type UpdateUnidadMedidaPayload = CreateUnidadMedidaPayload
