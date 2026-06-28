import { useMemo, useState } from 'react'
import {
    Button,
    Flex,
    Grid,
    Input,
    Statistic,
    Typography,
    theme,
} from 'antd'
import {
    PlusOutlined,
    SearchOutlined,
    TeamOutlined,
    UserOutlined,
} from '@ant-design/icons'

import { useRoles } from '../../roles/hooks/roles.hooks'
import { UserFormModal } from '../components/UserFormModal'
import { UsersTable } from '../components/UsersTable'
import {
    useCreateUser,
    useDeleteUser,
    useUpdateUser,
    useUsers,
} from '../hooks/users.hooks'
import type {
    CreateUserFormValues,
    UpdateUserFormValues,
} from '../schemas/user.schema'
import type { User } from '../types/user.types'

const { Title, Text } = Typography
const { useBreakpoint } = Grid

const DEFAULT_PAGE_SIZE = 20

type UsuariosViewProps = {
    embedded?: boolean
}

export function UsuariosView({ embedded = false }: UsuariosViewProps) {
    const { token } = theme.useToken()
    const screens = useBreakpoint()
    const isStacked = !screens.lg

    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
    const [search, setSearch] = useState('')
    const [searchInput, setSearchInput] = useState('')
    const [modalOpen, setModalOpen] = useState(false)
    const [editingUser, setEditingUser] = useState<User | null>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null)

    const { data, isFetching } = useUsers({
        page,
        pageSize,
        search: search || undefined,
    })
    const { data: rolesData } = useRoles({ page: 1, pageSize: 100 })
    const createUser = useCreateUser()
    const updateUser = useUpdateUser()
    const deleteUser = useDeleteUser()

    const users = data?.items ?? []
    const totalUsers = data?.totalRecords ?? 0

    const roleOptions = useMemo(
        () => rolesData?.items.map((role) => role.name) ?? [],
        [rolesData?.items],
    )

    const activeOnPage = useMemo(
        () => users.filter((user) => user.activo).length,
        [users],
    )

    const isSaving = createUser.isPending || updateUser.isPending

    const openCreateModal = () => {
        setEditingUser(null)
        setModalOpen(true)
    }

    const openEditModal = (user: User) => {
        setEditingUser(user)
        setModalOpen(true)
    }

    const closeModal = () => {
        if (isSaving) return
        setModalOpen(false)
        setEditingUser(null)
    }

    const handleCreate = async (values: CreateUserFormValues) => {
        await createUser.mutateAsync(values)
        closeModal()
    }

    const handleUpdate = async (values: UpdateUserFormValues) => {
        if (!editingUser) return

        const payload = {
            nombreCompleto: values.nombreCompleto,
            activo: values.activo,
        }

        await updateUser.mutateAsync({ id: editingUser.id, data: payload })
        closeModal()
    }

    const handleDelete = async (user: User) => {
        setDeletingId(user.id)

        try {
            await deleteUser.mutateAsync(user.id)
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
        <div className={embedded ? 'seguridad-panel' : 'admin-page'}>
            {!embedded ? (
                <header className="admin-page__header">
                    <Flex
                        justify="space-between"
                        align={isStacked ? 'flex-start' : 'center'}
                        gap={16}
                        wrap="wrap"
                    >
                        <Flex align="center" gap={16}>
                            <div className="admin-page__header-icon" aria-hidden>
                                <UserOutlined />
                            </div>
                            <div>
                                <Title level={3} className="admin-page__title">
                                    Usuarios
                                </Title>
                                <Text type="secondary">
                                    Administre las cuentas de acceso al sistema hospitalario.
                                </Text>
                            </div>
                        </Flex>

                        <Flex gap={12} wrap="wrap" className="admin-page__header-stats">
                            <div className="admin-page__stat">
                                <Statistic
                                    title="Registrados"
                                    value={totalUsers}
                                    prefix={<TeamOutlined />}
                                    loading={isFetching}
                                />
                            </div>
                            <div className="admin-page__stat">
                                <Statistic
                                    title="Activos"
                                    value={activeOnPage}
                                    suffix={users.length > 0 ? `/ ${users.length}` : undefined}
                                    prefix={<UserOutlined />}
                                    loading={isFetching}
                                />
                            </div>
                        </Flex>
                    </Flex>
                </header>
            ) : null}

            <div className={embedded ? undefined : 'admin-page__workspace'}>
                <section className="admin-page__panel">
                    <div className="admin-page__panel-toolbar">
                        <div>
                            <Text strong>Cuentas de usuario</Text>
                            <Text type="secondary" className="admin-page__panel-caption">
                                {totalUsers} registrado{totalUsers === 1 ? '' : 's'}
                                {search ? ` · filtrando por "${search}"` : ''}
                            </Text>
                        </div>
                        <Button
                            type="primary"
                            size="small"
                            icon={<PlusOutlined />}
                            onClick={openCreateModal}
                        >
                            Nuevo usuario
                        </Button>
                    </div>

                    <div className="admin-page__panel-search">
                        <Input
                            allowClear
                            prefix={<SearchOutlined style={{ color: token.colorTextQuaternary }} />}
                            placeholder="Buscar por usuario o nombre…"
                            value={searchInput}
                            onChange={(event) => setSearchInput(event.target.value)}
                            onPressEnter={() => handleSearch(searchInput)}
                            onClear={() => {
                                setSearchInput('')
                                handleSearch('')
                            }}
                        />
                    </div>

                    <div className="admin-page__panel-body">
                        <Flex
                            justify="space-between"
                            align="center"
                            className="admin-page__section-head"
                        >
                            <Text strong>Listado de usuarios</Text>
                            <Text type="secondary" className="admin-page__section-count">
                                {users.length} en esta página
                            </Text>
                        </Flex>

                        <UsersTable
                            users={users}
                            loading={isFetching}
                            total={totalUsers}
                            page={page}
                            pageSize={pageSize}
                            onPageChange={handlePageChange}
                            onEdit={openEditModal}
                            onDelete={handleDelete}
                            deletingId={deletingId}
                        />
                    </div>
                </section>
            </div>

            <UserFormModal
                open={modalOpen}
                user={editingUser}
                roleOptions={roleOptions}
                loading={isSaving}
                onClose={closeModal}
                onCreate={handleCreate}
                onUpdate={handleUpdate}
            />
        </div>
    )
}
