import { useMemo, useState } from 'react'
import { Form, Input, Modal, Select } from 'antd'

import { useCatalogoGruposGrouped } from '../../../parametros/catalogos/hooks/catalogo-grupos.hooks'
import { WorkflowEmployeeSelect } from '../../../workflow/components/WorkflowEmployeeSelect'
import type { SolicitudDetalle } from '../types/solicitud.types'
import type { TomarMuestraPayload } from '../../muestras/types/muestra.types'

const { TextArea } = Input
const TIPO_MUESTRA_GRUPO = 'TIPO_MUESTRA'

type TomarMuestraModalProps = {
    open: boolean
    detalles: SolicitudDetalle[]
    loading: boolean
    onClose: () => void
    onSubmit: (data: TomarMuestraPayload) => Promise<void>
}

export function TomarMuestraModal({
    open,
    detalles,
    loading,
    onClose,
    onSubmit,
}: TomarMuestraModalProps) {
    const { data: catalogos, isPending: loadingCatalogos } = useCatalogoGruposGrouped()
    const [tipoMuestraId, setTipoMuestraId] = useState<string | undefined>()
    const [tomadoPorEmpleadoId, setTomadoPorEmpleadoId] = useState('')
    const [detalleIds, setDetalleIds] = useState<string[]>([])
    const [observaciones, setObservaciones] = useState('')

    const tipoMuestraOptions = useMemo(
        () =>
            catalogos
                ?.find((grupo) => grupo.codigo === TIPO_MUESTRA_GRUPO)
                ?.items.map((item) => ({ label: item.nombre, value: item.id })) ?? [],
        [catalogos],
    )

    const detalleOptions = detalles.map((detalle) => ({
        label: detalle.pruebaNombre,
        value: detalle.id,
    }))

    const handleOk = async () => {
        if (!tomadoPorEmpleadoId) return
        await onSubmit({
            tipoMuestraId: tipoMuestraId ?? null,
            tomadoPorEmpleadoId,
            observaciones: observaciones.trim() || null,
            solicitudDetalleIds: detalleIds.length > 0 ? detalleIds : null,
        })
    }

    return (
        <Modal
            title="Tomar muestra"
            open={open}
            onCancel={() => {
                if (!loading) onClose()
            }}
            onOk={() => void handleOk()}
            okText="Registrar"
            cancelText="Cancelar"
            confirmLoading={loading}
            okButtonProps={{ disabled: !tomadoPorEmpleadoId }}
            destroyOnHidden
        >
            <Form layout="vertical" requiredMark={false}>
                <Form.Item label="Tipo de muestra">
                    <Select
                        allowClear
                        showSearch
                        optionFilterProp="label"
                        placeholder="Seleccionar tipo de muestra"
                        options={tipoMuestraOptions}
                        value={tipoMuestraId}
                        onChange={(value) => setTipoMuestraId(value ?? undefined)}
                        disabled={loading || loadingCatalogos}
                    />
                </Form.Item>
                <Form.Item label="Tomado por" required>
                    <WorkflowEmployeeSelect
                        value={tomadoPorEmpleadoId || undefined}
                        onChange={(value) =>
                            setTomadoPorEmpleadoId(typeof value === 'string' ? value : value[0] ?? '')
                        }
                        placeholder="Empleado que toma la muestra"
                        disabled={loading}
                    />
                </Form.Item>
                <Form.Item
                    label="Pruebas incluidas"
                    help="Si no selecciona ninguna, se incluirán todas las pendientes."
                >
                    <Select
                        mode="multiple"
                        allowClear
                        optionFilterProp="label"
                        placeholder="Todas las pruebas pendientes"
                        options={detalleOptions}
                        value={detalleIds}
                        onChange={setDetalleIds}
                        disabled={loading}
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
