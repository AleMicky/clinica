import { Card, Col, Flex, Row, Tag, Typography, theme } from 'antd'
import {
    ArrowRightOutlined,
    CalendarOutlined,
    DashboardOutlined,
    TeamOutlined,
} from '@ant-design/icons'
import { Link } from '@tanstack/react-router'

import { useMe } from '../../auth/hooks/auth.hooks'
import { authStore } from '../../../stores/auth.store'
import { getMenuGroupsForUser } from '../../../shared/components/ui/sidebar/menu-items'

const { Title, Text, Paragraph } = Typography

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

    const quickModules = menuGroups
        .flatMap((group) =>
            group.items
                .filter((item) => item.to && item.key !== '/')
                .map((item) => ({ ...item, groupLabel: group.label })),
        )
        .slice(0, 6)

    const primaryRole = userRoles[0]

    return (
        <div className="erp-dashboard">
            <header className="erp-dashboard__hero">
                <Flex justify="space-between" align="flex-start" wrap="wrap" gap={16}>
                    <div>
                        <Flex align="center" gap={10} className="erp-dashboard__hero-eyebrow">
                            <DashboardOutlined />
                            <Text type="secondary">Panel principal</Text>
                        </Flex>
                        <Title level={3} className="erp-dashboard__hero-title">
                            Bienvenido, {user?.nombreCompleto ?? 'Usuario'}
                        </Title>
                        <Paragraph type="secondary" className="erp-dashboard__hero-subtitle">
                            Sistema de gestión hospitalaria — acceda a los módulos operativos desde
                            este panel.
                        </Paragraph>
                    </div>

                    <Flex align="center" gap={8} className="erp-dashboard__hero-meta">
                        <CalendarOutlined style={{ color: token.colorTextSecondary }} />
                        <Text type="secondary" className="erp-dashboard__hero-date">
                            {formatToday()}
                        </Text>
                        {primaryRole && (
                            <Tag color="blue" className="erp-dashboard__role-tag">
                                {primaryRole}
                            </Tag>
                        )}
                    </Flex>
                </Flex>
            </header>

            <Row gutter={[16, 16]} className="erp-dashboard__kpis">
                <Col xs={24} sm={12} lg={6}>
                    <Card className="erp-dashboard__kpi-card" size="small">
                        <Text type="secondary" className="erp-dashboard__kpi-label">
                            Módulos activos
                        </Text>
                        <Title level={2} className="erp-dashboard__kpi-value">
                            {quickModules.length}
                        </Title>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card className="erp-dashboard__kpi-card" size="small">
                        <Text type="secondary" className="erp-dashboard__kpi-label">
                            Áreas de acceso
                        </Text>
                        <Title level={2} className="erp-dashboard__kpi-value">
                            {menuGroups.length}
                        </Title>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card className="erp-dashboard__kpi-card" size="small">
                        <Text type="secondary" className="erp-dashboard__kpi-label">
                            Sesión
                        </Text>
                        <Title level={4} className="erp-dashboard__kpi-value erp-dashboard__kpi-value--sm">
                            Activa
                        </Title>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card className="erp-dashboard__kpi-card" size="small">
                        <Text type="secondary" className="erp-dashboard__kpi-label">
                            Sistema
                        </Text>
                        <Title level={4} className="erp-dashboard__kpi-value erp-dashboard__kpi-value--sm">
                            Clínica ERP
                        </Title>
                    </Card>
                </Col>
            </Row>

            <section className="erp-dashboard__modules">
                <Flex justify="space-between" align="center" className="erp-dashboard__section-head">
                    <div>
                        <Title level={5} style={{ margin: 0 }}>
                            Acceso rápido
                        </Title>
                        <Text type="secondary">Módulos disponibles según su perfil</Text>
                    </div>
                </Flex>

                <Row gutter={[12, 12]}>
                    {quickModules.map((module) => (
                        <Col key={module.key} xs={24} sm={12} lg={8}>
                            <Link to={module.to!} className="erp-dashboard__module-link">
                                <Card className="erp-dashboard__module-card" size="small" hoverable>
                                    <Flex align="center" gap={14}>
                                        <div className="erp-dashboard__module-icon">{module.icon}</div>
                                        <div className="erp-dashboard__module-content">
                                            <Text strong className="erp-dashboard__module-title">
                                                {module.label}
                                            </Text>
                                            <Text type="secondary" className="erp-dashboard__module-group">
                                                {module.groupLabel}
                                            </Text>
                                        </div>
                                        <ArrowRightOutlined className="erp-dashboard__module-arrow" />
                                    </Flex>
                                </Card>
                            </Link>
                        </Col>
                    ))}

                    {quickModules.length === 0 && (
                        <Col span={24}>
                            <Card className="erp-dashboard__empty">
                                <Flex vertical align="center" gap={8}>
                                    <TeamOutlined style={{ fontSize: 32, opacity: 0.4 }} />
                                    <Text type="secondary">
                                        No hay módulos adicionales disponibles para su perfil.
                                    </Text>
                                </Flex>
                            </Card>
                        </Col>
                    )}
                </Row>
            </section>
        </div>
    )
}
