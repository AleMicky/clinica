import { useEffect, useMemo, useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { PlusOutlined } from '@ant-design/icons'
import { useQueryClient } from '@tanstack/react-query'
import { Button, Card, Col, Flex, Form, Input, Row, Select, Space, Typography } from 'antd'

import { serviciosService } from '../../catalogo-clinico/services/catalogo-clinico.service'
import { useMedicos } from '../../recursos-humanos/hooks/medicos.hooks'
import { PacienteFormModal } from '../../pacientes/components/PacienteFormModal'
import { useCreatePaciente } from '../../pacientes/hooks/pacientes.hooks'
import {
    toCreatePacientePayload,
    type PacienteFormValues,
} from '../../pacientes/schemas/paciente.schema'
import { usePacientes } from '../../pacientes/hooks/pacientes.hooks'
import { PersonaFormModal } from '../../personas/components/PersonaFormModal'
import { useCreatePersona } from '../../personas/hooks/personas.hooks'
import {
    toCreatePersonaPayload,
    type PersonaFormValues,
} from '../../personas/schemas/persona.schema'
import { useAppQuery } from '../../../shared/hooks/use-app-query'
import { queryKeys } from '../../../shared/constants/query-keys'
import {
    useEspecialidadesLookup,
    useTiposAtencion,
} from '../hooks/atencion-medica.hooks'
import {
    recepcionDefaultValues,
    recepcionFormSchema,
    type RecepcionFormValues,
} from '../schemas/recepcion.schema'

const { Text } = Typography

type RegistrarPacienteStep = 'closed' | 'persona' | 'paciente'

type RecepcionPacienteFormProps = {
    loading: boolean
    onSubmit: (values: RecepcionFormValues) => Promise<void>
}

function getFieldError(errors: unknown[]) {
    return errors
        .map((error) =>
            typeof error === 'string'
                ? error
                : (error as { message: string }).message,
        )
        .join(', ')
}

function requiredSelectValidator(message: string) {
    return {
        onChange: ({ value }: { value: string }) =>
            value.trim() ? undefined : message,
    }
}

export function RecepcionPacienteForm({
    loading,
    onSubmit,
}: RecepcionPacienteFormProps) {
    const [pacienteSearch, setPacienteSearch] = useState('')
    const [especialidadId, setEspecialidadId] = useState('')
    const [registrarStep, setRegistrarStep] = useState<RegistrarPacienteStep>('closed')
    const [nuevaPersonaId, setNuevaPersonaId] = useState('')

    const queryClient = useQueryClient()
    const createPersona = useCreatePersona()
    const createPaciente = useCreatePaciente()

    const { data: pacientesData, isFetching: loadingPacientes } = usePacientes({
        page: 1,
        pageSize: 20,
        search: pacienteSearch || undefined,
    })

    const { data: tiposData, isFetching: loadingTipos } = useTiposAtencion()
    const { data: serviciosData, isFetching: loadingServicios } = useAppQuery({
        queryKey: queryKeys.catalogoClinico.servicios.list({ page: 1, pageSize: 200 }),
        queryFn: () => serviciosService.getPaged({ page: 1, pageSize: 200 }),
        staleTime: 5 * 60 * 1000,
    })
    const { data: especialidadesData, isFetching: loadingEspecialidades } =
        useEspecialidadesLookup({ page: 1, pageSize: 200 })

    const form = useForm({
        defaultValues: recepcionDefaultValues,
        validators: {
            onSubmit: ({ value }) => {
                const result = recepcionFormSchema.safeParse(value)

                if (result.success) return

                const fields: Record<string, string> = {}

                for (const issue of result.error.issues) {
                    const key = issue.path[0]
                    if (typeof key === 'string' && !fields[key]) {
                        fields[key] = issue.message
                    }
                }

                return { fields }
            },
        },
        onSubmit: async ({ value }) => {
            await onSubmit(value)
        },
    })

    const especialidadIdForMedicos = especialidadId || undefined

    const { data: medicosData, isFetching: loadingMedicos } = useMedicos({
        page: 1,
        pageSize: 200,
        especialidadId: especialidadIdForMedicos,
    })

    const pacienteOptions = useMemo(
        () =>
            (pacientesData?.items ?? []).map((paciente) => ({
                value: paciente.id,
                label: `${paciente.personaNombreCompleto} · HC ${paciente.numeroHistoriaClinica}`,
            })),
        [pacientesData?.items],
    )

    const tipoOptions = useMemo(
        () =>
            (tiposData?.items ?? []).map((tipo) => ({
                value: tipo.id,
                label: tipo.nombre,
            })),
        [tiposData?.items],
    )

    const servicioOptions = useMemo(
        () =>
            (serviciosData?.items ?? []).map((servicio) => ({
                value: servicio.id,
                label: servicio.nombre,
            })),
        [serviciosData?.items],
    )

    const especialidadOptions = useMemo(
        () =>
            (especialidadesData?.items ?? []).map((especialidad) => ({
                value: especialidad.id,
                label: especialidad.nombre,
            })),
        [especialidadesData?.items],
    )

    const medicoOptions = useMemo(
        () =>
            (medicosData?.items ?? []).map((medico) => ({
                value: medico.id,
                label: `${medico.personaNombreCompleto} · ${medico.especialidadNombre}`,
            })),
        [medicosData?.items],
    )

    useEffect(() => {
        if (!especialidadId) {
            form.setFieldValue('medicoId', '')
        }
    }, [especialidadId, form])

    const sinResultados =
        Boolean(pacienteSearch.trim()) &&
        !loadingPacientes &&
        (pacientesData?.items.length ?? 0) === 0

    const sinServicios =
        !loadingServicios && (serviciosData?.items.length ?? 0) === 0

    const abrirRegistroPaciente = () => {
        setNuevaPersonaId('')
        setRegistrarStep('persona')
    }

    const cerrarRegistroPaciente = () => {
        if (createPersona.isPending || createPaciente.isPending) return
        setRegistrarStep('closed')
        setNuevaPersonaId('')
    }

    const handleRegistrarPersona = async (values: PersonaFormValues) => {
        const persona = await createPersona.mutateAsync(toCreatePersonaPayload(values))
        setNuevaPersonaId(persona.id)
        setRegistrarStep('paciente')
    }

    const handleRegistrarPaciente = async (values: PacienteFormValues) => {
        const paciente = await createPaciente.mutateAsync(toCreatePacientePayload(values))
        await queryClient.invalidateQueries({ queryKey: queryKeys.pacientes.all })
        form.setFieldValue('pacienteId', paciente.id)
        setPacienteSearch(paciente.personaNombreCompleto)
        setRegistrarStep('closed')
        setNuevaPersonaId('')
    }

    return (
        <form
            onSubmit={(event) => {
                event.preventDefault()
                void form.handleSubmit()
            }}
        >
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <Card size="small" title="1. Paciente">
                    <form.Field
                        name="pacienteId"
                        validators={requiredSelectValidator('Seleccione un paciente')}
                    >
                        {(field) => (
                            <Form.Item
                                label="Buscar paciente"
                                required
                                validateStatus={field.state.meta.errors.length ? 'error' : ''}
                                help={getFieldError(field.state.meta.errors)}
                            >
                                <Flex gap={8} align="start">
                                    <Select
                                        showSearch
                                        allowClear
                                        style={{ flex: 1 }}
                                        placeholder="Nombre, documento o historia clínica"
                                        filterOption={false}
                                        onSearch={setPacienteSearch}
                                        loading={loadingPacientes}
                                        options={pacienteOptions}
                                        value={field.state.value || undefined}
                                        onChange={(value) => field.handleChange(value ?? '')}
                                        onBlur={field.handleBlur}
                                        notFoundContent={
                                            sinResultados ? (
                                                <div style={{ padding: '8px 0', textAlign: 'center' }}>
                                                    <Text type="secondary">
                                                        No se encontró el paciente
                                                    </Text>
                                                    <br />
                                                    <Button
                                                        type="link"
                                                        size="small"
                                                        onClick={abrirRegistroPaciente}
                                                    >
                                                        Registrar nuevo paciente
                                                    </Button>
                                                </div>
                                            ) : undefined
                                        }
                                    />
                                    <Button
                                        icon={<PlusOutlined />}
                                        onClick={abrirRegistroPaciente}
                                    >
                                        Nuevo
                                    </Button>
                                </Flex>
                            </Form.Item>
                        )}
                    </form.Field>
                </Card>

                <Card size="small" title="2. Datos de atención">
                    <Row gutter={16}>
                        <Col xs={24} md={12}>
                            <form.Field
                                name="tipoAtencionId"
                                validators={requiredSelectValidator(
                                    'Seleccione un tipo de atención',
                                )}
                            >
                                {(field) => (
                                    <Form.Item
                                        label="Tipo de atención"
                                        required
                                        validateStatus={
                                            field.state.meta.errors.length ? 'error' : ''
                                        }
                                        help={getFieldError(field.state.meta.errors)}
                                    >
                                        <Select
                                            showSearch
                                            optionFilterProp="label"
                                            loading={loadingTipos}
                                            placeholder="Seleccione tipo"
                                            options={tipoOptions}
                                            value={field.state.value || undefined}
                                            onChange={(value) =>
                                                field.handleChange(value ?? '')
                                            }
                                            onBlur={field.handleBlur}
                                        />
                                    </Form.Item>
                                )}
                            </form.Field>
                        </Col>
                        <Col xs={24} md={12}>
                            <form.Field
                                name="servicioId"
                                validators={requiredSelectValidator('Seleccione un servicio')}
                            >
                                {(field) => (
                                    <Form.Item
                                        label="Servicio"
                                        required
                                        validateStatus={
                                            field.state.meta.errors.length ? 'error' : ''
                                        }
                                        help={
                                            sinServicios
                                                ? 'No hay servicios registrados. Configure la jerarquía clínica en Recursos Humanos.'
                                                : getFieldError(field.state.meta.errors)
                                        }
                                    >
                                        <Select
                                            showSearch
                                            optionFilterProp="label"
                                            loading={loadingServicios}
                                            placeholder="Seleccione servicio"
                                            options={servicioOptions}
                                            value={field.state.value || undefined}
                                            onChange={(value) =>
                                                field.handleChange(value ?? '')
                                            }
                                            onBlur={field.handleBlur}
                                            notFoundContent={
                                                sinServicios ? (
                                                    <Text type="secondary">
                                                        Sin servicios disponibles
                                                    </Text>
                                                ) : undefined
                                            }
                                        />
                                    </Form.Item>
                                )}
                            </form.Field>
                        </Col>
                        <Col xs={24} md={12}>
                            <form.Field name="especialidadId">
                                {(field) => (
                                    <Form.Item label="Especialidad">
                                        <Select
                                            showSearch
                                            allowClear
                                            optionFilterProp="label"
                                            loading={loadingEspecialidades}
                                            placeholder="Opcional"
                                            options={especialidadOptions}
                                            value={field.state.value || undefined}
                                            onChange={(value) => {
                                                const next = value ?? ''
                                                setEspecialidadId(next)
                                                field.handleChange(next)
                                            }}
                                            onBlur={field.handleBlur}
                                        />
                                    </Form.Item>
                                )}
                            </form.Field>
                        </Col>
                        <Col xs={24} md={12}>
                            <form.Field name="medicoId">
                                {(field) => (
                                    <Form.Item label="Médico">
                                        <Select
                                            showSearch
                                            allowClear
                                            optionFilterProp="label"
                                            loading={loadingMedicos}
                                            placeholder="Opcional"
                                            options={medicoOptions}
                                            value={field.state.value || undefined}
                                            onChange={(value) =>
                                                field.handleChange(value ?? '')
                                            }
                                            onBlur={field.handleBlur}
                                            disabled={!especialidadId}
                                        />
                                    </Form.Item>
                                )}
                            </form.Field>
                        </Col>
                        <Col span={24}>
                            <form.Field name="motivoConsulta">
                                {(field) => (
                                    <Form.Item
                                        label="Motivo de consulta"
                                        required
                                        validateStatus={
                                            field.state.meta.errors.length ? 'error' : ''
                                        }
                                        help={getFieldError(field.state.meta.errors)}
                                    >
                                        <Input.TextArea
                                            rows={2}
                                            maxLength={500}
                                            showCount
                                            placeholder="Describa el motivo de la consulta"
                                            value={field.state.value}
                                            onChange={(event) =>
                                                field.handleChange(event.target.value)
                                            }
                                            onBlur={field.handleBlur}
                                        />
                                    </Form.Item>
                                )}
                            </form.Field>
                        </Col>
                    </Row>
                </Card>

                <Card size="small" title="3. Responsable financiero">
                    <Row gutter={16}>
                        <Col xs={24} md={8}>
                            <form.Field name="responsableFinancieroNombre">
                                {(field) => (
                                    <Form.Item label="Nombre">
                                        <Input
                                            placeholder="Opcional"
                                            value={field.state.value}
                                            onChange={(event) =>
                                                field.handleChange(event.target.value)
                                            }
                                            onBlur={field.handleBlur}
                                        />
                                    </Form.Item>
                                )}
                            </form.Field>
                        </Col>
                        <Col xs={24} md={8}>
                            <form.Field name="responsableFinancieroDocumento">
                                {(field) => (
                                    <Form.Item label="Documento">
                                        <Input
                                            placeholder="Opcional"
                                            value={field.state.value}
                                            onChange={(event) =>
                                                field.handleChange(event.target.value)
                                            }
                                            onBlur={field.handleBlur}
                                        />
                                    </Form.Item>
                                )}
                            </form.Field>
                        </Col>
                        <Col xs={24} md={8}>
                            <form.Field name="responsableFinancieroTelefono">
                                {(field) => (
                                    <Form.Item label="Teléfono">
                                        <Input
                                            placeholder="Opcional"
                                            value={field.state.value}
                                            onChange={(event) =>
                                                field.handleChange(event.target.value)
                                            }
                                            onBlur={field.handleBlur}
                                        />
                                    </Form.Item>
                                )}
                            </form.Field>
                        </Col>
                    </Row>
                </Card>

                <Card size="small" title="4. Seguro / convenio">
                    <Row gutter={16}>
                        <Col xs={24} md={12}>
                            <form.Field name="seguroNombre">
                                {(field) => (
                                    <Form.Item label="Seguro">
                                        <Input
                                            placeholder="Opcional"
                                            value={field.state.value}
                                            onChange={(event) =>
                                                field.handleChange(event.target.value)
                                            }
                                            onBlur={field.handleBlur}
                                        />
                                    </Form.Item>
                                )}
                            </form.Field>
                        </Col>
                        <Col xs={24} md={12}>
                            <form.Field name="numeroAfiliacion">
                                {(field) => (
                                    <Form.Item label="Número de afiliación">
                                        <Input
                                            placeholder="Opcional"
                                            value={field.state.value}
                                            onChange={(event) =>
                                                field.handleChange(event.target.value)
                                            }
                                            onBlur={field.handleBlur}
                                        />
                                    </Form.Item>
                                )}
                            </form.Field>
                        </Col>
                    </Row>
                </Card>

                <Card size="small" title="5. Observaciones">
                    <form.Field name="observaciones">
                        {(field) => (
                            <Form.Item label="Observaciones">
                                <Input.TextArea
                                    rows={3}
                                    maxLength={2000}
                                    showCount
                                    placeholder="Notas adicionales (opcional)"
                                    value={field.state.value}
                                    onChange={(event) =>
                                        field.handleChange(event.target.value)
                                    }
                                    onBlur={field.handleBlur}
                                />
                            </Form.Item>
                        )}
                    </form.Field>
                </Card>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        Crear atención
                    </Button>
                </div>
            </Space>

            <PersonaFormModal
                open={registrarStep === 'persona'}
                persona={null}
                loading={createPersona.isPending}
                title="Registrar persona (paso 1 de 2)"
                onClose={cerrarRegistroPaciente}
                onSubmit={handleRegistrarPersona}
            />

            <PacienteFormModal
                open={registrarStep === 'paciente'}
                paciente={null}
                loading={createPaciente.isPending}
                initialPersonaId={nuevaPersonaId}
                lockPersona
                title="Registrar paciente (paso 2 de 2)"
                onClose={cerrarRegistroPaciente}
                onSubmit={handleRegistrarPaciente}
            />
        </form>
    )
}
