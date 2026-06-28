import { createFileRoute } from '@tanstack/react-router'
import { AdminLayout } from '../layouts/AdminLayout'
import { requireAuth } from '../shared/utils/auth-guards'

export const Route = createFileRoute('/_admin')({
    beforeLoad: () => {
        requireAuth()
    },
    component: AdminLayout,
})