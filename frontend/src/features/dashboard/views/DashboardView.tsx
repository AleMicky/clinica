import { Flex, Tag, Typography, theme } from 'antd'
import { CalendarOutlined } from '@ant-design/icons'
import { Link } from '@tanstack/react-router'

import { useMe } from '../../auth/hooks/auth.hooks'
import { authStore } from '../../../stores/auth.store'
import { getMenuGroupsForUser } from '../../../shared/components/ui/sidebar/menu-items'

const { Text } = Typography

function formatToday(): string {
    return new Intl.DateTimeFormat('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(new Date())
}

export function DashboardView() {
    const { token } = theme.useToken()
    const { data: user } = useMe()
    const userRoles = authStore((state) => state.user?.roles ?? [])
    const menuGroups = getMenuGroupsForUser(userRoles)

    const launchpadTiles = menuGroups.flatMap((group) =>
        group.items
            .filter((item) => item.to)
            .map((item) => ({ ...item, groupLabel: group.label })),
    )

    const primaryRole = userRoles[0]

    return (
        <div className="erp-launchpad">
            <header className="erp-launchpad__header">
                <Flex justify="space-between" align="center" wrap="wrap" gap={12}>
                    <div>
                        <Text className="erp-launchpad__greeting">
                            Bienvenido, {user?.nombreCompleto ?? 'Usuario'}
                        </Text>
                        <Text type="secondary" className="erp-launchpad__subtitle">
                            Seleccione un módulo para comenzar
                        </Text>
                    </div>

                    <Flex align="center" gap={8} className="erp-launchpad__meta">
                        <CalendarOutlined style={{ color: token.colorTextSecondary, fontSize: 13 }} />
                        <Text type="secondary" className="erp-launchpad__date">
                            {formatToday()}
                        </Text>
                        {primaryRole && (
                            <Tag variant="filled" className="erp-launchpad__role-tag">
                                {primaryRole}
                            </Tag>
                        )}
                    </Flex>
                </Flex>
            </header>

            {menuGroups.map((group) => {
                const groupTiles = group.items.filter((item) => item.to)

                if (groupTiles.length === 0) return null

                return (
                    <section key={group.key} className="erp-launchpad__group">
                        <Text className="erp-launchpad__group-label">{group.label}</Text>

                        <div className="erp-launchpad__tiles">
                            {groupTiles.map((module) => (
                                <Link
                                    key={module.key}
                                    to={module.to!}
                                    className="erp-launchpad__tile"
                                    title={module.label}
                                >
                                    <span className="erp-launchpad__tile-icon">{module.icon}</span>
                                    <span className="erp-launchpad__tile-label">{module.label}</span>
                                </Link>
                            ))}
                        </div>
                    </section>
                )
            })}

            {launchpadTiles.length === 0 && (
                <div className="erp-launchpad__empty">
                    <Text type="secondary">
                        No hay módulos disponibles para su perfil.
                    </Text>
                </div>
            )}
        </div>
    )
}
