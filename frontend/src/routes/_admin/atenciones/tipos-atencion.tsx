import { createFileRoute } from '@tanstack/react-router'
import { TiposAtencionView } from '../../../features/atencion-medica/views/TiposAtencionView'
import { requireAdmin } from '../../../shared/utils/auth-guards'

export const Route = createFileRoute('/_admin/atenciones/tipos-atencion')({
    beforeLoad: () => {
        requireAdmin()
    },
    component: TiposAtencionView,
})
