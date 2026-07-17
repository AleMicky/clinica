import { DeleteUserModal } from '../components/DeleteUserModal'
import { UserFormModal } from '../components/UserFormModal'
import { UsersFiltersBar } from '../components/UsersFiltersBar'
import { UsersHeader } from '../components/UsersHeader'
import { UsersTable } from '../components/UsersTable'
import { useUsersView } from '../hooks/use-users-view'

export function UsuariosView() {
    const { loading, roleOptions, caption, filters, table, formModal, actions } = useUsersView()

    return (
        <>
            <div className="seguridad-section-panel seguridad-usuarios">
                <UsersHeader caption={caption} onCreate={formModal.openCreateModal} />
                <div className="seguridad-section-panel__filters">
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
                </div>
                <div className="seguridad-section-panel__body">
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
                </div>
            </div>

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
}
