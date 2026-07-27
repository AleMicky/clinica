import { createFileRoute } from '@tanstack/react-router'

import { CajaOperacionView } from '../../../features/caja/views/CajaOperacionView'

export const Route = createFileRoute('/_admin/caja/')({
    component: CajaOperacionView,
})
