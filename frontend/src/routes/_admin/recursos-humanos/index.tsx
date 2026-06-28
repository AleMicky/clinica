import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_admin/recursos-humanos/')({
    beforeLoad: () => {
        throw redirect({ to: '/recursos-humanos/empleados' })
    },
})
