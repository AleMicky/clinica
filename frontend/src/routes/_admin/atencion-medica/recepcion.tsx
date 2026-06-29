import { createFileRoute } from '@tanstack/react-router'

import { RecepcionPacientePage } from '../../../features/atencion-medica/views/RecepcionPacientePage'
import { requireStaff } from '../../../shared/utils/auth-guards'

export const Route = createFileRoute('/_admin/atencion-medica/recepcion')({
    beforeLoad: () => {
        requireStaff()
    },
    component: RecepcionPacientePage,
})
