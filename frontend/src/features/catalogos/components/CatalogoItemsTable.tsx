import { useMemo } from 'react'
import {
    createColumnHelper,
    type ColumnDef,
} from '@tanstack/react-table'
import { Button, Popconfirm, Space } from 'antd'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons'

import { AppDataTable } from '../../../shared/components/ui/data-table/AppDataTable'
import type { CatalogoItem } from '../types/catalogo.types'

type CatalogoItemsTableProps = {
    items: CatalogoItem[]
    loading: boolean
    onEdit: (item: CatalogoItem) => void
    onDelete: (item: CatalogoItem) => void
    deletingId: string | null
}

const columnHelper = createColumnHelper<CatalogoItem>()

export function CatalogoItemsTable({
    items,
    loading,
    onEdit,
    onDelete,
    deletingId,
}: CatalogoItemsTableProps) {
    const columns = useMemo(
        () => [
            columnHelper.accessor('codigo', {
                header: 'Código',
                size: 140,
            }),
            columnHelper.accessor('nombre', {
                header: 'Nombre',
            }),
            columnHelper.accessor('valor', {
                header: 'Valor',
                size: 140,
            }),
            columnHelper.accessor('orden', {
                header: 'Orden',
                size: 90,
                meta: { align: 'center', headerAlign: 'center' },
            }),
            columnHelper.display({
                id: 'actions',
                header: 'Acciones',
                size: 140,
                meta: {
                    align: 'right',
                    headerAlign: 'right',
                },
                cell: ({ row }) => {
                    const item = row.original

                    return (
                        <Space size="small">
                            <Button
                                type="text"
                                icon={<EditOutlined />}
                                aria-label={`Editar ${item.nombre}`}
                                onClick={() => onEdit(item)}
                            />
                            <Popconfirm
                                title="Desactivar ítem"
                                description={`¿Desea desactivar el ítem "${item.nombre}"?`}
                                okText="Desactivar"
                                cancelText="Cancelar"
                                okButtonProps={{
                                    danger: true,
                                    loading: deletingId === item.id,
                                }}
                                onConfirm={() => onDelete(item)}
                            >
                                <Button
                                    type="text"
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
        ] as ColumnDef<CatalogoItem, any>[],
        [onEdit, onDelete, deletingId],
    )

    return (
        <AppDataTable
            data={items}
            columns={columns}
            loading={loading}
            emptyText="No hay ítems en este catálogo."
            getRowId={(row) => String(row.id)}
        />
    )
}
