import { useEffect, useMemo, useRef, useState } from 'react'
import {
    Button,
    Flex,
    Grid,
    Input,
    Select,
    Statistic,
    Typography,
    theme,
} from 'antd'
import {
    FilterOutlined,
    PlusOutlined,
    SearchOutlined,
    TeamOutlined,
    UserOutlined,
} from '@ant-design/icons'

import { useRoles } from '../../roles/hooks/roles.hooks'
import { UserFormModal } from '../components/UserFormModal'
import { UsersTable } from '../components/UsersTable'
import {
    useCreateUserWithPersona,
    useDeleteUser,
    useUpdateUser,
    useUsers,
} from '../hooks/users.hooks'
import {
    toCreateUsuarioPersonaPayload,
    type CreateUsuarioPersonaFormValues,
} from '../schemas/usuario-persona.schema'
import type { UpdateUserFormValues } from '../schemas/user.schema'
import type { User } from '../types/user.types'

const { Title, Text } = Typography
const { useBreakpoint } = Grid

const DEFAULT_PAGE_SIZE = 20
const FETCH_PAGE_SIZE = 5000

type StatusFilter = 'all' | 'activo' | 'inactivo'

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
    const [roleFilter, setRoleFilter] = useState<string | null>(null)
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
    const [modalOpen, setModalOpen] = useState(false)
    const [editingUser, setEditingUser] = useState<User | null>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [togglingId, setTogglingId] = useState<string | null>(null)

    const { data, isFetching } = useUsers({
        page: 1,
        pageSize: FETCH_PAGE_SIZE,
        search: search || undefined,
    })
    const { data: rolesData } = useRoles({ page: 1, pageSize: 100 })
    const createUserWithPersona = useCreateUserWithPersona()
    const updateUser = useUpdateUser()
    const deleteUser = useDeleteUser()

    const roleOptions = useMemo(
        () => rolesData?.items.map((role) => role.name) ?? [],
        [rolesData?.items],
    )

    const filteredUsers = useMemo(() => {
        let list = data?.items ?? []

        if (roleFilter) {
            list = list.filter((user) => user.roles.includes(roleFilter))
        }

        if (statusFilter === 'activo') {
            list = list.filter((user) => user.activo)
        } else if (statusFilter === 'inactivo') {
            list = list.filter((user) => !user.activo)
        }

        return list
    }, [data?.items, roleFilter, statusFilter])

    const totalUsers = data?.totalRecords ?? 0
    const totalFiltered = filteredUsers.length

    const users = useMemo(() => {
        const start = (page - 1) * pageSize
        return filteredUsers.slice(start, start + pageSize)
    }, [filteredUsers, page, pageSize])

    const activeOnPage = useMemo(
        () => users.filter((user) => user.activo).length,
        [users],
    )

    const hasActiveFilters = Boolean(roleFilter) || statusFilter !== 'all'

    const isSaving = createUserWithPersona.isPending || updateUser.isPending
    const onSearchRef = useRef<(value: string) => void>(() => undefined)

    useEffect(() => {
        onSearchRef.current = (value: string) => {
            setSearch(value.trim())
            setPage(1)
        }
    })

    useEffect(() => {
        const timer = window.setTimeout(() => {
            onSearchRef.current(searchInput.trim())
        }, 400)

        return () => window.clearTimeout(timer)
    }, [searchInput])

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

    const handleCreate = async (values: CreateUsuarioPersonaFormValues) => {
        await createUserWithPersona.mutateAsync(toCreateUsuarioPersonaPayload(values))
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

    const handleToggleActive = async (user: User) => {
        setTogglingId(user.id)

        try {
            await updateUser.mutateAsync({
                id: user.id,
                data: {
                    nombreCompleto: user.nombreCompleto,
                    activo: !user.activo,
                },
            })
        } finally {
            setTogglingId(null)
        }
    }

    const handleSearch = (value: string) => {
        setSearchInput(value)
        setSearch(value.trim())
        setPage(1)
    }

    const handleRoleFilterChange = (value: string | null) => {
        setRoleFilter(value)
        setPage(1)
    }

    const handleStatusFilterChange = (value: StatusFilter) => {
        setStatusFilter(value)
        setPage(1)
    }

    const handlePageChange = (nextPage: number, nextPageSize: number) => {
        setPage(nextPage)
        setPageSize(nextPageSize)
    }

    const clearFilters = () => {
        setRoleFilter(null)
        setStatusFilter('all')
        setPage(1)
    }

    const caption = (
        <>
            {hasActiveFilters ? totalFiltered : totalUsers} registrado
            {(hasActiveFilters ? totalFiltered : totalUsers) === 1 ? '' : 's'}
            {search ? ` · buscando "${search}"` : ''}
            {hasActiveFilters ? ' · filtros activos' : ''}
        </>
    )

    const filtersBar = (
        <div className="seguridad-usuarios__filters">
            <Input
                allowClear
                size="small"
                className="seguridad-usuarios__filter-search"
                prefix={<SearchOutlined style={{ color: token.colorTextQuaternary }} />}
                placeholder="Buscar por usuario o persona…"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                onPressEnter={() => handleSearch(searchInput)}
                onClear={() => {
                    setSearchInput('')
                    handleSearch('')
                }}
            />
            <Select
                allowClear
                size="small"
                className="seguridad-usuarios__filter-select"
                placeholder="Rol"
                value={roleFilter ?? undefined}
                options={roleOptions.map((role) => ({ label: role, value: role }))}
                onChange={(value) => handleRoleFilterChange(value ?? null)}
            />
            <Select
                size="small"
                className="seguridad-usuarios__filter-select"
                placeholder="Estado"
                value={statusFilter}
                options={[
                    { label: 'Todos', value: 'all' },
                    { label: 'Activos', value: 'activo' },
                    { label: 'Inactivos', value: 'inactivo' },
                ]}
                onChange={handleStatusFilterChange}
            />
            {hasActiveFilters ? (
                <Button
                    type="link"
                    size="small"
                    icon={<FilterOutlined />}
                    onClick={clearFilters}
                    className="seguridad-usuarios__filter-clear"
                >
                    Limpiar
                </Button>
            ) : null}
        </div>
    )

    const tableSection = (
        <UsersTable
            users={users}
            loading={isFetching}
            total={hasActiveFilters ? totalFiltered : totalUsers}
            page={page}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            onEdit={openEditModal}
            onDelete={handleDelete}
            onToggleActive={handleToggleActive}
            deletingId={deletingId}
            togglingId={togglingId}
            className="seguridad-usuarios__table"
        />
    )

    const formDrawer = (
        <UserFormModal
            open={modalOpen}
            user={editingUser}
            roleOptions={roleOptions}
            loading={isSaving}
            onClose={closeModal}
            onCreate={handleCreate}
            onUpdate={handleUpdate}
        />
    )

    if (embedded) {
        return (
            <>
                <div className="seguridad-section-panel seguridad-usuarios">
                    <div className="seguridad-section-panel__head">
                        <div className="seguridad-section-panel__head-text">
                            <Text strong className="seguridad-section-panel__title">
                                Cuentas de usuario
                            </Text>
                            <Text type="secondary" className="seguridad-section-panel__caption">
                                {caption}
                            </Text>
                        </div>
                        <Flex
                            gap={8}
                            wrap="wrap"
                            align="center"
                            className="seguridad-section-panel__actions"
                        >
                            {filtersBar}
                            <Button
                                type="primary"
                                size="small"
                                icon={<PlusOutlined />}
                                onClick={openCreateModal}
                            >
                                Nuevo usuario
                            </Button>
                        </Flex>
                    </div>

                    <div className="seguridad-section-panel__body">{tableSection}</div>
                </div>

                {formDrawer}
            </>
        )
    }

    return (
        <div className="admin-page seguridad-usuarios">
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

            <div className="admin-page__workspace">
                <section className="admin-page__panel">
                    <div className="admin-page__panel-toolbar">
                        <div>
                            <Text strong>Cuentas de usuario</Text>
                            <Text type="secondary" className="admin-page__panel-caption">
                                {caption}
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

                    <div className="admin-page__panel-search seguridad-usuarios__filters--panel">
                        {filtersBar}
                    </div>

                    <div className="admin-page__panel-body">{tableSection}</div>
                </section>
            </div>

            {formDrawer}
        </div>
    )
}
