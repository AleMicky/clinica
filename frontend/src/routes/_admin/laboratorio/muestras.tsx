import { createFileRoute } from '@tanstack/react-router'

import { MuestrasView } from '../../../features/laboratorio/muestras/views/MuestrasView'

export const Route = createFileRoute('/_admin/laboratorio/muestras')({
    component: MuestrasView,
})
