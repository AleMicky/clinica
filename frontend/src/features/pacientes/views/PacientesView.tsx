import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
    Button,
    Descriptions,
    Flex,
    Grid,
    Input,
    Modal,
    Select,
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

import { useCatalogoGruposGrouped } from '../../parametros/catalogos/hooks/catalogo-grupos.hooks'
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
    type PacienteUpdateFormValues,
} from '../schemas/paciente.schema'
import type { Paciente } from '../types/paciente.types'

const { Title, Text } = Typography
const { useBreakpoint } = Grid

const DEFAULT_PAGE_SIZE = 20
const FETCH_PAGE_SIZE = 5000

function extractDocumentoHint(numeroHistoriaClinica: string) {
    const match = numeroHistoriaClinica.match(/\d+$/)
    return match?.[0] ?? ''
}

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
    const [hcFilter, setHcFilter] = useState('')
    const [docFilter, setDocFilter] = useState('')
    const [grupoFilter, setGrupoFilter] = useState<string | null>(null)
    const [estadoFilter, setEstadoFilter] = useState<'all' | 'registrado'>('all')
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [editingPaciente, setEditingPaciente] = useState<Paciente | null>(null)
    const [viewingPaciente, setViewingPaciente] = useState<Paciente | null>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null)

    const { data: catalogos } = useCatalogoGruposGrouped()

    const { data, isFetching } = usePacientes({
        page: 1,
        pageSize: FETCH_PAGE_SIZE,
        search: search || undefined,
    })

    const createPaciente = useCreatePaciente()
    const updatePaciente = useUpdatePaciente()
    const deletePaciente = useDeletePaciente()

    const grupoSanguineoOptions = useMemo(
        () =>
            catalogos
                ?.find((grupo) => grupo.codigo === 'GRUPO_SANGUINEO')
                ?.items.map((item) => ({ label: item.nombre, value: item.id })) ?? [],
        [catalogos],
    )

    const hasActiveFilters = Boolean(
        hcFilter.trim() || docFilter.trim() || grupoFilter || estadoFilter !== 'all',
    )

    const filteredPacientes = useMemo(() => {
        let list = data?.items ?? []

        if (hcFilter.trim()) {
            const term = hcFilter.trim().toLowerCase()
            list = list.filter((paciente) =>
                paciente.numeroHistoriaClinica.toLowerCase().includes(term),
            )
        }

        if (docFilter.trim()) {
            const term = docFilter.trim().toLowerCase()
            list = list.filter((paciente) => {
                const documento = extractDocumentoHint(paciente.numeroHistoriaClinica).toLowerCase()
                return documento.includes(term)
            })
        }

        if (grupoFilter) {
            list = list.filter((paciente) => paciente.grupoSanguineoId === grupoFilter)
        }

        if (estadoFilter === 'registrado') {
            list = list.filter(Boolean)
        }

        return list
    }, [data?.items, hcFilter, docFilter, grupoFilter, estadoFilter])

    const totalPacientes = data?.totalRecords ?? 0
    const totalFiltered = filteredPacientes.length

    const pacientes = useMemo(() => {
        const start = (page - 1) * pageSize
        return filteredPacientes.slice(start, start + pageSize)
    }, [filteredPacientes, page, pageSize])

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

    const handleSubmit = async (values: PacienteFormValues | PacienteUpdateFormValues) => {
        if (editingPaciente) {
            await updatePaciente.mutateAsync({
                id: editingPaciente.id,
                data: toUpdatePacientePayload(values as PacienteUpdateFormValues),
            })
        } else {
            await createPaciente.mutateAsync(toCreatePacientePayload(values as PacienteFormValues))
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
        setHcFilter('')
        setDocFilter('')
        setGrupoFilter(null)
        setEstadoFilter('all')
        setPage(1)
    }

    const handleNuevaAtencion = (_paciente: Paciente) => {
        void navigate({ to: '/atencion-medica/recepcion' })
    }

    const caption = `${totalFiltered} de ${totalPacientes} paciente${totalPacientes === 1 ? '' : 's'}${
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
                                value={hcFilter}
                                onChange={(event) => {
                                    setHcFilter(event.target.value)
                                    setPage(1)
                                }}
                            />

                            <Input
                                allowClear
                                size="small"
                                className="pacientes-module__filter-input"
                                placeholder="Documento"
                                value={docFilter}
                                onChange={(event) => {
                                    setDocFilter(event.target.value)
                                    setPage(1)
                                }}
                            />

                            <Select
                                allowClear
                                size="small"
                                className="pacientes-module__filter-select"
                                placeholder="Grupo sanguíneo"
                                options={grupoSanguineoOptions}
                                value={grupoFilter ?? undefined}
                                onChange={(value) => {
                                    setGrupoFilter(value ?? null)
                                    setPage(1)
                                }}
                            />

                            <Select
                                size="small"
                                className="pacientes-module__filter-select"
                                placeholder="Estado"
                                value={estadoFilter}
                                options={[
                                    { label: 'Todos', value: 'all' },
                                    { label: 'Registrado', value: 'registrado' },
                                ]}
                                onChange={(value) => {
                                    setEstadoFilter(value)
                                    setPage(1)
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
                            total={totalFiltered}
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
                        <Descriptions.Item label="Paciente">
                            {viewingPaciente.personaNombreCompleto}
                        </Descriptions.Item>
                        <Descriptions.Item label="Historia clínica">
                            {viewingPaciente.numeroHistoriaClinica}
                        </Descriptions.Item>
                        <Descriptions.Item label="Grupo sanguíneo">
                            {viewingPaciente.grupoSanguineoNombre || '—'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Alergias">
                            {viewingPaciente.alergias || '—'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Observaciones">
                            {viewingPaciente.observaciones || '—'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Fecha de registro">
                            {formatDate(viewingPaciente.fechaRegistro)}
                        </Descriptions.Item>
                        <Descriptions.Item label="Estado">Registrado</Descriptions.Item>
                    </Descriptions>
                ) : null}
            </Modal>
        </div>
    )
}
