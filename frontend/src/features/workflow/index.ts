/**
 * API pública del feature Workflow para integrar en otros módulos.
 *
 * Ejemplo en una vista de dominio:
 *
 * ```tsx
 * <WorkflowEntityPanel
 *   referenceModule="AtencionMedica"
 *   referenceEntity="Atencion"
 *   referenceId={atencion.id}
 *   definitionCode="ATENCION"
 *   employeeId={empleadoId}
 *   variant="embedded"
 *   onStateChange={(instance) => { ... }}
 * />
 * ```
 */

export { WorkflowEntityPanel } from './components/WorkflowEntityPanel'
export type { WorkflowEntityPanelProps } from './components/WorkflowEntityPanel'
export { WorkflowActionsPanel } from './components/WorkflowActionsPanel'
export { WorkflowStateBadge } from './components/WorkflowStateBadge'
export { WorkflowTimeline } from './components/WorkflowTimeline'
export { WorkflowStartPanel } from './components/WorkflowStartPanel'

export {
    useWorkflowInstance,
    useWorkflowInstanceByReference,
    useWorkflowAvailableActions,
    useWorkflowHistory,
    useStartWorkflowInstance,
    useExecuteWorkflowTransition,
} from './hooks/useWorkflowInstances'

export {
    WORKFLOW_MODULE_CATALOG,
    getWorkflowModuleOptions,
    getWorkflowEntityOptions,
    getWorkflowModuleLabel,
    getWorkflowEntityLabel,
} from './constants/workflow-modules'

export type {
    WorkflowInstance,
    WorkflowAvailableAction,
    WorkflowHistoryEntry,
    StartWorkflowInstancePayload,
    ExecuteWorkflowTransitionPayload,
} from './types/workflow.types'
