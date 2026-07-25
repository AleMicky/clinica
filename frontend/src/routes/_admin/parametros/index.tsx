import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_admin/parametros/')({
    beforeLoad: () => {
        throw redirect({ to: '/parametros/catalogos' })
    },
})
