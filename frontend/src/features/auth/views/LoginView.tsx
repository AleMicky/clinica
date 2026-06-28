import { Col, Flex, Grid, Row, theme, Typography } from 'antd'
import {
    MedicineBoxOutlined,
    SafetyCertificateOutlined,
    TeamOutlined,
} from '@ant-design/icons'

import { LoginForm } from '../components/LoginForm'

const { Title, Paragraph, Text } = Typography
const { useBreakpoint } = Grid

const features = [
    {
        icon: <TeamOutlined />,
        title: 'Gestión integral',
        description: 'Administre pacientes, personal y recursos desde un solo lugar.',
    },
    {
        icon: <SafetyCertificateOutlined />,
        title: 'Acceso seguro',
        description: 'Credenciales protegidas para el personal autorizado.',
    },
    {
        icon: <MedicineBoxOutlined />,
        title: 'Operación clínica',
        description: 'Herramientas pensadas para el día a día del hospital.',
    },
]

function BrandHeader({ compact = false }: { compact?: boolean }) {
    return (
        <Flex align="center" gap={compact ? 10 : 12} className="login-view__brand-header">
            <div className="login-view__brand-icon">
                <MedicineBoxOutlined />
            </div>
            <div>
                <Title
                    level={compact ? 4 : 3}
                    className="login-view__brand-title"
                    style={{ margin: 0 }}
                >
                    Hospital Admin
                </Title>
                <Text className="login-view__brand-subtitle">
                    Panel de administración clínica
                </Text>
            </div>
        </Flex>
    )
}

export function LoginView() {
    const { token } = theme.useToken()
    const screens = useBreakpoint()
    const isMobile = !screens.md
    const showFeatures = Boolean(screens.lg)

    return (
        <div
            className="login-view"
            style={{ '--login-primary': token.colorPrimary } as React.CSSProperties}
        >
            <Row
                className="login-view__card"
                style={{
                    borderRadius: token.borderRadiusLG * 2,
                    background: token.colorBgContainer,
                }}
            >
                {!isMobile && (
                    <Col xs={0} md={10} lg={11} className="login-view__brand">
                        <Flex vertical justify="space-between" className="login-view__brand-inner">
                            <div>
                                <BrandHeader />
                                <Paragraph className="login-view__brand-description">
                                    Plataforma centralizada para la gestión hospitalaria con
                                    control de acceso y flujos operativos seguros.
                                </Paragraph>
                            </div>

                            {showFeatures && (
                                <Flex vertical gap={20} className="login-view__features">
                                    {features.map((feature) => (
                                        <Flex key={feature.title} gap={14} align="flex-start">
                                            <div className="login-view__feature-icon">
                                                {feature.icon}
                                            </div>
                                            <div>
                                                <Text strong className="login-view__feature-title">
                                                    {feature.title}
                                                </Text>
                                                <Text className="login-view__feature-description">
                                                    {feature.description}
                                                </Text>
                                            </div>
                                        </Flex>
                                    ))}
                                </Flex>
                            )}
                        </Flex>
                    </Col>
                )}

                <Col xs={24} md={14} lg={13} className="login-view__form">
                    <Flex vertical justify="center" className="login-view__form-inner">
                        {isMobile && (
                            <div className="login-view__mobile-brand">
                                <BrandHeader compact />
                            </div>
                        )}

                        <div className="login-view__form-header">
                            <Title level={isMobile ? 4 : 3} style={{ marginBottom: 8 }}>
                                Bienvenido
                            </Title>
                            <Text type="secondary">
                                Ingrese sus credenciales para acceder al sistema
                            </Text>
                        </div>

                        <LoginForm />
                    </Flex>
                </Col>
            </Row>
        </div>
    )
}
