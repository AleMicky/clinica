import { useEffect } from 'react'
import { useForm, useStore } from '@tanstack/react-form'
import {
    Button,
    Col,
    DatePicker,
    Divider,
    Drawer,
    Flex,
    Form,
    Grid,
    Input,
    Row,
    Select,
    Switch,
    Typography,
} from 'antd'
import dayjs from 'dayjs'

import {
    useAreas,
    useCargos,
    useEspecialidades,
    useProfesiones,
} from '../../catalogo-clinico/hooks/catalogo-clinico.hooks'
import { usePersonasLookup } from '../../personas/hooks/personas.hooks'
import { useEmpleado } from '../hooks/empleados.hooks'
import {
    empleadoDefaultValues,
    empleadoSchema,
    type EmpleadoFormValues,
} from '../schemas/empleado.schema'
import type { Empleado } from '../types/empleado.types'
import { getFieldError } from '../utils/form-errors'

const { Text } = Typography
const { useBreakpoint } = Grid

const DATE_VALUE_FORMAT = 'YYYY-MM-DD'
const DATE_DISPLAY_FORMAT = 'DD/MM/YYYY'

type EmpleadoFormDrawerProps = {
    open: boolean
    empleado: Empleado | null
    loading: boolean
    onClose: () => void
    onSubmit: (values: EmpleadoFormValues) => Promise<void>
}

const LOOKUP_QUERY = { page: 1, pageSize: 200 }

export function EmpleadoFormDrawer({
    open,
    empleado,
    loading,
    onClose,
    onSubmit,
}: EmpleadoFormDrawerProps) {
    const screens = useBreakpoint()
    const drawerWidth = screens.md ? 680 : '95%'
    const isEditing = empleado !== null

    const { data: empleadoDetail, isFetching: loadingEmpleadoDetail } = useEmpleado(
        empleado?.id ?? null,
        open && isEditing,
    )

    const { data: personasResult, isFetching: loadingPersonas } = usePersonasLookup()
    const { data: areasResult, isFetching: loadingAreas } = useAreas(LOOKUP_QUERY)
    const { data: profesionesResult, isFetching: loadingProfesiones } =
        useProfesiones(LOOKUP_QUERY)
    const { data: cargosResult, isFetching: loadingCargos } = useCargos(LOOKUP_QUERY)
    const { data: especialidadesResult, isFetching: loadingEspecialidades } =
        useEspecialidades(LOOKUP_QUERY)

    const form = useForm({
        defaultValues: empleadoDefaultValues,
        validators: {
            onSubmit: empleadoSchema,
        },
        onSubmit: async ({ value }) => {
            await onSubmit(value)
        },
    })

    const esMedico = useStore(form.store, (state) => state.values.esMedico)
    const selectedEspecialidadIds = useStore(
        form.store,
        (state) => state.values.especialidadIds,
    )

    const empleadoSource = empleadoDetail ?? empleado

    useEffect(() => {
        if (!open) return

        form.reset()

        if (empleadoSource) {
            form.setFieldValue('personaId', empleadoSource.personaId)
            form.setFieldValue('codigoEmpleado', empleadoSource.codigoEmpleado)
            form.setFieldValue('areaId', empleadoSource.areaId)
            form.setFieldValue('profesionId', empleadoSource.profesionId)
            form.setFieldValue('cargoId', empleadoSource.cargoId)
            form.setFieldValue('fechaIngreso', empleadoSource.fechaIngreso ?? '')
            form.setFieldValue('esMedico', empleadoSource.esMedico)
            form.setFieldValue(
                'especialidadIds',
                empleadoSource.medico?.especialidades.map(
                    (item) => item.especialidadId,
                ) ?? [],
            )
            form.setFieldValue(
                'especialidadPrincipalId',
                empleadoSource.medico?.especialidadPrincipalId ?? '',
            )
            form.setFieldValue(
                'matriculaProfesional',
                empleadoSource.medico?.matriculaProfesional ?? '',
            )
            form.setFieldValue(
                'registroColegioMedico',
                empleadoSource.medico?.registroColegioMedico ?? '',
            )
        }
    }, [open, empleadoSource, form])

    const personaOptions =
        personasResult?.items.map((persona) => ({
            label: `${persona.nombreCompleto} (${persona.tipoDocumentoNombre}: ${persona.numeroDocumento})`,
            value: persona.id,
        })) ?? []

    const areaOptions =
        areasResult?.items.map((area) => ({
            label: area.nombre,
            value: area.id,
        })) ?? []

    const profesionOptions =
        profesionesResult?.items.map((profesion) => ({
            label: profesion.nombre,
            value: profesion.id,
        })) ?? []

    const cargoOptions =
        cargosResult?.items.map((cargo) => ({
            label: cargo.nombre,
            value: cargo.id,
        })) ?? []

    const especialidadOptions =
        especialidadesResult?.items.map((especialidad) => ({
            label: especialidad.nombre,
            value: especialidad.id,
        })) ?? []

    const principalOptions = especialidadOptions.filter((option) =>
        selectedEspecialidadIds.includes(option.value),
    )

    const handleClose = () => {
        if (loading) return
        onClose()
    }

    const handleAreaChange = (value: string) => {
        form.setFieldValue('areaId', value)
    }

    const handleEsMedicoChange = (checked: boolean) => {
        form.setFieldValue('esMedico', checked)

        if (!checked) {
            form.setFieldValue('especialidadIds', [])
            form.setFieldValue('especialidadPrincipalId', '')
            form.setFieldValue('matriculaProfesional', '')
            form.setFieldValue('registroColegioMedico', '')
        }
    }

    const isFormLoading = loading || (isEditing && loadingEmpleadoDetail)

    return (
        <Drawer
            title={isEditing ? 'Editar empleado' : 'Nuevo empleado'}
            open={open}
            onClose={handleClose}
            width={drawerWidth}
            destroyOnHidden
            className="usuario-drawer"
            footer={
                <Flex justify="flex-end" gap={8} className="usuario-drawer__footer">
                    <Button onClick={handleClose} disabled={isFormLoading}>
                        Cancelar
                    </Button>
                    <Button
                        type="primary"
                        loading={isFormLoading}
                        onClick={() => void form.handleSubmit()}
                    >
                        {isEditing ? 'Guardar' : 'Registrar'}
                    </Button>
                </Flex>
            }
        >
            <Form
                layout="vertical"
                requiredMark
                size="small"
                className="usuario-drawer__form usuario-drawer__form--compact"
            >
                <Text type="secondary" className="usuario-drawer__required-hint">
                    Los campos marcados con <Text type="danger">*</Text> son obligatorios.
                </Text>

                <Row gutter={12}>
                    <Col xs={24} sm={12}>
                        <form.Field name="personaId">
                            {(field) => {
                                const error = getFieldError(field.state.meta.errors)

                                return (
                                    <Form.Item
                                        label="Persona"
                                        required
                                        validateStatus={error ? 'error' : undefined}
                                        help={error || undefined}
                                    >
                                        <Select
                                            showSearch
                                            optionFilterProp="label"
                                            placeholder="Seleccionar persona"
                                            options={personaOptions}
                                            value={field.state.value || undefined}
                                            onChange={(value) => field.handleChange(value)}
                                            onBlur={field.handleBlur}
                                            disabled={
                                                isFormLoading ||
                                                loadingPersonas ||
                                                isEditing
                                            }
                                        />
                                    </Form.Item>
                                )
                            }}
                        </form.Field>
                    </Col>

                    <Col xs={24} sm={12}>
                        <form.Field name="codigoEmpleado">
                            {(field) => {
                                const error = getFieldError(field.state.meta.errors)

                                return (
                                    <Form.Item
                                        label="Código de empleado"
                                        required
                                        validateStatus={error ? 'error' : undefined}
                                        help={error || undefined}
                                    >
                                        <Input
                                            placeholder="EMP-001"
                                            value={field.state.value}
                                            onChange={(event) =>
                                                field.handleChange(event.target.value)
                                            }
                                            onBlur={field.handleBlur}
                                            disabled={isFormLoading}
                                        />
                                    </Form.Item>
                                )
                            }}
                        </form.Field>
                    </Col>

                    <Col xs={24} sm={12}>
                        <form.Field name="fechaIngreso">
                            {(field) => (
                                <Form.Item label="Fecha de ingreso">
                                    <DatePicker
                                        style={{ width: '100%' }}
                                        format={DATE_DISPLAY_FORMAT}
                                        placeholder="Seleccione fecha"
                                        value={
                                            field.state.value
                                                ? dayjs(field.state.value, DATE_VALUE_FORMAT)
                                                : null
                                        }
                                        onChange={(date) =>
                                            field.handleChange(
                                                date ? date.format(DATE_VALUE_FORMAT) : '',
                                            )
                                        }
                                        onBlur={field.handleBlur}
                                        disabled={isFormLoading}
                                    />
                                </Form.Item>
                            )}
                        </form.Field>
                    </Col>

                    <Col xs={24} sm={12}>
                        <form.Field name="cargoId">
                            {(field) => {
                                const error = getFieldError(field.state.meta.errors)

                                return (
                                    <Form.Item
                                        label="Cargo"
                                        required
                                        validateStatus={error ? 'error' : undefined}
                                        help={error || undefined}
                                    >
                                        <Select
                                            showSearch
                                            optionFilterProp="label"
                                            placeholder="Seleccionar cargo"
                                            options={cargoOptions}
                                            value={field.state.value || undefined}
                                            onChange={(value) => field.handleChange(value)}
                                            onBlur={field.handleBlur}
                                            disabled={isFormLoading || loadingCargos}
                                        />
                                    </Form.Item>
                                )
                            }}
                        </form.Field>
                    </Col>

                    <Col xs={24} sm={12}>
                        <form.Field name="profesionId">
                            {(field) => {
                                const error = getFieldError(field.state.meta.errors)

                                return (
                                    <Form.Item
                                        label="Profesión"
                                        required
                                        validateStatus={error ? 'error' : undefined}
                                        help={error || undefined}
                                    >
                                        <Select
                                            showSearch
                                            optionFilterProp="label"
                                            placeholder="Seleccionar profesión"
                                            options={profesionOptions}
                                            value={field.state.value || undefined}
                                            onChange={(value) => field.handleChange(value)}
                                            onBlur={field.handleBlur}
                                            disabled={isFormLoading || loadingProfesiones}
                                        />
                                    </Form.Item>
                                )
                            }}
                        </form.Field>
                    </Col>

                    <Col xs={24} sm={12}>
                        <form.Field name="areaId">
                            {(field) => {
                                const error = getFieldError(field.state.meta.errors)

                                return (
                                    <Form.Item
                                        label="Área"
                                        required
                                        validateStatus={error ? 'error' : undefined}
                                        help={error || undefined}
                                    >
                                        <Select
                                            showSearch
                                            optionFilterProp="label"
                                            placeholder="Seleccionar área"
                                            options={areaOptions}
                                            value={field.state.value || undefined}
                                            onChange={handleAreaChange}
                                            onBlur={field.handleBlur}
                                            disabled={isFormLoading || loadingAreas}
                                        />
                                    </Form.Item>
                                )
                            }}
                        </form.Field>
                    </Col>
                </Row>

                <Divider className="rrhh-form-modal__divider" />

                <form.Field name="esMedico">
                    {(field) => (
                        <Form.Item
                            label="Registrar como médico"
                            help="Active esta opción para registrar especialidades y matrícula sin ir al directorio de médicos."
                        >
                            <Switch
                                checked={field.state.value}
                                onChange={handleEsMedicoChange}
                                disabled={isFormLoading}
                            />
                        </Form.Item>
                    )}
                </form.Field>

                {esMedico ? (
                    <Row gutter={12}>
                        <Col xs={24}>
                            <form.Field name="especialidadIds">
                                {(field) => {
                                    const error = getFieldError(field.state.meta.errors)

                                    return (
                                        <Form.Item
                                            label="Especialidades"
                                            required
                                            validateStatus={error ? 'error' : undefined}
                                            help={error || undefined}
                                        >
                                            <Select
                                                mode="multiple"
                                                showSearch
                                                optionFilterProp="label"
                                                placeholder="Seleccionar especialidades"
                                                options={especialidadOptions}
                                                value={field.state.value}
                                                onChange={(values) => {
                                                    field.handleChange(values)

                                                    const principalId =
                                                        form.getFieldValue(
                                                            'especialidadPrincipalId',
                                                        )

                                                    if (
                                                        values.length === 1 &&
                                                        values[0] !== principalId
                                                    ) {
                                                        form.setFieldValue(
                                                            'especialidadPrincipalId',
                                                            values[0],
                                                        )
                                                    } else if (
                                                        principalId &&
                                                        !values.includes(principalId)
                                                    ) {
                                                        form.setFieldValue(
                                                            'especialidadPrincipalId',
                                                            values[0] ?? '',
                                                        )
                                                    }
                                                }}
                                                onBlur={field.handleBlur}
                                                disabled={
                                                    isFormLoading || loadingEspecialidades
                                                }
                                            />
                                        </Form.Item>
                                    )
                                }}
                            </form.Field>
                        </Col>

                        <Col xs={24}>
                            <form.Field name="especialidadPrincipalId">
                                {(field) => {
                                    const error = getFieldError(field.state.meta.errors)

                                    return (
                                        <Form.Item
                                            label="Especialidad principal"
                                            required
                                            validateStatus={error ? 'error' : undefined}
                                            help={
                                                error ||
                                                (selectedEspecialidadIds.length > 1
                                                    ? 'Se usa como referencia en atención médica.'
                                                    : undefined)
                                            }
                                        >
                                            <Select
                                                showSearch
                                                optionFilterProp="label"
                                                placeholder="Seleccionar especialidad principal"
                                                options={principalOptions}
                                                value={field.state.value || undefined}
                                                onChange={(value) =>
                                                    field.handleChange(value)
                                                }
                                                onBlur={field.handleBlur}
                                                disabled={
                                                    isFormLoading ||
                                                    loadingEspecialidades ||
                                                    selectedEspecialidadIds.length === 0
                                                }
                                            />
                                        </Form.Item>
                                    )
                                }}
                            </form.Field>
                        </Col>

                        <Col xs={24} sm={12}>
                            <form.Field name="matriculaProfesional">
                                {(field) => {
                                    const error = getFieldError(field.state.meta.errors)

                                    return (
                                        <Form.Item
                                            label="Matrícula profesional"
                                            required
                                            validateStatus={error ? 'error' : undefined}
                                            help={error || undefined}
                                        >
                                            <Input
                                                placeholder="MP-12345"
                                                value={field.state.value}
                                                onChange={(event) =>
                                                    field.handleChange(event.target.value)
                                                }
                                                onBlur={field.handleBlur}
                                                disabled={isFormLoading}
                                            />
                                        </Form.Item>
                                    )
                                }}
                            </form.Field>
                        </Col>

                        <Col xs={24} sm={12}>
                            <form.Field name="registroColegioMedico">
                                {(field) => (
                                    <Form.Item label="Registro colegio médico">
                                        <Input
                                            placeholder="Opcional"
                                            value={field.state.value}
                                            onChange={(event) =>
                                                field.handleChange(event.target.value)
                                            }
                                            onBlur={field.handleBlur}
                                            disabled={isFormLoading}
                                        />
                                    </Form.Item>
                                )}
                            </form.Field>
                        </Col>
                    </Row>
                ) : (
                    <Text type="secondary">
                        Si el empleado ejerce como médico, active el interruptor para
                        completar sus datos profesionales aquí mismo.
                    </Text>
                )}
            </Form>
        </Drawer>
    )
}
