import { createFileRoute } from '@tanstack/react-router'

import { TurnosCajaView } from '../../../features/caja/views/TurnosCajaView'

export const Route = createFileRoute('/_admin/caja/turnos')({
    component: TurnosCajaView,
})
