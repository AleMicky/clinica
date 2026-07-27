import { createFileRoute } from '@tanstack/react-router'

import { ResultadosView } from '../../../features/laboratorio/resultados/views/ResultadosView'

export const Route = createFileRoute('/_admin/laboratorio/resultados')({
    component: ResultadosView,
})
