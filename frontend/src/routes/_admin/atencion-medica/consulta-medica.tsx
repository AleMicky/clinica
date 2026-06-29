import { createFileRoute } from '@tanstack/react-router'

import { ConsultaMedicaPage } from '../../../features/atencion-medica/views/ConsultaMedicaPage'
import { requireStaff } from '../../../shared/utils/auth-guards'

export const Route = createFileRoute('/_admin/atencion-medica/consulta-medica')({
    beforeLoad: () => {
        requireStaff()
    },
    component: ConsultaMedicaPage,
})
