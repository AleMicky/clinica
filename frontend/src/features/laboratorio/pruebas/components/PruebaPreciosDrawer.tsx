import { Button, Drawer, Space, Typography } from 'antd'
import { PlusOutlined } from '@ant-design/icons'

import { PruebaPrecioFormModal } from './PruebaPrecioFormModal'
import { PruebaPreciosTable } from './PruebaPreciosTable'
import type { PruebaPrecioFormValues } from '../schemas/prueba-precio.schema'
import type { PruebaPrecio } from '../types/prueba-precio.types'
import type { Prueba } from '../types/prueba.types'

const { Text } = Typography

type PruebaPreciosDrawerProps = {
    open: boolean
    prueba: Prueba | null
    loading: boolean
    items: PruebaPrecio[]
    onClose: () => void
    onCreate: () => void
    onEdit: (precio: PruebaPrecio) => void
    onDelete: (precio: PruebaPrecio) => void
    deletingId: string | null
    formModal: {
        open: boolean
        entity: PruebaPrecio | null
        isSaving: boolean
        onClose: () => void
        onSubmit: (values: PruebaPrecioFormValues) => Promise<void>
    }
}

export function PruebaPreciosDrawer({
    open,
    prueba,
    loading,
    items,
    onClose,
    onCreate,
    onEdit,
    onDelete,
    deletingId,
    formModal,
}: PruebaPreciosDrawerProps) {
    const pruebaLabel = prueba ? `${prueba.codigo} — ${prueba.nombre}` : ''

    return (
        <>
            <Drawer
                title="Precios de la prueba"
                open={open}
                onClose={onClose}
                width={820}
                destroyOnHidden
                extra={
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={onCreate}
                        disabled={!prueba}
                    >
                        Nuevo precio
                    </Button>
                }
            >
                {prueba ? (
                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                        <div>
                            <Text strong>{prueba.nombre}</Text>
                            <br />
                            <Text type="secondary" code>
                                {prueba.codigo}
                            </Text>
                        </div>

                        <PruebaPreciosTable
                            items={items}
                            loading={loading}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            deletingId={deletingId}
                        />
                    </Space>
                ) : null}
            </Drawer>

            <PruebaPrecioFormModal
                open={formModal.open}
                entity={formModal.entity}
                pruebaLabel={pruebaLabel}
                loading={formModal.isSaving}
                onClose={formModal.onClose}
                onSubmit={formModal.onSubmit}
            />
        </>
    )
}
