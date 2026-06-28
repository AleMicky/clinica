import { createFileRoute } from '@tanstack/react-router'
import { RecursosHumanosView } from '../../features/recursos-humanos/views/RecursosHumanosView'
import { requireAdmin } from '../../shared/utils/auth-guards'

export const Route = createFileRoute('/_admin/recursos-humanos')({
    beforeLoad: () => {
        requireAdmin()
    },
    component: RecursosHumanosView,
})
