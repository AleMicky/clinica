import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_admin/laboratorio/')({
    beforeLoad: () => {
        throw redirect({ to: '/laboratorio/solicitudes' })
    },
})
