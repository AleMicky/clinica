import { createFileRoute } from '@tanstack/react-router'

import { DashboardView } from '../../features/dashboard/views/DashboardView'

export const Route = createFileRoute('/_admin/')({
    component: DashboardView,
})
