import { Col, Flex, Grid, Row, Typography } from 'antd'
import { SafetyCertificateOutlined, TeamOutlined } from '@ant-design/icons'
import { Outlet } from '@tanstack/react-router'

import { useRoles } from '../../roles/hooks/roles.hooks'
import { useUsers } from '../../usuarios/hooks/users.hooks'
import { SeguridadSidebar } from '../components/SeguridadSidebar'

const { Title, Text } = Typography
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
        <div className="seguridad-view">
            <header className="seguridad-view__hero">
                <Flex
                    justify="space-between"
                    align="center"
                    gap={12}
                    wrap="wrap"
                    className="seguridad-view__hero-inner"
                >
                    <Flex align="center" gap={10} className="seguridad-view__hero-main">
                        <div className="seguridad-view__hero-icon" aria-hidden>
                            <SafetyCertificateOutlined />
                        </div>
                        <div>
                            <Title level={4} className="seguridad-view__title">
                                Seguridad
                            </Title>
                            <Text type="secondary" className="seguridad-view__subtitle">
                                Usuarios y roles del sistema
                            </Text>
                        </div>
                    </Flex>

                    <Flex gap={8} wrap="wrap" className="seguridad-view__stats">
                        <span className="seguridad-view__stat-pill">
                            <TeamOutlined />
                            {isLoadingUsers ? '…' : `${totalUsers} usuarios`}
                        </span>
                        <span className="seguridad-view__stat-pill">
                            <SafetyCertificateOutlined />
                            {isLoadingRoles ? '…' : `${totalRoles} roles`}
                        </span>
                    </Flex>
                </Flex>
            </header>

            {isMobile ? <SeguridadSidebar variant="tabs" /> : null}

            <div className="seguridad-view__workspace">
                <Row gutter={[12, 12]} className="seguridad-view__layout">
                    {!isMobile ? (
                        <Col xs={24} lg={6} xl={5}>
                            <SeguridadSidebar />
                        </Col>
                    ) : null}

                    <Col xs={24} lg={isMobile ? 24 : 18} xl={isMobile ? 24 : 19}>
                        <section className="seguridad-view__content">
                            <Outlet />
                        </section>
                    </Col>
                </Row>
            </div>
        </div>
    )
}
