import { createFileRoute } from '@tanstack/react-router'

import { CajasAdminView } from '../../../features/caja/views/CajasAdminView'

export const Route = createFileRoute('/_admin/caja/cajas')({
    component: CajasAdminView,
})
