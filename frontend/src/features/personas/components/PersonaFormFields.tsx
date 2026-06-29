import { Col, Form, Input, Row, Select, Typography } from 'antd'

import { useCatalogoGruposGrouped } from '../../parametros/catalogos/hooks/catalogo-grupos.hooks'

const { Text } = Typography

type PersonaFormFieldsProps = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    form: any
    loading?: boolean
    fieldPrefix?: string
    variant?: 'default' | 'sections'
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

function SectionTitle({ children }: { children: React.ReactNode }) {
    return (
        <Col span={24}>
            <Text className="usuario-drawer__section-title">{children}</Text>
        </Col>
    )
}

export function PersonaFormFields({
    form,
    loading = false,
    fieldPrefix,
    variant = 'default',
}: PersonaFormFieldsProps) {
    const { data: catalogos, isFetching: loadingCatalogos } = useCatalogoGruposGrouped()

    const tipoDocumentoOptions = getCatalogoOptions(catalogos, 'TIPO_DOCUMENTO')
    const extensionDocumentoOptions = getCatalogoOptions(catalogos, 'EXTENSION_DOCUMENTO')
    const sexoOptions = getCatalogoOptions(catalogos, 'SEXO')
    const estadoCivilOptions = getCatalogoOptions(catalogos, 'ESTADO_CIVIL')

    const disabled = loading || loadingCatalogos
    const showSections = variant === 'sections'
    const gutter: [number, number] = showSections ? [12, 0] : [12, 0]
    const colProps = showSections ? { xs: 24, sm: 12 } : { xs: 24, sm: 12 }

    return (
        <Row gutter={gutter}>
            {showSections ? <SectionTitle>Documento</SectionTitle> : null}

            <Col {...colProps}>
                <form.Field name={fieldName(fieldPrefix, 'tipoDocumentoId')}>
                    {(field: { state: { value: string; meta: { errors: unknown[] } }; handleChange: (v: string) => void; handleBlur: () => void }) => {
                        const error = getFieldError(field.state.meta.errors)

                        return (
                            <Form.Item
                                label="Tipo de documento"
                                required
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

            <Col {...colProps}>
                <form.Field name={fieldName(fieldPrefix, 'numeroDocumento')}>
                    {(field: { state: { value: string; meta: { errors: unknown[] } }; handleChange: (v: string) => void; handleBlur: () => void }) => {
                        const error = getFieldError(field.state.meta.errors)

                        return (
                            <Form.Item
                                label="Número de documento"
                                required
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

            <Col {...colProps}>
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

            <Col {...colProps}>
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

            {showSections ? <SectionTitle>Datos personales</SectionTitle> : null}

            <Col {...colProps}>
                <form.Field name={fieldName(fieldPrefix, 'nombres')}>
                    {(field: { state: { value: string; meta: { errors: unknown[] } }; handleChange: (v: string) => void; handleBlur: () => void }) => {
                        const error = getFieldError(field.state.meta.errors)

                        return (
                            <Form.Item
                                label="Nombres"
                                required
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

            <Col {...colProps}>
                <form.Field name={fieldName(fieldPrefix, 'apellidoPaterno')}>
                    {(field: { state: { value: string; meta: { errors: unknown[] } }; handleChange: (v: string) => void; handleBlur: () => void }) => {
                        const error = getFieldError(field.state.meta.errors)

                        return (
                            <Form.Item
                                label="Apellido paterno"
                                required
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

            <Col {...colProps}>
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

            <Col {...colProps}>
                <form.Field name={fieldName(fieldPrefix, 'fechaNacimiento')}>
                    {(field: { state: { value: string; meta: { errors: unknown[] } }; handleChange: (v: string) => void; handleBlur: () => void }) => {
                        const error = getFieldError(field.state.meta.errors)

                        return (
                            <Form.Item
                                label="Fecha de nacimiento"
                                required
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

            <Col {...colProps}>
                <form.Field name={fieldName(fieldPrefix, 'sexoId')}>
                    {(field: { state: { value: string; meta: { errors: unknown[] } }; handleChange: (v: string) => void; handleBlur: () => void }) => {
                        const error = getFieldError(field.state.meta.errors)

                        return (
                            <Form.Item
                                label="Sexo"
                                required
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

            <Col {...colProps}>
                <form.Field name={fieldName(fieldPrefix, 'estadoCivilId')}>
                    {(field: { state: { value: string; meta: { errors: unknown[] } }; handleChange: (v: string) => void; handleBlur: () => void }) => {
                        const error = getFieldError(field.state.meta.errors)

                        return (
                            <Form.Item
                                label="Estado civil"
                                required
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

            {showSections ? <SectionTitle>Contacto</SectionTitle> : null}

            <Col {...colProps}>
                <form.Field name={fieldName(fieldPrefix, 'telefono')}>
                    {(field: { state: { value: string; meta: { errors: unknown[] } }; handleChange: (v: string) => void; handleBlur: () => void }) => {
                        const error = getFieldError(field.state.meta.errors)

                        return (
                            <Form.Item
                                label="Teléfono"
                                required
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

            <Col span={24}>
                <form.Field name={fieldName(fieldPrefix, 'direccion')}>
                    {(field: { state: { value: string; meta: { errors: unknown[] } }; handleChange: (v: string) => void; handleBlur: () => void }) => {
                        const error = getFieldError(field.state.meta.errors)

                        return (
                            <Form.Item
                                label="Dirección"
                                required
                                validateStatus={error ? 'error' : undefined}
                                help={error || undefined}
                            >
                                <Input.TextArea
                                    rows={showSections ? 2 : 2}
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
