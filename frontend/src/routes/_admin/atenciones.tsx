import { createFileRoute } from '@tanstack/react-router'
import { AtencionMedicaView } from '../../features/atencion-medica/views/AtencionMedicaView'
import { requireStaff } from '../../shared/utils/auth-guards'

export const Route = createFileRoute('/_admin/atenciones')({
    beforeLoad: () => {
        requireStaff()
    },
    component: AtencionMedicaView,
})
