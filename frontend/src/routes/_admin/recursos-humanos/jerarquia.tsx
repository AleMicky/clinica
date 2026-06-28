import { createFileRoute } from '@tanstack/react-router'
import { JerarquiaView } from '../../../features/recursos-humanos/views/JerarquiaView'

export const Route = createFileRoute('/_admin/recursos-humanos/jerarquia')({
    component: JerarquiaView,
})
