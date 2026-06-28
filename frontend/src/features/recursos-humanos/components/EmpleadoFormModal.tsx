import { useEffect, useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { Col, Form, Input, Modal, Row, Select } from 'antd'

import {
    useAreaDepartamentos,
    useAreas,
    useCargos,
    useDepartamentoServicios,
    useProfesiones,
} from '../../catalogo-clinico/hooks/catalogo-clinico.hooks'
import { usePersonasLookup } from '../../personas/hooks/personas.hooks'
import {
    empleadoDefaultValues,
    empleadoSchema,
    type EmpleadoFormValues,
} from '../schemas/empleado.schema'
import type { Empleado } from '../types/empleado.types'

type EmpleadoFormModalProps = {
    open: boolean
    empleado: Empleado | null
    loading: boolean
    onClose: () => void
    onSubmit: (values: EmpleadoFormValues) => Promise<void>
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

const LOOKUP_QUERY = { page: 1, pageSize: 200 }

export function EmpleadoFormModal({
    open,
    empleado,
    loading,
    onClose,
    onSubmit,
}: EmpleadoFormModalProps) {
    const isEditing = empleado !== null

    const { data: personasResult, isFetching: loadingPersonas } = usePersonasLookup()
    const { data: areasResult, isFetching: loadingAreas } = useAreas(LOOKUP_QUERY)
    const { data: profesionesResult, isFetching: loadingProfesiones } =
        useProfesiones(LOOKUP_QUERY)
    const { data: cargosResult, isFetching: loadingCargos } = useCargos(LOOKUP_QUERY)

    const [areaId, setAreaId] = useState<string | null>(null)
    const [departamentoId, setDepartamentoId] = useState<string | null>(null)

    const { data: departamentosResult, isFetching: loadingDepartamentos } =
        useAreaDepartamentos(areaId)
    const { data: serviciosResult, isFetching: loadingServicios } =
        useDepartamentoServicios(departamentoId)

    const form = useForm({
        defaultValues: empleadoDefaultValues,
        validators: {
            onSubmit: empleadoSchema,
        },
        onSubmit: async ({ value }) => {
            await onSubmit(value)
        },
    })

    useEffect(() => {
        if (!open) return

        form.reset()

        if (empleado) {
            form.setFieldValue('personaId', empleado.personaId)
            form.setFieldValue('codigoEmpleado', empleado.codigoEmpleado)
            form.setFieldValue('areaId', empleado.areaId)
            form.setFieldValue('departamentoId', empleado.departamentoId)
            form.setFieldValue('servicioId', empleado.servicioId)
            form.setFieldValue('profesionId', empleado.profesionId)
            form.setFieldValue('cargoId', empleado.cargoId)
            form.setFieldValue('fechaIngreso', empleado.fechaIngreso ?? '')
            setAreaId(empleado.areaId)
            setDepartamentoId(empleado.departamentoId)
        } else {
            setAreaId(null)
            setDepartamentoId(null)
        }
    }, [open, empleado, form])

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

    const departamentoOptions =
        (departamentosResult ?? []).map((departamento) => ({
            label: departamento.nombre,
            value: departamento.id,
        }))

    const servicioOptions =
        (serviciosResult ?? []).map((servicio) => ({
            label: servicio.nombre,
            value: servicio.id,
        }))

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

    const handleClose = () => {
        if (loading) return
        onClose()
    }

    const handleAreaChange = (value: string) => {
        setAreaId(value)
        setDepartamentoId(null)
        form.setFieldValue('areaId', value)
        form.setFieldValue('departamentoId', '')
        form.setFieldValue('servicioId', '')
    }

    const handleDepartamentoChange = (value: string) => {
        setDepartamentoId(value)
        form.setFieldValue('departamentoId', value)
        form.setFieldValue('servicioId', '')
    }

    return (
        <Modal
            title={isEditing ? 'Editar empleado' : 'Nuevo empleado'}
            open={open}
            onCancel={handleClose}
            onOk={() => void form.handleSubmit()}
            okText={isEditing ? 'Guardar' : 'Registrar'}
            cancelText="Cancelar"
            confirmLoading={loading}
            destroyOnHidden
            width={640}
            className="rrhh-form-modal"
        >
            <Form layout="vertical" requiredMark={false} size="small">
                <Row gutter={12}>
                    <Col xs={24} sm={12}>
                        <form.Field name="personaId">
                            {(field) => {
                                const error = getFieldError(field.state.meta.errors)

                                return (
                                    <Form.Item
                                        label="Persona"
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
                                            disabled={loading || loadingPersonas || isEditing}
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
                                            disabled={loading}
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
                                    <Input
                                        type="date"
                                        value={field.state.value}
                                        onChange={(event) =>
                                            field.handleChange(event.target.value)
                                        }
                                        onBlur={field.handleBlur}
                                        disabled={loading}
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
                                            disabled={loading || loadingCargos}
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
                                            disabled={loading || loadingProfesiones}
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
                                            disabled={loading || loadingAreas}
                                        />
                                    </Form.Item>
                                )
                            }}
                        </form.Field>
                    </Col>

                    <Col xs={24} sm={12}>
                        <form.Field name="departamentoId">
                            {(field) => {
                                const error = getFieldError(field.state.meta.errors)

                                return (
                                    <Form.Item
                                        label="Departamento"
                                        validateStatus={error ? 'error' : undefined}
                                        help={error || undefined}
                                    >
                                        <Select
                                            showSearch
                                            optionFilterProp="label"
                                            placeholder="Seleccionar departamento"
                                            options={departamentoOptions}
                                            value={field.state.value || undefined}
                                            onChange={handleDepartamentoChange}
                                            onBlur={field.handleBlur}
                                            disabled={
                                                loading ||
                                                loadingDepartamentos ||
                                                !areaId
                                            }
                                        />
                                    </Form.Item>
                                )
                            }}
                        </form.Field>
                    </Col>

                    <Col xs={24}>
                        <form.Field name="servicioId">
                            {(field) => {
                                const error = getFieldError(field.state.meta.errors)

                                return (
                                    <Form.Item
                                        label="Servicio"
                                        validateStatus={error ? 'error' : undefined}
                                        help={error || undefined}
                                    >
                                        <Select
                                            showSearch
                                            optionFilterProp="label"
                                            placeholder="Seleccionar servicio"
                                            options={servicioOptions}
                                            value={field.state.value || undefined}
                                            onChange={(value) => field.handleChange(value)}
                                            onBlur={field.handleBlur}
                                            disabled={
                                                loading ||
                                                loadingServicios ||
                                                !departamentoId
                                            }
                                        />
                                    </Form.Item>
                                )
                            }}
                        </form.Field>
                    </Col>
                </Row>
            </Form>
        </Modal>
    )
}
