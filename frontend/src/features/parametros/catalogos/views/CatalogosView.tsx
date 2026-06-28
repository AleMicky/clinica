import { useEffect, useState } from 'react'
import {
    Button,
    Empty,
    Flex,
    Input,
    Typography,
    theme,
} from 'antd'
import {
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

const DEFAULT_PAGE_SIZE = 20

export function CatalogosView() {
    const { token } = theme.useToken()

    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
    const [search, setSearch] = useState('')
    const [searchInput, setSearchInput] = useState('')
    const [selectedGrupo, setSelectedGrupo] = useState<CatalogoGrupo | null>(null)

    const [grupoModalOpen, setGrupoModalOpen] = useState(false)
    const [editingGrupo, setEditingGrupo] = useState<CatalogoGrupo | null>(null)
    const [deletingGrupoId, setDeletingGrupoId] = useState<string | null>(null)

    const [itemModalOpen, setItemModalOpen] = useState(false)
    const [editingItem, setEditingItem] = useState<CatalogoItem | null>(null)
    const [deletingItemId, setDeletingItemId] = useState<string | null>(null)

    const { data, isFetching } = useCatalogoGrupos({
        page,
        pageSize,
        search: search || undefined,
    })
    const { data: items = [], isFetching: isFetchingItems } = useCatalogoGrupoItems(
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
        if (selectedGrupo || isFetching || grupos.length === 0) return
        setSelectedGrupo(grupos[0])
    }, [grupos, isFetching, selectedGrupo])

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

    return (
        <div className="module-object-page__panel catalogos-view catalogos-view--compact">
            <div className="catalogos-view__split">
                <aside className="catalogos-view__sidebar">
                    <div className="catalogos-view__sidebar-head">
                        <Flex align="center" gap={8} className="catalogos-view__sidebar-title">
                            <Text strong>Grupos</Text>
                            <Text type="secondary" className="catalogos-view__sidebar-count">
                                {totalGrupos}
                            </Text>
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
                            prefix={<SearchOutlined style={{ color: token.colorTextQuaternary }} />}
                            placeholder="Buscar…"
                            value={searchInput}
                            onChange={(event) => setSearchInput(event.target.value)}
                            onPressEnter={() => handleSearch(searchInput)}
                            onClear={() => {
                                setSearchInput('')
                                handleSearch('')
                            }}
                        />
                    </div>

                    <CatalogoGruposList
                        grupos={grupos}
                        loading={isFetching}
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
                            <div className="catalogos-view__main-head">
                                <Flex
                                    align="center"
                                    gap={10}
                                    className="catalogos-view__main-head-info"
                                >
                                    <code className="catalogos-view__main-code">
                                        {selectedGrupo.codigo}
                                    </code>
                                    <Text strong ellipsis className="catalogos-view__main-name">
                                        {selectedGrupo.nombre}
                                    </Text>
                                    {selectedGrupo.descripcion ? (
                                        <Text
                                            type="secondary"
                                            ellipsis
                                            className="catalogos-view__main-description"
                                        >
                                            {selectedGrupo.descripcion}
                                        </Text>
                                    ) : null}
                                </Flex>

                                <Flex align="center" gap={10} className="catalogos-view__main-actions">
                                    <Text type="secondary" className="catalogos-view__main-count">
                                        {items.length} ítem{items.length === 1 ? '' : 's'}
                                    </Text>
                                    <Button
                                        type="primary"
                                        size="small"
                                        icon={<PlusOutlined />}
                                        onClick={openCreateItemModal}
                                    >
                                        Nuevo ítem
                                    </Button>
                                </Flex>
                            </div>

                            <div className="catalogos-view__main-body">
                                <CatalogoItemsTable
                                    items={items}
                                    loading={isFetchingItems}
                                    onEdit={openEditItemModal}
                                    onDelete={handleDeleteItem}
                                    deletingId={deletingItemId}
                                />
                            </div>
                        </>
                    ) : (
                        <div className="catalogos-view__main-empty">
                            <Empty
                                image={<UnorderedListOutlined className="catalogos-view__main-empty-icon" />}
                                description={
                                    <Flex vertical gap={4} align="center">
                                        <Text strong>Seleccione un catálogo</Text>
                                        <Text type="secondary" style={{ fontSize: 13 }}>
                                            Elija un grupo del panel izquierdo para ver sus ítems.
                                        </Text>
                                    </Flex>
                                }
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
