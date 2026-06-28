import { createFileRoute } from '@tanstack/react-router'
import { MedicosView } from '../../../features/recursos-humanos/views/MedicosView'

export const Route = createFileRoute('/_admin/recursos-humanos/medicos')({
    component: MedicosView,
})
