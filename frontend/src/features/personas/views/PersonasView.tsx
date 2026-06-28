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
    IdcardOutlined,
    PlusOutlined,
    SearchOutlined,
} from '@ant-design/icons'

import { PersonaFormModal } from '../components/PersonaFormModal'
import { PersonasTable } from '../components/PersonasTable'
import {
    useCreatePersona,
    useDeletePersona,
    usePersonas,
    useUpdatePersona,
} from '../hooks/personas.hooks'
import {
    toCreatePersonaPayload,
    toUpdatePersonaPayload,
    type PersonaFormValues,
} from '../schemas/persona.schema'
import type { Persona } from '../types/persona.types'

const { Title, Text } = Typography
const { useBreakpoint } = Grid

const DEFAULT_PAGE_SIZE = 20

export function PersonasView() {
    const { token } = theme.useToken()
    const screens = useBreakpoint()
    const isStacked = !screens.lg

    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
    const [search, setSearch] = useState('')
    const [searchInput, setSearchInput] = useState('')
    const [modalOpen, setModalOpen] = useState(false)
    const [editingPersona, setEditingPersona] = useState<Persona | null>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null)

    const { data, isFetching } = usePersonas({
        page,
        pageSize,
        search: search || undefined,
    })

    const createPersona = useCreatePersona()
    const updatePersona = useUpdatePersona()
    const deletePersona = useDeletePersona()

    const personas = data?.items ?? []
    const totalPersonas = data?.totalRecords ?? 0
    const isSaving = createPersona.isPending || updatePersona.isPending

    const openCreateModal = () => {
        setEditingPersona(null)
        setModalOpen(true)
    }

    const openEditModal = (persona: Persona) => {
        setEditingPersona(persona)
        setModalOpen(true)
    }

    const closeModal = () => {
        if (isSaving) return
        setModalOpen(false)
        setEditingPersona(null)
    }

    const handleSubmit = async (values: PersonaFormValues) => {
        if (editingPersona) {
            await updatePersona.mutateAsync({
                id: editingPersona.id,
                data: toUpdatePersonaPayload(values),
            })
        } else {
            await createPersona.mutateAsync(toCreatePersonaPayload(values))
        }

        closeModal()
    }

    const handleDelete = async (persona: Persona) => {
        setDeletingId(persona.id)

        try {
            await deletePersona.mutateAsync(persona.id)
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
                            <IdcardOutlined />
                        </div>
                        <div>
                            <Title level={3} className="admin-page__title">
                                Personas
                            </Title>
                            <Text type="secondary">
                                Registre y administre los datos personales base del sistema.
                            </Text>
                        </div>
                    </Flex>

                    <Flex gap={12} wrap="wrap" className="admin-page__header-stats">
                        <div className="admin-page__stat">
                            <Statistic
                                title="Registradas"
                                value={totalPersonas}
                                prefix={<IdcardOutlined />}
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
                            <Text strong>Directorio de personas</Text>
                            <Text type="secondary" className="admin-page__panel-caption">
                                {totalPersonas} registrada{totalPersonas === 1 ? '' : 's'}
                                {search ? ` · filtrando por "${search}"` : ''}
                            </Text>
                        </div>
                        <Button
                            type="primary"
                            size="small"
                            icon={<PlusOutlined />}
                            onClick={openCreateModal}
                        >
                            Nueva persona
                        </Button>
                    </div>

                    <div className="admin-page__panel-search">
                        <Input
                            allowClear
                            prefix={<SearchOutlined style={{ color: token.colorTextQuaternary }} />}
                            placeholder="Buscar por documento o nombre…"
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
                            <Text strong>Listado de personas</Text>
                            <Text type="secondary" className="admin-page__section-count">
                                {personas.length} en esta página
                            </Text>
                        </Flex>

                        <PersonasTable
                            personas={personas}
                            loading={isFetching}
                            total={totalPersonas}
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

            <PersonaFormModal
                open={modalOpen}
                persona={editingPersona}
                loading={isSaving}
                onClose={closeModal}
                onSubmit={handleSubmit}
            />
        </div>
    )
}
