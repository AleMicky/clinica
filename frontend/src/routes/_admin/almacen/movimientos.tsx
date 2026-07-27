import { createFileRoute } from '@tanstack/react-router'
import { MovimientosAlmacenView } from '../../../features/almacen/movimientos/views/MovimientosView'

export const Route = createFileRoute('/_admin/almacen/movimientos')({
  component: MovimientosAlmacenView,
})
