import { createFileRoute } from '@tanstack/react-router'
import { WorkflowInstancePage } from '../../../../features/workflow/views/WorkflowInstancePage'
import { requireStaff } from '../../../../shared/utils/auth-guards'

export const Route = createFileRoute('/_admin/workflow/instances/$instanceId')({
    beforeLoad: () => {
        requireStaff()
    },
    component: WorkflowInstanceRoutePage,
})

function WorkflowInstanceRoutePage() {
    const { instanceId } = Route.useParams()

    return <WorkflowInstancePage instanceId={instanceId} />
}
