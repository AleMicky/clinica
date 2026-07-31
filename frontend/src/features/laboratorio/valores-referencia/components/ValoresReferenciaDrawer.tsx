import { Button, Drawer, Space, Typography } from 'antd'
import { PlusOutlined } from '@ant-design/icons'

import type { Parametro } from '../../parametros/types/parametro.types'
import type { ValorReferenciaFormValues } from '../schemas/valor-referencia.schema'
import type { ValorReferencia } from '../types/valor-referencia.types'
import { ValorReferenciaFormModal } from './ValorReferenciaFormModal'
import { ValoresReferenciaTable } from './ValoresReferenciaTable'

const { Text } = Typography

type ValoresReferenciaDrawerProps = {
    open: boolean
    parametro: Parametro | null
    loading: boolean
    items: ValorReferencia[]
    onClose: () => void
    onCreate: () => void
    onEdit: (item: ValorReferencia) => void
    onDelete: (item: ValorReferencia) => void
    deletingId: string | null
    formModal: {
        open: boolean
        entity: ValorReferencia | null
        isSaving: boolean
        onClose: () => void
        onSubmit: (values: ValorReferenciaFormValues) => Promise<void>
    }
}

export function ValoresReferenciaDrawer({
    open,
    parametro,
    loading,
    items,
    onClose,
    onCreate,
    onEdit,
    onDelete,
    deletingId,
    formModal,
}: ValoresReferenciaDrawerProps) {
    const parametroLabel = parametro
        ? `${parametro.codigo} — ${parametro.nombre}`
        : ''

    return (
        <>
            <Drawer
                title="Valores de referencia"
                open={open}
                onClose={onClose}
                width={820}
                destroyOnHidden
                extra={
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={onCreate}
                        disabled={!parametro}
                    >
                        Nuevo valor
                    </Button>
                }
            >
                {parametro ? (
                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                        <div>
                            <Text strong>{parametro.nombre}</Text>
                            <br />
                            <Text type="secondary" code>
                                {parametro.codigo}
                            </Text>
                        </div>

                        <ValoresReferenciaTable
                            items={items}
                            loading={loading}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            deletingId={deletingId}
                        />
                    </Space>
                ) : null}
            </Drawer>

            <ValorReferenciaFormModal
                open={formModal.open}
                entity={formModal.entity}
                parametroLabel={parametroLabel}
                loading={formModal.isSaving}
                onClose={formModal.onClose}
                onSubmit={formModal.onSubmit}
            />
        </>
    )
}
