import { useMemo } from 'react'
import {
    createColumnHelper,
    type ColumnDef,
} from '@tanstack/react-table'
import { Button, Popconfirm, Space, Tag } from 'antd'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons'

import { AppDataTable } from '../../../shared/components/ui/data-table/AppDataTable'
import type { User } from '../types/user.types'

type UsersTableProps = {
    users: User[]
    loading: boolean
    total: number
    page: number
    pageSize: number
    onPageChange: (page: number, pageSize: number) => void
    onEdit: (user: User) => void
    onDelete: (user: User) => void
    deletingId: string | null
}

const columnHelper = createColumnHelper<User>()

export function UsersTable({
    users,
    loading,
    total,
    page,
    pageSize,
    onPageChange,
    onEdit,
    onDelete,
    deletingId,
}: UsersTableProps) {
    const columns = useMemo(
        () => [
            columnHelper.accessor('userName', {
                header: 'Usuario',
            }),
            columnHelper.accessor('nombreCompleto', {
                header: 'Nombre completo',
            }),
            columnHelper.accessor('roles', {
                header: 'Rol',
                cell: ({ getValue }) => getValue()[0] ?? '—',
            }),
            columnHelper.accessor('activo', {
                header: 'Estado',
                size: 120,
                cell: ({ getValue }) => (
                    <Tag color={getValue() ? 'success' : 'default'}>
                        {getValue() ? 'Activo' : 'Inactivo'}
                    </Tag>
                ),
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
                    const user = row.original

                    return (
                        <Space size="small">
                            <Button
                                type="text"
                                icon={<EditOutlined />}
                                aria-label={`Editar ${user.userName}`}
                                onClick={() => onEdit(user)}
                            />
                            <Popconfirm
                                title="Desactivar usuario"
                                description={`¿Desea desactivar al usuario "${user.userName}"?`}
                                okText="Desactivar"
                                cancelText="Cancelar"
                                okButtonProps={{
                                    danger: true,
                                    loading: deletingId === user.id,
                                }}
                                disabled={!user.activo}
                                onConfirm={() => onDelete(user)}
                            >
                                <Button
                                    type="text"
                                    danger
                                    icon={<DeleteOutlined />}
                                    aria-label={`Desactivar ${user.userName}`}
                                    loading={deletingId === user.id}
                                    disabled={!user.activo}
                                />
                            </Popconfirm>
                        </Space>
                    )
                },
            }),
        ] as ColumnDef<User, any>[],
        [onEdit, onDelete, deletingId],
    )

    return (
        <AppDataTable
            data={users}
            columns={columns}
            loading={loading}
            emptyText="No hay usuarios registrados."
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
