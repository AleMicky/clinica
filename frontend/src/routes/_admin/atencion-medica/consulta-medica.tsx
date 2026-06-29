import { createFileRoute, Outlet } from '@tanstack/react-router'

import { requireStaff } from '../../../shared/utils/auth-guards'

export const Route = createFileRoute('/_admin/atencion-medica/consulta-medica')({
    beforeLoad: () => {
        requireStaff()
    },
    component: ConsultaMedicaLayout,
})

function ConsultaMedicaLayout() {
    return <Outlet />
}
