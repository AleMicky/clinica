import { useMemo } from 'react'
import {
    Checkbox,
    Col,
    Form,
    Input,
    InputNumber,
    Radio,
    Row,
    Select,
    Spin,
    Typography,
} from 'antd'

import type {
    DynamicFormValues,
    FormularioRecepcion,
    FormularioRecepcionCampo,
    RespuestaFormularioPayload,
} from '../types/recepcion.types'

const { Text, Title } = Typography

type DynamicClinicalFormProps = {
    formulario?: FormularioRecepcion
    loading?: boolean
    values: DynamicFormValues
    onChange: (values: DynamicFormValues) => void
    errors?: Record<string, string>
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

export function buildInitialFormValues(
    formulario?: FormularioRecepcion,
    prefill?: Record<string, unknown>,
): DynamicFormValues {
    const values: DynamicFormValues = {}
    const now = new Date()

    formulario?.secciones.forEach((seccion) => {
        seccion.campos.forEach((campo) => {
            if (prefill && campo.codigo in prefill) {
                values[campo.id] = prefill[campo.codigo]
                return
            }

            if (campo.valorDefecto) {
                values[campo.id] = campo.valorDefecto
                return
            }

            if (campo.tipoCampoCodigo === 'DATE') {
                values[campo.id] = now.toISOString().slice(0, 10)
            } else if (campo.tipoCampoCodigo === 'TIME') {
                values[campo.id] = now.toTimeString().slice(0, 5)
            }
        })
    })

    return values
}

export function buildRespuestasPayload(
    formulario: FormularioRecepcion,
    values: DynamicFormValues,
): RespuestaFormularioPayload[] {
    const campos = formulario.secciones.flatMap((seccion) => seccion.campos)

    return campos.reduce<RespuestaFormularioPayload[]>((acc, campo) => {
        const value = values[campo.id]

        if (value === undefined || value === null || value === '') {
            return acc
        }

        const base: RespuestaFormularioPayload = {
            formularioCampoId: campo.id,
            valorTexto: null,
            valorNumero: null,
            valorFecha: null,
            valorBooleano: null,
            valorJson: null,
        }

        switch (campo.tipoDato) {
            case 'int':
            case 'decimal':
                acc.push({ ...base, valorNumero: Number(value) })
                break
            case 'date':
            case 'datetime':
            case 'time':
                acc.push({
                    ...base,
                    valorFecha: new Date(String(value)).toISOString(),
                })
                break
            case 'bool':
                acc.push({ ...base, valorBooleano: Boolean(value) })
                break
            case 'json':
                acc.push({
                    ...base,
                    valorJson:
                        typeof value === 'string' ? value : JSON.stringify(value),
                })
                break
            default:
                acc.push({ ...base, valorTexto: String(value) })
        }

        return acc
    }, [])
}

export function validateDynamicForm(
    formulario: FormularioRecepcion,
    values: DynamicFormValues,
): Record<string, string> {
    const errors: Record<string, string> = {}

    formulario.secciones.forEach((seccion) => {
        seccion.campos.forEach((campo) => {
            if (!campo.esRequerido) return

            const value = values[campo.id]
            const isEmpty =
                value === undefined ||
                value === null ||
                value === '' ||
                value === false

            if (isEmpty) {
                errors[campo.id] = `${campo.etiqueta} es requerido`
            }
        })
    })

    return errors
}

function renderControlledField(
    campo: FormularioRecepcionCampo,
    value: unknown,
    onFieldChange: (campoId: string, nextValue: unknown) => void,
) {
    const control = campo.controlFrontend.toLowerCase()
    const opciones = parseOpciones(campo.opcionesJson)

    switch (control) {
        case 'textarea':
            return (
                <Input.TextArea
                    rows={2}
                    placeholder={campo.placeholder ?? undefined}
                    value={value as string | undefined}
                    onChange={(event) => onFieldChange(campo.id, event.target.value)}
                />
            )
        case 'numberinput':
        case 'number':
            return (
                <InputNumber
                    style={{ width: '100%' }}
                    placeholder={campo.placeholder ?? undefined}
                    value={value as number | undefined}
                    onChange={(next) => onFieldChange(campo.id, next)}
                />
            )
        case 'datepicker':
        case 'date':
            return (
                <Input
                    type="date"
                    value={value as string | undefined}
                    onChange={(event) => onFieldChange(campo.id, event.target.value)}
                />
            )
        case 'timepicker':
        case 'time':
            return (
                <Input
                    type="time"
                    value={value as string | undefined}
                    onChange={(event) => onFieldChange(campo.id, event.target.value)}
                />
            )
        case 'datetimepicker':
        case 'datetime':
            return (
                <Input
                    type="datetime-local"
                    value={value as string | undefined}
                    onChange={(event) => onFieldChange(campo.id, event.target.value)}
                />
            )
        case 'checkbox':
            return (
                <Checkbox
                    checked={Boolean(value)}
                    onChange={(event) => onFieldChange(campo.id, event.target.checked)}
                >
                    {campo.etiqueta}
                </Checkbox>
            )
        case 'radio':
            return (
                <Radio.Group
                    value={value as string | undefined}
                    onChange={(event) => onFieldChange(campo.id, event.target.value)}
                >
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
                    value={value as string | undefined}
                    onChange={(next) => onFieldChange(campo.id, next)}
                />
            )
        default:
            return (
                <Input
                    placeholder={campo.placeholder ?? undefined}
                    value={value as string | undefined}
                    onChange={(event) => onFieldChange(campo.id, event.target.value)}
                />
            )
    }
}

export function DynamicClinicalForm({
    formulario,
    loading,
    values,
    onChange,
    errors = {},
}: DynamicClinicalFormProps) {
    const campos = useMemo(
        () => formulario?.secciones.flatMap((seccion) => seccion.campos) ?? [],
        [formulario],
    )

    const handleFieldChange = (campoId: string, nextValue: unknown) => {
        onChange({ ...values, [campoId]: nextValue })
    }

    if (loading) {
        return <Spin />
    }

    if (!formulario?.secciones.length) {
        return (
            <Text type="secondary">
                No hay campos de recepción configurados para este tipo de atención.
            </Text>
        )
    }

    return (
        <div>
            {formulario.secciones.map((seccion) => (
                <div key={seccion.id} style={{ marginBottom: 16 }}>
                    <Title level={5} style={{ marginBottom: 12 }}>
                        {seccion.nombre}
                    </Title>
                    <Row gutter={[12, 0]}>
                        {seccion.campos.map((campo) => {
                            const control = campo.controlFrontend.toLowerCase()
                            const isCheckbox = control === 'checkbox'
                            const isRadio = control === 'radio'
                            const colSpan =
                                campo.tipoCampoCodigo === 'TEXTAREA' ? 24 : 12

                            return (
                                <Col key={campo.id} xs={24} md={colSpan}>
                                    <Form.Item
                                        label={
                                            isCheckbox ? undefined : campo.etiqueta
                                        }
                                        required={campo.esRequerido}
                                        validateStatus={errors[campo.id] ? 'error' : ''}
                                        help={errors[campo.id]}
                                        style={{ marginBottom: 12 }}
                                    >
                                        {isRadio ? (
                                            <div>
                                                <Text
                                                    type="secondary"
                                                    style={{
                                                        display: 'block',
                                                        marginBottom: 4,
                                                    }}
                                                >
                                                    {campo.etiqueta}
                                                </Text>
                                                {renderControlledField(
                                                    campo,
                                                    values[campo.id],
                                                    handleFieldChange,
                                                )}
                                            </div>
                                        ) : (
                                            renderControlledField(
                                                campo,
                                                values[campo.id],
                                                handleFieldChange,
                                            )
                                        )}
                                    </Form.Item>
                                </Col>
                            )
                        })}
                    </Row>
                </div>
            ))}

            {campos.length === 0 ? (
                <Text type="secondary">Sin campos visibles en el formulario.</Text>
            ) : null}
        </div>
    )
}
