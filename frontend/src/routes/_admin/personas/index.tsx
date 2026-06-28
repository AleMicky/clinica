import { createFileRoute } from '@tanstack/react-router'
import { PersonasView } from '../../../features/personas/views/PersonasView'
import { requireStaff } from '../../../shared/utils/auth-guards'

export const Route = createFileRoute('/_admin/personas/')({
    beforeLoad: () => {
        requireStaff()
    },
    component: PersonasView,
})
