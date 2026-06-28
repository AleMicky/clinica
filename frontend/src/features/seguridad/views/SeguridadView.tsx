import { Flex, Typography } from 'antd'
import { SafetyCertificateOutlined, TeamOutlined } from '@ant-design/icons'
import { Outlet } from '@tanstack/react-router'

import { useRoles } from '../../roles/hooks/roles.hooks'
import { useUsers } from '../../usuarios/hooks/users.hooks'

const { Text } = Typography

export function SeguridadView() {
    const { data: usersData, isFetching: isLoadingUsers } = useUsers({
        page: 1,
        pageSize: 1,
    })
    const { data: rolesData, isFetching: isLoadingRoles } = useRoles({
        page: 1,
        pageSize: 1,
    })

    const totalUsers = usersData?.totalRecords ?? 0
    const totalRoles = rolesData?.totalRecords ?? 0

    return (
        <div className="erp-object-page">
            <header className="erp-object-page__header">
                <Flex align="center" gap={10} className="erp-object-page__header-main">
                    <div className="erp-object-page__header-icon" aria-hidden>
                        <SafetyCertificateOutlined />
                    </div>
                    <div>
                        <Text strong className="erp-object-page__title">
                            Seguridad
                        </Text>
                        <Text type="secondary" className="erp-object-page__subtitle">
                            Usuarios y roles del sistema
                        </Text>
                    </div>
                </Flex>

                <Flex gap={12} wrap="wrap" className="erp-object-page__stats">
                    <span className="erp-object-page__stat">
                        <TeamOutlined />
                        {isLoadingUsers ? '…' : `${totalUsers} usuarios`}
                    </span>
                    <span className="erp-object-page__stat">
                        <SafetyCertificateOutlined />
                        {isLoadingRoles ? '…' : `${totalRoles} roles`}
                    </span>
                </Flex>
            </header>

            <div className="erp-object-page__workspace">
                <section className="erp-object-page__content">
                    <Outlet />
                </section>
            </div>
        </div>
    )
}
