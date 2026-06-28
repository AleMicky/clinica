import { Timeline, Typography } from 'antd'

import { WorkflowStateBadge } from './WorkflowStateBadge'
import type { WorkflowHistoryEntry } from '../types/workflow.types'

const { Text } = Typography

type WorkflowTimelineProps = {
    history: WorkflowHistoryEntry[]
    loading?: boolean
}

export function WorkflowTimeline({ history, loading = false }: WorkflowTimelineProps) {
    if (loading) {
        return <Text type="secondary">Cargando historial…</Text>
    }

    if (history.length === 0) {
        return <Text type="secondary">Sin movimientos registrados.</Text>
    }

    return (
        <Timeline
            className="workflow-timeline"
            items={history.map((entry) => ({
                key: entry.id,
                children: (
                    <div className="workflow-timeline__item">
                        <div className="workflow-timeline__header">
                            <Text strong>{entry.actionName}</Text>
                            <Text type="secondary">
                                {new Date(entry.performedAt).toLocaleString('es-BO')}
                            </Text>
                        </div>
                        <div className="workflow-timeline__states">
                            <WorkflowStateBadge name={entry.fromStateName} code={entry.fromStateCode} />
                            <Text type="secondary">→</Text>
                            <WorkflowStateBadge name={entry.toStateName} code={entry.toStateCode} />
                        </div>
                        <Text type="secondary">
                            {entry.performedByUserName}
                            {entry.performedByRole ? ` · ${entry.performedByRole}` : ''}
                        </Text>
                        {entry.comment ? <Text>{entry.comment}</Text> : null}
                    </div>
                ),
            }))}
        />
    )
}
