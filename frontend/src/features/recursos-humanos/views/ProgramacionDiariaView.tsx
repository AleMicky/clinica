import { useEffect, useMemo, useState } from 'react'
import {
    Button,
    DatePicker,
    Drawer,
    Flex,
    Form,
    Input,
    InputNumber,
    Popconfirm,
    Select,
    Space,
    Switch,
    Table,
    Tag,
} from 'antd'
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'

import {
    useAreas,
    useCargos,
    useEspecialidades,
} from '../../catalogo-clinico/hooks/catalogo-clinico.hooks'
import { useEmpleados } from '../hooks/empleados.hooks'
import {
    useCreateProgramacionDiaria,
    useDeleteProgramacionDiaria,
    useProgramacionDiaria,
    useTurnos,
    useUpdateProgramacionDiaria,
} from '../hooks/turnos.hooks'
import {
    PROGRAMACION_ESTADOS,
    type ProgramacionDiaria,
} from '../types/turnos.types'

const LOOKUP_QUERY = { page: 1, pageSize: 200 }
const DATE_FORMAT = 'YYYY-MM-DD'

type ProgramacionFormValues = {
    empleadoId: string
    fecha: dayjs.Dayjs
    turnoId: string
    areaId: string
    cargoId: string
    especialidadId?: string
    esMedicoTurno: boolean
    aceptaConsultas: boolean
    aceptaSinCita: boolean
    maxPacientes: number
    estado: string
    observacion?: string
    permiteMultiplesMedicosTurno: boolean
}

const defaultValues: ProgramacionFormValues = {
    empleadoId: '',
    fecha: dayjs(),
    turnoId: '',
    areaId: '',
    cargoId: '',
    especialidadId: undefined,
    esMedicoTurno: false,
    aceptaConsultas: true,
    aceptaSinCita: false,
    maxPacientes: 20,
    estado: 'ACTIVO',
    observacion: '',
    permiteMultiplesMedicosTurno: false,
}

function toPayload(values: ProgramacionFormValues) {
    return {
        empleadoId: values.empleadoId,
        fecha: values.fecha.format(DATE_FORMAT),
        turnoId: values.turnoId,
        areaId: values.areaId,
        cargoId: values.cargoId,
        especialidadId: values.especialidadId || null,
        esMedicoTurno: values.esMedicoTurno,
        aceptaConsultas: values.aceptaConsultas,
        aceptaSinCita: values.aceptaSinCita,
        maxPacientes: values.maxPacientes,
        estado: values.estado,
        observacion: values.observacion?.trim() || null,
        permiteMultiplesMedicosTurno: values.permiteMultiplesMedicosTurno,
    }
}

export function ProgramacionDiariaView() {
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(20)
    const [fechaFiltro, setFechaFiltro] = useState(dayjs())
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [editing, setEditing] = useState<ProgramacionDiaria | null>(null)
    const [form] = Form.useForm<ProgramacionFormValues>()

    const fecha = fechaFiltro.format(DATE_FORMAT)
    const { data, isFetching } = useProgramacionDiaria({ page, pageSize, fecha })
    const { data: turnosData } = useTurnos({ page: 1, pageSize: 100, activo: true })
    const { data: empleadosData } = useEmpleados(LOOKUP_QUERY)
    const { data: areasData } = useAreas(LOOKUP_QUERY)
    const { data: cargosData } = useCargos(LOOKUP_QUERY)
    const { data: especialidadesData } = useEspecialidades(LOOKUP_QUERY)

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

    const areaOptions = useMemo(
        () =>
            (areasData?.items ?? []).map((a) => ({
                value: a.id,
                label: `${a.codigo} – ${a.nombre}`,
            })),
        [areasData?.items],
    )

    const cargoOptions = useMemo(
        () =>
            (cargosData?.items ?? []).map((c) => ({
                value: c.id,
                label: c.nombre,
            })),
        [cargosData?.items],
    )

    const especialidadOptions = useMemo(
        () =>
            (especialidadesData?.items ?? []).map((e) => ({
                value: e.id,
                label: e.nombre,
            })),
        [especialidadesData?.items],
    )

    useEffect(() => {
        if (!drawerOpen) return
        if (editing) {
            form.setFieldsValue({
                empleadoId: editing.empleadoId,
                fecha: dayjs(editing.fecha),
                turnoId: editing.turnoId,
                areaId: editing.areaId,
                cargoId: editing.cargoId,
                especialidadId: editing.especialidadId ?? undefined,
                esMedicoTurno: editing.esMedicoTurno,
                aceptaConsultas: editing.aceptaConsultas,
                aceptaSinCita: editing.aceptaSinCita,
                maxPacientes: editing.maxPacientes,
                estado: editing.estado,
                observacion: editing.observacion ?? '',
                permiteMultiplesMedicosTurno: editing.permiteMultiplesMedicosTurno,
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
                    `${row.turnoNombre} (${row.horaInicio.slice(0, 5)}–${row.horaFin.slice(0, 5)})`,
            },
            {
                title: 'Área / Consultorio',
                dataIndex: 'areaNombre',
                key: 'area',
            },
            {
                title: 'Especialidad',
                dataIndex: 'especialidadNombre',
                key: 'especialidad',
                render: (value: string | null) => value ?? '—',
            },
            {
                title: 'Médico turno',
                dataIndex: 'esMedicoTurno',
                key: 'esMedicoTurno',
                render: (value: boolean) =>
                    value ? <Tag color="blue">Principal</Tag> : null,
            },
            {
                title: 'Estado',
                dataIndex: 'estado',
                key: 'estado',
                render: (value: string) => (
                    <Tag color={value === 'ACTIVO' ? 'success' : 'default'}>{value}</Tag>
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
                title={editing ? 'Editar programación' : 'Nueva programación'}
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
                    <Form.Item name="turnoId" label="Turno" rules={[{ required: true }]}>
                        <Select options={turnoOptions} />
                    </Form.Item>
                    <Form.Item
                        name="areaId"
                        label="Área / Consultorio"
                        rules={[{ required: true }]}
                    >
                        <Select
                            showSearch
                            optionFilterProp="label"
                            options={areaOptions}
                        />
                    </Form.Item>
                    <Form.Item name="cargoId" label="Cargo" rules={[{ required: true }]}>
                        <Select options={cargoOptions} />
                    </Form.Item>
                    <Form.Item name="especialidadId" label="Especialidad (opcional)">
                        <Select allowClear options={especialidadOptions} />
                    </Form.Item>
                    <Form.Item name="maxPacientes" label="Máx. pacientes" rules={[{ required: true }]}>
                        <InputNumber min={1} max={999} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="estado" label="Estado" rules={[{ required: true }]}>
                        <Select
                            options={PROGRAMACION_ESTADOS.map((e) => ({
                                value: e,
                                label: e,
                            }))}
                        />
                    </Form.Item>
                    <Form.Item name="esMedicoTurno" label="Médico de turno" valuePropName="checked">
                        <Switch />
                    </Form.Item>
                    <Form.Item name="aceptaConsultas" label="Acepta consultas" valuePropName="checked">
                        <Switch />
                    </Form.Item>
                    <Form.Item name="aceptaSinCita" label="Acepta sin cita" valuePropName="checked">
                        <Switch />
                    </Form.Item>
                    <Form.Item
                        name="permiteMultiplesMedicosTurno"
                        label="Permite múltiples médicos principales"
                        valuePropName="checked"
                    >
                        <Switch />
                    </Form.Item>
                    <Form.Item name="observacion" label="Observación">
                        <Input.TextArea rows={3} />
                    </Form.Item>
                </Form>
            </Drawer>
        </div>
    )
}
