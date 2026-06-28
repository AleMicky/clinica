import { createFileRoute } from '@tanstack/react-router'
import { AtencionesView } from '../../../features/atencion-medica/views/AtencionesView'
import { requireStaff } from '../../../shared/utils/auth-guards'

export const Route = createFileRoute('/_admin/atenciones/')({
    beforeLoad: () => {
        requireStaff()
    },
    component: AtencionesView,
})
