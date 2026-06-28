import { EditOutlined } from '@ant-design/icons'
import { Button, Descriptions, Drawer, Flex, Tag } from 'antd'

import type { WorkflowState } from '../types/workflow.types'

type WorkflowStateDrawerProps = {
    open: boolean
    state: WorkflowState | null
    onClose: () => void
    onEdit?: (state: WorkflowState) => void
}

export function WorkflowStateDrawer({ open, state, onClose, onEdit }: WorkflowStateDrawerProps) {
    return (
        <Drawer
            title="Detalle del estado"
            open={open}
            onClose={onClose}
            width={460}
            destroyOnHidden
            className="workflow-drawer workflow-drawer--detail"
            footer={
                <Flex justify="flex-end" gap={8}>
                    <Button onClick={onClose}>Cerrar</Button>
                    {onEdit && state ? (
                        <Button
                            type="primary"
                            icon={<EditOutlined />}
                            onClick={() => {
                                onEdit(state)
                                onClose()
                            }}
                        >
                            Editar
                        </Button>
                    ) : null}
                </Flex>
            }
        >
            {state ? (
                <Descriptions
                    bordered
                    size="small"
                    column={1}
                    className="workflow-module__descriptions"
                >
                    <Descriptions.Item label="Nombre">{state.name}</Descriptions.Item>
                    <Descriptions.Item label="Código">{state.code}</Descriptions.Item>
                    <Descriptions.Item label="Tipo">
                        {state.isInitial ? (
                            <Tag color="blue">Estado inicial</Tag>
                        ) : state.isFinal ? (
                            <Tag color="green">Estado final</Tag>
                        ) : (
                            <Tag>Normal</Tag>
                        )}
                    </Descriptions.Item>
                    <Descriptions.Item label="Orden">{state.order}</Descriptions.Item>
                    <Descriptions.Item label="Color">
                        <span
                            className="workflow-drawer__color-preview"
                            style={{ background: state.color || '#1677ff' }}
                        />
                        {state.color || '—'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Descripción">
                        {state.description?.trim() || '—'}
                    </Descriptions.Item>
                </Descriptions>
            ) : null}
        </Drawer>
    )
}
