import { createFileRoute } from '@tanstack/react-router'

import { MovimientosView } from '../../../features/caja/views/MovimientosView'

export const Route = createFileRoute('/_admin/caja/movimientos')({
    component: MovimientosView,
})
