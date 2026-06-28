import { Avatar, Breadcrumb, Button, Dropdown, Flex, Space, Tag, theme, Typography } from 'antd'
import {
    LogoutOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    UserOutlined,
} from '@ant-design/icons'
import { Link, useRouterState } from '@tanstack/react-router'

import { ThemeToggle } from '../theme-toggle/ThemeToggle'
import { useLogout, useMe } from '../../../../features/auth/hooks/auth.hooks'
import { authStore } from '../../../../stores/auth.store'
import { getBreadcrumbSegments } from '../sidebar/menu-items'

const { Text } = Typography

type AppHeaderProps = {
    collapsed: boolean
    isMobile: boolean
    onToggleSidebar: () => void
}

export function AppHeader({ collapsed, isMobile, onToggleSidebar }: AppHeaderProps) {
    const logout = useLogout()
    const { data: user } = useMe()
    const pathname = useRouterState({ select: (state) => state.location.pathname })
    const userRoles = authStore((state) => state.user?.roles ?? [])
    const breadcrumbSegments = getBreadcrumbSegments(pathname, userRoles)
    const currentPage = breadcrumbSegments[breadcrumbSegments.length - 1]?.title ?? 'Panel'

    const { token } = theme.useToken()
    const primaryRole = userRoles[0]

    return (
        <header className="admin-header">
            <div className="admin-header__accent" aria-hidden />

            <Flex align="center" gap={16} className="admin-header__left">
                <Button
                    type="text"
                    className="admin-header__toggle"
                    icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                    onClick={onToggleSidebar}
                    aria-label={collapsed ? 'Abrir menú' : 'Cerrar menú'}
                />

                <div className="admin-header__context">
                    {!isMobile && (
                        <Text strong className="admin-header__page-title">
                            {currentPage}
                        </Text>
                    )}

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
                </div>
            </Flex>

            <Flex align="center" gap={4} className="admin-header__actions">
                <ThemeToggle />

                <Dropdown
                    trigger={['click']}
                    menu={{
                        items: [
                            {
                                key: 'profile',
                                icon: <UserOutlined />,
                                label: 'Mi perfil',
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
                            size={34}
                            style={{ backgroundColor: token.colorPrimary }}
                            icon={<UserOutlined />}
                        />
                        {!isMobile && (
                            <Flex vertical gap={0} className="admin-header__user-info">
                                <Text strong className="admin-header__user-name">
                                    {user?.nombreCompleto}
                                </Text>
                                {primaryRole && (
                                    <Tag bordered={false} className="admin-header__user-role">
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
