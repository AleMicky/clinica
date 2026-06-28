import { useMemo } from 'react'
import {
    createColumnHelper,
    type ColumnDef,
} from '@tanstack/react-table'
import { Button, Popconfirm, Space } from 'antd'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons'

import { AppDataTable } from '../../../shared/components/ui/data-table/AppDataTable'
import type { Role } from '../types/role.types'

type RolesTableProps = {
    roles: Role[]
    loading: boolean
    total: number
    page: number
    pageSize: number
    onPageChange: (page: number, pageSize: number) => void
    onEdit: (role: Role) => void
    onDelete: (role: Role) => void
    deletingId: string | null
}

const columnHelper = createColumnHelper<Role>()

export function RolesTable({
    roles,
    loading,
    total,
    page,
    pageSize,
    onPageChange,
    onEdit,
    onDelete,
    deletingId,
}: RolesTableProps) {
    const columns = useMemo(
        () => [
            columnHelper.accessor('name', {
                header: 'Nombre',
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
                    const role = row.original

                    return (
                        <Space size="small">
                            <Button
                                type="text"
                                icon={<EditOutlined />}
                                aria-label={`Editar ${role.name}`}
                                onClick={() => onEdit(role)}
                            />
                            <Popconfirm
                                title="Eliminar rol"
                                description={`¿Desea eliminar el rol "${role.name}"?`}
                                okText="Eliminar"
                                cancelText="Cancelar"
                                okButtonProps={{
                                    danger: true,
                                    loading: deletingId === role.id,
                                }}
                                onConfirm={() => onDelete(role)}
                            >
                                <Button
                                    type="text"
                                    danger
                                    icon={<DeleteOutlined />}
                                    aria-label={`Eliminar ${role.name}`}
                                    loading={deletingId === role.id}
                                />
                            </Popconfirm>
                        </Space>
                    )
                },
            }),
        ] as ColumnDef<Role, any>[],
        [onEdit, onDelete, deletingId],
    )

    return (
        <AppDataTable
            data={roles}
            columns={columns}
            loading={loading}
            emptyText="No hay roles registrados."
            getRowId={(row) => String(row.id)}
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
