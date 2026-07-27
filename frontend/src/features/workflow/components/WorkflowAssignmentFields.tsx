import { Col, Form, Row, Select, Switch, Typography } from 'antd'

import type { WorkflowCustomQuery } from '../types/workflow.types'
import { WorkflowAssignmentType } from '../types/workflow.types'
import { WorkflowAreaSelect } from './WorkflowAreaSelect'
import { WorkflowEmployeeSelect } from './WorkflowEmployeeSelect'

const { Text } = Typography

const ASSIGNMENT_TYPE_OPTIONS = [
    { value: WorkflowAssignmentType.Area, label: 'Área' },
    { value: WorkflowAssignmentType.EmployeeList, label: 'Lista de empleados' },
    { value: WorkflowAssignmentType.StoredProcedure, label: 'Procedimiento almacenado' },
]

type AssignmentSlice = {
    enabled: boolean
    type: WorkflowAssignmentType
    areaId?: string | null
    workflowCustomQueryId?: string | null
    employeeIds?: string[] | null
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyForm = {
    Field: any
    Subscribe: any
}

type WorkflowAssignmentFieldsProps = {
    form: AnyForm
    customQueries?: WorkflowCustomQuery[]
}

export function WorkflowAssignmentFields({
    form,
    customQueries = [],
}: WorkflowAssignmentFieldsProps) {
    const customQueryOptions = customQueries.map((query) => ({
        value: query.id,
        label: `${query.code} · ${query.name}`,
    }))

    return (
        <>
            <Text strong>Asignación</Text>
            <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
                Define quién puede ejecutar esta transición.
            </Text>

            <form.Field name="assignment.enabled">
                {(field: { state: { value: boolean }; handleChange: (v: boolean) => void }) => (
                    <Form.Item label="Configurar asignación">
                        <Switch
                            checked={field.state.value}
                            checkedChildren="Sí"
                            unCheckedChildren="No"
                            onChange={(checked) => field.handleChange(checked)}
                        />
                    </Form.Item>
                )}
            </form.Field>

            <form.Subscribe selector={(state: { values: { assignment: AssignmentSlice } }) => state.values.assignment}>
                {(assignment: AssignmentSlice) => {
                    if (!assignment.enabled) return null

                    return (
                        <Row gutter={[12, 0]}>
                            <Col span={24}>
                                <form.Field name="assignment.type">
                                    {(field: {
                                        state: { value: WorkflowAssignmentType }
                                        handleChange: (v: WorkflowAssignmentType) => void
                                    }) => (
                                        <Form.Item label="Tipo" required>
                                            <Select
                                                options={ASSIGNMENT_TYPE_OPTIONS}
                                                value={field.state.value}
                                                onChange={(value) => field.handleChange(value)}
                                            />
                                        </Form.Item>
                                    )}
                                </form.Field>
                            </Col>

                            {assignment.type === WorkflowAssignmentType.Area ? (
                                <Col span={24}>
                                    <form.Field name="assignment.areaId">
                                        {(field: {
                                            state: { value: string | null | undefined }
                                            handleChange: (v: string) => void
                                        }) => (
                                            <Form.Item label="Área" required>
                                                <WorkflowAreaSelect
                                                    value={field.state.value ?? ''}
                                                    onChange={(value) => field.handleChange(value)}
                                                />
                                            </Form.Item>
                                        )}
                                    </form.Field>
                                </Col>
                            ) : null}

                            {assignment.type === WorkflowAssignmentType.EmployeeList ? (
                                <Col span={24}>
                                    <form.Field name="assignment.employeeIds">
                                        {(field: {
                                            state: { value: string[] | null | undefined }
                                            handleChange: (v: string[]) => void
                                        }) => (
                                            <Form.Item label="Empleados" required>
                                                <WorkflowEmployeeSelect
                                                    mode="multiple"
                                                    placeholder="Seleccione uno o más empleados"
                                                    value={field.state.value ?? []}
                                                    onChange={(value) =>
                                                        field.handleChange(value as string[])
                                                    }
                                                />
                                            </Form.Item>
                                        )}
                                    </form.Field>
                                </Col>
                            ) : null}

                            {assignment.type === WorkflowAssignmentType.StoredProcedure ? (
                                <Col span={24}>
                                    <form.Field name="assignment.workflowCustomQueryId">
                                        {(field: {
                                            state: { value: string | null | undefined }
                                            handleChange: (v: string) => void
                                        }) => (
                                            <Form.Item label="Consulta personalizada" required>
                                                <Select
                                                    showSearch
                                                    optionFilterProp="label"
                                                    placeholder="Seleccione consulta"
                                                    options={customQueryOptions}
                                                    value={field.state.value || undefined}
                                                    onChange={(value) => field.handleChange(value)}
                                                />
                                            </Form.Item>
                                        )}
                                    </form.Field>
                                </Col>
                            ) : null}
                        </Row>
                    )
                }}
            </form.Subscribe>
        </>
    )
}
