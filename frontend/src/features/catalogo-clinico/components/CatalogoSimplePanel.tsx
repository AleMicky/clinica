import { useEffect, useMemo, useRef, useState } from 'react'
import {
    createColumnHelper,
    type ColumnDef,
} from '@tanstack/react-table'
import { Button, Flex, Grid, Input, Popconfirm, Space, Tag, Typography, theme } from 'antd'
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

const { Text } = Typography
const { useBreakpoint } = Grid

type CatalogoSimplePanelProps = {
    title: string
    subtitle: string
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
}

const columnHelper = createColumnHelper<CatalogoBase>()

export function CatalogoSimplePanel({
    title,
    subtitle,
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
}: CatalogoSimplePanelProps) {
    const { token } = theme.useToken()
    const screens = useBreakpoint()
    const isMobile = !screens.md
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
                    header: 'Acciones',
                    size: 120,
                    meta: { align: 'right', headerAlign: 'right' },
                    cell: ({ row }) => {
                        const item = row.original
                        return (
                            <Space size="small">
                                <Button
                                    type="text"
                                    icon={<EditOutlined />}
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
                                        danger
                                        icon={<DeleteOutlined />}
                                        loading={deletingId === item.id}
                                    />
                                </Popconfirm>
                            </Space>
                        )
                    },
                }),
            ] as ColumnDef<CatalogoBase, unknown>[],
        [deletingId, onDelete],
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
        <div className="catalogo-clinico-panel">
            <div className="catalogo-clinico-panel__head">
                <div className="catalogo-clinico-panel__head-text">
                    <Text strong className="catalogo-clinico-panel__title">
                        {title}
                    </Text>
                    <Text type="secondary" className="catalogo-clinico-panel__subtitle">
                        {subtitle}
                    </Text>
                </div>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    block={isMobile}
                    className="catalogo-clinico-panel__create-btn"
                    onClick={() => {
                        setEditing(null)
                        setModalOpen(true)
                    }}
                >
                    {newButtonLabel}
                </Button>
            </div>

            <div className="catalogo-clinico-panel__search">
                <Input
                    allowClear
                    prefix={<SearchOutlined style={{ color: token.colorTextQuaternary }} />}
                    placeholder={searchPlaceholder}
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onPressEnter={() => onSearch(searchInput.trim())}
                    onClear={() => {
                        setSearchInput('')
                        onSearch('')
                    }}
                />
            </div>

            <div className="catalogo-clinico-panel__body">
                <Flex justify="space-between" align="center" className="catalogo-clinico-panel__meta">
                    <Text type="secondary">
                        {total} registro{total === 1 ? '' : 's'}
                        {search ? ` · "${search}"` : ''}
                    </Text>
                </Flex>

                <AppDataTable
                    data={items}
                    columns={columns}
                    loading={loading}
                    emptyText={`No hay ${entityLabel.toLowerCase()}s registrados.`}
                    getRowId={(row) => String(row.id)}
                    pagination={{
                        page,
                        pageSize,
                        total,
                        onChange: onPageChange,
                    }}
                />
            </div>

            <CatalogoBaseFormModal
                open={modalOpen}
                entityLabel={entityLabel}
                entity={editing}
                loading={isSaving}
                onClose={closeModal}
                onSubmit={handleSubmit}
            />
        </div>
    )
}
