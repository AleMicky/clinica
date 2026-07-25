import { useMemo } from 'react'
import {
    createColumnHelper,
    type ColumnDef,
} from '@tanstack/react-table'
import { Button, Popconfirm, Space, Tag, Typography } from 'antd'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons'

import { AppDataTable } from '../../../../shared/components/ui/data-table/AppDataTable'
import type { UnidadMedida } from '../types/unidades-medida.types'

const { Text } = Typography

type UnidadesMedidaTableProps = {
    items: UnidadMedida[]
    loading: boolean
    total: number
    page: number
    pageSize: number
    onPageChange: (page: number, pageSize: number) => void
    onEdit: (unidad: UnidadMedida) => void
    onDelete: (unidad: UnidadMedida) => void
    deletingId: string | null
    className?: string
}

const columnHelper = createColumnHelper<UnidadMedida>()

export function UnidadesMedidaTable({
    items,
    loading,
    total,
    page,
    pageSize,
    onPageChange,
    onEdit,
    onDelete,
    deletingId,
    className,
}: UnidadesMedidaTableProps) {
    const columns = useMemo(
        () =>
            [
                columnHelper.accessor('codigo', {
                    header: 'Código',
                    size: 120,
                    cell: ({ getValue }) => (
                        <Text code className="rrhh-page__code">
                            {getValue()}
                        </Text>
                    ),
                }),
                columnHelper.accessor('nombre', {
                    header: 'Nombre',
                    cell: ({ getValue }) => <Text strong>{getValue()}</Text>,
                }),
                columnHelper.accessor('simbolo', {
                    header: 'Símbolo',
                    size: 100,
                    cell: ({ getValue }) => (
                        <Tag variant="filled" className="rrhh-page__date-tag">
                            {getValue()}
                        </Tag>
                    ),
                }),
                columnHelper.display({
                    id: 'actions',
                    header: '',
                    size: 88,
                    meta: {
                        align: 'right',
                        headerAlign: 'right',
                    },
                    cell: ({ row }) => {
                        const unidad = row.original

                        return (
                            <Space size={4}>
                                <Button
                                    type="text"
                                    size="small"
                                    icon={<EditOutlined />}
                                    aria-label={`Editar ${unidad.nombre}`}
                                    onClick={() => onEdit(unidad)}
                                />
                                <Popconfirm
                                    title="Desactivar unidad"
                                    description={`¿Desactivar "${unidad.nombre}"?`}
                                    okText="Desactivar"
                                    cancelText="Cancelar"
                                    okButtonProps={{
                                        danger: true,
                                        loading: deletingId === unidad.id,
                                    }}
                                    onConfirm={() => onDelete(unidad)}
                                >
                                    <Button
                                        type="text"
                                        size="small"
                                        danger
                                        icon={<DeleteOutlined />}
                                        aria-label={`Desactivar ${unidad.nombre}`}
                                        loading={deletingId === unidad.id}
                                    />
                                </Popconfirm>
                            </Space>
                        )
                    },
                }),
            ] as ColumnDef<UnidadMedida, unknown>[],
        [onEdit, onDelete, deletingId],
    )

    return (
        <AppDataTable
            className={className}
            data={items}
            columns={columns}
            loading={loading}
            emptyText="No hay unidades de medida registradas."
            getRowId={(row) => row.id}
            pagination={{
                page,
                pageSize,
                total,
                pageSizeOptions: [10, 20, 50],
                onChange: onPageChange,
            }}
        />
    )
}
