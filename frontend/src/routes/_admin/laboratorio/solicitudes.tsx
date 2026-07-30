import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_admin/laboratorio/solicitudes')({
    component: SolicitudesLayout,
})

function SolicitudesLayout() {
    return <Outlet />
}
