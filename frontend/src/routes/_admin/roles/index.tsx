import { createFileRoute, redirect } from '@tanstack/react-router'
import { requireAdmin } from '../../../shared/utils/auth-guards'

export const Route = createFileRoute('/_admin/roles/')({
    beforeLoad: () => {
        requireAdmin()
        throw redirect({ to: '/seguridad/roles' })
    },
})
