import { createFileRoute } from '@tanstack/react-router'

import { PruebasView } from '../../../features/laboratorio/pruebas/views/PruebasView'

export const Route = createFileRoute('/_admin/laboratorio/pruebas')({
    component: PruebasView,
})
