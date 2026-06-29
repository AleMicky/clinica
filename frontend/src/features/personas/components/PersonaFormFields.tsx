import { Col, Form, Input, Row, Select } from 'antd'

import { useCatalogoGruposGrouped } from '../../parametros/catalogos/hooks/catalogo-grupos.hooks'

type PersonaFormFieldsProps = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    form: any
    loading?: boolean
    fieldPrefix?: string
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

function fieldName(prefix: string | undefined, name: string) {
    return prefix ? `${prefix}.${name}` : name
}

export function PersonaFormFields({
    form,
    loading = false,
    fieldPrefix,
}: PersonaFormFieldsProps) {
    const { data: catalogos, isFetching: loadingCatalogos } = useCatalogoGruposGrouped()

    const tipoDocumentoOptions = getCatalogoOptions(catalogos, 'TIPO_DOCUMENTO')
    const extensionDocumentoOptions = getCatalogoOptions(catalogos, 'EXTENSION_DOCUMENTO')
    const sexoOptions = getCatalogoOptions(catalogos, 'SEXO')
    const estadoCivilOptions = getCatalogoOptions(catalogos, 'ESTADO_CIVIL')

    const disabled = loading || loadingCatalogos

    return (
        <Row gutter={12}>
            <Col xs={24} sm={12}>
                <form.Field name={fieldName(fieldPrefix, 'tipoDocumentoId')}>
                    {(field: { state: { value: string; meta: { errors: unknown[] } }; handleChange: (v: string) => void; handleBlur: () => void }) => {
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
                                    disabled={disabled}
                                />
                            </Form.Item>
                        )
                    }}
                </form.Field>
            </Col>

            <Col xs={24} sm={12}>
                <form.Field name={fieldName(fieldPrefix, 'numeroDocumento')}>
                    {(field: { state: { value: string; meta: { errors: unknown[] } }; handleChange: (v: string) => void; handleBlur: () => void }) => {
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
                <form.Field name={fieldName(fieldPrefix, 'extensionDocumentoId')}>
                    {(field: { state: { value: string }; handleChange: (v: string) => void; handleBlur: () => void }) => (
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
                                disabled={disabled}
                            />
                        </Form.Item>
                    )}
                </form.Field>
            </Col>

            <Col xs={24} sm={12}>
                <form.Field name={fieldName(fieldPrefix, 'complementoDocumento')}>
                    {(field: { state: { value: string }; handleChange: (v: string) => void; handleBlur: () => void }) => (
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
                <form.Field name={fieldName(fieldPrefix, 'nombres')}>
                    {(field: { state: { value: string; meta: { errors: unknown[] } }; handleChange: (v: string) => void; handleBlur: () => void }) => {
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
                <form.Field name={fieldName(fieldPrefix, 'apellidoPaterno')}>
                    {(field: { state: { value: string; meta: { errors: unknown[] } }; handleChange: (v: string) => void; handleBlur: () => void }) => {
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
                <form.Field name={fieldName(fieldPrefix, 'apellidoMaterno')}>
                    {(field: { state: { value: string }; handleChange: (v: string) => void; handleBlur: () => void }) => (
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
                <form.Field name={fieldName(fieldPrefix, 'fechaNacimiento')}>
                    {(field: { state: { value: string; meta: { errors: unknown[] } }; handleChange: (v: string) => void; handleBlur: () => void }) => {
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
                <form.Field name={fieldName(fieldPrefix, 'sexoId')}>
                    {(field: { state: { value: string; meta: { errors: unknown[] } }; handleChange: (v: string) => void; handleBlur: () => void }) => {
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
                                    disabled={disabled}
                                />
                            </Form.Item>
                        )
                    }}
                </form.Field>
            </Col>

            <Col xs={24} sm={12}>
                <form.Field name={fieldName(fieldPrefix, 'estadoCivilId')}>
                    {(field: { state: { value: string; meta: { errors: unknown[] } }; handleChange: (v: string) => void; handleBlur: () => void }) => {
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
                                    disabled={disabled}
                                />
                            </Form.Item>
                        )
                    }}
                </form.Field>
            </Col>

            <Col xs={24} sm={12}>
                <form.Field name={fieldName(fieldPrefix, 'telefono')}>
                    {(field: { state: { value: string; meta: { errors: unknown[] } }; handleChange: (v: string) => void; handleBlur: () => void }) => {
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
                <form.Field name={fieldName(fieldPrefix, 'direccion')}>
                    {(field: { state: { value: string; meta: { errors: unknown[] } }; handleChange: (v: string) => void; handleBlur: () => void }) => {
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
    )
}
