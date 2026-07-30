import { useEffect, useMemo } from 'react'
import { useForm, useStore } from '@tanstack/react-form'
import {
    Button,
    Col,
    Drawer,
    Empty,
    Flex,
    Form,
    Grid,
    Input,
    InputNumber,
    Row,
    Select,
    Table,
    Typography,
} from 'antd'
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons'

import { getFieldError } from '../../../../shared/utils/form-errors'
import { WorkflowEmployeeSelect } from '../../../workflow/components/WorkflowEmployeeSelect'
import {
    PacienteSearchBox,
    type PacienteSeleccionado,
} from '../../../atencion-medica/components/PacienteSearchBox'
import { useMedicos } from '../../../recursos-humanos/hooks/medicos.hooks'
import { usePruebas } from '../../pruebas/hooks/pruebas.hooks'
import {
    solicitudDefaultValues,
    solicitudLineaDefaultValues,
    solicitudSchema,
    type SolicitudFormValues,
} from '../schemas/solicitud.schema'
import {
    SOLICITUD_ORIGEN_OPTIONS,
    SolicitudOrigen,
    type Solicitud,
} from '../types/solicitud.types'

const { Text } = Typography
const { TextArea } = Input
const { useBreakpoint } = Grid

const LOOKUP_QUERY = { page: 1, pageSize: 200 } as const
const EDIT_EMPLEADO_PLACEHOLDER = '__edit__'

type SolicitudFormDrawerProps = {
    open: boolean
    entity?: Solicitud | null
    loading: boolean
    onClose: () => void
    onSubmit: (values: SolicitudFormValues) => Promise<void>
}

export function SolicitudFormDrawer({
    open,
    entity = null,
    loading,
    onClose,
    onSubmit,
}: SolicitudFormDrawerProps) {
    const screens = useBreakpoint()
    const drawerWidth = screens.lg ? 720 : screens.md ? 560 : '95%'
    const isEditing = entity !== null

    const { data: pruebasResult, isFetching: loadingPruebas } = usePruebas(LOOKUP_QUERY)
    const { data: medicosResult, isFetching: loadingMedicos } = useMedicos(LOOKUP_QUERY)

    const form = useForm({
        defaultValues: solicitudDefaultValues,
        validators: { onSubmit: solicitudSchema },
        onSubmit: async ({ value }) => {
            await onSubmit(value)
        },
    })

    const origen = useStore(form.store, (state) => state.values.origen)

    useEffect(() => {
        if (!open) return

        if (entity) {
            form.reset()
            form.setFieldValue('pacienteId', entity.pacienteId)
            form.setFieldValue(
                'origen',
                entity.origen as SolicitudFormValues['origen'],
            )
            form.setFieldValue('atencionId', entity.atencionId ?? null)
            form.setFieldValue('medicoSolicitanteId', entity.medicoSolicitanteId ?? null)
            form.setFieldValue('medicoExternoNombre', entity.medicoExternoNombre ?? null)
            form.setFieldValue('observaciones', entity.observaciones ?? null)
            form.setFieldValue('empleadoId', EDIT_EMPLEADO_PLACEHOLDER)
            form.setFieldValue(
                'lineas',
                entity.detalles.length > 0
                    ? entity.detalles.map((detalle) => ({
                          pruebaId: detalle.pruebaId,
                          cantidad: Number(detalle.cantidad) || 1,
                          observaciones: detalle.observaciones ?? null,
                      }))
                    : [{ ...solicitudLineaDefaultValues }],
            )
            return
        }

        form.reset()
    }, [open, entity, form])

    const pruebaOptions = useMemo(
        () =>
            (pruebasResult?.items ?? []).map((item) => ({
                label: `${item.codigo} — ${item.nombre}`,
                value: item.id,
            })),
        [pruebasResult?.items],
    )

    const medicoOptions = useMemo(
        () =>
            (medicosResult?.items ?? []).map((item) => ({
                label: `${item.personaNombreCompleto} · ${item.matriculaProfesional}`,
                value: item.id,
            })),
        [medicosResult?.items],
    )

    const handleClose = () => {
        if (loading) return
        onClose()
    }

    const handlePacienteChange = (paciente: PacienteSeleccionado | null) => {
        form.setFieldValue('pacienteId', paciente?.id ?? '')
    }

    return (
        <Drawer
            title={
                isEditing
                    ? `Editar solicitud ${entity.numero}`
                    : 'Nueva solicitud de laboratorio'
            }
            open={open}
            onClose={handleClose}
            width={drawerWidth}
            destroyOnHidden
            className="usuario-drawer"
            footer={
                <Flex justify="flex-end" gap={8} className="usuario-drawer__footer">
                    <Button onClick={handleClose} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button
                        type="primary"
                        loading={loading}
                        onClick={() => void form.handleSubmit()}
                    >
                        {isEditing ? 'Guardar' : 'Crear'}
                    </Button>
                </Flex>
            }
        >
            <Form
                layout="vertical"
                requiredMark
                size="small"
                className="usuario-drawer__form usuario-drawer__form--compact"
            >
                <Text type="secondary" className="usuario-drawer__required-hint">
                    Los campos marcados con <Text type="danger">*</Text> son
                    obligatorios.
                </Text>

                <form.Field name="pacienteId">
                    {(field) => {
                        const error = getFieldError(field.state.meta.errors)
                        return (
                            <PacienteSearchBox
                                value={field.state.value || undefined}
                                onChange={handlePacienteChange}
                                onBlur={field.handleBlur}
                                disabled={loading}
                                error={error || undefined}
                            />
                        )
                    }}
                </form.Field>

                <Row gutter={16}>
                    <Col xs={24} sm={12}>
                        <form.Field name="origen">
                            {(field) => {
                                const error = getFieldError(field.state.meta.errors)
                                return (
                                    <Form.Item
                                        label="Origen"
                                        required
                                        validateStatus={error ? 'error' : undefined}
                                        help={error || undefined}
                                    >
                                        <Select
                                            options={SOLICITUD_ORIGEN_OPTIONS}
                                            value={field.state.value}
                                            onChange={(value) => field.handleChange(value)}
                                            onBlur={field.handleBlur}
                                            disabled={loading}
                                        />
                                    </Form.Item>
                                )
                            }}
                        </form.Field>
                    </Col>

                    {!isEditing ? (
                        <Col xs={24} sm={12}>
                            <form.Field name="empleadoId">
                                {(field) => {
                                    const error = getFieldError(field.state.meta.errors)
                                    return (
                                        <Form.Item
                                            label="Registrado por"
                                            required
                                            validateStatus={error ? 'error' : undefined}
                                            help={error || undefined}
                                        >
                                            <WorkflowEmployeeSelect
                                                value={field.state.value || undefined}
                                                onChange={(value) =>
                                                    field.handleChange(
                                                        typeof value === 'string'
                                                            ? value
                                                            : (value[0] ?? ''),
                                                    )
                                                }
                                                placeholder="Empleado que registra"
                                            />
                                        </Form.Item>
                                    )
                                }}
                            </form.Field>
                        </Col>
                    ) : null}

                    {origen === SolicitudOrigen.AtencionMedica ? (
                        <Col xs={24} sm={12}>
                            <form.Field name="atencionId">
                                {(field) => {
                                    const error = getFieldError(field.state.meta.errors)
                                    return (
                                        <Form.Item
                                            label="Atención médica"
                                            required
                                            validateStatus={error ? 'error' : undefined}
                                            help={error || 'ID de la atención asociada'}
                                        >
                                            <Input
                                                placeholder="ID de la atención"
                                                value={field.state.value ?? ''}
                                                onChange={(e) =>
                                                    field.handleChange(e.target.value || null)
                                                }
                                                onBlur={field.handleBlur}
                                                disabled={loading}
                                            />
                                        </Form.Item>
                                    )
                                }}
                            </form.Field>
                        </Col>
                    ) : null}

                    {origen === SolicitudOrigen.MedicoExterno ? (
                        <Col xs={24} sm={12}>
                            <form.Field name="medicoExternoNombre">
                                {(field) => {
                                    const error = getFieldError(field.state.meta.errors)
                                    return (
                                        <Form.Item
                                            label="Médico externo"
                                            required
                                            validateStatus={error ? 'error' : undefined}
                                            help={error || undefined}
                                        >
                                            <Input
                                                placeholder="Nombre del médico externo"
                                                value={field.state.value ?? ''}
                                                onChange={(e) =>
                                                    field.handleChange(e.target.value || null)
                                                }
                                                onBlur={field.handleBlur}
                                                disabled={loading}
                                            />
                                        </Form.Item>
                                    )
                                }}
                            </form.Field>
                        </Col>
                    ) : (
                        <Col xs={24} sm={12}>
                            <form.Field name="medicoSolicitanteId">
                                {(field) => (
                                    <Form.Item label="Médico solicitante (opcional)">
                                        <Select
                                            showSearch
                                            allowClear
                                            optionFilterProp="label"
                                            placeholder="Seleccionar médico"
                                            options={medicoOptions}
                                            value={field.state.value || undefined}
                                            onChange={(value) =>
                                                field.handleChange(value ?? null)
                                            }
                                            onBlur={field.handleBlur}
                                            disabled={loading || loadingMedicos}
                                        />
                                    </Form.Item>
                                )}
                            </form.Field>
                        </Col>
                    )}

                    <Col xs={24}>
                        <form.Field name="observaciones">
                            {(field) => (
                                <Form.Item label="Observaciones">
                                    <TextArea
                                        rows={2}
                                        placeholder="Observaciones adicionales"
                                        value={field.state.value ?? ''}
                                        onChange={(e) =>
                                            field.handleChange(e.target.value || null)
                                        }
                                        onBlur={field.handleBlur}
                                        disabled={loading}
                                    />
                                </Form.Item>
                            )}
                        </form.Field>
                    </Col>
                </Row>

                <form.Field name="lineas" mode="array">
                    {(lineasField) => {
                        const lineasError = getFieldError(lineasField.state.meta.errors)
                        return (
                            <Form.Item
                                label="Pruebas solicitadas"
                                required
                                validateStatus={lineasError ? 'error' : undefined}
                                help={lineasError || undefined}
                            >
                                <Table
                                    size="small"
                                    pagination={false}
                                    rowKey={(record) => record.index}
                                    dataSource={lineasField.state.value.map((_, index) => ({
                                        index,
                                    }))}
                                    locale={{
                                        emptyText: (
                                            <Empty
                                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                                description="Agregue al menos una prueba"
                                            />
                                        ),
                                    }}
                                    columns={[
                                        {
                                            title: 'Prueba',
                                            key: 'prueba',
                                            width: '50%',
                                            render: (_, { index }) => (
                                                <form.Field name={`lineas[${index}].pruebaId`}>
                                                    {(field) => (
                                                        <Select
                                                            showSearch
                                                            optionFilterProp="label"
                                                            style={{ width: '100%' }}
                                                            placeholder="Seleccionar prueba"
                                                            options={pruebaOptions}
                                                            value={field.state.value || undefined}
                                                            onChange={(value) =>
                                                                field.handleChange(value)
                                                            }
                                                            disabled={loading || loadingPruebas}
                                                        />
                                                    )}
                                                </form.Field>
                                            ),
                                        },
                                        {
                                            title: 'Cantidad',
                                            key: 'cantidad',
                                            width: 120,
                                            render: (_, { index }) => (
                                                <form.Field name={`lineas[${index}].cantidad`}>
                                                    {(field) => (
                                                        <InputNumber
                                                            min={1}
                                                            style={{ width: '100%' }}
                                                            value={field.state.value}
                                                            onChange={(value) =>
                                                                field.handleChange(value ?? 1)
                                                            }
                                                            disabled={loading}
                                                        />
                                                    )}
                                                </form.Field>
                                            ),
                                        },
                                        {
                                            title: 'Observaciones',
                                            key: 'observaciones',
                                            render: (_, { index }) => (
                                                <form.Field
                                                    name={`lineas[${index}].observaciones`}
                                                >
                                                    {(field) => (
                                                        <Input
                                                            placeholder="Opcional"
                                                            value={field.state.value ?? ''}
                                                            onChange={(e) =>
                                                                field.handleChange(
                                                                    e.target.value || null,
                                                                )
                                                            }
                                                            disabled={loading}
                                                        />
                                                    )}
                                                </form.Field>
                                            ),
                                        },
                                        {
                                            title: '',
                                            key: 'actions',
                                            width: 48,
                                            render: (_, { index }) => (
                                                <Button
                                                    type="text"
                                                    danger
                                                    size="small"
                                                    icon={<DeleteOutlined />}
                                                    disabled={
                                                        loading ||
                                                        lineasField.state.value.length <= 1
                                                    }
                                                    onClick={() =>
                                                        lineasField.removeValue(index)
                                                    }
                                                    aria-label="Eliminar línea"
                                                />
                                            ),
                                        },
                                    ]}
                                />
                                <Button
                                    type="dashed"
                                    icon={<PlusOutlined />}
                                    style={{ marginTop: 8, width: '100%' }}
                                    disabled={loading}
                                    onClick={() =>
                                        lineasField.pushValue({
                                            ...solicitudLineaDefaultValues,
                                        })
                                    }
                                >
                                    Agregar prueba
                                </Button>
                            </Form.Item>
                        )
                    }}
                </form.Field>
            </Form>
        </Drawer>
    )
}
