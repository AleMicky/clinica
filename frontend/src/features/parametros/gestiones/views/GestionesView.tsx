import { useEffect, useState } from 'react'
import {
    Button,
    Flex,
    Input,
    Skeleton,
    Typography,
    theme,
} from 'antd'
import {
    CalendarOutlined,
    EditOutlined,
    PlusOutlined,
    SearchOutlined,
    UnorderedListOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'

import { StatusBadge } from '../../../../shared/components/ui/status-badge/StatusBadge'
import { GestionFormDrawer } from '../components/GestionFormDrawer'
import { GestionesList } from '../components/GestionesList'
import { PeriodoFormDrawer } from '../components/PeriodoFormDrawer'
import { PeriodosTable } from '../components/PeriodosTable'
import {
    useCreateGestion,
    useDeleteGestion,
    useGestiones,
    usePeriodos,
    useUpdateGestion,
    useUpdatePeriodo,
} from '../hooks/gestiones.hooks'
import type {
    GestionFormValues,
    PeriodoFormValues,
} from '../schemas/gestiones.schema'
import type { Gestion, Periodo } from '../types/gestiones.types'

const { Text } = Typography

const DEFAULT_PAGE_SIZE = 12

type PanelEmptyProps = {
    icon: React.ReactNode
    title: string
    description: string
}

function PanelEmpty({ icon, title, description }: PanelEmptyProps) {
    return (
        <div className="catalogos-view__panel-empty">
            <div className="catalogos-view__panel-empty-ring" aria-hidden>
                <span className="catalogos-view__panel-empty-icon">{icon}</span>
            </div>
            <Text strong className="catalogos-view__panel-empty-title">
                {title}
            </Text>
            <Text type="secondary" className="catalogos-view__panel-empty-desc">
                {description}
            </Text>
        </div>
    )
}

function PeriodosSkeleton() {
    return (
        <div className="catalogos-view__items-skeleton" aria-busy aria-label="Cargando periodos">
            {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="catalogos-view__items-skeleton-row">
                    <Skeleton.Input active size="small" style={{ width: 64 }} />
                    <Skeleton.Input active size="small" style={{ flex: 1 }} />
                    <Skeleton.Input active size="small" style={{ width: 96 }} />
                    <Skeleton.Input active size="small" style={{ width: 96 }} />
                    <Skeleton.Input active size="small" style={{ width: 40 }} />
                </div>
            ))}
        </div>
    )
}

function formatDateRange(inicio: string, fin: string) {
    return `${dayjs(inicio).format('DD/MM/YYYY')} → ${dayjs(fin).format('DD/MM/YYYY')}`
}

export function GestionesView() {
    const { token } = theme.useToken()

    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
    const [search, setSearch] = useState('')
    const [searchInput, setSearchInput] = useState('')
    const [selectedGestion, setSelectedGestion] = useState<Gestion | null>(null)

    const [gestionDrawerOpen, setGestionDrawerOpen] = useState(false)
    const [editingGestion, setEditingGestion] = useState<Gestion | null>(null)
    const [deletingGestionId, setDeletingGestionId] = useState<string | null>(null)

    const [periodoDrawerOpen, setPeriodoDrawerOpen] = useState(false)
    const [editingPeriodo, setEditingPeriodo] = useState<Periodo | null>(null)

    const { data, isLoading: isLoadingGestiones } = useGestiones({
        page,
        pageSize,
        search: search || undefined,
    })

    const { data: periodosData, isFetching: isLoadingPeriodos } = usePeriodos(
        {
            page: 1,
            pageSize: 12,
            gestionId: selectedGestion?.id,
        },
        Boolean(selectedGestion?.id),
    )

    const createGestion = useCreateGestion()
    const updateGestion = useUpdateGestion()
    const deleteGestion = useDeleteGestion()
    const updatePeriodo = useUpdatePeriodo()

    const isSavingGestion = createGestion.isPending || updateGestion.isPending
    const isSavingPeriodo = updatePeriodo.isPending

    const gestiones = data?.items ?? []
    const totalGestiones = data?.totalRecords ?? 0
    const periodos = periodosData?.items ?? []

    useEffect(() => {
        if (!selectedGestion || !gestiones.length) return

        const updated = gestiones.find((g) => g.id === selectedGestion.id)

        if (!updated) {
            setSelectedGestion(gestiones[0] ?? null)
            return
        }

        if (
            updated.literal !== selectedGestion.literal ||
            updated.gestion !== selectedGestion.gestion ||
            updated.activa !== selectedGestion.activa ||
            updated.fechaInicio !== selectedGestion.fechaInicio ||
            updated.fechaFin !== selectedGestion.fechaFin
        ) {
            setSelectedGestion(updated)
        }
    }, [gestiones, selectedGestion])

    useEffect(() => {
        if (selectedGestion || isLoadingGestiones || gestiones.length === 0) return
        setSelectedGestion(gestiones[0])
    }, [gestiones, isLoadingGestiones, selectedGestion])

    const openCreateGestion = () => {
        setEditingGestion(null)
        setGestionDrawerOpen(true)
    }

    const openEditGestion = (gestion: Gestion) => {
        setEditingGestion(gestion)
        setGestionDrawerOpen(true)
    }

    const closeGestionDrawer = () => {
        if (isSavingGestion) return
        setGestionDrawerOpen(false)
        setEditingGestion(null)
    }

    const handleSubmitGestion = async (values: GestionFormValues) => {
        if (editingGestion) {
            await updateGestion.mutateAsync({ id: editingGestion.id, data: values })
        } else {
            await createGestion.mutateAsync(values)
        }
        closeGestionDrawer()
    }

    const handleDeleteGestion = async (gestion: Gestion) => {
        setDeletingGestionId(gestion.id)
        try {
            await deleteGestion.mutateAsync(gestion.id)
            if (selectedGestion?.id === gestion.id) {
                setSelectedGestion(null)
            }
        } finally {
            setDeletingGestionId(null)
        }
    }

    const openEditPeriodo = (periodo: Periodo) => {
        setEditingPeriodo(periodo)
        setPeriodoDrawerOpen(true)
    }

    const closePeriodoDrawer = () => {
        if (isSavingPeriodo) return
        setPeriodoDrawerOpen(false)
        setEditingPeriodo(null)
    }

    const handleSubmitPeriodo = async (values: PeriodoFormValues) => {
        if (!editingPeriodo) return
        await updatePeriodo.mutateAsync({ id: editingPeriodo.id, data: values })
        closePeriodoDrawer()
    }

    const handleSearch = (value: string) => {
        setSearch(value.trim())
        setPage(1)
        setSelectedGestion(null)
    }

    const handlePageChange = (nextPage: number, nextPageSize: number) => {
        setPage(nextPage)
        setPageSize(nextPageSize)
    }

    const periodoCountLabel = `${periodos.length} periodo${periodos.length === 1 ? '' : 's'}`

    return (
        <div className="module-object-page__panel catalogos-view catalogos-view--compact catalogos-view--erp">
            <div className="catalogos-view__split">
                <aside className="catalogos-view__sidebar">
                    <div className="catalogos-view__sidebar-head">
                        <Flex align="center" gap={8} className="catalogos-view__sidebar-title">
                            <span className="catalogos-view__sidebar-icon" aria-hidden>
                                <CalendarOutlined />
                            </span>
                            <div className="catalogos-view__sidebar-title-text">
                                <Text strong className="catalogos-view__sidebar-label">
                                    Gestiones
                                </Text>
                                <Text type="secondary" className="catalogos-view__sidebar-count">
                                    {totalGestiones}
                                </Text>
                            </div>
                        </Flex>
                        <Button
                            type="primary"
                            size="small"
                            icon={<PlusOutlined />}
                            onClick={openCreateGestion}
                            aria-label="Crear nueva gestión"
                        >
                            Nueva
                        </Button>
                    </div>

                    <div className="catalogos-view__sidebar-search">
                        <Input
                            allowClear
                            size="small"
                            className="catalogos-view__search-input"
                            prefix={
                                <SearchOutlined style={{ color: token.colorTextQuaternary }} />
                            }
                            placeholder="Buscar gestión…"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            onPressEnter={() => handleSearch(searchInput)}
                            onClear={() => {
                                setSearchInput('')
                                handleSearch('')
                            }}
                        />
                    </div>

                    <div className="catalogos-view__sidebar-body">
                        {!isLoadingGestiones && gestiones.length === 0 ? (
                            <PanelEmpty
                                icon={<CalendarOutlined />}
                                title="Sin gestiones"
                                description={
                                    search
                                        ? 'No se encontraron gestiones con ese criterio.'
                                        : 'Cree una gestión con el botón Nueva para comenzar.'
                                }
                            />
                        ) : (
                            <GestionesList
                                gestiones={gestiones}
                                loading={isLoadingGestiones}
                                total={totalGestiones}
                                page={page}
                                pageSize={pageSize}
                                selectedId={selectedGestion?.id ?? null}
                                onPageChange={handlePageChange}
                                onSelect={setSelectedGestion}
                                onEdit={openEditGestion}
                                onDelete={handleDeleteGestion}
                                deletingId={deletingGestionId}
                            />
                        )}
                    </div>
                </aside>

                <main
                    className={[
                        'catalogos-view__main',
                        selectedGestion ? 'catalogos-view__main--active' : '',
                    ]
                        .filter(Boolean)
                        .join(' ')}
                >
                    {selectedGestion ? (
                        <>
                            <div className="catalogos-view__catalog-card">
                                <div className="catalogos-view__catalog-card-main">
                                    <span className="catalogos-view__catalog-badge">
                                        {selectedGestion.gestion}
                                    </span>
                                    <div className="catalogos-view__catalog-info">
                                        <Flex align="center" gap={8} wrap="wrap">
                                            <Text strong className="catalogos-view__catalog-name">
                                                {selectedGestion.literal ||
                                                    `Gestión ${selectedGestion.gestion}`}
                                            </Text>
                                            <StatusBadge
                                                active={selectedGestion.activa}
                                                activeLabel="Activa"
                                                inactiveLabel="Inactiva"
                                            />
                                        </Flex>
                                        <Text
                                            type="secondary"
                                            className="catalogos-view__catalog-desc"
                                        >
                                            {formatDateRange(
                                                selectedGestion.fechaInicio,
                                                selectedGestion.fechaFin,
                                            )}
                                        </Text>
                                    </div>
                                </div>

                                <Flex
                                    align="center"
                                    gap={10}
                                    wrap="wrap"
                                    className="catalogos-view__catalog-actions"
                                >
                                    <span className="catalogos-view__catalog-count">
                                        {periodoCountLabel}
                                    </span>
                                    <Button
                                        size="small"
                                        icon={<EditOutlined />}
                                        onClick={() => openEditGestion(selectedGestion)}
                                    >
                                        Editar
                                    </Button>
                                </Flex>
                            </div>

                            <div className="catalogos-view__main-body">
                                {isLoadingPeriodos && periodos.length === 0 ? (
                                    <PeriodosSkeleton />
                                ) : !isLoadingPeriodos && periodos.length === 0 ? (
                                    <PanelEmpty
                                        icon={<UnorderedListOutlined />}
                                        title="Sin periodos"
                                        description="Esta gestión aún no tiene periodos registrados."
                                    />
                                ) : (
                                    <div className="catalogos-view__table">
                                        <PeriodosTable
                                            items={periodos}
                                            loading={isLoadingPeriodos}
                                            onEdit={openEditPeriodo}
                                        />
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="catalogos-view__main-empty">
                            <PanelEmpty
                                icon={<CalendarOutlined />}
                                title="Seleccione una gestión"
                                description="Elija una gestión del panel izquierdo para ver y editar sus periodos (1–12)."
                            />
                        </div>
                    )}
                </main>
            </div>

            <GestionFormDrawer
                open={gestionDrawerOpen}
                entity={editingGestion}
                loading={isSavingGestion}
                onClose={closeGestionDrawer}
                onSubmit={handleSubmitGestion}
            />

            <PeriodoFormDrawer
                open={periodoDrawerOpen}
                entity={editingPeriodo}
                loading={isSavingPeriodo}
                onClose={closePeriodoDrawer}
                onSubmit={handleSubmitPeriodo}
            />
        </div>
    )
}
