import { almacenEndpoints } from '../../../../shared/api/endpoints'
import { createGuidCrudService } from '../../../../shared/services/guid-crud.service'
import type { CreateProductoPayload, Producto, UpdateProductoPayload } from '../types/producto.types'

export const productosAlmacenService = createGuidCrudService<
  Producto,
  CreateProductoPayload,
  UpdateProductoPayload
>(almacenEndpoints.productos.root)
