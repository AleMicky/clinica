import { createFileRoute } from '@tanstack/react-router'

import { SolicitudesView } from '../../../features/laboratorio/solicitudes/views/SolicitudesView'

export const Route = createFileRoute('/_admin/laboratorio/solicitudes/')({
    component: SolicitudesView,
})
