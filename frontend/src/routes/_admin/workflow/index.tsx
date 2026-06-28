import { createFileRoute } from '@tanstack/react-router'
import { WorkflowDefinitionsPage } from '../../../features/workflow/views/WorkflowDefinitionsPage'
import { requireAdmin } from '../../../shared/utils/auth-guards'

export const Route = createFileRoute('/_admin/workflow/')({
    beforeLoad: () => {
        requireAdmin()
    },
    component: WorkflowDefinitionsPage,
})
