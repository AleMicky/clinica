import { useState } from 'react'
import {
    FormOutlined,
    UnorderedListOutlined,
    UserAddOutlined,
} from '@ant-design/icons'
import { Badge, Tabs, Typography } from 'antd'

import { ModuleSectionPanel } from '../../../shared/components/ui/module-page/ModuleSectionPanel'
import { AtencionFormModal } from '../components/AtencionFormModal'
import { AtencionRecepcionForm } from '../components/AtencionRecepcionForm'
import { AtencionesTable } from '../components/AtencionesTable'
import {
    useAtenciones,
    useDeleteAtencion,
    useRecepcionarAtencion,
    useUpdateAtencion,
} from '../hooks/atencion-medica.hooks'
import {
    toRecepcionarAtencionPayload,
    toUpdateAtencionPayload,
    type AtencionFormValues,
    type RecepcionFormValues,
} from '../schemas/atencion.schema'
import type { Atencion } from '../types/atencion-medica.types'

const { Text, Title } = Typography

const DEFAULT_PAGE_SIZE = 20

type RecepcionTab = 'recepcion' | 'registros'

export function AtencionesView() {
    const [activeTab, setActiveTab] = useState<RecepcionTab>('recepcion')
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
    const [search, setSearch] = useState('')
    const [searchInput, setSearchInput] = useState('')
    const [modalOpen, setModalOpen] = useState(false)
    const [editingAtencion, setEditingAtencion] = useState<Atencion | null>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null)

    const { data, isFetching } = useAtenciones({
        page,
        pageSize,
        search: search || undefined,
    })
    const recepcionarAtencion = useRecepcionarAtencion()
    const updateAtencion = useUpdateAtencion()
    const deleteAtencion = useDeleteAtencion()

    const atenciones = data?.items ?? []
    const totalAtenciones = data?.totalRecords ?? 0

    const openEditModal = (atencion: Atencion) => {
        setEditingAtencion(atencion)
        setModalOpen(true)
    }

    const closeModal = () => {
        if (updateAtencion.isPending) return
        setModalOpen(false)
        setEditingAtencion(null)
    }

    const handleRecepcion = async (values: RecepcionFormValues) => {
        await recepcionarAtencion.mutateAsync(toRecepcionarAtencionPayload(values))
        setActiveTab('registros')
        setPage(1)
    }

    const handleUpdate = async (values: AtencionFormValues) => {
        if (!editingAtencion) return

        await updateAtencion.mutateAsync({
            id: editingAtencion.id,
            data: toUpdateAtencionPayload(values),
        })
        closeModal()
    }

    const handleDelete = async (atencion: Atencion) => {
        setDeletingId(atencion.id)

        try {
            await deleteAtencion.mutateAsync(atencion.id)
        } finally {
            setDeletingId(null)
        }
    }

    return (
        <div className="module-object-page__panel atenciones-recepcion-view">
            <Tabs
                activeKey={activeTab}
                onChange={(key) => setActiveTab(key as RecepcionTab)}
                className="atenciones-recepcion-view__tabs"
                items={[
                    {
                        key: 'recepcion',
                        label: (
                            <span className="atenciones-recepcion-view__tab-label">
                                <FormOutlined />
                                Recepción
                            </span>
                        ),
                        children: (
                            <div className="atenciones-recepcion-view__recepcion">
                                <header className="atenciones-recepcion-view__hero">
                                    <div
                                        className="atenciones-recepcion-view__hero-icon"
                                        aria-hidden
                                    >
                                        <UserAddOutlined />
                                    </div>
                                    <div className="atenciones-recepcion-view__hero-text">
                                        <Title
                                            level={4}
                                            className="atenciones-recepcion-view__hero-title"
                                        >
                                            Nueva recepción
                                        </Title>
                                        <Text
                                            type="secondary"
                                            className="atenciones-recepcion-view__hero-subtitle"
                                        >
                                            Busque o complete al paciente, elija el tipo y
                                            recepcione con un solo botón.
                                        </Text>
                                    </div>
                                </header>

                                <div className="atenciones-recepcion-view__form-card">
                                    <AtencionRecepcionForm
                                        loading={recepcionarAtencion.isPending}
                                        onSubmit={handleRecepcion}
                                        submitLabel="Recepcionar atención"
                                    />
                                </div>
                            </div>
                        ),
                    },
                    {
                        key: 'registros',
                        label: (
                            <span className="atenciones-recepcion-view__tab-label">
                                <UnorderedListOutlined />
                                Registros
                                <Badge
                                    count={totalAtenciones}
                                    overflowCount={999}
                                    className="atenciones-recepcion-view__tab-badge"
                                    showZero
                                />
                            </span>
                        ),
                        children: (
                            <ModuleSectionPanel
                                title="Atenciones registradas"
                                caption={`${totalAtenciones} registro${totalAtenciones === 1 ? '' : 's'}`}
                                searchPlaceholder="Buscar por trámite u observaciones…"
                                searchValue={searchInput}
                                onSearchChange={setSearchInput}
                                onSearch={(value) => {
                                    setSearch(value)
                                    setPage(1)
                                }}
                                actionLabel="Nueva recepción"
                                onAction={() => setActiveTab('recepcion')}
                            >
                                <AtencionesTable
                                    atenciones={atenciones}
                                    loading={isFetching}
                                    total={totalAtenciones}
                                    page={page}
                                    pageSize={pageSize}
                                    onPageChange={(nextPage, nextPageSize) => {
                                        setPage(nextPage)
                                        setPageSize(nextPageSize)
                                    }}
                                    onEdit={openEditModal}
                                    onDelete={handleDelete}
                                    deletingId={deletingId}
                                />
                            </ModuleSectionPanel>
                        ),
                    },
                ]}
            />

            <AtencionFormModal
                open={modalOpen}
                atencion={editingAtencion}
                loading={updateAtencion.isPending}
                onClose={closeModal}
                onSubmit={handleUpdate}
            />
        </div>
    )
}
