import { useMemo } from 'react'
import { Col, DatePicker, Form, Input, Row, Select, Typography } from 'antd'
import dayjs from 'dayjs'

import { getFieldError } from '../../../shared/utils/form-errors'
import { useCatalogoGruposGrouped } from '../../parametros/catalogos/hooks/catalogo-grupos.hooks'
import {
    isPersonaRequiredField,
    personaFieldValidators,
    type PersonaFormInput,
} from '../schemas/persona.schema'

const { Text } = Typography

const DATE_VALUE_FORMAT = 'YYYY-MM-DD'
const DATE_DISPLAY_FORMAT = 'DD/MM/YYYY'

type PersonaFormFieldsProps = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    form: any
    loading?: boolean
    fieldPrefix?: string
    variant?: 'default' | 'sections'
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

function fieldName(prefix: string | undefined, name: keyof PersonaFormInput) {
    return prefix ? `${prefix}.${name}` : name
}

function SectionTitle({
    children,
    spaced = false,
}: {
    children: React.ReactNode
    spaced?: boolean
}) {
    return (
        <Col span={24}>
            <div
                className={[
                    'usuario-drawer__section-title-wrap',
                    spaced ? 'usuario-drawer__section-title-wrap--spaced' : '',
                ]
                    .filter(Boolean)
                    .join(' ')}
            >
                <Text className="usuario-drawer__section-title">{children}</Text>
            </div>
        </Col>
    )
}

type FieldRenderProps = {
    state: { value: string; meta: { errors: unknown[] } }
    handleChange: (value: string) => void
    handleBlur: () => void
}

type PersonaFieldProps = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    form: any
    fieldPrefix?: string
    name: keyof PersonaFormInput
    label: string
    children: (field: FieldRenderProps, error: string) => React.ReactNode
}

function PersonaField({ form, fieldPrefix, name, label, children }: PersonaFieldProps) {
    const required = isPersonaRequiredField(name)

    return (
        <form.Field name={fieldName(fieldPrefix, name)} validators={personaFieldValidators(name)}>
            {(field: FieldRenderProps) => {
                const error = getFieldError(field.state.meta.errors)

                return (
                    <Form.Item
                        label={label}
                        required={required}
                        validateStatus={error ? 'error' : undefined}
                        help={error || undefined}
                    >
                        {children(field, error)}
                    </Form.Item>
                )
            }}
        </form.Field>
    )
}

export function PersonaFormFields({
    form,
    loading = false,
    fieldPrefix,
    variant = 'default',
}: PersonaFormFieldsProps) {
    const { data: catalogos, isPending: loadingCatalogos } = useCatalogoGruposGrouped()

    const tipoDocumentoOptions = useMemo(
        () => getCatalogoOptions(catalogos, 'TIPO_DOCUMENTO'),
        [catalogos],
    )
    const extensionDocumentoOptions = useMemo(
        () => getCatalogoOptions(catalogos, 'EXTENSION_DOCUMENTO'),
        [catalogos],
    )
    const sexoOptions = useMemo(() => getCatalogoOptions(catalogos, 'SEXO'), [catalogos])
    const estadoCivilOptions = useMemo(
        () => getCatalogoOptions(catalogos, 'ESTADO_CIVIL'),
        [catalogos],
    )

    const disabled = loading || loadingCatalogos
    const showSections = variant === 'sections'
    const gutter: [number, number] = showSections ? [10, 0] : [12, 0]
    const colProps = showSections ? { xs: 24, sm: 12 } : { xs: 24, sm: 12 }

    return (
        <Row gutter={gutter}>
            {showSections ? <SectionTitle>Documento</SectionTitle> : null}

            <Col {...colProps}>
                <PersonaField
                    form={form}
                    fieldPrefix={fieldPrefix}
                    name="tipoDocumentoId"
                    label="Tipo de documento"
                >
                    {(field) => (
                        <Select
                            showSearch
                            optionFilterProp="label"
                            placeholder="Seleccionar tipo"
                            options={tipoDocumentoOptions}
                            value={field.state.value || undefined}
                            onChange={(value) => field.handleChange(value)}
                            onBlur={field.handleBlur}
                            disabled={disabled}
                            loading={loadingCatalogos}
                        />
                    )}
                </PersonaField>
            </Col>

            <Col {...colProps}>
                <PersonaField
                    form={form}
                    fieldPrefix={fieldPrefix}
                    name="numeroDocumento"
                    label="Número de documento"
                >
                    {(field) => (
                        <Input
                            placeholder="12345678"
                            value={field.state.value}
                            onChange={(event) => field.handleChange(event.target.value)}
                            onBlur={field.handleBlur}
                            disabled={loading}
                        />
                    )}
                </PersonaField>
            </Col>

            <Col {...colProps}>
                <PersonaField
                    form={form}
                    fieldPrefix={fieldPrefix}
                    name="extensionDocumentoId"
                    label="Extensión"
                >
                    {(field) => (
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
                            loading={loadingCatalogos}
                        />
                    )}
                </PersonaField>
            </Col>

            <Col {...colProps}>
                <PersonaField
                    form={form}
                    fieldPrefix={fieldPrefix}
                    name="complementoDocumento"
                    label="Complemento"
                >
                    {(field) => (
                        <Input
                            placeholder="Opcional"
                            value={field.state.value}
                            onChange={(event) => field.handleChange(event.target.value)}
                            onBlur={field.handleBlur}
                            disabled={loading}
                            maxLength={10}
                        />
                    )}
                </PersonaField>
            </Col>

            {showSections ? <SectionTitle spaced>Datos personales</SectionTitle> : null}

            <Col {...colProps}>
                <PersonaField
                    form={form}
                    fieldPrefix={fieldPrefix}
                    name="nombres"
                    label="Nombres"
                >
                    {(field) => (
                        <Input
                            placeholder="Nombres"
                            value={field.state.value}
                            onChange={(event) => field.handleChange(event.target.value)}
                            onBlur={field.handleBlur}
                            disabled={loading}
                        />
                    )}
                </PersonaField>
            </Col>

            <Col {...colProps}>
                <PersonaField
                    form={form}
                    fieldPrefix={fieldPrefix}
                    name="apellidoPaterno"
                    label="Apellido paterno"
                >
                    {(field) => (
                        <Input
                            placeholder="Apellido paterno"
                            value={field.state.value}
                            onChange={(event) => field.handleChange(event.target.value)}
                            onBlur={field.handleBlur}
                            disabled={loading}
                        />
                    )}
                </PersonaField>
            </Col>

            <Col {...colProps}>
                <PersonaField
                    form={form}
                    fieldPrefix={fieldPrefix}
                    name="apellidoMaterno"
                    label="Apellido materno"
                >
                    {(field) => (
                        <Input
                            placeholder="Opcional"
                            value={field.state.value}
                            onChange={(event) => field.handleChange(event.target.value)}
                            onBlur={field.handleBlur}
                            disabled={loading}
                        />
                    )}
                </PersonaField>
            </Col>

            <Col {...colProps}>
                <PersonaField
                    form={form}
                    fieldPrefix={fieldPrefix}
                    name="fechaNacimiento"
                    label="Fecha de nacimiento"
                >
                    {(field) => (
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
                            disabled={loading}
                        />
                    )}
                </PersonaField>
            </Col>

            <Col {...colProps}>
                <PersonaField
                    form={form}
                    fieldPrefix={fieldPrefix}
                    name="sexoId"
                    label="Sexo"
                >
                    {(field) => (
                        <Select
                            showSearch
                            optionFilterProp="label"
                            placeholder="Seleccionar sexo"
                            options={sexoOptions}
                            value={field.state.value || undefined}
                            onChange={(value) => field.handleChange(value)}
                            onBlur={field.handleBlur}
                            disabled={disabled}
                            loading={loadingCatalogos}
                        />
                    )}
                </PersonaField>
            </Col>

            <Col {...colProps}>
                <PersonaField
                    form={form}
                    fieldPrefix={fieldPrefix}
                    name="estadoCivilId"
                    label="Estado civil"
                >
                    {(field) => (
                        <Select
                            showSearch
                            optionFilterProp="label"
                            placeholder="Seleccionar estado civil"
                            options={estadoCivilOptions}
                            value={field.state.value || undefined}
                            onChange={(value) => field.handleChange(value)}
                            onBlur={field.handleBlur}
                            disabled={disabled}
                            loading={loadingCatalogos}
                        />
                    )}
                </PersonaField>
            </Col>

            {showSections ? <SectionTitle spaced>Contacto</SectionTitle> : null}

            <Col {...colProps}>
                <PersonaField
                    form={form}
                    fieldPrefix={fieldPrefix}
                    name="telefono"
                    label="Teléfono"
                >
                    {(field) => (
                        <Input
                            placeholder="70000000"
                            value={field.state.value}
                            onChange={(event) => field.handleChange(event.target.value)}
                            onBlur={field.handleBlur}
                            disabled={loading}
                        />
                    )}
                </PersonaField>
            </Col>

            <Col span={24}>
                <PersonaField
                    form={form}
                    fieldPrefix={fieldPrefix}
                    name="direccion"
                    label="Dirección"
                >
                    {(field) => (
                        <Input.TextArea
                            rows={1}
                            autoSize={{ minRows: 1, maxRows: 2 }}
                            className="usuario-drawer__textarea"
                            placeholder="Opcional"
                            value={field.state.value}
                            onChange={(event) => field.handleChange(event.target.value)}
                            onBlur={field.handleBlur}
                            disabled={loading}
                            maxLength={500}
                        />
                    )}
                </PersonaField>
            </Col>
        </Row>
    )
}
