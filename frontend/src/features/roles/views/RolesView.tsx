import { useState } from 'react'

import { ModuleSectionPanel } from '../../../shared/components/ui/module-page/ModuleSectionPanel'
import { RoleFormModal } from '../components/RoleFormModal'
import { RolesTable } from '../components/RolesTable'
import {
    useCreateRole,
    useDeleteRole,
    useRoles,
    useUpdateRole,
} from '../hooks/roles.hooks'
import type { RoleFormValues } from '../schemas/role.schema'
import type { Role } from '../types/role.types'

const DEFAULT_PAGE_SIZE = 20

export function RolesView() {
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
    const [search, setSearch] = useState('')
    const [searchInput, setSearchInput] = useState('')
    const [modalOpen, setModalOpen] = useState(false)
    const [editingRole, setEditingRole] = useState<Role | null>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null)

    const { data, isFetching } = useRoles({ page, pageSize, search: search || undefined })
    const createRole = useCreateRole()
    const updateRole = useUpdateRole()
    const deleteRole = useDeleteRole()

    const roles = data?.items ?? []
    const totalRoles = data?.totalRecords ?? 0
    const isSaving = createRole.isPending || updateRole.isPending

    const openCreateModal = () => {
        setEditingRole(null)
        setModalOpen(true)
    }

    const openEditModal = (role: Role) => {
        setEditingRole(role)
        setModalOpen(true)
    }

    const closeModal = () => {
        if (isSaving) return
        setModalOpen(false)
        setEditingRole(null)
    }

    const handleSubmit = async (values: RoleFormValues) => {
        if (editingRole) {
            await updateRole.mutateAsync({ id: editingRole.id, data: values })
        } else {
            await createRole.mutateAsync(values)
        }

        closeModal()
    }

    const handleDelete = async (role: Role) => {
        setDeletingId(role.id)

        try {
            await deleteRole.mutateAsync(role.id)
        } finally {
            setDeletingId(null)
        }
    }

    const handleSearch = (value: string) => {
        setSearch(value.trim())
        setPage(1)
    }

    const handlePageChange = (nextPage: number, nextPageSize: number) => {
        setPage(nextPage)
        setPageSize(nextPageSize)
    }

    return (
        <>
            <ModuleSectionPanel
                title="Roles del sistema"
                caption={
                    <>
                        {totalRoles} registrado{totalRoles === 1 ? '' : 's'}
                        {search ? ` · filtrando por "${search}"` : ''}
                    </>
                }
                searchPlaceholder="Buscar por nombre de rol…"
                searchValue={searchInput}
                onSearchChange={setSearchInput}
                onSearch={handleSearch}
                actionLabel="Nuevo rol"
                onAction={openCreateModal}
            >
                <RolesTable
                    roles={roles}
                    loading={isFetching}
                    total={totalRoles}
                    page={page}
                    pageSize={pageSize}
                    onPageChange={handlePageChange}
                    onEdit={openEditModal}
                    onDelete={handleDelete}
                    deletingId={deletingId}
                />
            </ModuleSectionPanel>

            <RoleFormModal
                open={modalOpen}
                role={editingRole}
                loading={isSaving}
                onClose={closeModal}
                onSubmit={handleSubmit}
            />
        </>
    )
}
