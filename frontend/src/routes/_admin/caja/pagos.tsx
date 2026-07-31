import { createFileRoute } from '@tanstack/react-router'

import { PagosView } from '../../../features/caja/views/PagosView'

export const Route = createFileRoute('/_admin/caja/pagos')({
    component: PagosView,
})
