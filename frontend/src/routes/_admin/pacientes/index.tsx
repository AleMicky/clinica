import { createFileRoute } from '@tanstack/react-router'
import { PacientesView } from '../../../features/pacientes/views/PacientesView'
import { requireStaff } from '../../../shared/utils/auth-guards'

export const Route = createFileRoute('/_admin/pacientes/')({
    beforeLoad: () => {
        requireStaff()
    },
    component: PacientesView,
})
