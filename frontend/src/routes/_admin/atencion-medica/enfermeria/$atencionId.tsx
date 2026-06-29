import { createFileRoute } from '@tanstack/react-router'

import {
    ENFERMERIA_WORKBENCH_CONFIG,
    EtapaAtencionWorkbenchView,
} from '../../../../features/atencion-medica/views/EtapaAtencionWorkbenchView'
import { requireStaff } from '../../../../shared/utils/auth-guards'

export const Route = createFileRoute('/_admin/atencion-medica/enfermeria/$atencionId')({
    beforeLoad: () => {
        requireStaff()
    },
    component: EnfermeriaWorkbenchRoutePage,
})

function EnfermeriaWorkbenchRoutePage() {
    const { atencionId } = Route.useParams()
    return (
        <EtapaAtencionWorkbenchView
            atencionId={atencionId}
            config={ENFERMERIA_WORKBENCH_CONFIG}
        />
    )
}
