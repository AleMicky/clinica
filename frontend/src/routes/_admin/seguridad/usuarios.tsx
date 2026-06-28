import { createFileRoute } from '@tanstack/react-router'
import { UsuariosView } from '../../../features/usuarios/views/UsuariosView'

export const Route = createFileRoute('/_admin/seguridad/usuarios')({
    component: UsuariosPage,
})

function UsuariosPage() {
    return <UsuariosView embedded />
}
