import { createFileRoute } from '@tanstack/react-router'

import { PerfilView } from '../../../features/auth/views/PerfilView'

export const Route = createFileRoute('/_admin/usuarios/perfil')({
    component: PerfilPage,
})

function PerfilPage() {
    return <PerfilView />
}
