import { useMemo, useState } from 'react'
import {
    Alert,
    Checkbox,
    Col,
    DatePicker,
    Empty,
    Flex,
    Form,
    Input,
    InputNumber,
    Modal,
    Radio,
    Row,
    Select,
    Skeleton,
    Switch,
    Tag,
    TimePicker,
    Typography,
} from 'antd'
import { EyeInvisibleOutlined } from '@ant-design/icons'

import {
    useFormularioEstructura,
    useTiposCampoFormulario,
} from '../hooks/atencion-medica.hooks'
import type {
    FormularioCampo,
    FormularioClinico,
    TipoCampoFormulario,
} from '../types/atencion-medica.types'

const { Text, Title } = Typography

const DATE_FORMAT = 'DD/MM/YYYY'
const DATETIME_FORMAT = 'DD/MM/YYYY HH:mm'
const TIME_FORMAT = 'HH:mm'

const ETAPA_LABELS: Record<string, string> = {
    RECEPCION: 'Recepción',
    TRIAJE: 'Triaje',
    ENFERMERIA: 'Enfermería',
    CONSULTA_MEDICA: 'Consulta médica',
    PENDIENTE_PAGO: 'Caja',
    PAGADO: 'Pagado',
    FINALIZADO: 'Finalizado',
}

type FormularioPreviewModalProps = {
    open: boolean
    formulario: FormularioClinico | null
    onClose: () => void
}

function parseOpciones(json?: string | null): { value: string; label: string }[] {
    if (!json) return []

    try {
        const parsed = JSON.parse(json) as unknown
        if (Array.isArray(parsed)) {
            return parsed.map((item) => ({
                value: String(item),
                label: String(item),
            }))
        }
    } catch {
        return []
    }

    return []
}

function renderPreviewField(
    campo: FormularioCampo,
    tipoCampo: TipoCampoFormulario | undefined,
) {
    const control = (tipoCampo?.controlFrontend ?? 'input').toLowerCase()
    const opciones = parseOpciones(campo.opcionesJson)

    switch (control) {
        case 'textarea':
            return (
                <Input.TextArea
                    rows={3}
                    placeholder={campo.placeholder ?? undefined}
                />
            )
        case 'number':
        case 'numberinput':
            return (
                <InputNumber
                    style={{ width: '100%' }}
                    placeholder={campo.placeholder ?? undefined}
                />
            )
        case 'date':
        case 'datepicker':
            return (
                <DatePicker
                    style={{ width: '100%' }}
                    format={DATE_FORMAT}
                    placeholder={campo.placeholder ?? 'Seleccione fecha'}
                />
            )
        case 'datetime':
        case 'datetimepicker':
            return (
                <DatePicker
                    showTime
                    style={{ width: '100%' }}
                    format={DATETIME_FORMAT}
                    placeholder={campo.placeholder ?? 'Seleccione fecha y hora'}
                />
            )
        case 'time':
        case 'timepicker':
            return (
                <TimePicker
                    style={{ width: '100%' }}
                    format={TIME_FORMAT}
                    placeholder={campo.placeholder ?? 'Seleccione hora'}
                />
            )
        case 'checkbox':
        case 'switch':
            return <Checkbox>{campo.etiqueta}</Checkbox>
        case 'radio':
            return (
                <Radio.Group>
                    {opciones.map((opcion) => (
                        <Radio key={opcion.value} value={opcion.value}>
                            {opcion.label}
                        </Radio>
                    ))}
                </Radio.Group>
            )
        case 'select':
            return (
                <Select
                    allowClear
                    placeholder={campo.placeholder ?? 'Seleccione'}
                    options={opciones}
                    style={{ width: '100%' }}
                />
            )
        case 'multiselect':
            return (
                <Select
                    mode="multiple"
                    allowClear
                    placeholder={campo.placeholder ?? 'Seleccione'}
                    options={opciones}
                    style={{ width: '100%' }}
                />
            )
        default:
            return <Input placeholder={campo.placeholder ?? undefined} />
    }
}

export function FormularioPreviewModal({
    open,
    formulario,
    onClose,
}: FormularioPreviewModalProps) {
    const [mostrarOcultos, setMostrarOcultos] = useState(false)
    const [etapaFiltro, setEtapaFiltro] = useState<string | undefined>()

    const { secciones, campos, isFetching } = useFormularioEstructura(
        open ? formulario?.id : undefined,
    )
    const { data: tiposCampoData } = useTiposCampoFormulario()

    const tipoCampoMap = useMemo(
        () => new Map(tiposCampoData?.items.map((t) => [t.id, t]) ?? []),
        [tiposCampoData],
    )

    const etapasDisponibles = useMemo(() => {
        const set = new Set<string>()
        for (const seccion of secciones) {
            if (seccion.etapaFlujo) set.add(seccion.etapaFlujo)
        }
        return Array.from(set).sort()
    }, [secciones])

    const seccionesVisibles = useMemo(() => {
        return [...secciones]
            .filter((seccion) => {
                if (!mostrarOcultos && seccion.visible === false) return false
                if (etapaFiltro && seccion.etapaFlujo !== etapaFiltro) return false
                return true
            })
            .sort((a, b) => a.orden - b.orden)
    }, [etapaFiltro, mostrarOcultos, secciones])

    const camposPorSeccion = useMemo(() => {
        const map = new Map<string, FormularioCampo[]>()
        for (const seccion of seccionesVisibles) {
            map.set(
                seccion.id,
                campos
                    .filter((campo) => {
                        if (campo.formularioSeccionId !== seccion.id) return false
                        if (!mostrarOcultos && campo.visible === false) return false
                        return true
                    })
                    .sort((a, b) => a.orden - b.orden),
            )
        }
        return map
    }, [campos, mostrarOcultos, seccionesVisibles])

    const totalCampos = useMemo(
        () =>
            Array.from(camposPorSeccion.values()).reduce(
                (acc, items) => acc + items.length,
                0,
            ),
        [camposPorSeccion],
    )

    const initialValues = useMemo(() => {
        const values: Record<string, unknown> = {}
        for (const campo of campos) {
            if (campo.valorDefecto == null || campo.valorDefecto === '') continue

            const control = (
                tipoCampoMap.get(campo.tipoCampoFormularioId)?.controlFrontend ?? ''
            ).toLowerCase()

            // DatePicker/TimePicker esperan Dayjs; en vista previa se dejan vacíos.
            if (
                control === 'date' ||
                control === 'datepicker' ||
                control === 'datetime' ||
                control === 'datetimepicker' ||
                control === 'time' ||
                control === 'timepicker'
            ) {
                continue
            }

            values[campo.id] = campo.valorDefecto
        }
        return values
    }, [campos, tipoCampoMap])

    const handleClose = () => {
        setMostrarOcultos(false)
        setEtapaFiltro(undefined)
        onClose()
    }

    return (
        <Modal
            open={open}
            onCancel={handleClose}
            title={
                <Flex vertical gap={2}>
                    <span>Vista previa del formulario</span>
                    {formulario ? (
                        <Text type="secondary" style={{ fontSize: 12, fontWeight: 400 }}>
                            {formulario.nombre}
                            <Text code style={{ marginLeft: 8, fontSize: 11 }}>
                                {formulario.codigo}
                            </Text>
                        </Text>
                    ) : null}
                </Flex>
            }
            footer={null}
            width={820}
            destroyOnHidden
            className="formularios-view__preview-modal"
            styles={{
                body: { maxHeight: 'min(70vh, 720px)', overflow: 'auto', paddingTop: 12 },
            }}
        >
            <Alert
                type="info"
                showIcon
                className="formularios-view__preview-alert"
                title="Vista previa interactiva"
                description="Así se verá el formulario en la atención clínica. Los valores no se guardan."
            />

            <Flex
                gap={12}
                wrap="wrap"
                align="center"
                className="formularios-view__preview-toolbar"
            >
                <Flex align="center" gap={8}>
                    <Switch
                        size="small"
                        checked={mostrarOcultos}
                        onChange={setMostrarOcultos}
                    />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        Mostrar ocultos
                    </Text>
                </Flex>

                {etapasDisponibles.length > 0 ? (
                    <Select
                        allowClear
                        size="small"
                        placeholder="Filtrar por etapa"
                        value={etapaFiltro}
                        onChange={(value) => setEtapaFiltro(value)}
                        style={{ minWidth: 180 }}
                        options={etapasDisponibles.map((etapa) => ({
                            value: etapa,
                            label: ETAPA_LABELS[etapa] ?? etapa,
                        }))}
                    />
                ) : null}

                <Text type="secondary" style={{ fontSize: 12, marginLeft: 'auto' }}>
                    {seccionesVisibles.length} sección
                    {seccionesVisibles.length === 1 ? '' : 'es'} · {totalCampos} campo
                    {totalCampos === 1 ? '' : 's'}
                </Text>
            </Flex>

            {isFetching && secciones.length === 0 ? (
                <Skeleton active paragraph={{ rows: 6 }} />
            ) : seccionesVisibles.length === 0 ? (
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={
                        secciones.length === 0
                            ? 'Este formulario aún no tiene secciones configuradas.'
                            : 'No hay secciones visibles con los filtros actuales.'
                    }
                />
            ) : (
                <Form
                    key={`${formulario?.id}-${mostrarOcultos}-${etapaFiltro ?? 'all'}-${campos.length}`}
                    layout="vertical"
                    size="middle"
                    initialValues={initialValues}
                    className="formularios-view__preview-form"
                    requiredMark="optional"
                >
                    {seccionesVisibles.map((seccion) => {
                        const seccionCampos = camposPorSeccion.get(seccion.id) ?? []
                        const oculta = seccion.visible === false

                        return (
                            <section
                                key={seccion.id}
                                className={[
                                    'formularios-view__preview-section',
                                    oculta
                                        ? 'formularios-view__preview-section--hidden'
                                        : '',
                                ]
                                    .filter(Boolean)
                                    .join(' ')}
                            >
                                <Flex align="center" gap={8} wrap="wrap" style={{ marginBottom: 12 }}>
                                    <Title level={5} style={{ margin: 0 }}>
                                        {seccion.nombre}
                                    </Title>
                                    {oculta ? (
                                        <Tag icon={<EyeInvisibleOutlined />}>Oculta</Tag>
                                    ) : null}
                                    {seccion.etapaFlujo ? (
                                        <Tag>
                                            {ETAPA_LABELS[seccion.etapaFlujo] ??
                                                seccion.etapaFlujo}
                                        </Tag>
                                    ) : null}
                                </Flex>

                                {seccionCampos.length === 0 ? (
                                    <Text type="secondary">Sin campos en esta sección.</Text>
                                ) : (
                                    <Row gutter={[16, 0]}>
                                        {seccionCampos.map((campo) => {
                                            const tipoCampo = tipoCampoMap.get(
                                                campo.tipoCampoFormularioId,
                                            )
                                            const control = (
                                                tipoCampo?.controlFrontend ?? ''
                                            ).toLowerCase()
                                            const isCheckbox =
                                                control === 'checkbox' ||
                                                control === 'switch'
                                            const isTextArea = control === 'textarea'
                                            const campoOculto = campo.visible === false

                                            return (
                                                <Col
                                                    key={campo.id}
                                                    xs={24}
                                                    md={isTextArea || isCheckbox ? 24 : 12}
                                                >
                                                    <Form.Item
                                                        name={campo.id}
                                                        label={
                                                            isCheckbox
                                                                ? undefined
                                                                : (
                                                                      <Flex
                                                                          gap={6}
                                                                          align="center"
                                                                          wrap="wrap"
                                                                      >
                                                                          <span>
                                                                              {campo.etiqueta}
                                                                          </span>
                                                                          {campoOculto ? (
                                                                              <Tag
                                                                                  icon={
                                                                                      <EyeInvisibleOutlined />
                                                                                  }
                                                                              >
                                                                                  Oculto
                                                                              </Tag>
                                                                          ) : null}
                                                                      </Flex>
                                                                  )
                                                        }
                                                        valuePropName={
                                                            isCheckbox ? 'checked' : 'value'
                                                        }
                                                        required={campo.esRequerido}
                                                        rules={
                                                            campo.esRequerido
                                                                ? [
                                                                      {
                                                                          required: true,
                                                                          message: 'Requerido',
                                                                      },
                                                                  ]
                                                                : undefined
                                                        }
                                                        extra={
                                                            isCheckbox && campoOculto ? (
                                                                <Tag
                                                                    icon={
                                                                        <EyeInvisibleOutlined />
                                                                    }
                                                                >
                                                                    Oculto
                                                                </Tag>
                                                            ) : undefined
                                                        }
                                                    >
                                                        {renderPreviewField(campo, tipoCampo)}
                                                    </Form.Item>
                                                </Col>
                                            )
                                        })}
                                    </Row>
                                )}
                            </section>
                        )
                    })}
                </Form>
            )}
        </Modal>
    )
}
