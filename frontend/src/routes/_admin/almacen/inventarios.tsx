import { createFileRoute } from '@tanstack/react-router'
import { InventariosFisicosView } from '../../../features/almacen/inventarios/views/InventariosView'

export const Route = createFileRoute('/_admin/almacen/inventarios')({
  component: InventariosFisicosView,
})
