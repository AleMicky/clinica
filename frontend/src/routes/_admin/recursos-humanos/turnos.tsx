import { createFileRoute } from '@tanstack/react-router'

import { TurnosView } from '../../../features/recursos-humanos/views/TurnosView'

export const Route = createFileRoute('/_admin/recursos-humanos/turnos')({
    component: TurnosView,
})
