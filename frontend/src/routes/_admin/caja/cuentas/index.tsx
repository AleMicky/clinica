import { createFileRoute } from '@tanstack/react-router'

import { CajaBandejaView } from '../../../../features/caja/views/CajaBandejaView'

export const Route = createFileRoute('/_admin/caja/cuentas/')({
    component: CajaBandejaView,
})
