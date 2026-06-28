import { createFileRoute } from '@tanstack/react-router'
import { EmpleadosView } from '../../../features/recursos-humanos/views/EmpleadosView'

export const Route = createFileRoute('/_admin/recursos-humanos/empleados')({
    component: EmpleadosView,
})
