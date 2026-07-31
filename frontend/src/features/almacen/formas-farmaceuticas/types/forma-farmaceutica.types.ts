export type FormaFarmaceutica = {
  id: string
  codigo: string
  nombre: string
  descripcion?: string | null
}

export type FormaFarmaceuticaPayload = {
  codigo: string
  nombre: string
  descripcion?: string | null
}
