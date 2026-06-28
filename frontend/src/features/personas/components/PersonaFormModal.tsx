import { useEffect } from 'react'
import { useForm } from '@tanstack/react-form'
import { Col, Form, Input, Modal, Row, Select } from 'antd'

import { useCatalogoGruposGrouped } from '../../parametros/catalogos/hooks/catalogo-grupos.hooks'
import {
    personaDefaultValues,
    personaSchema,
    type PersonaFormValues,
} from '../schemas/persona.schema'
import type { Persona } from '../types/persona.types'

type PersonaFormModalProps = {
    open: boolean
    persona: Persona | null
    loading: boolean
    onClose: () => void
    onSubmit: (values: PersonaFormValues) => Promise<void>
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

function getCatalogoOptions(
    catalogos: ReturnType<typeof useCatalogoGruposGrouped>['data'],
    codigo: string,
) {
    return (
        catalogos
            ?.find((grupo) => grupo.codigo === codigo)
            ?.items.map((item) => ({
                label: item.nombre,
                value: item.id,
            })) ?? []
    )
}

export function PersonaFormModal({
    open,
    persona,
    loading,
    onClose,
    onSubmit,
}: PersonaFormModalProps) {
    const isEditing = persona !== null
    const { data: catalogos, isFetching: loadingCatalogos } = useCatalogoGruposGrouped()

    const form = useForm({
        defaultValues: personaDefaultValues,
        validators: {
            onSubmit: personaSchema,
        },
        onSubmit: async ({ value }) => {
            await onSubmit(value)
        },
    })

    useEffect(() => {
        if (!open) return

        form.reset()

        if (persona) {
            form.setFieldValue('tipoDocumentoId', persona.tipoDocumentoId)
            form.setFieldValue('numeroDocumento', persona.numeroDocumento)
            form.setFieldValue('extensionDocumentoId', persona.extensionDocumentoId ?? '')
            form.setFieldValue('complementoDocumento', persona.complementoDocumento ?? '')
            form.setFieldValue('nombres', persona.nombres)
            form.setFieldValue('apellidoPaterno', persona.apellidoPaterno)
            form.setFieldValue('apellidoMaterno', persona.apellidoMaterno)
            form.setFieldValue('fechaNacimiento', persona.fechaNacimiento)
            form.setFieldValue('sexoId', persona.sexoId)
            form.setFieldValue('estadoCivilId', persona.estadoCivilId)
            form.setFieldValue('telefono', persona.telefono)
            form.setFieldValue('direccion', persona.direccion)
        }
    }, [open, persona, form])

    const tipoDocumentoOptions = getCatalogoOptions(catalogos, 'TIPO_DOCUMENTO')
    const extensionDocumentoOptions = getCatalogoOptions(catalogos, 'EXTENSION_DOCUMENTO')
    const sexoOptions = getCatalogoOptions(catalogos, 'SEXO')
    const estadoCivilOptions = getCatalogoOptions(catalogos, 'ESTADO_CIVIL')

    const handleClose = () => {
        if (loading) return
        onClose()
    }

    return (
        <Modal
            title={isEditing ? 'Editar persona' : 'Nueva persona'}
            open={open}
            onCancel={handleClose}
            onOk={() => void form.handleSubmit()}
            okText={isEditing ? 'Guardar' : 'Registrar'}
            cancelText="Cancelar"
            confirmLoading={loading}
            destroyOnHidden
            width={720}
            className="rrhh-form-modal"
        >
            <Form layout="vertical" requiredMark={false} size="small">
                <Row gutter={12}>
                    <Col xs={24} sm={12}>
                        <form.Field name="tipoDocumentoId">
                            {(field) => {
                                const error = getFieldError(field.state.meta.errors)

                                return (
                                    <Form.Item
                                        label="Tipo de documento"
                                        validateStatus={error ? 'error' : undefined}
                                        help={error || undefined}
                                    >
                                        <Select
                                            showSearch
                                            optionFilterProp="label"
                                            placeholder="Seleccionar tipo"
                                            options={tipoDocumentoOptions}
                                            value={field.state.value || undefined}
                                            onChange={(value) => field.handleChange(value)}
                                            onBlur={field.handleBlur}
                                            disabled={loading || loadingCatalogos}
                                        />
                                    </Form.Item>
                                )
                            }}
                        </form.Field>
                    </Col>

                    <Col xs={24} sm={12}>
                        <form.Field name="numeroDocumento">
                            {(field) => {
                                const error = getFieldError(field.state.meta.errors)

                                return (
                                    <Form.Item
                                        label="Número de documento"
                                        validateStatus={error ? 'error' : undefined}
                                        help={error || undefined}
                                    >
                                        <Input
                                            placeholder="12345678"
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
                        <form.Field name="extensionDocumentoId">
                            {(field) => (
                                <Form.Item label="Extensión">
                                    <Select
                                        allowClear
                                        showSearch
                                        optionFilterProp="label"
                                        placeholder="Opcional"
                                        options={extensionDocumentoOptions}
                                        value={field.state.value || undefined}
                                        onChange={(value) => field.handleChange(value ?? '')}
                                        onBlur={field.handleBlur}
                                        disabled={loading || loadingCatalogos}
                                    />
                                </Form.Item>
                            )}
                        </form.Field>
                    </Col>

                    <Col xs={24} sm={12}>
                        <form.Field name="complementoDocumento">
                            {(field) => (
                                <Form.Item label="Complemento">
                                    <Input
                                        placeholder="Opcional"
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
                        <form.Field name="nombres">
                            {(field) => {
                                const error = getFieldError(field.state.meta.errors)

                                return (
                                    <Form.Item
                                        label="Nombres"
                                        validateStatus={error ? 'error' : undefined}
                                        help={error || undefined}
                                    >
                                        <Input
                                            placeholder="Nombres"
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
                        <form.Field name="apellidoPaterno">
                            {(field) => {
                                const error = getFieldError(field.state.meta.errors)

                                return (
                                    <Form.Item
                                        label="Apellido paterno"
                                        validateStatus={error ? 'error' : undefined}
                                        help={error || undefined}
                                    >
                                        <Input
                                            placeholder="Apellido paterno"
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
                        <form.Field name="apellidoMaterno">
                            {(field) => (
                                <Form.Item label="Apellido materno">
                                    <Input
                                        placeholder="Opcional"
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
                        <form.Field name="fechaNacimiento">
                            {(field) => {
                                const error = getFieldError(field.state.meta.errors)

                                return (
                                    <Form.Item
                                        label="Fecha de nacimiento"
                                        validateStatus={error ? 'error' : undefined}
                                        help={error || undefined}
                                    >
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
                                )
                            }}
                        </form.Field>
                    </Col>

                    <Col xs={24} sm={12}>
                        <form.Field name="sexoId">
                            {(field) => {
                                const error = getFieldError(field.state.meta.errors)

                                return (
                                    <Form.Item
                                        label="Sexo"
                                        validateStatus={error ? 'error' : undefined}
                                        help={error || undefined}
                                    >
                                        <Select
                                            showSearch
                                            optionFilterProp="label"
                                            placeholder="Seleccionar sexo"
                                            options={sexoOptions}
                                            value={field.state.value || undefined}
                                            onChange={(value) => field.handleChange(value)}
                                            onBlur={field.handleBlur}
                                            disabled={loading || loadingCatalogos}
                                        />
                                    </Form.Item>
                                )
                            }}
                        </form.Field>
                    </Col>

                    <Col xs={24} sm={12}>
                        <form.Field name="estadoCivilId">
                            {(field) => {
                                const error = getFieldError(field.state.meta.errors)

                                return (
                                    <Form.Item
                                        label="Estado civil"
                                        validateStatus={error ? 'error' : undefined}
                                        help={error || undefined}
                                    >
                                        <Select
                                            showSearch
                                            optionFilterProp="label"
                                            placeholder="Seleccionar estado civil"
                                            options={estadoCivilOptions}
                                            value={field.state.value || undefined}
                                            onChange={(value) => field.handleChange(value)}
                                            onBlur={field.handleBlur}
                                            disabled={loading || loadingCatalogos}
                                        />
                                    </Form.Item>
                                )
                            }}
                        </form.Field>
                    </Col>

                    <Col xs={24} sm={12}>
                        <form.Field name="telefono">
                            {(field) => {
                                const error = getFieldError(field.state.meta.errors)

                                return (
                                    <Form.Item
                                        label="Teléfono"
                                        validateStatus={error ? 'error' : undefined}
                                        help={error || undefined}
                                    >
                                        <Input
                                            placeholder="70000000"
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

                    <Col xs={24}>
                        <form.Field name="direccion">
                            {(field) => {
                                const error = getFieldError(field.state.meta.errors)

                                return (
                                    <Form.Item
                                        label="Dirección"
                                        validateStatus={error ? 'error' : undefined}
                                        help={error || undefined}
                                    >
                                        <Input.TextArea
                                            rows={2}
                                            placeholder="Dirección de domicilio"
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
                </Row>
            </Form>
        </Modal>
    )
}
