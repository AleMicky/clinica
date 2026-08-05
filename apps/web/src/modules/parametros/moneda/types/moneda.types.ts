export type EstadoMoneda = "Activo" | "Inactivo"

export interface Moneda {
  id: string
  codigo: string
  simbolo: string
  nombre: string
  decimales: number
  esMonedaBase: boolean
  estado: EstadoMoneda
}

export interface MonedaMetrics {
  monedaBase: string
  monedasHabilitadas: number
  facturacionMultimoneda: boolean
  monedasInactivas: number
}

export interface MonedaFilters {
  search: string
  estado?: EstadoMoneda | "Todos"
}
