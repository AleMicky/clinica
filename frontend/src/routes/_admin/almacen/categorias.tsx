import { createFileRoute } from '@tanstack/react-router'
import { CategoriasProductoView } from '../../../features/almacen/categorias/views/CategoriasView'

export const Route = createFileRoute('/_admin/almacen/categorias')({
  component: CategoriasProductoView,
})
