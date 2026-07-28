import { createFileRoute } from '@tanstack/react-router'

import { GestionesView } from '../../../features/parametros/gestiones/views/GestionesView'

export const Route = createFileRoute('/_admin/parametros/gestiones')({
    component: GestionesView,
})
