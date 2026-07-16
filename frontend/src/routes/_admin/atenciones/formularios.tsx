import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { requireAdmin } from '../../../shared/utils/auth-guards'

export const Route = createFileRoute('/_admin/atenciones/formularios')({
    beforeLoad: ({ location }) => {
        requireAdmin()

        const path = location.pathname.replace(/\/$/, '')
        if (path === '/atenciones/formularios') {
            throw redirect({ to: '/atenciones/tipos-atencion' })
        }
    },
    component: FormulariosLayout,
})

function FormulariosLayout() {
    return <Outlet />
}
