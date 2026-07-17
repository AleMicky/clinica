import { useMemo } from 'react'
import {
    createColumnHelper,
    type ColumnDef,
} from '@tanstack/react-table'
import {
    Button,
    Dropdown,
    Modal,
    Tag,
    Typography,
} from 'antd'
import type { MenuProps } from 'antd'
import {
    DeleteOutlined,
    EditOutlined,
    LockOutlined,
    MoreOutlined,
    UnlockOutlined,
} from '@ant-design/icons'

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
    onToggleActive: (user: User) => void
    deletingId: string | null
    togglingId: string | null
    className?: string
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

function PersonaCell({ user }: { user: User }) {
    if (!user.personaId) {
        return (
            <Typography.Text type="secondary" className="seguridad-user-cell__persona-empty">
                Sin persona
            </Typography.Text>
        )
    }

    return (
        <div className="seguridad-user-cell__persona">
            <Typography.Text className="seguridad-user-cell__persona-name">
                {user.personaNombreCompleto ?? user.nombreCompleto}
            </Typography.Text>
            {user.personaNumeroDocumento ? (
                <Typography.Text type="secondary" className="seguridad-user-cell__persona-doc">
                    {user.personaNumeroDocumento}
                </Typography.Text>
            ) : null}
        </div>
    )
}

function UserActionsCell({
    user,
    onEdit,
    onDelete,
    onToggleActive,
    deletingId,
    togglingId,
}: {
    user: User
    onEdit: (user: User) => void
    onDelete: (user: User) => void
    onToggleActive: (user: User) => void
    deletingId: string | null
    togglingId: string | null
}) {
    const isBusy = deletingId === user.id || togglingId === user.id

    const handleDeleteClick = () => {
        Modal.confirm({
            title: 'Desactivar usuario',
            content: `¿Desea desactivar al usuario "${user.userName}"?`,
            okText: 'Desactivar',
            cancelText: 'Cancelar',
            okButtonProps: { danger: true },
            onOk: () => onDelete(user),
        })
    }

    const menuItems: MenuProps['items'] = [
        {
            key: 'edit',
            icon: <EditOutlined />,
            label: 'Editar',
            onClick: () => onEdit(user),
        },
        {
            key: 'toggle',
            icon: user.activo ? <LockOutlined /> : <UnlockOutlined />,
            label: user.activo ? 'Bloquear' : 'Activar',
            disabled: isBusy,
            onClick: () => onToggleActive(user),
        },
        { type: 'divider' },
        {
            key: 'delete',
            icon: <DeleteOutlined />,
            label: 'Desactivar',
            danger: true,
            disabled: !user.activo || isBusy,
            onClick: handleDeleteClick,
        },
    ]

    return (
        <div className="seguridad-user-actions">
            <Dropdown
                menu={{ items: menuItems }}
                trigger={['click']}
                placement="bottomRight"
            >
                <Button
                    type="text"
                    size="small"
                    icon={<MoreOutlined />}
                    loading={isBusy}
                    aria-label={`Acciones para ${user.userName}`}
                    className="seguridad-user-actions__trigger"
                />
            </Dropdown>
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
    onToggleActive,
    deletingId,
    togglingId,
    className,
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
                header: 'Persona asociada',
                cell: ({ row }) => <PersonaCell user={row.original} />,
            }),
            columnHelper.accessor('roles', {
                header: 'Rol',
                size: 140,
                cell: ({ getValue }) => {
                    const roles = getValue()

                    if (roles.length === 0) {
                        return <Typography.Text type="secondary">—</Typography.Text>
                    }

                    return (
                        <div className="seguridad-user-cell__roles">
                            {roles.map((role) => (
                                <Tag key={role} className="seguridad-role-tag">
                                    {role}
                                </Tag>
                            ))}
                        </div>
                    )
                },
            }),
            columnHelper.accessor('activo', {
                header: 'Estado',
                size: 100,
                cell: ({ getValue }) => (
                    <Tag
                        className={
                            getValue()
                                ? 'seguridad-status-tag seguridad-status-tag--active'
                                : 'seguridad-status-tag seguridad-status-tag--inactive'
                        }
                    >
                        {getValue() ? 'Activo' : 'Inactivo'}
                    </Tag>
                ),
            }),
            columnHelper.display({
                id: 'actions',
                header: '',
                size: 56,
                meta: {
                    align: 'right',
                    headerAlign: 'right',
                },
                cell: ({ row }) => (
                    <UserActionsCell
                        user={row.original}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onToggleActive={onToggleActive}
                        deletingId={deletingId}
                        togglingId={togglingId}
                    />
                ),
            }),
        ] as ColumnDef<User, unknown>[],
        [onEdit, onDelete, onToggleActive, deletingId, togglingId],
    )

    return (
        <AppDataTable
            className={className}
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
