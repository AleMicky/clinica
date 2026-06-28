import { useEffect, useMemo, useState } from 'react'
import {
    Button,
    Flex,
    Input,
    Skeleton,
    Typography,
    theme,
} from 'antd'
import {
    AppstoreOutlined,
    FolderOpenOutlined,
    PlusOutlined,
    SearchOutlined,
    UnorderedListOutlined,
} from '@ant-design/icons'

import { CatalogoGrupoFormModal } from '../components/CatalogoGrupoFormModal'
import { CatalogoGruposList } from '../components/CatalogoGruposList'
import { CatalogoItemFormModal } from '../components/CatalogoItemFormModal'
import { CatalogoItemsTable } from '../components/CatalogoItemsTable'
import {
    useCatalogoGrupoItems,
    useCatalogoGrupos,
    useCreateCatalogoGrupo,
    useDeleteCatalogoGrupo,
    useUpdateCatalogoGrupo,
} from '../hooks/catalogo-grupos.hooks'
import {
    useCreateCatalogoItem,
    useDeleteCatalogoItem,
    useUpdateCatalogoItem,
} from '../hooks/catalogo-items.hooks'
import type {
    CreateCatalogoGrupoFormValues,
    UpdateCatalogoGrupoFormValues,
} from '../schemas/catalogo-grupo.schema'
import type { CatalogoItemFormValues } from '../schemas/catalogo-item.schema'
import type { CatalogoGrupo, CatalogoItem } from '../types/catalogo.types'

const { Text } = Typography

const DEFAULT_PAGE_SIZE = 12

type CatalogosPanelEmptyProps = {
    icon: React.ReactNode
    title: string
    description: string
}

function CatalogosPanelEmpty({ icon, title, description }: CatalogosPanelEmptyProps) {
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

function CatalogosItemsSkeleton() {
    return (
        <div className="catalogos-view__items-skeleton" aria-busy aria-label="Cargando registros">
            {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="catalogos-view__items-skeleton-row">
                    <Skeleton.Input active size="small" style={{ width: 88 }} />
                    <Skeleton.Input active size="small" style={{ flex: 1 }} />
                    <Skeleton.Input active size="small" style={{ width: 72 }} />
                    <Skeleton.Input active size="small" style={{ width: 48 }} />
                </div>
            ))}
        </div>
    )
}

export function CatalogosView() {
    const { token } = theme.useToken()

    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
    const [search, setSearch] = useState('')
    const [searchInput, setSearchInput] = useState('')
    const [itemSearchInput, setItemSearchInput] = useState('')
    const [selectedGrupo, setSelectedGrupo] = useState<CatalogoGrupo | null>(null)

    const [grupoModalOpen, setGrupoModalOpen] = useState(false)
    const [editingGrupo, setEditingGrupo] = useState<CatalogoGrupo | null>(null)
    const [deletingGrupoId, setDeletingGrupoId] = useState<string | null>(null)

    const [itemModalOpen, setItemModalOpen] = useState(false)
    const [editingItem, setEditingItem] = useState<CatalogoItem | null>(null)
    const [deletingItemId, setDeletingItemId] = useState<string | null>(null)

    const { data, isLoading: isLoadingGrupos } = useCatalogoGrupos({
        page,
        pageSize,
        search: search || undefined,
    })
    const { data: items = [], isLoading: isLoadingItems } = useCatalogoGrupoItems(
        selectedGrupo?.id ?? null,
    )

    const createGrupo = useCreateCatalogoGrupo()
    const updateGrupo = useUpdateCatalogoGrupo()
    const deleteGrupo = useDeleteCatalogoGrupo()
    const createItem = useCreateCatalogoItem()
    const updateItem = useUpdateCatalogoItem()
    const deleteItem = useDeleteCatalogoItem()

    const isSavingGrupo = createGrupo.isPending || updateGrupo.isPending
    const isSavingItem = createItem.isPending || updateItem.isPending

    const grupos = data?.items ?? []
    const totalGrupos = data?.totalRecords ?? 0

    const filteredItems = useMemo(() => {
        const term = itemSearchInput.trim().toLowerCase()
        if (!term) return items

        return items.filter((item) => {
            const codigo = item.codigo.toLowerCase()
            const nombre = item.nombre.toLowerCase()
            const valor = item.valor?.toLowerCase() ?? ''

            return codigo.includes(term) || nombre.includes(term) || valor.includes(term)
        })
    }, [items, itemSearchInput])

    const itemSearchActive = itemSearchInput.trim().length > 0
    const showNoItemSearchResults =
        itemSearchActive && filteredItems.length === 0 && items.length > 0

    useEffect(() => {
        if (!selectedGrupo || !grupos.length) return

        const updatedGrupo = grupos.find((grupo) => grupo.id === selectedGrupo.id)

        if (!updatedGrupo) {
            setSelectedGrupo(grupos[0] ?? null)
            return
        }

        if (
            updatedGrupo.nombre !== selectedGrupo.nombre ||
            updatedGrupo.codigo !== selectedGrupo.codigo ||
            updatedGrupo.descripcion !== selectedGrupo.descripcion
        ) {
            setSelectedGrupo(updatedGrupo)
        }
    }, [grupos, selectedGrupo])

    useEffect(() => {
        if (selectedGrupo || isLoadingGrupos || grupos.length === 0) return
        setSelectedGrupo(grupos[0])
    }, [grupos, isLoadingGrupos, selectedGrupo])

    useEffect(() => {
        setItemSearchInput('')
    }, [selectedGrupo?.id])

    const openCreateGrupoModal = () => {
        setEditingGrupo(null)
        setGrupoModalOpen(true)
    }

    const openEditGrupoModal = (grupo: CatalogoGrupo) => {
        setEditingGrupo(grupo)
        setGrupoModalOpen(true)
    }

    const closeGrupoModal = () => {
        if (isSavingGrupo) return
        setGrupoModalOpen(false)
        setEditingGrupo(null)
    }

    const handleCreateGrupo = async (values: CreateCatalogoGrupoFormValues) => {
        await createGrupo.mutateAsync(values)
        closeGrupoModal()
    }

    const handleUpdateGrupo = async (values: UpdateCatalogoGrupoFormValues) => {
        if (!editingGrupo) return

        await updateGrupo.mutateAsync({ id: editingGrupo.id, data: values })
        closeGrupoModal()
    }

    const handleDeleteGrupo = async (grupo: CatalogoGrupo) => {
        setDeletingGrupoId(grupo.id)

        try {
            await deleteGrupo.mutateAsync(grupo.id)

            if (selectedGrupo?.id === grupo.id) {
                setSelectedGrupo(null)
            }
        } finally {
            setDeletingGrupoId(null)
        }
    }

    const openCreateItemModal = () => {
        setEditingItem(null)
        setItemModalOpen(true)
    }

    const openEditItemModal = (item: CatalogoItem) => {
        setEditingItem(item)
        setItemModalOpen(true)
    }

    const closeItemModal = () => {
        if (isSavingItem) return
        setItemModalOpen(false)
        setEditingItem(null)
    }

    const handleSubmitItem = async (values: CatalogoItemFormValues) => {
        if (editingItem) {
            await updateItem.mutateAsync({ id: editingItem.id, data: values })
        } else {
            await createItem.mutateAsync(values)
        }

        closeItemModal()
    }

    const handleDeleteItem = async (item: CatalogoItem) => {
        setDeletingItemId(item.id)

        try {
            await deleteItem.mutateAsync(item.id)
        } finally {
            setDeletingItemId(null)
        }
    }

    const handleSearch = (value: string) => {
        setSearch(value.trim())
        setPage(1)
        setSelectedGrupo(null)
    }

    const handlePageChange = (nextPage: number, nextPageSize: number) => {
        setPage(nextPage)
        setPageSize(nextPageSize)
    }

    const recordCountLabel = `${items.length} registro${items.length === 1 ? '' : 's'}`

    return (
        <div className="module-object-page__panel catalogos-view catalogos-view--compact catalogos-view--erp">
            <div className="catalogos-view__split">
                <aside className="catalogos-view__sidebar">
                    <div className="catalogos-view__sidebar-head">
                        <Flex align="center" gap={8} className="catalogos-view__sidebar-title">
                            <span className="catalogos-view__sidebar-icon" aria-hidden>
                                <AppstoreOutlined />
                            </span>
                            <div className="catalogos-view__sidebar-title-text">
                                <Text strong className="catalogos-view__sidebar-label">
                                    Catálogos
                                </Text>
                                <Text type="secondary" className="catalogos-view__sidebar-count">
                                    {totalGrupos}
                                </Text>
                            </div>
                        </Flex>
                        <Button
                            type="primary"
                            size="small"
                            icon={<PlusOutlined />}
                            onClick={openCreateGrupoModal}
                        >
                            Nuevo
                        </Button>
                    </div>

                    <div className="catalogos-view__sidebar-search">
                        <Input
                            allowClear
                            size="small"
                            className="catalogos-view__search-input"
                            prefix={<SearchOutlined style={{ color: token.colorTextQuaternary }} />}
                            placeholder="Buscar catálogo…"
                            value={searchInput}
                            onChange={(event) => setSearchInput(event.target.value)}
                            onPressEnter={() => handleSearch(searchInput)}
                            onClear={() => {
                                setSearchInput('')
                                handleSearch('')
                            }}
                        />
                    </div>

                    <div className="catalogos-view__sidebar-body">
                        {!isLoadingGrupos && grupos.length === 0 ? (
                            <CatalogosPanelEmpty
                                icon={<FolderOpenOutlined />}
                                title="Sin catálogos"
                                description={
                                    search
                                        ? 'No se encontraron catálogos con ese criterio.'
                                        : 'Cree un catálogo con el botón Nuevo para comenzar.'
                                }
                            />
                        ) : (
                            <CatalogoGruposList
                                grupos={grupos}
                                loading={isLoadingGrupos}
                                total={totalGrupos}
                                page={page}
                                pageSize={pageSize}
                                selectedGrupoId={selectedGrupo?.id ?? null}
                                onPageChange={handlePageChange}
                                onSelect={setSelectedGrupo}
                                onEdit={openEditGrupoModal}
                                onDelete={handleDeleteGrupo}
                                deletingId={deletingGrupoId}
                            />
                        )}
                    </div>
                </aside>

                <main
                    className={[
                        'catalogos-view__main',
                        selectedGrupo ? 'catalogos-view__main--active' : '',
                    ]
                        .filter(Boolean)
                        .join(' ')}
                >
                    {selectedGrupo ? (
                        <>
                            <div className="catalogos-view__catalog-card">
                                <div className="catalogos-view__catalog-card-main">
                                    <span className="catalogos-view__catalog-badge">
                                        {selectedGrupo.codigo}
                                    </span>
                                    <div className="catalogos-view__catalog-info">
                                        <Text strong className="catalogos-view__catalog-name">
                                            {selectedGrupo.nombre}
                                        </Text>
                                        {selectedGrupo.descripcion ? (
                                            <Text
                                                type="secondary"
                                                className="catalogos-view__catalog-desc"
                                            >
                                                {selectedGrupo.descripcion}
                                            </Text>
                                        ) : null}
                                    </div>
                                </div>

                                <Flex
                                    align="center"
                                    gap={10}
                                    wrap="wrap"
                                    className="catalogos-view__catalog-actions"
                                >
                                    <span className="catalogos-view__catalog-count">
                                        {recordCountLabel}
                                    </span>
                                    <Button
                                        type="primary"
                                        size="small"
                                        icon={<PlusOutlined />}
                                        onClick={openCreateItemModal}
                                    >
                                        Nuevo registro
                                    </Button>
                                </Flex>
                            </div>

                            <div className="catalogos-view__items-toolbar">
                                <Input
                                    allowClear
                                    size="small"
                                    className="catalogos-view__search-input"
                                    prefix={
                                        <SearchOutlined
                                            style={{ color: token.colorTextQuaternary }}
                                        />
                                    }
                                    placeholder="Buscar en registros…"
                                    value={itemSearchInput}
                                    onChange={(event) => setItemSearchInput(event.target.value)}
                                    onClear={() => setItemSearchInput('')}
                                />
                            </div>

                            <div className="catalogos-view__main-body">
                                {isLoadingItems && items.length === 0 ? (
                                    <CatalogosItemsSkeleton />
                                ) : showNoItemSearchResults ? (
                                    <CatalogosPanelEmpty
                                        icon={<SearchOutlined />}
                                        title="Sin resultados"
                                        description="No hay registros que coincidan con la búsqueda."
                                    />
                                ) : !isLoadingItems && items.length === 0 ? (
                                    <CatalogosPanelEmpty
                                        icon={<UnorderedListOutlined />}
                                        title="Sin registros"
                                        description="Agregue el primer registro con el botón Nuevo registro."
                                    />
                                ) : (
                                    <div className="catalogos-view__table">
                                        <CatalogoItemsTable
                                            items={filteredItems}
                                            loading={isLoadingItems}
                                            onEdit={openEditItemModal}
                                            onDelete={handleDeleteItem}
                                            deletingId={deletingItemId}
                                        />
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="catalogos-view__main-empty">
                            <CatalogosPanelEmpty
                                icon={<FolderOpenOutlined />}
                                title="Seleccione un catálogo"
                                description="Elija un grupo del panel izquierdo para ver y administrar sus registros."
                            />
                        </div>
                    )}
                </main>
            </div>

            <CatalogoGrupoFormModal
                open={grupoModalOpen}
                grupo={editingGrupo}
                loading={isSavingGrupo}
                onClose={closeGrupoModal}
                onCreate={handleCreateGrupo}
                onUpdate={handleUpdateGrupo}
            />

            <CatalogoItemFormModal
                open={itemModalOpen}
                grupo={selectedGrupo}
                item={editingItem}
                loading={isSavingItem}
                onClose={closeItemModal}
                onSubmit={handleSubmitItem}
            />
        </div>
    )
}
