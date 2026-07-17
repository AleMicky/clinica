import { useEffect, useMemo, useRef, useState } from 'react'
import {
    createColumnHelper,
    type ColumnDef,
} from '@tanstack/react-table'
import { Button, Flex, Input, Popconfirm, Space, Tag, theme } from 'antd'
import {
    DeleteOutlined,
    EditOutlined,
    PlusOutlined,
    SearchOutlined,
} from '@ant-design/icons'

import { AppDataTable } from '../../../shared/components/ui/data-table/AppDataTable'
import { CatalogoBaseFormModal } from './CatalogoBaseFormModal'
import type { CatalogoBaseFormValues } from '../schemas/catalogo-clinico.schema'
import type { CatalogoBase } from '../types/catalogo-clinico.types'

type CatalogoSimplePanelProps = {
    entityLabel: string
    newButtonLabel: string
    searchPlaceholder: string
    items: CatalogoBase[]
    total: number
    page: number
    pageSize: number
    search: string
    loading: boolean
    isSaving: boolean
    onPageChange: (page: number, pageSize: number) => void
    onSearch: (search: string) => void
    onCreate: (values: CatalogoBaseFormValues) => Promise<void>
    onUpdate: (id: string, values: CatalogoBaseFormValues) => Promise<void>
    onDelete: (id: string) => Promise<void>
    /** Acciones adicionales por fila (antes de editar/eliminar). */
    extraRowActions?: (item: CatalogoBase) => React.ReactNode
    /** @deprecated El título/subtítulo ya no se muestran; la sección activa está en el header del módulo. */
    title?: string
    subtitle?: string
}

const columnHelper = createColumnHelper<CatalogoBase>()

export function CatalogoSimplePanel({
    entityLabel,
    newButtonLabel,
    searchPlaceholder,
    items,
    total,
    page,
    pageSize,
    search,
    loading,
    isSaving,
    onPageChange,
    onSearch,
    onCreate,
    onUpdate,
    onDelete,
    extraRowActions,
}: CatalogoSimplePanelProps) {
    const { token } = theme.useToken()
    const [searchInput, setSearchInput] = useState(search)
    const [modalOpen, setModalOpen] = useState(false)
    const [editing, setEditing] = useState<CatalogoBase | null>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const onSearchRef = useRef(onSearch)
    onSearchRef.current = onSearch

    useEffect(() => {
        const timer = window.setTimeout(() => {
            onSearchRef.current(searchInput.trim())
        }, 400)

        return () => window.clearTimeout(timer)
    }, [searchInput])

    const caption = `${total} registro${total === 1 ? '' : 's'}${
        search ? ` · "${search}"` : ''
    }`

    const columns = useMemo(
        () =>
            [
                columnHelper.accessor('codigo', {
                    header: 'Código',
                    size: 120,
                    cell: ({ getValue }) => (
                        <Tag className="catalogo-clinico-code-tag">{getValue()}</Tag>
                    ),
                }),
                columnHelper.accessor('nombre', { header: 'Nombre' }),
                columnHelper.accessor('descripcion', {
                    header: 'Descripción',
                    cell: ({ getValue }) => getValue() || '—',
                }),
                columnHelper.display({
                    id: 'actions',
                    header: '',
                    size: extraRowActions ? 120 : 88,
                    meta: { align: 'right', headerAlign: 'right' },
                    cell: ({ row }) => {
                        const item = row.original
                        return (
                            <Space size={4}>
                                {extraRowActions?.(item)}
                                <Button
                                    type="text"
                                    size="small"
                                    icon={<EditOutlined />}
                                    aria-label={`Editar ${item.nombre}`}
                                    onClick={() => {
                                        setEditing(item)
                                        setModalOpen(true)
                                    }}
                                />
                                <Popconfirm
                                    title="Desactivar"
                                    description={`¿Desactivar "${item.nombre}"?`}
                                    okText="Desactivar"
                                    cancelText="Cancelar"
                                    okButtonProps={{
                                        danger: true,
                                        loading: deletingId === item.id,
                                    }}
                                    onConfirm={async () => {
                                        setDeletingId(item.id)
                                        try {
                                            await onDelete(item.id)
                                        } finally {
                                            setDeletingId(null)
                                        }
                                    }}
                                >
                                    <Button
                                        type="text"
                                        size="small"
                                        danger
                                        icon={<DeleteOutlined />}
                                        aria-label={`Desactivar ${item.nombre}`}
                                        loading={deletingId === item.id}
                                    />
                                </Popconfirm>
                            </Space>
                        )
                    },
                }),
            ] as ColumnDef<CatalogoBase, unknown>[],
        [deletingId, extraRowActions, onDelete],
    )

    const closeModal = () => {
        if (isSaving) return
        setModalOpen(false)
        setEditing(null)
    }

    const handleSubmit = async (values: CatalogoBaseFormValues) => {
        if (editing) {
            await onUpdate(editing.id, values)
        } else {
            await onCreate(values)
        }
        closeModal()
    }

    return (
        <>
            <div className="rrhh-section-panel rrhh-catalogo">
                <div className="rrhh-section-panel__filters">
                    <Flex
                        gap={6}
                        wrap="wrap"
                        align="center"
                        className="rrhh-catalogo__filters"
                        role="search"
                        aria-label={`Filtros de ${entityLabel}`}
                    >
                        <Input
                            allowClear
                            size="small"
                            className="rrhh-catalogo__filter-search"
                            prefix={
                                <SearchOutlined style={{ color: token.colorTextQuaternary }} />
                            }
                            placeholder={searchPlaceholder}
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            onPressEnter={() => onSearch(searchInput.trim())}
                            onClear={() => {
                                setSearchInput('')
                                onSearch('')
                            }}
                            aria-label={`Buscar ${entityLabel}`}
                        />
                    </Flex>
                    <Flex gap={6} wrap="wrap" align="center" className="rrhh-section-panel__actions">
                        <Button
                            type="primary"
                            size="small"
                            icon={<PlusOutlined />}
                            onClick={() => {
                                setEditing(null)
                                setModalOpen(true)
                            }}
                            aria-label={newButtonLabel}
                        >
                            {newButtonLabel}
                        </Button>
                    </Flex>
                </div>
                <div className="rrhh-section-panel__body">
                    <p className="rrhh-section-panel__caption rrhh-catalogo__caption">{caption}</p>
                    <AppDataTable
                        className="rrhh-catalogo__table"
                        data={items}
                        columns={columns}
                        loading={loading}
                        emptyText={`No hay ${entityLabel.toLowerCase()}s registrados.`}
                        getRowId={(row) => String(row.id)}
                        pagination={{
                            page,
                            pageSize,
                            total,
                            pageSizeOptions: [10, 20, 50],
                            onChange: onPageChange,
                        }}
                    />
                </div>
            </div>

            <CatalogoBaseFormModal
                open={modalOpen}
                entityLabel={entityLabel}
                entity={editing}
                loading={isSaving}
                onClose={closeModal}
                onSubmit={handleSubmit}
            />
        </>
    )
}
