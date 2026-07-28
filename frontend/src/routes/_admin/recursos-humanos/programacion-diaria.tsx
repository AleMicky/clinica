import { createFileRoute } from '@tanstack/react-router'

import { ProgramacionDiariaView } from '../../../features/recursos-humanos/views/ProgramacionDiariaView'

export const Route = createFileRoute('/_admin/recursos-humanos/programacion-diaria')({
    component: ProgramacionDiariaView,
})
