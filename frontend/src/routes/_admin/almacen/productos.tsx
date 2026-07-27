import { createFileRoute } from '@tanstack/react-router'
import { ProductosAlmacenView } from '../../../features/almacen/productos/views/ProductosView'

export const Route = createFileRoute('/_admin/almacen/productos')({
  component: ProductosAlmacenView,
})
