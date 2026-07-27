import { createFileRoute } from '@tanstack/react-router'
import { WorkflowCustomQueriesPage } from '../../../features/workflow/views/WorkflowCustomQueriesPage'
import { requireAdmin } from '../../../shared/utils/auth-guards'

export const Route = createFileRoute('/_admin/workflow/custom-queries')({
    beforeLoad: () => {
        requireAdmin()
    },
    component: WorkflowCustomQueriesPage,
})
