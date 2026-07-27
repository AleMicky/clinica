import { createFileRoute } from '@tanstack/react-router'

import { ParametrosView } from '../../../features/laboratorio/parametros/views/ParametrosView'

export const Route = createFileRoute('/_admin/laboratorio/parametros')({
    component: ParametrosView,
})
