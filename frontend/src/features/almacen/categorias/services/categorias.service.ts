import { almacenEndpoints } from '../../../../shared/api/endpoints'
import { createGuidCrudService } from '../../../../shared/services/guid-crud.service'
import type { CategoriaProducto, CategoriaProductoPayload } from '../types/categoria.types'

export const categoriasProductoService = createGuidCrudService<
  CategoriaProducto,
  CategoriaProductoPayload
>(almacenEndpoints.categorias.root)
