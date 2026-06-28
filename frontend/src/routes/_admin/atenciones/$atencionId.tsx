import { createFileRoute } from '@tanstack/react-router'
import { AtencionDetailView } from '../../../features/atencion-medica/views/AtencionDetailView'
import { requireStaff } from '../../../shared/utils/auth-guards'

export const Route = createFileRoute('/_admin/atenciones/$atencionId')({
    beforeLoad: () => {
        requireStaff()
    },
    component: AtencionDetailPage,
})

function AtencionDetailPage() {
    const { atencionId } = Route.useParams()

    return <AtencionDetailView atencionId={atencionId} />
}
