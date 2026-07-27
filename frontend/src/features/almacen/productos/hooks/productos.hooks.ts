import { useQueryClient } from '@tanstack/react-query'
import { useAppMutation } from '../../../../shared/hooks/use-app-mutation'
import { useAppQuery } from '../../../../shared/hooks/use-app-query'
import { queryKeys } from '../../../../shared/constants/query-keys'
import { notify } from '../../../../shared/utils/notify'
import { getApiErrorMessage } from '../../../../shared/utils/api-error'
import type { PagedQuery } from '../../../../shared/types/pagination.types'
import { productosAlmacenService } from '../services/productos.service'
import type { CreateProductoPayload, UpdateProductoPayload } from '../types/producto.types'

export function useProductosAlmacen(query: PagedQuery) {
  return useAppQuery({
    queryKey: queryKeys.almacen.productos.list(query),
    queryFn: () => productosAlmacenService.getPaged(query),
  })
}

export function useCreateProductoAlmacen() {
  const qc = useQueryClient()
  return useAppMutation({
    mutationFn: (data: CreateProductoPayload) => productosAlmacenService.create(data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.almacen.productos.all })
      notify.success('Producto creado', 'Registro guardado correctamente.')
    },
    onError: (e) => notify.error('Error al crear', getApiErrorMessage(e)),
  })
}

export function useUpdateProductoAlmacen() {
  const qc = useQueryClient()
  return useAppMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductoPayload }) =>
      productosAlmacenService.update(id, data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.almacen.productos.all })
      notify.success('Producto actualizado', 'Los cambios se guardaron.')
    },
    onError: (e) => notify.error('Error al actualizar', getApiErrorMessage(e)),
  })
}

export function useDeleteProductoAlmacen() {
  const qc = useQueryClient()
  return useAppMutation({
    mutationFn: (id: string) => productosAlmacenService.delete(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.almacen.productos.all })
      notify.success('Producto eliminado', 'Se eliminó correctamente.')
    },
    onError: (e) => notify.error('Error al eliminar', getApiErrorMessage(e)),
  })
}
