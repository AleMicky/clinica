import { createFileRoute } from '@tanstack/react-router'

import { LaboratorioView } from '../../features/laboratorio/views/LaboratorioView'
import { AppRole } from '../../shared/constants/app-roles'
import { requireRoles } from '../../shared/utils/auth-guards'

export const Route = createFileRoute('/_admin/laboratorio')({
    beforeLoad: () => {
        requireRoles([AppRole.Admin, AppRole.Laboratorio])
    },
    component: LaboratorioView,
})
