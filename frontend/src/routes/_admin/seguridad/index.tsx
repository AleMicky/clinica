import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_admin/seguridad/')({
    beforeLoad: () => {
        throw redirect({ to: '/seguridad/usuarios' })
    },
})
