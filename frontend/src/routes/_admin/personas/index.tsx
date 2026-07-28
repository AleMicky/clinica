import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_admin/personas/')({
    beforeLoad: () => {
        throw redirect({ to: '/parametros/personas' })
    },
})
