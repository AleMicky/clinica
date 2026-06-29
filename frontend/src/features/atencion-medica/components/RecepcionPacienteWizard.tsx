import { useEffect, useMemo, useState } from 'react'
import {
    UserOutlined,
    FormOutlined,
    FileTextOutlined,
    CheckCircleOutlined,
} from '@ant-design/icons'
import {
    Alert,
    Button,
    Card,
    Descriptions,
    Flex,
    Form,
    Select,
    Space,
    Steps,
    Typography,
} from 'antd'

import {
    buildInitialFormValues,
    buildRespuestasPayload,
    DynamicClinicalForm,
    validateDynamicForm,
} from './DynamicClinicalForm'
import {
    PacienteSearchBox,
    type PacienteSeleccionado,
} from './PacienteSearchBox'
import { useFormularioRecepcion } from '../hooks/useFormularioRecepcion'
import { useTiposAtencion } from '../hooks/useTiposAtencion'
import type {
    CrearRecepcionAtencionPayload,
    DynamicFormValues,
    FormularioRecepcion,
    RecepcionAtencion,
} from '../types/recepcion.types'

const { Text } = Typography

const WIZARD_STEPS = [
    { title: 'Paciente', icon: <UserOutlined /> },
    { title: 'Tipo de atención', icon: <FormOutlined /> },
    { title: 'Formulario', icon: <FileTextOutlined /> },
    { title: 'Confirmar', icon: <CheckCircleOutlined /> },
]

type RecepcionPacienteWizardProps = {
    loading: boolean
    onSubmit: (payload: CrearRecepcionAtencionPayload) => Promise<RecepcionAtencion>
    onSuccess?: (atencion: RecepcionAtencion) => void
}

export function RecepcionPacienteWizard({
    loading,
    onSubmit,
    onSuccess,
}: RecepcionPacienteWizardProps) {
    const [currentStep, setCurrentStep] = useState(0)
    const [paciente, setPaciente] = useState<PacienteSeleccionado | null>(null)
    const [tipoAtencionId, setTipoAtencionId] = useState('')
    const [formValues, setFormValues] = useState<DynamicFormValues>({})
    const [formErrors, setFormErrors] = useState<Record<string, string>>({})
    const [stepError, setStepError] = useState<string | null>(null)

    const { data: tiposData, isFetching: loadingTipos } = useTiposAtencion()
    const { data: formulario, isFetching: loadingFormulario } =
        useFormularioRecepcion(tipoAtencionId || undefined)

    const tipoOptions = useMemo(
        () =>
            (tiposData?.items ?? []).map((tipo) => ({
                value: tipo.id,
                label: tipo.nombre,
            })),
        [tiposData?.items],
    )

    const tipoSeleccionado = useMemo(
        () => tiposData?.items.find((tipo) => tipo.id === tipoAtencionId),
        [tiposData?.items, tipoAtencionId],
    )

    const prefill = useMemo(() => {
        if (!paciente) return undefined

        return {
            historia_clinica: paciente.numeroHistoriaClinica,
            nombres_apellidos: paciente.personaNombreCompleto,
            nombres: paciente.personaNombreCompleto,
        }
    }, [paciente])

    useEffect(() => {
        if (!formulario) return
        setFormValues(buildInitialFormValues(formulario, prefill))
        setFormErrors({})
    }, [formulario, prefill])

    const irPaso = (paso: number) => {
        setStepError(null)
        setCurrentStep(paso)
    }

    const validarPasoActual = (): boolean => {
        if (currentStep === 0) {
            if (!paciente) {
                setStepError('Seleccione o registre un paciente.')
                return false
            }
        }

        if (currentStep === 1) {
            if (!tipoAtencionId) {
                setStepError('Seleccione un tipo de atención.')
                return false
            }
        }

        if (currentStep === 2 && formulario) {
            const errores = validateDynamicForm(formulario, formValues)
            setFormErrors(errores)
            if (Object.keys(errores).length > 0) {
                setStepError('Complete los campos requeridos del formulario.')
                return false
            }
        }

        setStepError(null)
        return true
    }

    const handleNext = () => {
        if (!validarPasoActual()) return
        irPaso(currentStep + 1)
    }

    const handleBack = () => {
        setStepError(null)
        setCurrentStep((prev) => Math.max(0, prev - 1))
    }

    const handleConfirm = async () => {
        if (!paciente || !tipoAtencionId || !formulario) return

        const errores = validateDynamicForm(formulario, formValues)
        setFormErrors(errores)
        if (Object.keys(errores).length > 0) {
            setStepError('Complete los campos requeridos del formulario.')
            return
        }

        const payload: CrearRecepcionAtencionPayload = {
            pacienteId: paciente.id,
            tipoAtencionId,
            respuestasFormulario: buildRespuestasPayload(formulario, formValues),
        }

        const atencion = await onSubmit(payload)
        onSuccess?.(atencion)
        resetWizard()
    }

    const resetWizard = () => {
        setCurrentStep(0)
        setPaciente(null)
        setTipoAtencionId('')
        setFormValues({})
        setFormErrors({})
        setStepError(null)
    }

    return (
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Steps
                size="small"
                current={currentStep}
                items={WIZARD_STEPS}
                style={{ marginBottom: 8 }}
            />

            {stepError ? (
                <Alert type="error" showIcon message={stepError} />
            ) : null}

            {currentStep === 0 ? (
                <Card size="small" title="1. Buscar o registrar paciente">
                    <PacienteSearchBox
                        value={paciente?.id}
                        onChange={setPaciente}
                    />
                    {paciente ? (
                        <Alert
                            type="info"
                            showIcon
                            message={`Paciente seleccionado: ${paciente.label}`}
                        />
                    ) : null}
                </Card>
            ) : null}

            {currentStep === 1 ? (
                <Card size="small" title="2. Seleccionar tipo de atención">
                    <Form layout="vertical">
                        <Form.Item label="Tipo de atención" required>
                            <Select
                                showSearch
                                optionFilterProp="label"
                                loading={loadingTipos}
                                placeholder="Seleccione tipo"
                                options={tipoOptions}
                                value={tipoAtencionId || undefined}
                                onChange={(value) => setTipoAtencionId(value)}
                            />
                        </Form.Item>
                    </Form>
                </Card>
            ) : null}

            {currentStep === 2 ? (
                <Card
                    size="small"
                    title={`3. Formulario de recepción${tipoSeleccionado ? ` — ${tipoSeleccionado.nombre}` : ''}`}
                >
                    <DynamicClinicalForm
                        formulario={formulario}
                        loading={loadingFormulario}
                        values={formValues}
                        onChange={setFormValues}
                        errors={formErrors}
                    />
                </Card>
            ) : null}

            {currentStep === 3 ? (
                <Card size="small" title="4. Confirmar y crear atención">
                    <Descriptions bordered size="small" column={1}>
                        <Descriptions.Item label="Paciente">
                            {paciente?.label ?? '—'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Tipo de atención">
                            {tipoSeleccionado?.nombre ?? '—'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Formulario">
                            {formulario?.formularioNombre ?? '—'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Campos completados">
                            {formulario
                                ? buildRespuestasPayload(formulario, formValues).length
                                : 0}
                        </Descriptions.Item>
                        <Descriptions.Item label="Estado inicial">
                            RECEPCION
                        </Descriptions.Item>
                    </Descriptions>

                    {formulario ? (
                        <ResumenRespuestas
                            formulario={formulario}
                            values={formValues}
                        />
                    ) : null}
                </Card>
            ) : null}

            <Flex justify="space-between">
                <Button disabled={currentStep === 0 || loading} onClick={handleBack}>
                    Anterior
                </Button>

                {currentStep < WIZARD_STEPS.length - 1 ? (
                    <Button type="primary" onClick={handleNext}>
                        Siguiente
                    </Button>
                ) : (
                    <Button
                        type="primary"
                        loading={loading}
                        onClick={() => void handleConfirm()}
                    >
                        Crear atención
                    </Button>
                )}
            </Flex>
        </Space>
    )
}

function ResumenRespuestas({
    formulario,
    values,
}: {
    formulario: FormularioRecepcion
    values: DynamicFormValues
}) {
    const items = formulario.secciones.flatMap((seccion) =>
        seccion.campos
            .filter((campo) => {
                const value = values[campo.id]
                return value !== undefined && value !== null && value !== ''
            })
            .map((campo) => ({
                key: campo.id,
                label: campo.etiqueta,
                children: String(values[campo.id] ?? '—'),
            })),
    )

    if (!items.length) {
        return (
            <Text type="secondary" style={{ display: 'block', marginTop: 16 }}>
                No hay respuestas para mostrar.
            </Text>
        )
    }

    return (
        <Descriptions
            bordered
            size="small"
            column={1}
            style={{ marginTop: 16 }}
            items={items.slice(0, 12)}
        />
    )
}
