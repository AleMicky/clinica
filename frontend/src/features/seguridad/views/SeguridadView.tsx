import { Col, Flex, Grid, Row, Typography } from 'antd'
import { SafetyCertificateOutlined, TeamOutlined } from '@ant-design/icons'
import { Outlet } from '@tanstack/react-router'

import { useRoles } from '../../roles/hooks/roles.hooks'
import { useUsers } from '../../usuarios/hooks/users.hooks'
import { SeguridadSidebar } from '../components/SeguridadSidebar'

const { Text } = Typography
const { useBreakpoint } = Grid

export function SeguridadView() {
    const screens = useBreakpoint()
    const isMobile = !screens.md

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

            {isMobile ? <SeguridadSidebar variant="tabs" /> : null}

            <div className="erp-object-page__workspace">
                <Row gutter={[0, 0]} className="erp-object-page__layout">
                    {!isMobile ? (
                        <Col xs={24} lg={5} xl={4}>
                            <SeguridadSidebar />
                        </Col>
                    ) : null}

                    <Col xs={24} lg={isMobile ? 24 : 19} xl={isMobile ? 24 : 20}>
                        <section className="erp-object-page__content">
                            <Outlet />
                        </section>
                    </Col>
                </Row>
            </div>
        </div>
    )
}
