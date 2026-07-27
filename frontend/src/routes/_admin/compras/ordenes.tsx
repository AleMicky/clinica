import { createFileRoute } from '@tanstack/react-router'
import { OrdenesCompraView } from '../../../features/compras/ordenes/views/OrdenesView'

export const Route = createFileRoute('/_admin/compras/ordenes')({
  component: OrdenesCompraView,
})
