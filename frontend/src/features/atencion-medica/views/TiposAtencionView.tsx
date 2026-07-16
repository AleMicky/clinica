import { useMemo, useState } from 'react'
import { createColumnHelper, type ColumnDef } from '@tanstack/react-table'
import {
    Alert,
    Button,
    Dropdown,
    Empty,
    Flex,
    Grid,
    Input,
    Modal,
    Skeleton,
    Space,
    Typography,
    theme,
} from 'antd'
import type { MenuProps } from 'antd'
import {
    DeleteOutlined,
    EditOutlined,
    FormOutlined,
    MoreOutlined,
    PlusOutlined,
    SearchOutlined,
} from '@ant-design/icons'
import { useNavigate } from '@tanstack/react-router'

import { AppDataTable } from '../../../shared/components/ui/data-table/AppDataTable'
import { CatalogoBaseFormModal } from '../../catalogo-clinico/components/CatalogoBaseFormModal'
import type { CatalogoBaseFormValues } from '../../catalogo-clinico/schemas/catalogo-clinico.schema'
import type { CatalogoBase } from '../../catalogo-clinico/types/catalogo-clinico.types'
import { tiposAtencionHooks, useTiposAtencion } from '../hooks/atencion-medica.hooks'
import type { TipoAtencion } from '../types/atencion-medica.types'

const { Text } = Typography
const { useBreakpoint } = Grid

const DEFAULT_PAGE_SIZE = 20

const columnHelper = createColumnHelper<TipoAtencion>()

function toCatalogoBase(tipo: TipoAtencion): CatalogoBase {
    return {
        id: tipo.id,
        codigo: tipo.codigo,
        nombre: tipo.nombre,
        descripcion: tipo.descripcion || null,
    }
}

function toPayload(values: CatalogoBaseFormValues) {
    return {
        codigo: values.codigo,
        nombre: values.nombre,
        descripcion: values.descripcion || '',
    }
}

export function TiposAtencionView() {
    const { token } = theme.useToken()
    const screens = useBreakpoint()
    const isMobile = !screens.md
    const navigate = useNavigate()

    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
    const [search, setSearch] = useState('')
    const [searchInput, setSearchInput] = useState('')
    const [modalOpen, setModalOpen] = useState(false)
    const [editing, setEditing] = useState<TipoAtencion | null>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null)

    // El backend de tipos-atencion aún no filtra por `search`; se aplica filtro local.
    const { data, isFetching, isLoading, isError, refetch, isRefetching } = useTiposAtencion({
        page,
        pageSize,
    })

    const createMutation = tiposAtencionHooks.useCreate()
    const updateMutation = tiposAtencionHooks.useUpdate()
    const deleteMutation = tiposAtencionHooks.useDelete()
    const isSaving = createMutation.isPending || updateMutation.isPending

    const applySearch = (value: string) => {
        setSearch(value.trim())
        setPage(1)
    }

    const items = useMemo(() => {
        const source = data?.items ?? []
        const term = search.trim().toLowerCase()

        if (!term) {
            return source
        }

        return source.filter((item) => {
            const codigo = item.codigo.toLowerCase()
            const nombre = item.nombre.toLowerCase()
            const descripcion = item.descripcion?.toLowerCase() ?? ''
            return (
                codigo.includes(term) ||
                nombre.includes(term) ||
                descripcion.includes(term)
            )
        })
    }, [data?.items, search])

    const total = search ? items.length : (data?.totalRecords ?? 0)
    const showPagination = !search && (data?.totalPages ?? 0) > 1

    const openCreate = () => {
        setEditing(null)
        setModalOpen(true)
    }

    const openEdit = (tipo: TipoAtencion) => {
        setEditing(tipo)
        setModalOpen(true)
    }

    const closeModal = () => {
        if (isSaving) return
        setModalOpen(false)
        setEditing(null)
    }

    const handleSubmit = async (values: CatalogoBaseFormValues) => {
        if (editing) {
            await updateMutation.mutateAsync({ id: editing.id, data: toPayload(values) })
        } else {
            await createMutation.mutateAsync(toPayload(values))
        }
        closeModal()
    }

    const columns = useMemo(
        () =>
            [
                columnHelper.display({
                    id: 'tipo',
                    header: 'Tipo de atención',
                    cell: ({ row }) => {
                        const descripcion = row.original.descripcion?.trim()
                        return (
                            <div className="tipos-atencion-view__name-cell">
                                <Text strong className="tipos-atencion-view__name">
                                    {row.original.nombre}
                                </Text>
                                <Text type="secondary" className="tipos-atencion-view__desc">
                                    {descripcion || 'Sin descripción'}
                                </Text>
                            </div>
                        )
                    },
                }),
                columnHelper.accessor('codigo', {
                    header: 'Código',
                    size: 200,
                    cell: ({ getValue }) => (
                        <Text code className="tipos-atencion-view__code">
                            {getValue()}
                        </Text>
                    ),
                }),
                columnHelper.display({
                    id: 'actions',
                    header: 'Acciones',
                    size: 250,
                    meta: { align: 'right', headerAlign: 'right' },
                    cell: ({ row }) => {
                        const tipo = row.original
                        const menuItems: MenuProps['items'] = [
                            {
                                key: 'edit',
                                label: 'Editar',
                                icon: <EditOutlined />,
                                onClick: () => openEdit(tipo),
                            },
                            { type: 'divider' },
                            {
                                key: 'delete',
                                label: 'Eliminar',
                                icon: <DeleteOutlined />,
                                danger: true,
                                disabled: deletingId === tipo.id,
                                onClick: () => {
                                    Modal.confirm({
                                        title: '¿Eliminar tipo de atención?',
                                        content: `Se eliminará "${tipo.nombre}". Si está en uso, el sistema rechazará la operación.`,
                                        okText: 'Eliminar',
                                        okType: 'danger',
                                        cancelText: 'Cancelar',
                                        onOk: async () => {
                                            setDeletingId(tipo.id)
                                            try {
                                                await deleteMutation.mutateAsync(tipo.id)
                                            } finally {
                                                setDeletingId(null)
                                            }
                                        },
                                    })
                                },
                            },
                        ]

                        return (
                            <Space size={4} className="tipos-atencion-view__actions">
                                <Button
                                    type="link"
                                    size="small"
                                    icon={<FormOutlined />}
                                    onClick={() =>
                                        void navigate({
                                            to: '/atenciones/formularios/$tipoAtencionId',
                                            params: { tipoAtencionId: tipo.id },
                                        })
                                    }
                                >
                                    Administrar formularios
                                </Button>
                                <Dropdown
                                    menu={{ items: menuItems }}
                                    trigger={['click']}
                                    placement="bottomRight"
                                >
                                    <Button
                                        type="text"
                                        size="small"
                                        icon={<MoreOutlined />}
                                        aria-label={`Más acciones para ${tipo.nombre}`}
                                    />
                                </Dropdown>
                            </Space>
                        )
                    },
                }),
            ] as ColumnDef<TipoAtencion, unknown>[],
        [deleteMutation, deletingId, navigate],
    )

    const recordCountLabel = `${total} registro${total === 1 ? '' : 's'}`

    const renderBody = () => {
        if (isLoading) {
            return (
                <div
                    className="tipos-atencion-view__skeleton"
                    aria-busy
                    aria-label="Cargando tipos de atención"
                >
                    {Array.from({ length: 5 }).map((_, index) => (
                        <Skeleton key={index} active paragraph={{ rows: 1 }} />
                    ))}
                </div>
            )
        }

        if (isError) {
            return (
                <Alert
                    type="error"
                    showIcon
                    title="No se pudieron cargar los tipos de atención."
                    action={
                        <Button
                            size="small"
                            loading={isRefetching}
                            onClick={() => void refetch()}
                        >
                            Reintentar
                        </Button>
                    }
                />
            )
        }

        if (!isFetching && items.length === 0 && search) {
            return (
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={`No se encontraron tipos con “${search}”.`}
                />
            )
        }

        if (!isFetching && items.length === 0) {
            return (
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="Aún no hay tipos de atención registrados."
                >
                    <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
                        Nuevo tipo de atención
                    </Button>
                </Empty>
            )
        }

        return (
            <AppDataTable
                data={items}
                columns={columns}
                loading={isFetching}
                emptyText="No hay tipos de atención registrados."
                getRowId={(row) => row.id}
                pagination={
                    showPagination
                        ? {
                              page,
                              pageSize,
                              total: data?.totalRecords ?? 0,
                              onChange: (nextPage, nextPageSize) => {
                                  setPage(nextPage)
                                  setPageSize(nextPageSize)
                              },
                          }
                        : undefined
                }
            />
        )
    }

    return (
        <div className="module-object-page__panel catalogo-clinico-panel tipos-atencion-view">
            <Flex
                justify="space-between"
                align="center"
                gap={12}
                wrap="wrap"
                className="tipos-atencion-view__toolbar"
            >
                <Flex
                    gap={12}
                    wrap="wrap"
                    align="center"
                    className="tipos-atencion-view__filters"
                >
                    <Input
                        allowClear
                        className="tipos-atencion-view__search"
                        prefix={
                            <SearchOutlined style={{ color: token.colorTextQuaternary }} />
                        }
                        placeholder="Buscar por código o nombre..."
                        value={searchInput}
                        onChange={(event) => setSearchInput(event.target.value)}
                        onPressEnter={() => applySearch(searchInput)}
                        onClear={() => {
                            setSearchInput('')
                            applySearch('')
                        }}
                    />
                </Flex>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    block={isMobile}
                    onClick={openCreate}
                >
                    Nuevo tipo de atención
                </Button>
            </Flex>

            <div className="catalogo-clinico-panel__body">
                <Flex
                    justify="space-between"
                    align="center"
                    className="catalogo-clinico-panel__meta"
                >
                    <Text type="secondary">
                        {recordCountLabel}
                        {search ? ` · “${search}”` : ''}
                    </Text>
                </Flex>

                {renderBody()}
            </div>

            <CatalogoBaseFormModal
                open={modalOpen}
                entityLabel="tipo de atención"
                entity={editing ? toCatalogoBase(editing) : null}
                loading={isSaving}
                onClose={closeModal}
                onSubmit={handleSubmit}
            />
        </div>
    )
}
