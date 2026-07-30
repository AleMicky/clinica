import { Modal } from 'antd'

import {
    WorkflowEntityPanel,
    type WorkflowEntityPanelProps,
} from './WorkflowEntityPanel'

export type WorkflowEntityModalProps = Omit<
    WorkflowEntityPanelProps,
    'variant' | 'className' | 'title'
> & {
    open: boolean
    onClose: () => void
    title?: string
    width?: number | string
}

export function WorkflowEntityModal({
    open,
    onClose,
    title = 'Flujo de trabajo',
    width = 720,
    showHistory = true,
    historyDefaultOpen = false,
    allowStart = true,
    ...panelProps
}: WorkflowEntityModalProps) {
    return (
        <Modal
            title={title}
            open={open}
            onCancel={onClose}
            footer={null}
            width={width}
            destroyOnHidden
            className="workflow-entity-modal"
            styles={{
                body: {
                    maxHeight: 'min(70vh, 640px)',
                    overflowY: 'auto',
                    paddingTop: 8,
                },
            }}
        >
            {open ? (
                <WorkflowEntityPanel
                    {...panelProps}
                    title={title}
                    variant="embedded"
                    showHistory={showHistory}
                    historyDefaultOpen={historyDefaultOpen}
                    allowStart={allowStart}
                    className="workflow-entity-modal__panel"
                />
            ) : null}
        </Modal>
    )
}
