import { useState } from 'react'
import { Form, Input, Modal, Select } from 'antd'

import { useLaboratoriosExternos } from '../../laboratorios-externos/hooks/laboratorios-externos.hooks'
import type { SolicitudDetalle } from '../types/solicitud.types'

const { TextArea } = Input
const LOOKUP_QUERY = { page: 1, pageSize: 200 } as const

type DerivarDetalleModalProps = {
    open: boolean
    detalle: SolicitudDetalle | null
    loading: boolean
    onClose: () => void
    onSubmit: (values: { laboratorioExternoId: string; observaciones: string | null }) => Promise<void>
}

export function DerivarDetalleModal({
    open,
    detalle,
    loading,
    onClose,
    onSubmit,
}: DerivarDetalleModalProps) {
    const { data: laboratoriosResult, isFetching: loadingLaboratorios } =
        useLaboratoriosExternos(LOOKUP_QUERY)
    const [laboratorioExternoId, setLaboratorioExternoId] = useState<string | undefined>()
    const [observaciones, setObservaciones] = useState('')

    const laboratorioOptions = (laboratoriosResult?.items ?? []).map((item) => ({
        label: `${item.codigo} — ${item.nombre}`,
        value: item.id,
    }))

    const handleOk = async () => {
        if (!laboratorioExternoId) return
        await onSubmit({
            laboratorioExternoId,
            observaciones: observaciones.trim() || null,
        })
    }

    return (
        <Modal
            title={`Derivar prueba${detalle ? `: ${detalle.pruebaNombre}` : ''}`}
            open={open}
            onCancel={() => {
                if (!loading) onClose()
            }}
            onOk={() => void handleOk()}
            okText="Derivar"
            cancelText="Cancelar"
            confirmLoading={loading}
            okButtonProps={{ disabled: !laboratorioExternoId }}
            destroyOnHidden
        >
            <Form layout="vertical" requiredMark={false}>
                <Form.Item label="Laboratorio externo" required>
                    <Select
                        showSearch
                        optionFilterProp="label"
                        placeholder="Seleccionar laboratorio externo"
                        options={laboratorioOptions}
                        value={laboratorioExternoId}
                        onChange={setLaboratorioExternoId}
                        disabled={loading || loadingLaboratorios}
                    />
                </Form.Item>
                <Form.Item label="Observaciones">
                    <TextArea
                        rows={2}
                        value={observaciones}
                        onChange={(e) => setObservaciones(e.target.value)}
                        disabled={loading}
                    />
                </Form.Item>
            </Form>
        </Modal>
    )
}
