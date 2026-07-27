import { almacenEndpoints } from '../../../../shared/api/endpoints'
import { createGuidCrudService } from '../../../../shared/services/guid-crud.service'
import type { Categoria, CreateCategoriaPayload, UpdateCategoriaPayload } from '../types/categoria.types'

export const categoriasAlmacenService = createGuidCrudService<
  Categoria,
  CreateCategoriaPayload,
  UpdateCategoriaPayload
>(almacenEndpoints.categorias.root)
