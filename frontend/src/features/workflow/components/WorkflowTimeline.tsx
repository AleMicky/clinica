import { Timeline, Typography } from 'antd'

import { WorkflowStateBadge } from './WorkflowStateBadge'
import type { WorkflowHistoryEntry } from '../types/workflow.types'

const { Text } = Typography

type WorkflowTimelineProps = {
    history: WorkflowHistoryEntry[]
    loading?: boolean
    employeeNameById?: Map<string, string>
}

export function WorkflowTimeline({
    history,
    loading = false,
    employeeNameById,
}: WorkflowTimelineProps) {
    if (loading) {
        return <Text type="secondary">Cargando historial…</Text>
    }

    if (history.length === 0) {
        return <Text type="secondary">Sin movimientos registrados.</Text>
    }

    return (
        <Timeline
            className="workflow-timeline"
            items={history.map((entry) => {
                const employeeLabel =
                    employeeNameById?.get(entry.executedByEmployeeId) ??
                    entry.executedByEmployeeId

                return {
                    key: entry.id,
                    children: (
                        <div className="workflow-timeline__item">
                            <div className="workflow-timeline__header">
                                <Text strong>{entry.transitionName ?? 'Inicio del workflow'}</Text>
                                <Text type="secondary">
                                    {new Date(entry.performedAt).toLocaleString('es-BO')}
                                </Text>
                            </div>
                            <div className="workflow-timeline__states">
                                <WorkflowStateBadge
                                    name={entry.fromStateName}
                                    code={entry.fromStateCode}
                                />
                                <Text type="secondary">→</Text>
                                <WorkflowStateBadge
                                    name={entry.toStateName}
                                    code={entry.toStateCode}
                                />
                            </div>
                            <Text type="secondary">Ejecutado por: {employeeLabel}</Text>
                            {entry.comment ? (
                                <Text className="workflow-timeline__comment">{entry.comment}</Text>
                            ) : null}
                        </div>
                    ),
                }
            })}
        />
    )
}
