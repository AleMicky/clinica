import { createFileRoute } from '@tanstack/react-router'

import { ConceptosCajaAdminView } from '../../../features/caja/views/ConceptosCajaAdminView'

export const Route = createFileRoute('/_admin/caja/conceptos')({
    component: ConceptosCajaAdminView,
})
