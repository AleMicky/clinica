import { useEffect, useMemo, useState } from 'react'
import { Empty, Form, Input, InputNumber, Modal, Select, Switch, Table } from 'antd'

import { WorkflowEmployeeSelect } from '../../../workflow/components/WorkflowEmployeeSelect'
import { useParametros } from '../../parametros/hooks/parametros.hooks'
import { ParametroTipoDato } from '../../parametros/types/parametro.types'
import type { Muestra } from '../../muestras/types/muestra.types'
import type { RegistrarResultadosPayload } from '../../resultados/types/resultado.types'
import type { SolicitudDetalle } from '../types/solicitud.types'

const { TextArea } = Input
const LOOKUP_QUERY = { page: 1, pageSize: 500 } as const

type LineaEstado = {
    parametroId: string
    parametroNombre: string
    solicitudDetalleId: string
    tipoDato: string
    valorNumerico: number | null
    valorTexto: string | null
    incluido: boolean
}

type RegistrarResultadosModalProps = {
    open: boolean
    detalles: SolicitudDetalle[]
    muestras: Muestra[]
    loading: boolean
    onClose: () => void
    onSubmit: (data: RegistrarResultadosPayload) => Promise<void>
}

export function RegistrarResultadosModal({
    open,
    detalles,
    muestras,
    loading,
    onClose,
    onSubmit,
}: RegistrarResultadosModalProps) {
    const { data: parametrosResult, isFetching: loadingParametros } = useParametros(LOOKUP_QUERY)
    const [muestraId, setMuestraId] = useState<string | undefined>(() => muestras[0]?.id)
    const [empleadoId, setEmpleadoId] = useState('')
    const [observaciones, setObservaciones] = useState('')
    const [lineas, setLineas] = useState<LineaEstado[]>([])

    const pruebaIds = useMemo(() => new Set(detalles.map((d) => d.pruebaId)), [detalles])

    const parametrosDisponibles = useMemo(
        () => (parametrosResult?.items ?? []).filter((p) => pruebaIds.has(p.pruebaId) && p.activo),
        [parametrosResult?.items, pruebaIds],
    )

    // Los parámetros se resuelven de forma asíncrona (catálogo compartido); las líneas
    // editables deben sincronizarse una vez que el catálogo está disponible.
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLineas(
            parametrosDisponibles.map((parametro) => {
                const detalle = detalles.find((d) => d.pruebaId === parametro.pruebaId)
                return {
                    parametroId: parametro.id,
                    parametroNombre: parametro.nombre,
                    solicitudDetalleId: detalle?.id ?? '',
                    tipoDato: parametro.tipoDato,
                    valorNumerico: null,
                    valorTexto: null,
                    incluido: true,
                }
            }),
        )
    }, [parametrosDisponibles, detalles])

    const updateLinea = (parametroId: string, patch: Partial<LineaEstado>) => {
        setLineas((prev) =>
            prev.map((linea) =>
                linea.parametroId === parametroId ? { ...linea, ...patch } : linea,
            ),
        )
    }

    const lineasValidas = lineas.filter((linea) => {
        if (!linea.incluido || !linea.solicitudDetalleId) return false

        if (
            linea.tipoDato === ParametroTipoDato.Texto ||
            linea.tipoDato === ParametroTipoDato.Booleano
        ) {
            return Boolean(linea.valorTexto?.trim())
        }

        return linea.valorNumerico !== null
    })

    const handleOk = async () => {
        if (!empleadoId || lineasValidas.length === 0) return

        await onSubmit({
            muestraId: muestraId ?? null,
            observaciones: observaciones.trim() || null,
            empleadoId,
            lineas: lineasValidas.map((linea) => {
                const esTexto =
                    linea.tipoDato === ParametroTipoDato.Texto ||
                    linea.tipoDato === ParametroTipoDato.Booleano

                return {
                    parametroId: linea.parametroId,
                    solicitudDetalleId: linea.solicitudDetalleId,
                    valorNumerico: esTexto ? null : linea.valorNumerico,
                    valorTexto: esTexto ? linea.valorTexto : null,
                    observaciones: null,
                }
            }),
        })
    }

    return (
        <Modal
            title="Registrar resultados"
            open={open}
            onCancel={() => {
                if (!loading) onClose()
            }}
            onOk={() => void handleOk()}
            okText="Registrar"
            cancelText="Cancelar"
            confirmLoading={loading}
            okButtonProps={{ disabled: !empleadoId || lineasValidas.length === 0 }}
            destroyOnHidden
            width={700}
        >
            <Form layout="vertical" requiredMark={false}>
                {muestras.length > 0 ? (
                    <Form.Item label="Muestra asociada">
                        <Select
                            allowClear
                            placeholder="Sin muestra asociada"
                            options={muestras.map((m) => ({ label: m.codigo, value: m.id }))}
                            value={muestraId}
                            onChange={(value) => setMuestraId(value ?? undefined)}
                            disabled={loading}
                        />
                    </Form.Item>
                ) : null}

                <Form.Item label="Validado / registrado por" required>
                    <WorkflowEmployeeSelect
                        value={empleadoId || undefined}
                        onChange={(value) =>
                            setEmpleadoId(typeof value === 'string' ? value : value[0] ?? '')
                        }
                        placeholder="Empleado que registra"
                        disabled={loading}
                    />
                </Form.Item>

                <Form.Item label="Valores por parámetro">
                    <Table
                        size="small"
                        rowKey="parametroId"
                        pagination={false}
                        loading={loadingParametros}
                        dataSource={lineas}
                        locale={{
                            emptyText: (
                                <Empty
                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                    description="No hay parámetros configurados para las pruebas de esta solicitud."
                                />
                            ),
                        }}
                        columns={[
                            {
                                title: '',
                                key: 'incluido',
                                width: 48,
                                render: (_, record: LineaEstado) => (
                                    <Switch
                                        size="small"
                                        checked={record.incluido}
                                        onChange={(checked) =>
                                            updateLinea(record.parametroId, { incluido: checked })
                                        }
                                        disabled={loading}
                                    />
                                ),
                            },
                            {
                                title: 'Parámetro',
                                dataIndex: 'parametroNombre',
                            },
                            {
                                title: 'Valor',
                                key: 'valor',
                                render: (_, record: LineaEstado) => {
                                    if (record.tipoDato === ParametroTipoDato.Texto) {
                                        return (
                                            <Input
                                                value={record.valorTexto ?? ''}
                                                onChange={(e) =>
                                                    updateLinea(record.parametroId, {
                                                        valorTexto: e.target.value,
                                                    })
                                                }
                                                disabled={loading || !record.incluido}
                                            />
                                        )
                                    }

                                    if (record.tipoDato === ParametroTipoDato.Booleano) {
                                        return (
                                            <Select
                                                allowClear
                                                style={{ width: '100%' }}
                                                placeholder="Seleccionar"
                                                options={[
                                                    { label: 'Sí', value: 'true' },
                                                    { label: 'No', value: 'false' },
                                                ]}
                                                value={record.valorTexto ?? undefined}
                                                onChange={(value) =>
                                                    updateLinea(record.parametroId, {
                                                        valorTexto: value ?? null,
                                                        valorNumerico: null,
                                                    })
                                                }
                                                disabled={loading || !record.incluido}
                                            />
                                        )
                                    }

                                    return (
                                        <InputNumber
                                            style={{ width: '100%' }}
                                            value={record.valorNumerico ?? undefined}
                                            onChange={(value) =>
                                                updateLinea(record.parametroId, {
                                                    valorNumerico: value ?? null,
                                                })
                                            }
                                            disabled={loading || !record.incluido}
                                        />
                                    )
                                },
                            },
                        ]}
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
