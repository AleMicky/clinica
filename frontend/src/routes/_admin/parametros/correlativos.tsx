import { createFileRoute } from '@tanstack/react-router'

import { CorrelativosView } from '../../../features/parametros/correlativos/views/CorrelativosView'

export const Route = createFileRoute('/_admin/parametros/correlativos')({
    component: CorrelativosView,
})
