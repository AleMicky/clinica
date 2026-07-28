import { createFileRoute } from '@tanstack/react-router'

import { PersonasView } from '../../../features/personas/views/PersonasView'

export const Route = createFileRoute('/_admin/parametros/personas')({
    component: PersonasView,
})
