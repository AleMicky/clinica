import { memo, useMemo } from 'react'
import {
    createColumnHelper,
    type ColumnDef,
    type OnChangeFn,
    type SortingState,
} from '@tanstack/react-table'
import { Avatar, Flex, Typography } from 'antd'
import { CalendarOutlined } from '@ant-design/icons'

import { AppDataTable } from '../../../shared/components/ui/data-table/AppDataTable'
import type { User } from '../types/user.types'
import { formatOptionalDate, getUserInitials } from '../utils/user-display'
import { EmptyUsers } from './EmptyUsers'
import { PersonaCell, UserEmailMeta } from './PersonaCell'
import { UserActionsDropdown } from './UserActionsDropdown'
import { UserRolesCell } from './UserRoleTag'
import { UserStatusBadge } from './UserStatusBadge'

type UsersTableProps = {
    users: User[]
    loading: boolean
    total: number
    page: number
    pageSize: number
    sorting: SortingState
    onSortingChange: OnChangeFn<SortingState>
    onPageChange: (page: number, pageSize: number) => void
    onEdit: (user: User) => void
    onDelete: (user: User) => void
    onToggleActive: (user: User) => void
    deletingId: string | null
    togglingId: string | null
    hasFilters?: boolean
    onClearFilters?: () => void
    onCreate?: () => void
    className?: string
}

const columnHelper = createColumnHelper<User>()

const UserIdentityCell = memo(function UserIdentityCell({ user }: { user: User }) {
    return (
        <div className="seguridad-user-cell">
            <Avatar size={32} className="seguridad-user-cell__avatar" aria-hidden>
                {getUserInitials(user.nombreCompleto, user.userName)}
            </Avatar>
            <span className="seguridad-user-cell__text">
                <Typography.Text strong className="seguridad-user-cell__name">
                    {user.nombreCompleto}
                </Typography.Text>
                <Typography.Text type="secondary" className="seguridad-user-cell__username">
                    @{user.userName}
                </Typography.Text>
                <UserEmailMeta email={user.email} />
            </span>
        </div>
    )
})

const CreatedAtCell = memo(function CreatedAtCell({ value }: { value?: string | null }) {
    const formatted = formatOptionalDate(value)

    if (!formatted) {
        return (
            <Typography.Text type="secondary" className="seguridad-user-cell__meta-empty">
                —
            </Typography.Text>
        )
    }

    return (
        <Flex align="center" gap={6}>
            <CalendarOutlined className="seguridad-user-cell__meta-icon" aria-hidden />
            <Typography.Text className="seguridad-user-cell__meta">{formatted}</Typography.Text>
        </Flex>
    )
})

export const UsersTable = memo(function UsersTable({
    users,
    loading,
    total,
    page,
    pageSize,
    sorting,
    onSortingChange,
    onPageChange,
    onEdit,
    onDelete,
    onToggleActive,
    deletingId,
    togglingId,
    hasFilters = false,
    onClearFilters,
    onCreate,
    className,
}: UsersTableProps) {
    const columns = useMemo(
        () =>
            [
                columnHelper.accessor('nombreCompleto', {
                    id: 'identity',
                    header: 'Usuario',
                    enableSorting: true,
                    cell: ({ row }) => <UserIdentityCell user={row.original} />,
                }),
                columnHelper.display({
                    id: 'persona',
                    header: 'Persona relacionada',
                    enableSorting: true,
                    cell: ({ row }) => <PersonaCell user={row.original} />,
                }),
                columnHelper.accessor('roles', {
                    header: 'Rol',
                    size: 140,
                    enableSorting: true,
                    cell: ({ getValue }) => <UserRolesCell roles={getValue()} />,
                }),
                columnHelper.accessor('activo', {
                    header: 'Estado',
                    size: 110,
                    enableSorting: true,
                    cell: ({ getValue }) => <UserStatusBadge activo={getValue()} />,
                }),
                columnHelper.accessor('createdAt', {
                    id: 'fechaCreacion',
                    header: 'Creación',
                    size: 130,
                    enableSorting: true,
                    cell: ({ getValue }) => <CreatedAtCell value={getValue()} />,
                }),
                columnHelper.display({
                    id: 'actions',
                    header: '',
                    size: 56,
                    enableSorting: false,
                    meta: {
                        align: 'right',
                        headerAlign: 'right',
                    },
                    cell: ({ row }) => {
                        const user = row.original
                        const busy = deletingId === user.id || togglingId === user.id

                        return (
                            <UserActionsDropdown
                                user={user}
                                busy={busy}
                                onEdit={onEdit}
                                onDelete={onDelete}
                                onToggleActive={onToggleActive}
                            />
                        )
                    },
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
            emptyContent={
                <EmptyUsers
                    hasFilters={hasFilters}
                    onClearFilters={onClearFilters}
                    onCreate={onCreate}
                />
            }
            getRowId={(row) => String(row.id)}
            sorting={sorting}
            onSortingChange={onSortingChange}
            skeletonRows={pageSize > 10 ? 8 : 5}
            pagination={{
                page,
                pageSize,
                total,
                pageSizeOptions: [10, 20, 50],
                onChange: onPageChange,
            }}
        />
    )
})
