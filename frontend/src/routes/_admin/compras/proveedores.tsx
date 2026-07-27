import { createFileRoute } from '@tanstack/react-router'
import { ProveedoresView } from '../../../features/compras/proveedores/views/ProveedoresView'

export const Route = createFileRoute('/_admin/compras/proveedores')({
  component: ProveedoresView,
})
