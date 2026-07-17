import { Typography } from 'antd'

import { DeleteUserModal } from '../components/DeleteUserModal'
import { UserFormModal } from '../components/UserFormModal'
import { UsersFiltersBar } from '../components/UsersFiltersBar'
import { UsersHeader } from '../components/UsersHeader'
import { UsersTable } from '../components/UsersTable'
import { useUsersView } from '../hooks/use-users-view'

const { Text } = Typography

type UsuariosViewProps = {
    embedded?: boolean
}

export function UsuariosView({ embedded = false }: UsuariosViewProps) {
    const {
        loading,
        totalUsers,
        totalRoles,
        roleOptions,
        caption,
        filters,
        table,
        formModal,
        actions,
    } = useUsersView()

    const filtersBar = (
        <UsersFiltersBar
            searchInput={filters.searchInput}
            roleFilter={filters.roleFilter}
            statusFilter={filters.statusFilter}
            roleOptions={roleOptions}
            hasActiveFilters={filters.hasActiveFilters}
            onSearchInputChange={filters.onSearchInputChange}
            onSearch={filters.onSearch}
            onRoleFilterChange={filters.onRoleFilterChange}
            onStatusFilterChange={filters.onStatusFilterChange}
            onClearFilters={filters.onClearFilters}
        />
    )

    const tableSection = (
        <UsersTable
            users={table.users}
            loading={loading}
            total={table.total}
            page={table.page}
            pageSize={table.pageSize}
            sorting={table.sorting}
            onSortingChange={table.onSortingChange}
            onPageChange={table.onPageChange}
            onEdit={formModal.openEditModal}
            onDelete={actions.requestDelete}
            onToggleActive={actions.toggleActive}
            deletingId={actions.deletingId}
            togglingId={actions.togglingId}
            hasFilters={filters.hasActiveFilters || Boolean(filters.search)}
            onClearFilters={filters.onClearFilters}
            onCreate={formModal.openCreateModal}
            className="seguridad-usuarios__table"
        />
    )

    const drawers = (
        <>
            <UserFormModal
                open={formModal.modalOpen}
                user={formModal.editingUser}
                roleOptions={roleOptions}
                loading={formModal.isSaving}
                onClose={formModal.closeModal}
                onCreate={formModal.handleCreate}
                onUpdate={formModal.handleUpdate}
            />
            <DeleteUserModal
                open={Boolean(actions.userToDelete)}
                user={actions.userToDelete}
                loading={actions.isDeleting}
                onCancel={actions.cancelDelete}
                onConfirm={() => void actions.confirmDelete()}
            />
        </>
    )

    if (embedded) {
        return (
            <>
                <div className="seguridad-section-panel seguridad-usuarios">
                    <UsersHeader
                        embedded
                        totalUsers={totalUsers}
                        totalRoles={totalRoles}
                        loading={loading}
                        caption={caption}
                        onCreate={formModal.openCreateModal}
                    />
                    <div className="seguridad-section-panel__filters">{filtersBar}</div>
                    <div className="seguridad-section-panel__body">{tableSection}</div>
                </div>
                {drawers}
            </>
        )
    }

    return (
        <div className="admin-page seguridad-usuarios">
            <UsersHeader
                totalUsers={totalUsers}
                totalRoles={totalRoles}
                loading={loading}
                onCreate={formModal.openCreateModal}
            />

            <div className="admin-page__workspace">
                <section className="admin-page__panel">
                    <div className="admin-page__panel-toolbar">
                        <div>
                            <Text strong>Cuentas de usuario</Text>
                            <Text type="secondary" className="admin-page__panel-caption">
                                {caption}
                            </Text>
                        </div>
                    </div>

                    <div className="admin-page__panel-search seguridad-usuarios__filters--panel">
                        {filtersBar}
                    </div>

                    <div className="admin-page__panel-body">{tableSection}</div>
                </section>
            </div>

            {drawers}
        </div>
    )
}
