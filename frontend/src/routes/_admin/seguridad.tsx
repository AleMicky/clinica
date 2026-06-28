import { createFileRoute } from '@tanstack/react-router'
import { SeguridadView } from '../../features/seguridad/views/SeguridadView'
import { requireAdmin } from '../../shared/utils/auth-guards'

export const Route = createFileRoute('/_admin/seguridad')({
    beforeLoad: () => {
        requireAdmin()
    },
    component: SeguridadView,
})
