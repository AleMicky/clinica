import { createFileRoute } from '@tanstack/react-router'
import { RolesView } from '../../../features/roles/views/RolesView'

export const Route = createFileRoute('/_admin/seguridad/roles')({
    component: RolesPage,
})

function RolesPage() {
    return <RolesView embedded />
}
