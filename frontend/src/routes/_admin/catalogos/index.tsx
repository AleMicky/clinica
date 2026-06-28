import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_admin/catalogos/')({
    beforeLoad: () => {
        throw redirect({ to: '/parametros' })
    },
})
