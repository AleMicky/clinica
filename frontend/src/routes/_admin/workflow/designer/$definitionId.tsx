import { createFileRoute } from '@tanstack/react-router'
import { WorkflowDesignerPage } from '../../../../features/workflow/views/WorkflowDesignerPage'
import { requireAdmin } from '../../../../shared/utils/auth-guards'

export const Route = createFileRoute('/_admin/workflow/designer/$definitionId')({
    beforeLoad: () => {
        requireAdmin()
    },
    component: WorkflowDesignerRoutePage,
})

function WorkflowDesignerRoutePage() {
    const { definitionId } = Route.useParams()

    return <WorkflowDesignerPage definitionId={definitionId} />
}
