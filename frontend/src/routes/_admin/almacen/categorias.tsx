import { createFileRoute } from '@tanstack/react-router'
import { CategoriasAlmacenView } from '../../../features/almacen/categorias/views/CategoriasView'

export const Route = createFileRoute('/_admin/almacen/categorias')({
  component: CategoriasAlmacenView,
})
