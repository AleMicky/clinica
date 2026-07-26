import { createFileRoute } from '@tanstack/react-router'

import { TiposExamenView } from '../../../features/laboratorio/tipos-examen/views/TiposExamenView'

export const Route = createFileRoute('/_admin/laboratorio/tipos-examen')({
    component: TiposExamenView,
})
