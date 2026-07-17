import { Card, Descriptions, Flex, Tag } from 'antd'

import {
    buildNombreCompletoPreview,
    type CreateUsuarioPersonaFormValues,
} from '../schemas/usuario-persona.schema'

type UserCreateSummaryProps = {
    values: CreateUsuarioPersonaFormValues
}

export function UserCreateSummary({ values }: UserCreateSummaryProps) {
    const nombreCompleto = buildNombreCompletoPreview(values)
    const documento = values.numeroDocumento?.trim() || '—'

    return (
        <Card className="usuario-drawer__summary-card" size="small">
            <Descriptions
                size="small"
                column={1}
                bordered
                className="usuario-drawer__summary"
            >
                <Descriptions.Item label="Persona">
                    {nombreCompleto || '—'}
                </Descriptions.Item>
                <Descriptions.Item label="Documento">{documento}</Descriptions.Item>
                <Descriptions.Item label="Teléfono">
                    {values.telefono?.trim() || '—'}
                </Descriptions.Item>
                <Descriptions.Item label="Usuario">
                    {values.userName?.trim() || values.numeroDocumento?.trim() || '—'}
                </Descriptions.Item>
                <Descriptions.Item label="Correo">
                    {values.email?.trim() || '—'}
                </Descriptions.Item>
                <Descriptions.Item label="Roles">
                    {values.roles.length > 0 ? (
                        <Flex gap={4} wrap="wrap">
                            {values.roles.map((role) => (
                                <Tag key={role} className="seguridad-role-tag">
                                    {role}
                                </Tag>
                            ))}
                        </Flex>
                    ) : (
                        '—'
                    )}
                </Descriptions.Item>
                <Descriptions.Item label="Estado">
                    <Tag className="seguridad-status-tag seguridad-status-tag--active">
                        Activo
                    </Tag>
                </Descriptions.Item>
            </Descriptions>
        </Card>
    )
}
