import { useQueryClient } from '@tanstack/react-query'
import { useAppMutation } from '../../../../shared/hooks/use-app-mutation'
import { useAppQuery } from '../../../../shared/hooks/use-app-query'
import { queryKeys } from '../../../../shared/constants/query-keys'
import { notify } from '../../../../shared/utils/notify'
import { getApiErrorMessage } from '../../../../shared/utils/api-error'
import type { PagedQuery } from '../../../../shared/types/pagination.types'
import { categoriasAlmacenService } from '../services/categorias.service'
import type { CreateCategoriaPayload, UpdateCategoriaPayload } from '../types/categoria.types'

export function useCategoriasAlmacen(query: PagedQuery) {
  return useAppQuery({
    queryKey: queryKeys.almacen.categorias.list(query),
    queryFn: () => categoriasAlmacenService.getPaged(query),
  })
}

export function useCreateCategoriaAlmacen() {
  const qc = useQueryClient()
  return useAppMutation({
    mutationFn: (data: CreateCategoriaPayload) => categoriasAlmacenService.create(data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.almacen.categorias.all })
      notify.success('Categoría creada', 'Registro guardado correctamente.')
    },
    onError: (e) => notify.error('Error al crear', getApiErrorMessage(e)),
  })
}

export function useUpdateCategoriaAlmacen() {
  const qc = useQueryClient()
  return useAppMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoriaPayload }) =>
      categoriasAlmacenService.update(id, data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.almacen.categorias.all })
      notify.success('Categoría actualizada', 'Los cambios se guardaron.')
    },
    onError: (e) => notify.error('Error al actualizar', getApiErrorMessage(e)),
  })
}

export function useDeleteCategoriaAlmacen() {
  const qc = useQueryClient()
  return useAppMutation({
    mutationFn: (id: string) => categoriasAlmacenService.delete(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.almacen.categorias.all })
      notify.success('Categoría eliminada', 'Se eliminó correctamente.')
    },
    onError: (e) => notify.error('Error al eliminar', getApiErrorMessage(e)),
  })
}
