import { createFileRoute } from '@tanstack/react-router'
import { ParametrosView } from '../../features/parametros/views/ParametrosView'
import { requireAdmin } from '../../shared/utils/auth-guards'

export const Route = createFileRoute('/_admin/parametros')({
    beforeLoad: () => {
        requireAdmin()
    },
    component: ParametrosView,
})
