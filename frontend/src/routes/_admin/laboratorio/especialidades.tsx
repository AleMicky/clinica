import { createFileRoute } from '@tanstack/react-router'

import { EspecialidadesView } from '../../../features/laboratorio/especialidades/views/EspecialidadesView'

export const Route = createFileRoute('/_admin/laboratorio/especialidades')({
    component: EspecialidadesView,
})
