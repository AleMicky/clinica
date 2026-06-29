import { createFileRoute } from '@tanstack/react-router'

import {
    CONSULTA_MEDICA_WORKBENCH_CONFIG,
    EtapaAtencionWorkbenchView,
} from '../../../../features/atencion-medica/views/EtapaAtencionWorkbenchView'
import { requireStaff } from '../../../../shared/utils/auth-guards'

export const Route = createFileRoute(
    '/_admin/atencion-medica/consulta-medica/$atencionId',
)({
    beforeLoad: () => {
        requireStaff()
    },
    component: ConsultaMedicaWorkbenchRoutePage,
})

function ConsultaMedicaWorkbenchRoutePage() {
    const { atencionId } = Route.useParams()
    return (
        <EtapaAtencionWorkbenchView
            atencionId={atencionId}
            config={CONSULTA_MEDICA_WORKBENCH_CONFIG}
        />
    )
}
