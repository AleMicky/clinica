import { Avatar, Card, Descriptions, Flex, Tag, Typography, theme } from 'antd'
import { UserOutlined } from '@ant-design/icons'

import { ChangePasswordForm } from '../components/ChangePasswordForm'
import { useMe } from '../hooks/auth.hooks'

const { Title, Text } = Typography

function getInitials(name: string, userName: string) {
    const source = name.trim() || userName.trim()
    const parts = source.split(/\s+/).filter(Boolean)

    if (parts.length >= 2) {
        return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase()
    }

    return source.slice(0, 2).toUpperCase()
}

export function PerfilView() {
    const { token } = theme.useToken()
    const { data: user, isFetching } = useMe()

    const initials = user
        ? getInitials(user.nombreCompleto, user.userName)
        : '—'

    return (
        <div className="perfil-page">
            <Flex vertical gap={16}>
                <div>
                    <Title level={3} style={{ margin: 0 }}>
                        Mi perfil
                    </Title>
                    <Text type="secondary">
                        Información de su cuenta en el sistema
                    </Text>
                </div>

                <Card loading={isFetching}>
                    {user ? (
                        <Flex vertical gap={24}>
                            <Flex align="center" gap={16} wrap="wrap">
                                <Avatar
                                    size={64}
                                    style={{
                                        backgroundColor: token.colorPrimary,
                                        fontSize: 22,
                                        fontWeight: 700,
                                    }}
                                >
                                    {initials}
                                </Avatar>
                                <div>
                                    <Title level={4} style={{ margin: 0 }}>
                                        {user.nombreCompleto}
                                    </Title>
                                    <Text type="secondary">@{user.userName}</Text>
                                </div>
                            </Flex>

                            <Descriptions column={{ xs: 1, sm: 2 }} bordered size="small">
                                <Descriptions.Item label="Nombre completo">
                                    {user.nombreCompleto}
                                </Descriptions.Item>
                                <Descriptions.Item label="Usuario">
                                    {user.userName}
                                </Descriptions.Item>
                                <Descriptions.Item label="Correo electrónico">
                                    {user.email?.trim() || '—'}
                                </Descriptions.Item>
                                <Descriptions.Item label="Estado">
                                    <Tag color={user.activo !== false ? 'success' : 'default'}>
                                        {user.activo !== false ? 'Activo' : 'Inactivo'}
                                    </Tag>
                                </Descriptions.Item>
                                <Descriptions.Item label="Roles" span={2}>
                                    {user.roles.length > 0 ? (
                                        <Flex gap={6} wrap="wrap">
                                            {user.roles.map((role) => (
                                                <Tag
                                                    key={role}
                                                    icon={<UserOutlined />}
                                                    className="seguridad-role-tag"
                                                >
                                                    {role}
                                                </Tag>
                                            ))}
                                        </Flex>
                                    ) : (
                                        '—'
                                    )}
                                </Descriptions.Item>
                            </Descriptions>
                        </Flex>
                    ) : null}
                </Card>

                <Card title="Cambiar contraseña">
                    <ChangePasswordForm />
                </Card>
            </Flex>
        </div>
    )
}
