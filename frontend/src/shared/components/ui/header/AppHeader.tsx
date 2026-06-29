import { useMemo, useState } from 'react'
import {
    AutoComplete,
    Avatar,
    Breadcrumb,
    Button,
    Dropdown,
    Flex,
    Input,
    Space,
    Tag,
    theme,
    Typography,
} from 'antd'
import {
    LogoutOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    SearchOutlined,
    UserOutlined,
} from '@ant-design/icons'
import { Link, useNavigate, useRouterState } from '@tanstack/react-router'

import { ThemeToggle } from '../theme-toggle/ThemeToggle'
import { useLogout, useMe } from '../../../../features/auth/hooks/auth.hooks'
import { authStore } from '../../../../stores/auth.store'
import {
    getBreadcrumbSegments,
    getMenuGroupsForUser,
    type AppMenuItem,
} from '../sidebar/menu-items'

const { Text } = Typography

type AppHeaderProps = {
    collapsed: boolean
    isMobile: boolean
    onToggleSidebar: () => void
}

export function AppHeader({ collapsed, isMobile, onToggleSidebar }: AppHeaderProps) {
    const navigate = useNavigate()
    const logout = useLogout()
    const { data: user } = useMe()
    const pathname = useRouterState({ select: (state) => state.location.pathname })
    const userRoles = authStore((state) => state.user?.roles ?? [])
    const breadcrumbSegments = getBreadcrumbSegments(pathname, userRoles)
    const currentPage = breadcrumbSegments[breadcrumbSegments.length - 1]?.title ?? 'Panel'

    const [searchOpen, setSearchOpen] = useState(false)
    const [searchValue, setSearchValue] = useState('')

    const { token } = theme.useToken()
    const primaryRole = userRoles[0]

    const searchableItems = useMemo(() => {
        return getMenuGroupsForUser(userRoles).flatMap((group) =>
            group.items
                .filter((item): item is AppMenuItem & { to: NonNullable<AppMenuItem['to']> } =>
                    Boolean(item.to),
                )
                .map((item) => ({
                    value: item.key,
                    label: (
                        <Flex align="center" justify="space-between" gap={8}>
                            <span>{item.label}</span>
                            <Text type="secondary" style={{ fontSize: 11 }}>
                                {group.label}
                            </Text>
                        </Flex>
                    ),
                    item,
                })),
        )
    }, [userRoles])

    const filteredOptions = useMemo(() => {
        const query = searchValue.trim().toLowerCase()
        if (!query) return searchableItems

        return searchableItems.filter(({ item }) =>
            item.label.toLowerCase().includes(query),
        )
    }, [searchableItems, searchValue])

    const handleSearchSelect = (key: string) => {
        const match = searchableItems.find((entry) => entry.value === key)
        if (!match?.item.to) return

        navigate({ to: match.item.to })
        setSearchValue('')
        setSearchOpen(false)
    }

    return (
        <header className="admin-header">
            <Flex align="center" gap={12} className="admin-header__left">
                <Button
                    type="text"
                    className="admin-header__toggle"
                    icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                    onClick={onToggleSidebar}
                    aria-label={collapsed ? 'Abrir menú' : 'Cerrar menú'}
                />

                {!isMobile && (
                    <Text strong className="admin-header__app-name">
                        Clínica ERP
                    </Text>
                )}

                <div className="admin-header__divider" aria-hidden />

                <div className="admin-header__context">
                    <Text strong className="admin-header__page-title">
                        {currentPage}
                    </Text>

                    {!isMobile && (
                        <Breadcrumb
                            className="admin-header__breadcrumb"
                            items={breadcrumbSegments.map((segment, index) => {
                                const isLast = index === breadcrumbSegments.length - 1

                                return {
                                    title:
                                        segment.to && !isLast ? (
                                            <Link
                                                to={segment.to}
                                                className="admin-header__breadcrumb-link"
                                            >
                                                {segment.title}
                                            </Link>
                                        ) : (
                                            segment.title
                                        ),
                                }
                            })}
                        />
                    )}
                </div>
            </Flex>

            <Flex align="center" gap={8} className="admin-header__actions">
                {(!isMobile || searchOpen) && (
                    <AutoComplete
                        className={`admin-header__search${isMobile ? ' admin-header__search--mobile' : ''}`}
                        options={filteredOptions}
                        value={searchValue}
                        onChange={setSearchValue}
                        onSelect={handleSearchSelect}
                        onBlur={() => {
                            if (isMobile && !searchValue) setSearchOpen(false)
                        }}
                        popupMatchSelectWidth={280}
                    >
                        <Input
                            size="small"
                            allowClear
                            placeholder="Buscar módulos…"
                            prefix={<SearchOutlined style={{ color: token.colorTextQuaternary }} />}
                            autoFocus={isMobile && searchOpen}
                        />
                    </AutoComplete>
                )}

                {isMobile && !searchOpen && (
                    <Button
                        type="text"
                        className="admin-header__search-trigger"
                        icon={<SearchOutlined />}
                        aria-label="Buscar módulos"
                        onClick={() => setSearchOpen(true)}
                    />
                )}

                <ThemeToggle />

                <Dropdown
                    trigger={['click']}
                    menu={{
                        items: [
                            {
                                key: 'profile',
                                icon: <UserOutlined />,
                                label: 'Mi perfil',
                                onClick: () => navigate({ to: '/usuarios/perfil' }),
                            },
                            { type: 'divider' },
                            {
                                key: 'logout',
                                icon: <LogoutOutlined />,
                                label: 'Cerrar sesión',
                                danger: true,
                                onClick: logout,
                            },
                        ],
                    }}
                >
                    <Space className="admin-header__user" style={{ cursor: 'pointer' }}>
                        <Avatar
                            size={32}
                            style={{ backgroundColor: token.colorPrimary }}
                            icon={<UserOutlined />}
                        />
                        {!isMobile && (
                            <Flex vertical gap={0} className="admin-header__user-info">
                                <Text strong className="admin-header__user-name">
                                    {user?.nombreCompleto}
                                </Text>
                                {primaryRole && (
                                    <Tag variant="filled" className="admin-header__user-role">
                                        {primaryRole}
                                    </Tag>
                                )}
                            </Flex>
                        )}
                    </Space>
                </Dropdown>
            </Flex>
        </header>
    )
}
