import { useMemo, useState } from 'react'
import {
    Button,
    Checkbox,
    Flex,
    Form,
    Input,
    InputNumber,
    Select,
    Spin,
    Typography,
} from 'antd'

import {
    atencionRespuestasHooks,
    useAtencionRespuestas,
    useFormularioEstructura,
    useTiposCampoFormulario,
} from '../hooks/atencion-medica.hooks'
import type {
    Atencion,
    AtencionFormularioRespuesta,
    FormularioCampo,
    TipoCampoFormulario,
} from '../types/atencion-medica.types'

const { Text, Title } = Typography

type FormularioClinicoTabProps = {
    atencion: Atencion
    etapaForzada?: string
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

function toDatetimeLocalValue(iso?: string | null): string | undefined {
    if (!iso) return undefined
    return iso.slice(0, 16)
}

function getRespuestaValue(
    respuesta: AtencionFormularioRespuesta | undefined,
    tipoCampo?: TipoCampoFormulario,
) {
    if (!respuesta || !tipoCampo) return undefined

    switch (tipoCampo.tipoDato) {
        case 'int':
        case 'decimal':
            return respuesta.valorNumero ?? undefined
        case 'date':
            return respuesta.valorFecha ? respuesta.valorFecha.slice(0, 10) : undefined
        case 'datetime':
        case 'time':
            return toDatetimeLocalValue(respuesta.valorFecha)
        case 'bool':
            return respuesta.valorBooleano ?? false
        case 'json':
            return respuesta.valorJson ?? undefined
        default:
            return respuesta.valorTexto ?? undefined
    }
}

function buildPayload(
    atencionId: string,
    campo: FormularioCampo,
    tipoCampo: TipoCampoFormulario | undefined,
    value: unknown,
) {
    const base = {
        atencionId,
        formularioCampoId: campo.id,
        valorTexto: null as string | null,
        valorNumero: null as number | null,
        valorFecha: null as string | null,
        valorBooleano: null as boolean | null,
        valorJson: null as string | null,
    }

    if (value === undefined || value === null || value === '') {
        return base
    }

    switch (tipoCampo?.tipoDato) {
        case 'int':
        case 'decimal':
            return { ...base, valorNumero: Number(value) }
        case 'date':
        case 'datetime':
        case 'time':
            return {
                ...base,
                valorFecha: new Date(String(value)).toISOString(),
            }
        case 'bool':
            return { ...base, valorBooleano: Boolean(value) }
        case 'json':
            return {
                ...base,
                valorJson: typeof value === 'string' ? value : JSON.stringify(value),
            }
        default:
            return { ...base, valorTexto: String(value) }
    }
}

function renderFieldInput(
    campo: FormularioCampo,
    tipoCampo: TipoCampoFormulario | undefined,
) {
    const control = tipoCampo?.controlFrontend ?? 'input'
    const opciones = parseOpciones(campo.opcionesJson)

    switch (control) {
        case 'textarea':
            return <Input.TextArea rows={3} placeholder={campo.placeholder ?? undefined} />
        case 'number':
            return (
                <InputNumber
                    style={{ width: '100%' }}
                    placeholder={campo.placeholder ?? undefined}
                />
            )
        case 'date':
            return <Input type="date" />
        case 'datetime':
            return <Input type="datetime-local" />
        case 'time':
            return <Input type="time" />
        case 'checkbox':
            return <Checkbox>{campo.etiqueta}</Checkbox>
        case 'select':
            return (
                <Select
                    allowClear
                    placeholder={campo.placeholder ?? 'Seleccione'}
                    options={opciones}
                />
            )
        case 'multiselect':
            return (
                <Select
                    mode="multiple"
                    allowClear
                    placeholder={campo.placeholder ?? 'Seleccione'}
                    options={opciones}
                />
            )
        default:
            return <Input placeholder={campo.placeholder ?? undefined} />
    }
}

export function FormularioClinicoTab({ atencion, etapaForzada }: FormularioClinicoTabProps) {
    const [form] = Form.useForm()
    const [saving, setSaving] = useState(false)

    const { secciones, campos, isFetching: loadingEstructura } = useFormularioEstructura(
        atencion.formularioClinicoId ?? undefined,
    )

    const seccionesVisibles = useMemo(() => {
        const visibles = secciones.filter((s) => s.visible !== false)
        if (!etapaForzada) return visibles
        return visibles.filter((s) => s.etapaFlujo === etapaForzada)
    }, [etapaForzada, secciones])

    const camposPorSeccion = useMemo(() => {
        const map = new Map<string, FormularioCampo[]>()
        seccionesVisibles.forEach((seccion) => {
            map.set(
                seccion.id,
                campos
                    .filter((c) => c.formularioSeccionId === seccion.id && c.visible !== false)
                    .sort((a, b) => a.orden - b.orden),
            )
        })
        return map
    }, [campos, seccionesVisibles])

    const { data: tiposCampoData } = useTiposCampoFormulario()
    const tipoCampoMap = useMemo(
        () => new Map(tiposCampoData?.items.map((t) => [t.id, t]) ?? []),
        [tiposCampoData],
    )

    const campoMap = useMemo(
        () => new Map(campos.map((c) => [c.id, c])),
        [campos],
    )

    const { data: respuestasData, isFetching: loadingRespuestas } = useAtencionRespuestas({
        atencionId: atencion.id,
        page: 1,
        pageSize: 500,
    })

    const respuestaMap = useMemo(() => {
        const map = new Map<string, AtencionFormularioRespuesta>()
        respuestasData?.items.forEach((r) => map.set(r.formularioCampoId, r))
        return map
    }, [respuestasData])

    const createMutation = atencionRespuestasHooks.useCreate()
    const updateMutation = atencionRespuestasHooks.useUpdate()

    const formReady = !loadingEstructura && !loadingRespuestas && secciones.length > 0

    const initialValues = useMemo(() => {
        if (!formReady) return undefined

        const values: Record<string, unknown> = {}
        campos.forEach((campo) => {
            const respuesta = respuestaMap.get(campo.id)
            const tipoCampo = tipoCampoMap.get(campo.tipoCampoFormularioId)
            values[campo.id] =
                getRespuestaValue(respuesta, tipoCampo) ??
                campo.valorDefecto ??
                undefined
        })
        return values
    }, [campos, formReady, respuestaMap, tipoCampoMap])

    const handleSave = async () => {
        const values = await form.validateFields()
        setSaving(true)

        try {
            for (const [campoId, value] of Object.entries(values)) {
                const campo = campoMap.get(campoId)
                if (!campo) continue

                const tipoCampo = tipoCampoMap.get(campo.tipoCampoFormularioId)
                const payload = buildPayload(atencion.id, campo, tipoCampo, value)
                const existing = respuestaMap.get(campoId)

                if (existing) {
                    await updateMutation.mutateAsync({ id: existing.id, data: payload })
                } else if (
                    value !== undefined &&
                    value !== null &&
                    value !== '' &&
                    value !== false
                ) {
                    await createMutation.mutateAsync(payload)
                }
            }
        } finally {
            setSaving(false)
        }
    }

    if (loadingEstructura || loadingRespuestas) {
        return <Spin />
    }

    if (!secciones.length) {
        return (
            <Text type="secondary">
                Este formulario clínico no tiene secciones configuradas.
            </Text>
        )
    }

    return (
        <Form
            key={`${atencion.id}-${respuestasData?.items.length ?? 0}`}
            form={form}
            layout="vertical"
            initialValues={initialValues}
        >
            {seccionesVisibles.map((seccion) => {
                const seccionCampos = camposPorSeccion.get(seccion.id) ?? []

                return (
                    <div key={seccion.id} style={{ marginBottom: 24 }}>
                        <Title level={5}>{seccion.nombre}</Title>
                        {seccionCampos.length === 0 ? (
                            <Text type="secondary">Sin campos en esta sección.</Text>
                        ) : (
                            seccionCampos.map((campo) => {
                                const tipoCampo = tipoCampoMap.get(campo.tipoCampoFormularioId)
                                const isCheckbox = tipoCampo?.controlFrontend === 'checkbox'

                                return (
                                    <Form.Item
                                        key={campo.id}
                                        name={campo.id}
                                        label={isCheckbox ? undefined : campo.etiqueta}
                                        valuePropName={isCheckbox ? 'checked' : 'value'}
                                        rules={
                                            campo.esRequerido
                                                ? [{ required: true, message: 'Requerido' }]
                                                : undefined
                                        }
                                    >
                                        {renderFieldInput(campo, tipoCampo)}
                                    </Form.Item>
                                )
                            })
                        )}
                    </div>
                )
            })}

            <Flex justify="flex-end">
                <Button type="primary" loading={saving} onClick={() => void handleSave()}>
                    Guardar respuestas
                </Button>
            </Flex>
        </Form>
    )
}
