import { createFileRoute } from '@tanstack/react-router'

import { EnfermeriaPage } from '../../../features/atencion-medica/views/EnfermeriaPage'
import { requireStaff } from '../../../shared/utils/auth-guards'

export const Route = createFileRoute('/_admin/atencion-medica/enfermeria')({
    beforeLoad: () => {
        requireStaff()
    },
    component: EnfermeriaPage,
})
