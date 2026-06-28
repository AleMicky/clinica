import { useState } from 'react'
import {
    Button,
    Flex,
    Grid,
    Input,
    Statistic,
    Typography,
    theme,
} from 'antd'
import {
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
import type { Paciente } from '../types/paciente.types'

const { Title, Text } = Typography
const { useBreakpoint } = Grid

const DEFAULT_PAGE_SIZE = 20

export function PacientesView() {
    const { token } = theme.useToken()
    const screens = useBreakpoint()
    const isStacked = !screens.lg

    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
    const [search, setSearch] = useState('')
    const [searchInput, setSearchInput] = useState('')
    const [modalOpen, setModalOpen] = useState(false)
    const [editingPaciente, setEditingPaciente] = useState<Paciente | null>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null)

    const { data, isFetching } = usePacientes({
        page,
        pageSize,
        search: search || undefined,
    })

    const createPaciente = useCreatePaciente()
    const updatePaciente = useUpdatePaciente()
    const deletePaciente = useDeletePaciente()

    const pacientes = data?.items ?? []
    const totalPacientes = data?.totalRecords ?? 0
    const isSaving = createPaciente.isPending || updatePaciente.isPending

    const openCreateModal = () => {
        setEditingPaciente(null)
        setModalOpen(true)
    }

    const openEditModal = (paciente: Paciente) => {
        setEditingPaciente(paciente)
        setModalOpen(true)
    }

    const closeModal = () => {
        if (isSaving) return
        setModalOpen(false)
        setEditingPaciente(null)
    }

    const handleSubmit = async (values: PacienteFormValues) => {
        if (editingPaciente) {
            await updatePaciente.mutateAsync({
                id: editingPaciente.id,
                data: toUpdatePacientePayload(values),
            })
        } else {
            await createPaciente.mutateAsync(toCreatePacientePayload(values))
        }

        closeModal()
    }

    const handleDelete = async (paciente: Paciente) => {
        setDeletingId(paciente.id)

        try {
            await deletePaciente.mutateAsync(paciente.id)
        } finally {
            setDeletingId(null)
        }
    }

    const handleSearch = (value: string) => {
        setSearch(value.trim())
        setPage(1)
    }

    const handlePageChange = (nextPage: number, nextPageSize: number) => {
        setPage(nextPage)
        setPageSize(nextPageSize)
    }

    return (
        <div className="admin-page">
            <header className="admin-page__header">
                <Flex
                    justify="space-between"
                    align={isStacked ? 'flex-start' : 'center'}
                    gap={16}
                    wrap="wrap"
                >
                    <Flex align="center" gap={16}>
                        <div className="admin-page__header-icon" aria-hidden>
                            <TeamOutlined />
                        </div>
                        <div>
                            <Title level={3} className="admin-page__title">
                                Pacientes
                            </Title>
                            <Text type="secondary">
                                Administre las fichas clínicas vinculadas a personas registradas.
                            </Text>
                        </div>
                    </Flex>

                    <Flex gap={12} wrap="wrap" className="admin-page__header-stats">
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
                        <div>
                            <Text strong>Directorio de pacientes</Text>
                            <Text type="secondary" className="admin-page__panel-caption">
                                {totalPacientes} registrado{totalPacientes === 1 ? '' : 's'}
                                {search ? ` · filtrando por "${search}"` : ''}
                            </Text>
                        </div>
                        <Button
                            type="primary"
                            size="small"
                            icon={<PlusOutlined />}
                            onClick={openCreateModal}
                        >
                            Nuevo paciente
                        </Button>
                    </div>

                    <div className="admin-page__panel-search">
                        <Input
                            allowClear
                            prefix={<SearchOutlined style={{ color: token.colorTextQuaternary }} />}
                            placeholder="Buscar por historia clínica o nombre…"
                            value={searchInput}
                            onChange={(event) => setSearchInput(event.target.value)}
                            onPressEnter={() => handleSearch(searchInput)}
                            onClear={() => {
                                setSearchInput('')
                                handleSearch('')
                            }}
                        />
                    </div>

                    <div className="admin-page__panel-body">
                        <Flex
                            justify="space-between"
                            align="center"
                            className="admin-page__section-head"
                        >
                            <Text strong>Listado de pacientes</Text>
                            <Text type="secondary" className="admin-page__section-count">
                                {pacientes.length} en esta página
                            </Text>
                        </Flex>

                        <PacientesTable
                            pacientes={pacientes}
                            loading={isFetching}
                            total={totalPacientes}
                            page={page}
                            pageSize={pageSize}
                            onPageChange={handlePageChange}
                            onEdit={openEditModal}
                            onDelete={handleDelete}
                            deletingId={deletingId}
                        />
                    </div>
                </section>
            </div>

            <PacienteFormModal
                open={modalOpen}
                paciente={editingPaciente}
                loading={isSaving}
                onClose={closeModal}
                onSubmit={handleSubmit}
            />
        </div>
    )
}
