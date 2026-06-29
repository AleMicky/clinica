import { useMemo } from 'react'
import {
    createColumnHelper,
    type ColumnDef,
} from '@tanstack/react-table'
import { Button, Popconfirm, Space, Tag, Typography } from 'antd'
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

function getInitials(name: string, userName: string) {
    const source = name.trim() || userName.trim()
    const parts = source.split(/\s+/).filter(Boolean)

    if (parts.length >= 2) {
        return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase()
    }

    return source.slice(0, 2).toUpperCase()
}

function UserIdentityCell({ user }: { user: User }) {
    return (
        <div className="seguridad-user-cell">
            <span className="seguridad-user-cell__avatar" aria-hidden>
                {getInitials(user.nombreCompleto, user.userName)}
            </span>
            <span className="seguridad-user-cell__text">
                <Typography.Text strong className="seguridad-user-cell__name">
                    {user.nombreCompleto}
                </Typography.Text>
                <Typography.Text type="secondary" className="seguridad-user-cell__username">
                    @{user.userName}
                </Typography.Text>
            </span>
        </div>
    )
}

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
            columnHelper.display({
                id: 'identity',
                header: 'Usuario',
                cell: ({ row }) => <UserIdentityCell user={row.original} />,
            }),
            columnHelper.display({
                id: 'persona',
                header: 'Persona',
                cell: ({ row }) => {
                    const user = row.original

                    if (!user.personaId) {
                        return <Typography.Text type="secondary">—</Typography.Text>
                    }

                    return (
                        <span>
                            <Typography.Text>
                                {user.personaNombreCompleto ?? user.nombreCompleto}
                            </Typography.Text>
                            {user.personaNumeroDocumento ? (
                                <Typography.Text type="secondary" className="seguridad-user-cell__username">
                                    {' '}
                                    · {user.personaNumeroDocumento}
                                </Typography.Text>
                            ) : null}
                        </span>
                    )
                },
            }),
            columnHelper.accessor('roles', {
                header: 'Rol',
                cell: ({ getValue }) => {
                    const role = getValue()[0]

                    if (!role) return '—'

                    return <Tag className="seguridad-role-tag">{role}</Tag>
                },
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
