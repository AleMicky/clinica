import { createFileRoute } from '@tanstack/react-router'

import { MetodosPagoAdminView } from '../../../features/caja/views/MetodosPagoAdminView'

export const Route = createFileRoute('/_admin/caja/metodos-pago')({
    component: MetodosPagoAdminView,
})
