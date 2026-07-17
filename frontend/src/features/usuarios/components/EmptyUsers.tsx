import { memo } from 'react'
import { Button, Empty, Flex, Typography } from 'antd'
import { PlusOutlined, UserOutlined } from '@ant-design/icons'

type EmptyUsersProps = {
    hasFilters?: boolean
    onClearFilters?: () => void
    onCreate?: () => void
}

export const EmptyUsers = memo(function EmptyUsers({
    hasFilters = false,
    onClearFilters,
    onCreate,
}: EmptyUsersProps) {
    return (
        <div className="seguridad-usuarios__empty" role="status">
            <Empty
                image={
                    <div className="seguridad-usuarios__empty-icon" aria-hidden>
                        <UserOutlined />
                    </div>
                }
                description={
                    <Flex vertical gap={4} align="center">
                        <Typography.Text strong>
                            {hasFilters ? 'Sin resultados' : 'No hay usuarios todavía'}
                        </Typography.Text>
                        <Typography.Text type="secondary">
                            {hasFilters
                                ? 'Prueba con otra búsqueda o limpia los filtros activos.'
                                : 'Crea el primer usuario para dar acceso al sistema.'}
                        </Typography.Text>
                    </Flex>
                }
            >
                <Flex gap={8} justify="center" wrap="wrap">
                    {hasFilters && onClearFilters ? (
                        <Button onClick={onClearFilters} aria-label="Limpiar filtros">
                            Limpiar filtros
                        </Button>
                    ) : null}
                    {!hasFilters && onCreate ? (
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={onCreate}
                            aria-label="Crear nuevo usuario"
                        >
                            Nuevo usuario
                        </Button>
                    ) : null}
                </Flex>
            </Empty>
        </div>
    )
})
