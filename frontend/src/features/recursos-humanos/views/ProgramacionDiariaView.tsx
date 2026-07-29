import { useEffect, useMemo, useState } from 'react'
import {
    Button,
    DatePicker,
    Drawer,
    Flex,
    Form,
    Input,
    Popconfirm,
    Select,
    Space,
    Table,
    Tag,
} from 'antd'
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'

import { useEmpleados } from '../hooks/empleados.hooks'
import {
    useCreateProgramacionDiaria,
    useDeleteProgramacionDiaria,
    useProgramacionDiaria,
    useProgramacionesLookup,
    useTurnos,
    useUpdateProgramacionDiaria,
} from '../hooks/turnos.hooks'
import {
    ESTADO_PROGRAMACION_LABELS,
    TIPO_ASIGNACION_OPTIONS,
    type EstadoProgramacion,
    type ProgramacionDiaria,
    type TipoAsignacionProgramacion,
} from '../types/turnos.types'

const LOOKUP_QUERY = { page: 1, pageSize: 200 }
const DATE_FORMAT = 'YYYY-MM-DD'

type ProgramacionFormValues = {
    programacionId: string
    empleadoId: string
    fecha: dayjs.Dayjs
    turnoId?: string
    tipoAsignacion: TipoAsignacionProgramacion
    observacion?: string
}

const defaultValues: ProgramacionFormValues = {
    programacionId: '',
    empleadoId: '',
    fecha: dayjs(),
    turnoId: undefined,
    tipoAsignacion: 1,
    observacion: '',
}

function toPayload(values: ProgramacionFormValues) {
    return {
        programacionId: values.programacionId,
        empleadoId: values.empleadoId,
        fecha: values.fecha.format(DATE_FORMAT),
        turnoId: values.tipoAsignacion === 1 ? values.turnoId || null : null,
        tipoAsignacion: values.tipoAsignacion,
        observacion: values.observacion?.trim() || null,
    }
}

function formatHora(value?: string | null) {
    return value ? value.slice(0, 5) : '—'
}

export function ProgramacionDiariaView() {
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(20)
    const [fechaFiltro, setFechaFiltro] = useState(dayjs())
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [editing, setEditing] = useState<ProgramacionDiaria | null>(null)
    const [form] = Form.useForm<ProgramacionFormValues>()
    const tipoAsignacion = Form.useWatch('tipoAsignacion', form)

    const fecha = fechaFiltro.format(DATE_FORMAT)
    const { data, isFetching } = useProgramacionDiaria({ page, pageSize, fecha })
    const { data: turnosData } = useTurnos({ page: 1, pageSize: 100, activo: true })
    const { data: empleadosData } = useEmpleados(LOOKUP_QUERY)
    const { data: programacionesLookup } = useProgramacionesLookup()

    const createMutation = useCreateProgramacionDiaria()
    const updateMutation = useUpdateProgramacionDiaria()
    const deleteMutation = useDeleteProgramacionDiaria()

    const loading =
        isFetching ||
        createMutation.isPending ||
        updateMutation.isPending

    const empleadoOptions = useMemo(
        () =>
            (empleadosData?.items ?? []).map((e) => ({
                value: e.id,
                label: `${e.codigoEmpleado} – ${e.personaNombreCompleto}`,
            })),
        [empleadosData?.items],
    )

    const turnoOptions = useMemo(
        () =>
            (turnosData?.items ?? []).map((t) => ({
                value: t.id,
                label: `${t.codigo} (${t.horaInicio.slice(0, 5)}–${t.horaFin.slice(0, 5)})`,
            })),
        [turnosData?.items],
    )

    const programacionOptions = useMemo(
        () =>
            (programacionesLookup ?? []).map((p) => ({
                value: p.id,
                label: `${p.nombre} · ${p.areaNombre} (${p.fechaInicio} → ${p.fechaFin})`,
            })),
        [programacionesLookup],
    )

    useEffect(() => {
        if (!drawerOpen) return
        if (editing) {
            form.setFieldsValue({
                programacionId: editing.programacionId,
                empleadoId: editing.empleadoId,
                fecha: dayjs(editing.fecha),
                turnoId: editing.turnoId ?? undefined,
                tipoAsignacion: editing.tipoAsignacion,
                observacion: editing.observacion ?? '',
            })
        } else {
            form.setFieldsValue({ ...defaultValues, fecha: fechaFiltro })
        }
    }, [drawerOpen, editing, form, fechaFiltro])

    const columns = useMemo(
        () => [
            {
                title: 'Empleado',
                key: 'empleado',
                render: (_: unknown, row: ProgramacionDiaria) =>
                    `${row.empleadoCodigo} – ${row.empleadoNombre}`,
            },
            {
                title: 'Turno',
                key: 'turno',
                render: (_: unknown, row: ProgramacionDiaria) =>
                    row.turnoNombre
                        ? `${row.turnoNombre} (${formatHora(row.horaInicio)}–${formatHora(row.horaFin)})`
                        : '—',
            },
            {
                title: 'Programación',
                dataIndex: 'programacionNombre',
                key: 'programacion',
            },
            {
                title: 'Área',
                dataIndex: 'areaNombre',
                key: 'area',
            },
            {
                title: 'Tipo',
                dataIndex: 'tipoAsignacion',
                key: 'tipoAsignacion',
                render: (value: TipoAsignacionProgramacion) =>
                    value === 2 ? <Tag>Descanso</Tag> : <Tag color="blue">Regular</Tag>,
            },
            {
                title: 'Estado',
                dataIndex: 'programacionEstado',
                key: 'estado',
                render: (value: EstadoProgramacion) => (
                    <Tag color={value === 2 ? 'success' : 'default'}>
                        {ESTADO_PROGRAMACION_LABELS[value] ?? value}
                    </Tag>
                ),
            },
            {
                title: 'Acciones',
                key: 'actions',
                render: (_: unknown, row: ProgramacionDiaria) => (
                    <Space>
                        <Button
                            type="link"
                            icon={<EditOutlined />}
                            onClick={() => {
                                setEditing(row)
                                setDrawerOpen(true)
                            }}
                        >
                            Editar
                        </Button>
                        <Popconfirm
                            title="¿Eliminar programación?"
                            onConfirm={async () => deleteMutation.mutateAsync(row.id)}
                        >
                            <Button type="link" danger icon={<DeleteOutlined />}>
                                Eliminar
                            </Button>
                        </Popconfirm>
                    </Space>
                ),
            },
        ],
        [deleteMutation],
    )

    const handleSubmit = async () => {
        const values = await form.validateFields()
        const payload = toPayload(values)

        if (editing) {
            await updateMutation.mutateAsync({ id: editing.id, data: payload })
        } else {
            await createMutation.mutateAsync(payload)
        }

        setDrawerOpen(false)
        setEditing(null)
    }

    return (
        <div className="rrhh-section-panel">
            <Flex gap={12} wrap="wrap" style={{ marginBottom: 16 }}>
                <DatePicker
                    value={fechaFiltro}
                    onChange={(value) => {
                        if (value) {
                            setFechaFiltro(value)
                            setPage(1)
                        }
                    }}
                    format="DD/MM/YYYY"
                />
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                        setEditing(null)
                        setDrawerOpen(true)
                    }}
                >
                    Nueva programación
                </Button>
            </Flex>

            <Table
                rowKey="id"
                loading={loading}
                columns={columns}
                dataSource={data?.items ?? []}
                pagination={{
                    current: page,
                    pageSize,
                    total: data?.totalRecords ?? 0,
                    onChange: (nextPage, nextSize) => {
                        setPage(nextPage)
                        setPageSize(nextSize)
                    },
                }}
            />

            <Drawer
                title={editing ? 'Editar detalle' : 'Nuevo detalle'}
                open={drawerOpen}
                onClose={() => {
                    setDrawerOpen(false)
                    setEditing(null)
                }}
                width={560}
                extra={
                    <Button type="primary" loading={loading} onClick={() => void handleSubmit()}>
                        Guardar
                    </Button>
                }
            >
                <Form form={form} layout="vertical" initialValues={defaultValues}>
                    <Form.Item
                        name="programacionId"
                        label="Programación"
                        rules={[{ required: true, message: 'Seleccione una programación' }]}
                    >
                        <Select
                            showSearch
                            optionFilterProp="label"
                            options={programacionOptions}
                        />
                    </Form.Item>
                    <Form.Item name="fecha" label="Fecha" rules={[{ required: true }]}>
                        <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="empleadoId" label="Empleado" rules={[{ required: true }]}>
                        <Select
                            showSearch
                            optionFilterProp="label"
                            options={empleadoOptions}
                        />
                    </Form.Item>
                    <Form.Item
                        name="tipoAsignacion"
                        label="Tipo de asignación"
                        rules={[{ required: true }]}
                    >
                        <Select options={TIPO_ASIGNACION_OPTIONS} />
                    </Form.Item>
                    {tipoAsignacion !== 2 && (
                        <Form.Item
                            name="turnoId"
                            label="Turno"
                            rules={[{ required: true, message: 'El turno es obligatorio' }]}
                        >
                            <Select options={turnoOptions} />
                        </Form.Item>
                    )}
                    <Form.Item name="observacion" label="Observación">
                        <Input.TextArea rows={3} />
                    </Form.Item>
                </Form>
            </Drawer>
        </div>
    )
}
