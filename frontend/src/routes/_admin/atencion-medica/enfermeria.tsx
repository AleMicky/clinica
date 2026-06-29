import { createFileRoute, Outlet } from '@tanstack/react-router'

import { requireStaff } from '../../../shared/utils/auth-guards'

export const Route = createFileRoute('/_admin/atencion-medica/enfermeria')({
    beforeLoad: () => {
        requireStaff()
    },
    component: EnfermeriaLayout,
})

function EnfermeriaLayout() {
    return <Outlet />
}
