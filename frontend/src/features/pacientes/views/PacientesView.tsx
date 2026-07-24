import { useEffect, useRef, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
    Button,
    Descriptions,
    Flex,
    Grid,
    Input,
    Modal,
    Statistic,
    Typography,
    theme,
} from 'antd'
import {
    FilterOutlined,
    PlusOutlined,
    SearchOutlined,
    TeamOutlined,
} from '@ant-design/icons'

import { PacienteFormModal } from '../components/PacienteFormModal'
import { PacientesTable } from '../components/PacientesTable'
import {
    useCreatePaciente,
    useDeletePaciente,
    usePacientes,
    useUpdatePaciente,
} from '../hooks/pacientes.hooks'
import {
    toCreatePacientePayload,
    toUpdatePacientePayload,
    type PacienteFormValues,
} from '../schemas/paciente.schema'
import {
    calcularEdadPaciente,
    formatPacienteDocumento,
    type Paciente,
} from '../types/paciente.types'

const { Title, Text } = Typography
const { useBreakpoint } = Grid

const DEFAULT_PAGE_SIZE = 20

function formatDate(value: string) {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value
    return date.toLocaleDateString('es-BO')
}

export function PacientesView() {
    const { token } = theme.useToken()
    const screens = useBreakpoint()
    const navigate = useNavigate()
    const isStacked = !screens.lg

    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
    const [search, setSearch] = useState('')
    const [searchInput, setSearchInput] = useState('')
    const [hcFilterInput, setHcFilterInput] = useState('')
    const [docFilterInput, setDocFilterInput] = useState('')
    const [hcFilter, setHcFilter] = useState('')
    const [docFilter, setDocFilter] = useState('')
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [editingPaciente, setEditingPaciente] = useState<Paciente | null>(null)
    const [viewingPaciente, setViewingPaciente] = useState<Paciente | null>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null)

    const { data, isFetching } = usePacientes({
        page,
        pageSize,
        search: search || undefined,
        numeroHistoriaClinica: hcFilter || undefined,
        numeroDocumento: docFilter || undefined,
    })

    const createPaciente = useCreatePaciente()
    const updatePaciente = useUpdatePaciente()
    const deletePaciente = useDeletePaciente()

    const hasActiveFilters = Boolean(hcFilter || docFilter)

    const pacientes = data?.items ?? []
    const totalPacientes = data?.totalRecords ?? 0

    const isSaving = createPaciente.isPending || updatePaciente.isPending

    const onSearchRef = useRef<(value: string) => void>(() => undefined)

    useEffect(() => {
        onSearchRef.current = (value: string) => {
            setSearch(value.trim())
            setPage(1)
        }
    })

    useEffect(() => {
        const timer = window.setTimeout(() => {
            onSearchRef.current(searchInput)
        }, 300)

        return () => window.clearTimeout(timer)
    }, [searchInput])

    useEffect(() => {
        const next = hcFilterInput.trim()
        const timer = window.setTimeout(() => {
            if (next === hcFilter) return
            setHcFilter(next)
            setPage(1)
        }, 300)

        return () => window.clearTimeout(timer)
    }, [hcFilterInput, hcFilter])

    useEffect(() => {
        const next = docFilterInput.trim()
        const timer = window.setTimeout(() => {
            if (next === docFilter) return
            setDocFilter(next)
            setPage(1)
        }, 300)

        return () => window.clearTimeout(timer)
    }, [docFilterInput, docFilter])

    const openCreateDrawer = () => {
        setEditingPaciente(null)
        setDrawerOpen(true)
    }

    const openEditDrawer = (paciente: Paciente) => {
        setEditingPaciente(paciente)
        setDrawerOpen(true)
    }

    const closeDrawer = () => {
        if (isSaving) return
        setDrawerOpen(false)
        setEditingPaciente(null)
    }

    const handleSubmit = async (values: PacienteFormValues) => {
        if (editingPaciente) {
            await updatePaciente.mutateAsync({
                id: editingPaciente.id,
                data: toUpdatePacientePayload(
                    values,
                    editingPaciente.personaId,
                    editingPaciente.numeroHistoriaClinica,
                ),
            })
        } else {
            await createPaciente.mutateAsync(toCreatePacientePayload(values))
        }

        closeDrawer()
    }

    const handleDelete = async (paciente: Paciente) => {
        setDeletingId(paciente.id)

        try {
            await deletePaciente.mutateAsync(paciente.id)
        } finally {
            setDeletingId(null)
        }
    }

    const handlePageChange = (nextPage: number, nextPageSize: number) => {
        setPage(nextPage)
        setPageSize(nextPageSize)
    }

    const clearFilters = () => {
        setHcFilterInput('')
        setDocFilterInput('')
        setHcFilter('')
        setDocFilter('')
        setPage(1)
    }

    const handleNuevaAtencion = (_paciente: Paciente) => {
        void navigate({ to: '/atenciones' })
    }

    const caption = `${totalPacientes} paciente${totalPacientes === 1 ? '' : 's'}${
        search ? ` · "${search}"` : ''
    }`

    return (
        <div className="admin-page pacientes-module">
            <header className="admin-page__header">
                <Flex
                    justify="space-between"
                    align={isStacked ? 'flex-start' : 'center'}
                    gap={12}
                    wrap="wrap"
                >
                    <Flex align="center" gap={12}>
                        <div className="admin-page__header-icon" aria-hidden>
                            <TeamOutlined />
                        </div>
                        <div>
                            <Title level={3} className="admin-page__title">
                                Pacientes
                            </Title>
                            <Text type="secondary" className="pacientes-module__caption">
                                Directorio clínico y registro guiado de fichas de paciente.
                            </Text>
                        </div>
                    </Flex>

                    <Flex gap={10} wrap="wrap" className="admin-page__header-stats">
                        <div className="admin-page__stat">
                            <Statistic
                                title="Registrados"
                                value={totalPacientes}
                                prefix={<TeamOutlined />}
                                loading={isFetching}
                            />
                        </div>
                    </Flex>
                </Flex>
            </header>

            <div className="admin-page__workspace">
                <section className="admin-page__panel">
                    <div className="admin-page__panel-toolbar">
                        <div className="pacientes-module__toolbar">
                            <Input
                                allowClear
                                size="small"
                                className="pacientes-module__filter-search"
                                prefix={
                                    <SearchOutlined
                                        style={{ color: token.colorTextQuaternary }}
                                    />
                                }
                                placeholder="Buscar paciente…"
                                value={searchInput}
                                onChange={(event) => setSearchInput(event.target.value)}
                                onClear={() => setSearchInput('')}
                            />

                            <Input
                                allowClear
                                size="small"
                                className="pacientes-module__filter-input"
                                placeholder="Historia clínica"
                                value={hcFilterInput}
                                onChange={(event) => {
                                    setHcFilterInput(event.target.value)
                                }}
                            />

                            <Input
                                allowClear
                                size="small"
                                className="pacientes-module__filter-input"
                                placeholder="Documento"
                                value={docFilterInput}
                                onChange={(event) => {
                                    setDocFilterInput(event.target.value)
                                }}
                            />

                            {hasActiveFilters ? (
                                <Button
                                    type="link"
                                    size="small"
                                    icon={<FilterOutlined />}
                                    onClick={clearFilters}
                                >
                                    Limpiar
                                </Button>
                            ) : null}

                            <div className="pacientes-module__toolbar-actions">
                                <Button
                                    type="primary"
                                    size="small"
                                    icon={<PlusOutlined />}
                                    onClick={openCreateDrawer}
                                >
                                    Nuevo paciente
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="admin-page__panel-body">
                        <Text type="secondary" className="pacientes-module__caption">
                            {caption}
                        </Text>

                        <PacientesTable
                            pacientes={pacientes}
                            loading={isFetching}
                            total={totalPacientes}
                            page={page}
                            pageSize={pageSize}
                            onPageChange={handlePageChange}
                            onEdit={openEditDrawer}
                            onViewFicha={setViewingPaciente}
                            onNuevaAtencion={handleNuevaAtencion}
                            onDelete={handleDelete}
                            onCreate={openCreateDrawer}
                            deletingId={deletingId}
                            hasActiveFilters={hasActiveFilters || Boolean(search)}
                        />
                    </div>
                </section>
            </div>

            <PacienteFormModal
                open={drawerOpen}
                paciente={editingPaciente}
                loading={isSaving}
                onClose={closeDrawer}
                onSubmit={handleSubmit}
            />

            <Modal
                title="Ficha del paciente"
                open={viewingPaciente !== null}
                onCancel={() => setViewingPaciente(null)}
                footer={[
                    <Button key="close" onClick={() => setViewingPaciente(null)}>
                        Cerrar
                    </Button>,
                    <Button
                        key="edit"
                        type="primary"
                        onClick={() => {
                            if (!viewingPaciente) return
                            setViewingPaciente(null)
                            openEditDrawer(viewingPaciente)
                        }}
                    >
                        Editar
                    </Button>,
                ]}
                width={560}
                className="paciente-ficha-modal"
                destroyOnHidden
            >
                {viewingPaciente ? (
                    <Descriptions bordered size="small" column={1}>
                        <Descriptions.Item label="Historia clínica">
                            {viewingPaciente.numeroHistoriaClinica}
                        </Descriptions.Item>
                        <Descriptions.Item label="Paciente">
                            {viewingPaciente.personaNombreCompleto}
                        </Descriptions.Item>
                        <Descriptions.Item label="Documento">
                            {formatPacienteDocumento(viewingPaciente)}
                        </Descriptions.Item>
                        <Descriptions.Item label="Fecha de nacimiento">
                            {formatDate(viewingPaciente.fechaNacimiento)}
                        </Descriptions.Item>
                        <Descriptions.Item label="Edad">
                            {calcularEdadPaciente(viewingPaciente.fechaNacimiento)}
                        </Descriptions.Item>
                        <Descriptions.Item label="Sexo">
                            {viewingPaciente.sexoNombre || '—'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Teléfono">
                            {viewingPaciente.telefono?.trim() || '—'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Dirección">
                            {viewingPaciente.direccion?.trim() || '—'}
                        </Descriptions.Item>
                    </Descriptions>
                ) : null}
            </Modal>
        </div>
    )
}
