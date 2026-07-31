export type UnidadMedida = {
  id: string
  codigo: string
  nombre: string
  abreviatura?: string | null
  permiteDecimales: boolean
}

export type UnidadMedidaPayload = {
  codigo: string
  nombre: string
  abreviatura?: string | null
  permiteDecimales?: boolean
}
