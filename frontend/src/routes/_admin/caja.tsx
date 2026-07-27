import { createFileRoute } from '@tanstack/react-router'

import { CajaView } from '../../features/caja/views/CajaView'
import { AppRole } from '../../shared/constants/app-roles'
import { requireRoles } from '../../shared/utils/auth-guards'

export const Route = createFileRoute('/_admin/caja')({
    beforeLoad: () => {
        requireRoles([AppRole.Admin, AppRole.Caja, AppRole.Recepcion])
    },
    component: CajaView,
})
