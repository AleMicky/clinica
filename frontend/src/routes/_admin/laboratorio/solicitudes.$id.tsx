import { createFileRoute } from '@tanstack/react-router'

import { SolicitudDetailView } from '../../../features/laboratorio/solicitudes/views/SolicitudDetailView'

export const Route = createFileRoute('/_admin/laboratorio/solicitudes/$id')({
    component: SolicitudDetailPage,
})

function SolicitudDetailPage() {
    const { id } = Route.useParams()

    return <SolicitudDetailView solicitudId={id} />
}
