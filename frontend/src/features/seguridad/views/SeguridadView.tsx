import { Col, Flex, Grid, Row, Typography } from 'antd'
import { SafetyCertificateOutlined } from '@ant-design/icons'
import { Outlet, useRouterState } from '@tanstack/react-router'

import {
    SeguridadSidebar,
    getActiveSeguridadSection,
    getSectionMeta,
} from '../components/SeguridadSidebar'

const { Title, Text } = Typography
const { useBreakpoint } = Grid

export function SeguridadView() {
    const screens = useBreakpoint()
    const isMobile = !screens.md
    const isStacked = !screens.lg
    const pathname = useRouterState({ select: (state) => state.location.pathname })
    const activeSection = getActiveSeguridadSection(pathname)
    const meta = getSectionMeta(activeSection)

    return (
        <div className="seguridad-view">
            <header className="seguridad-view__header">
                <Flex
                    justify="space-between"
                    align={isStacked ? 'flex-start' : 'center'}
                    gap={16}
                    wrap="wrap"
                >
                    <Flex align="center" gap={16} className="seguridad-view__header-main">
                        <div className="seguridad-view__header-icon" aria-hidden>
                            <SafetyCertificateOutlined />
                        </div>
                        <div>
                            <Title level={3} className="seguridad-view__title">
                                Seguridad
                            </Title>
                            <Text type="secondary" className="seguridad-view__subtitle">
                                Autenticación, usuarios y roles del sistema hospitalario.
                            </Text>
                        </div>
                    </Flex>

                    <div className="seguridad-view__section-badge">
                        <span className="seguridad-view__section-badge-icon" aria-hidden>
                            {meta.icon}
                        </span>
                        <div className="seguridad-view__section-badge-content">
                            <Text type="secondary" className="seguridad-view__section-badge-label">
                                Sección activa
                            </Text>
                            <Text strong className="seguridad-view__section-badge-title">
                                {meta.label}
                            </Text>
                        </div>
                    </div>
                </Flex>
            </header>

            {isMobile ? (
                <SeguridadSidebar variant="tabs" />
            ) : null}

            <div className="seguridad-view__workspace">
                <Row gutter={[20, 20]} className="seguridad-view__layout">
                    {!isMobile ? (
                        <Col xs={24} lg={6} xl={5}>
                            <SeguridadSidebar />
                        </Col>
                    ) : null}

                    <Col xs={24} lg={isMobile ? 24 : 18} xl={isMobile ? 24 : 19}>
                        <section className="seguridad-view__content">
                            {isMobile ? (
                                <div className="seguridad-view__content-intro">
                                    <Text type="secondary">{meta.description}</Text>
                                </div>
                            ) : null}

                            <Outlet />
                        </section>
                    </Col>
                </Row>
            </div>
        </div>
    )
}
