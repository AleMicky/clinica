import { useState } from 'react'
import {
    Button,
    Flex,
    Input,
    Typography,
    theme,
} from 'antd'
import { PlusOutlined, SearchOutlined } from '@ant-design/icons'

import { SeguridadSectionPanel } from '../../seguridad/components/SeguridadSectionPanel'
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

const { Title, Text } = Typography

const DEFAULT_PAGE_SIZE = 20

type RolesViewProps = {
    embedded?: boolean
}

export function RolesView({ embedded = false }: RolesViewProps) {
    const { token } = theme.useToken()

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

    if (embedded) {
        return (
            <>
                <SeguridadSectionPanel
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
                </SeguridadSectionPanel>

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

    return (
        <Flex vertical gap={24}>
            <Flex
                justify="space-between"
                align="flex-start"
                gap={16}
                wrap="wrap"
            >
                <div>
                    <Title level={3} style={{ marginBottom: 4 }}>
                        Roles y permisos
                    </Title>
                    <Text type="secondary">
                        Administre los roles del sistema y su asignación a usuarios.
                    </Text>
                </div>

                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={openCreateModal}
                >
                    Nuevo rol
                </Button>
            </Flex>

            <Input
                allowClear
                prefix={<SearchOutlined style={{ color: token.colorTextQuaternary }} />}
                placeholder="Buscar por nombre"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                onPressEnter={() => handleSearch(searchInput)}
                onClear={() => handleSearch('')}
                style={{ maxWidth: 360 }}
            />

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

            <RoleFormModal
                open={modalOpen}
                role={editingRole}
                loading={isSaving}
                onClose={closeModal}
                onSubmit={handleSubmit}
            />
        </Flex>
    )
}
