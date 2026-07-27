import { createFileRoute } from '@tanstack/react-router'

import { LaboratoriosExternosView } from '../../../features/laboratorio/laboratorios-externos/views/LaboratoriosExternosView'

export const Route = createFileRoute('/_admin/laboratorio/laboratorios-externos')({
    component: LaboratoriosExternosView,
})
