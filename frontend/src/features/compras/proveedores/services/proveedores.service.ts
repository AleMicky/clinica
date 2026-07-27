import { comprasEndpoints } from '../../../../shared/api/endpoints'
import { createGuidCrudService } from '../../../../shared/services/guid-crud.service'

export type Proveedor = {
  id: string
  codigo: string
  nombre: string
  nit: string | null
  telefono: string | null
  email: string | null
  activo: boolean
}

export type ProveedorPayload = {
  codigo: string
  nombre: string
  nit?: string | null
  telefono?: string | null
  email?: string | null
  activo?: boolean
}

export const proveedoresService = createGuidCrudService<Proveedor, ProveedorPayload>(
  comprasEndpoints.proveedores.root,
)
