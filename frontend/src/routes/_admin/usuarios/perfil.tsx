import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_admin/usuarios/perfil')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_admin/usuarios/perfil"!</div>
}
