import { createFileRoute } from '@tanstack/react-router'
import { DiagnosticosCatalogView } from '../../../features/atencion-medica/views/DiagnosticosCatalogView'
import { requireAdmin } from '../../../shared/utils/auth-guards'

export const Route = createFileRoute('/_admin/atenciones/diagnosticos')({
    beforeLoad: () => {
        requireAdmin()
    },
    component: DiagnosticosCatalogView,
})
