import { useEffect, useRef, useState } from 'react'
import {
    FormOutlined,
    PlusOutlined,
    SearchOutlined,
    UnorderedListOutlined,
} from '@ant-design/icons'
import { useQueryClient } from '@tanstack/react-query'
import { Badge, Button, Flex, Input, Tabs, theme } from 'antd'

import { queryKeys } from '../../../shared/constants/query-keys'
import { catalogoGruposService } from '../../parametros/catalogos/services/catalogo-grupos.service'
import { AtencionFormModal } from '../components/AtencionFormModal'
import { AtencionRecepcionForm } from '../components/AtencionRecepcionForm'
import { AtencionesTable } from '../components/AtencionesTable'
import { tiposAtencionService } from '../services/atencion-medica.service'
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

const DEFAULT_PAGE_SIZE = 20
const SEARCH_DEBOUNCE_MS = 400

type RecepcionTab = 'recepcion' | 'registros'

export function AtencionesView() {
    const { token } = theme.useToken()
    const queryClient = useQueryClient()
    const [activeTab, setActiveTab] = useState<RecepcionTab>('recepcion')
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
    const [search, setSearch] = useState('')
    const [searchInput, setSearchInput] = useState('')
    const [modalOpen, setModalOpen] = useState(false)
    const [editingAtencion, setEditingAtencion] = useState<Atencion | null>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null)

    const onSearchRef = useRef((value: string) => {
        setSearch(value.trim())
        setPage(1)
    })

    useEffect(() => {
        onSearchRef.current = (value: string) => {
            setSearch(value.trim())
            setPage(1)
        }
    })

    useEffect(() => {
        const timer = window.setTimeout(() => {
            onSearchRef.current(searchInput)
        }, SEARCH_DEBOUNCE_MS)

        return () => window.clearTimeout(timer)
    }, [searchInput])

    useEffect(() => {
        const tiposQuery = { page: 1, pageSize: 100 }

        void queryClient.prefetchQuery({
            queryKey: [...queryKeys.catalogoGrupos.all, 'grouped'] as const,
            queryFn: () => catalogoGruposService.getGroupedItems(),
            staleTime: 30 * 60 * 1000,
        })
        void queryClient.prefetchQuery({
            queryKey: queryKeys.atencionMedica.tiposAtencion.list(tiposQuery),
            queryFn: () => tiposAtencionService.getPaged(tiposQuery),
            staleTime: 10 * 60 * 1000,
        })
    }, [queryClient])

    const { data, isLoading, isFetching } = useAtenciones({
        page,
        pageSize,
        search: search || undefined,
    })
    const recepcionarAtencion = useRecepcionarAtencion()
    const updateAtencion = useUpdateAtencion()
    const deleteAtencion = useDeleteAtencion()

    const atenciones = data?.items ?? []
    const totalAtenciones = data?.totalRecords ?? 0
    // Solo spinner en carga inicial; el refetch en segundo plano no bloquea la tabla.
    const tableLoading = isLoading || (isFetching && !data)
    const caption = `${totalAtenciones} registro${totalAtenciones === 1 ? '' : 's'}`

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

    const handleSearch = (value: string) => {
        setSearchInput(value)
        setSearch(value.trim())
        setPage(1)
    }

    return (
        <div className="module-object-page__panel atenciones-recepcion-view">
            <Tabs
                activeKey={activeTab}
                onChange={(key) => setActiveTab(key as RecepcionTab)}
                className="atenciones-recepcion-view__tabs"
                destroyOnHidden
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
                            <div className="atenciones-recepcion-view__registros">
                                <div className="rrhh-section-panel rrhh-atenciones">
                                    <div className="rrhh-section-panel__filters">
                                        <Flex
                                            gap={6}
                                            wrap="wrap"
                                            align="center"
                                            className="rrhh-atenciones__filters"
                                            role="search"
                                            aria-label="Filtros de atenciones"
                                        >
                                            <Input
                                                allowClear
                                                size="small"
                                                className="rrhh-atenciones__filter-search"
                                                prefix={
                                                    <SearchOutlined
                                                        style={{
                                                            color: token.colorTextQuaternary,
                                                        }}
                                                    />
                                                }
                                                placeholder="Buscar por trámite, paciente, HC u observaciones…"
                                                value={searchInput}
                                                onChange={(event) =>
                                                    setSearchInput(event.target.value)
                                                }
                                                onPressEnter={() => handleSearch(searchInput)}
                                                onClear={() => handleSearch('')}
                                                aria-label="Buscar atención"
                                            />
                                        </Flex>
                                        <Flex
                                            gap={6}
                                            wrap="wrap"
                                            align="center"
                                            className="rrhh-section-panel__actions"
                                        >
                                            <Button
                                                type="primary"
                                                size="small"
                                                icon={<PlusOutlined />}
                                                onClick={() => setActiveTab('recepcion')}
                                                aria-label="Nueva recepción"
                                            >
                                                Nueva recepción
                                            </Button>
                                        </Flex>
                                    </div>
                                    <div className="rrhh-section-panel__body">
                                        <p className="rrhh-section-panel__caption rrhh-atenciones__caption">
                                            {caption}
                                        </p>
                                        <AtencionesTable
                                            atenciones={atenciones}
                                            loading={tableLoading}
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
                                            className="rrhh-atenciones__table"
                                        />
                                    </div>
                                </div>
                            </div>
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
