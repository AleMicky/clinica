import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from 'react'
import { useForm, useStore } from '@tanstack/react-form'
import {
    Button,
    Col,
    DatePicker,
    Flex,
    Form,
    Input,
    Row,
    Select,
    Space,
    Tag,
    Typography,
} from 'antd'
import {
    ClearOutlined,
    CheckCircleOutlined,
    CloseOutlined,
    FileTextOutlined,
    UserAddOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'

import { useCatalogoGruposGrouped } from '../../parametros/catalogos/hooks/catalogo-grupos.hooks'
import {
    useFormulariosClinicos,
    useTiposAtencion,
} from '../hooks/atencion-medica.hooks'
import {
    recepcionDefaultValues,
    recepcionFormSchema,
    type RecepcionFormValues,
} from '../schemas/atencion.schema'
import { PacienteSearchBox } from './PacienteSearchBox'

const { Text } = Typography
const DATE_VALUE_FORMAT = 'YYYY-MM-DD'
const DATE_DISPLAY_FORMAT = 'DD/MM/YYYY'

export type AtencionRecepcionFormHandle = {
    submit: () => void
    reset: () => void
}

type AtencionRecepcionFormProps = {
    loading: boolean
    onSubmit: (values: RecepcionFormValues) => Promise<void>
    submitLabel?: string
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

function pickDefaultCatalogId(
    items: { id: string; codigo: string; nombre: string }[] | undefined,
    preferredCodes: string[],
) {
    if (!items?.length) return ''
    const preferred = items.find((item) =>
        preferredCodes.some((code) => item.codigo.toUpperCase().includes(code)),
    )
    return preferred?.id ?? items[0]?.id ?? ''
}

export const AtencionRecepcionForm = forwardRef<
    AtencionRecepcionFormHandle,
    AtencionRecepcionFormProps
>(function AtencionRecepcionForm(
    { loading, onSubmit, submitLabel = 'Recepcionar' },
    ref,
) {
    const [tipoAtencionId, setTipoAtencionId] = useState('')
    const [formKey, setFormKey] = useState(0)

    const { data: tiposData, isFetching: loadingTipos } = useTiposAtencion()
    const { data: catalogos, isPending: loadingCatalogos } = useCatalogoGruposGrouped()

    const form = useForm({
        defaultValues: recepcionDefaultValues,
        validators: { onSubmit: recepcionFormSchema },
        onSubmit: async ({ value }) => {
            await onSubmit(value)
            resetForm()
        },
    })

    const modoPaciente = useStore(form.store, (state) => state.values.modoPaciente)
    const tipoAtencionIdForQuery = tipoAtencionId || undefined

    const { data: formulariosData, isFetching: loadingFormularios } =
        useFormulariosClinicos({
            page: 1,
            pageSize: 100,
            tipoAtencionId: tipoAtencionIdForQuery,
        })

    const formularioActivo = useMemo(() => {
        const activos = (formulariosData?.items ?? []).filter((item) => item.activo)
        if (activos.length === 0) return null
        return [...activos].sort((a, b) => b.version - a.version)[0] ?? null
    }, [formulariosData?.items])

    const tipoDocumentoOptions =
        catalogos
            ?.find((grupo) => grupo.codigo === 'TIPO_DOCUMENTO')
            ?.items.map((item) => ({ label: item.nombre, value: item.id })) ?? []

    const sexoOptions =
        catalogos
            ?.find((grupo) => grupo.codigo === 'SEXO')
            ?.items.map((item) => ({ label: item.nombre, value: item.id })) ?? []

    const resetForm = () => {
        form.reset(recepcionDefaultValues)
        setTipoAtencionId('')
        setFormKey((key) => key + 1)
    }

    useImperativeHandle(ref, () => ({
        submit: () => void form.handleSubmit(),
        reset: resetForm,
    }))

    const iniciarRegistro = (searchTerm: string) => {
        const tipoDocumentoId = pickDefaultCatalogId(
            catalogos?.find((grupo) => grupo.codigo === 'TIPO_DOCUMENTO')?.items,
            ['CI', 'CEDULA', 'DNI'],
        )
        const estadoCivilId = pickDefaultCatalogId(
            catalogos?.find((grupo) => grupo.codigo === 'ESTADO_CIVIL')?.items,
            ['SOLTER', 'SOLTERO'],
        )

        form.setFieldValue('modoPaciente', 'nuevo')
        form.setFieldValue('pacienteId', '')
        form.setFieldValue('pacienteNuevo', {
            ...recepcionDefaultValues.pacienteNuevo!,
            tipoDocumentoId,
            estadoCivilId,
            numeroDocumento: /^\d+$/.test(searchTerm) ? searchTerm : '',
            nombres: /^\d+$/.test(searchTerm) ? '' : searchTerm,
        })
    }

    const volverABuscar = () => {
        form.setFieldValue('modoPaciente', 'existente')
        form.setFieldValue('pacienteId', '')
        form.setFieldValue('pacienteNuevo', recepcionDefaultValues.pacienteNuevo)
        setFormKey((key) => key + 1)
    }

    const tipoOptions =
        tiposData?.items.map((tipo) => ({
            value: tipo.id,
            label: `${tipo.codigo} — ${tipo.nombre}`,
        })) ?? []

    const formDisabled = loading || loadingTipos || loadingCatalogos
    const busy = formDisabled

    return (
        <Form layout="vertical" requiredMark={false} className="atencion-recepcion-form">
            <div className="atencion-recepcion-form__section">
                <div className="atencion-recepcion-form__section-head">
                    <span className="atencion-recepcion-form__step">1</span>
                    <div>
                        <p className="atencion-recepcion-form__section-title">Paciente</p>
                        <p className="atencion-recepcion-form__section-hint">
                            Busque al paciente o complete sus datos; se registra al
                            recepcionar
                        </p>
                    </div>
                </div>

                {modoPaciente === 'existente' ? (
                    <form.Field key={`paciente-${formKey}`} name="pacienteId">
                        {(field) => {
                            const error = getFieldError(field.state.meta.errors)

                            return (
                                <PacienteSearchBox
                                    value={field.state.value || undefined}
                                    error={error || undefined}
                                    disabled={formDisabled}
                                    label={null}
                                    onBlur={field.handleBlur}
                                    onChange={(paciente) => {
                                        field.handleChange(paciente?.id ?? '')
                                    }}
                                    onRegistrar={iniciarRegistro}
                                />
                            )
                        }}
                    </form.Field>
                ) : (
                    <div className="paciente-search-box__inline">
                        <div className="paciente-search-box__inline-head">
                            <div className="paciente-search-box__inline-title">
                                <UserAddOutlined />
                                <div>
                                    <p className="paciente-search-box__inline-heading">
                                        Datos del paciente nuevo
                                    </p>
                                    <p className="paciente-search-box__inline-hint">
                                        No se guarda todavía: se registra al pulsar
                                        Recepcionar
                                    </p>
                                </div>
                            </div>
                            <Button
                                type="text"
                                icon={<CloseOutlined />}
                                onClick={volverABuscar}
                                disabled={loading}
                            >
                                Buscar
                            </Button>
                        </div>

                        <Row gutter={[12, 0]}>
                            <Col xs={24} sm={10}>
                                <form.Field name="pacienteNuevo.tipoDocumentoId">
                                    {(field) => {
                                        const error = getFieldError(field.state.meta.errors)
                                        return (
                                            <Form.Item
                                                label="Documento"
                                                required
                                                validateStatus={error ? 'error' : undefined}
                                                help={error || undefined}
                                            >
                                                <Select
                                                    showSearch
                                                    optionFilterProp="label"
                                                    options={tipoDocumentoOptions}
                                                    value={field.state.value || undefined}
                                                    onChange={field.handleChange}
                                                    onBlur={field.handleBlur}
                                                    disabled={busy}
                                                />
                                            </Form.Item>
                                        )
                                    }}
                                </form.Field>
                            </Col>
                            <Col xs={24} sm={14}>
                                <form.Field name="pacienteNuevo.numeroDocumento">
                                    {(field) => {
                                        const error = getFieldError(field.state.meta.errors)
                                        return (
                                            <Form.Item
                                                label="Número"
                                                required
                                                validateStatus={error ? 'error' : undefined}
                                                help={error || undefined}
                                            >
                                                <Input
                                                    value={field.state.value}
                                                    onChange={(event) =>
                                                        field.handleChange(event.target.value)
                                                    }
                                                    onBlur={field.handleBlur}
                                                    disabled={busy}
                                                />
                                            </Form.Item>
                                        )
                                    }}
                                </form.Field>
                            </Col>
                            <Col xs={24} sm={12}>
                                <form.Field name="pacienteNuevo.nombres">
                                    {(field) => {
                                        const error = getFieldError(field.state.meta.errors)
                                        return (
                                            <Form.Item
                                                label="Nombres"
                                                required
                                                validateStatus={error ? 'error' : undefined}
                                                help={error || undefined}
                                            >
                                                <Input
                                                    value={field.state.value}
                                                    onChange={(event) =>
                                                        field.handleChange(event.target.value)
                                                    }
                                                    onBlur={field.handleBlur}
                                                    disabled={busy}
                                                />
                                            </Form.Item>
                                        )
                                    }}
                                </form.Field>
                            </Col>
                            <Col xs={24} sm={12}>
                                <form.Field name="pacienteNuevo.apellidoPaterno">
                                    {(field) => {
                                        const error = getFieldError(field.state.meta.errors)
                                        return (
                                            <Form.Item
                                                label="Apellido paterno"
                                                required
                                                validateStatus={error ? 'error' : undefined}
                                                help={error || undefined}
                                            >
                                                <Input
                                                    value={field.state.value}
                                                    onChange={(event) =>
                                                        field.handleChange(event.target.value)
                                                    }
                                                    onBlur={field.handleBlur}
                                                    disabled={busy}
                                                />
                                            </Form.Item>
                                        )
                                    }}
                                </form.Field>
                            </Col>
                            <Col xs={24} sm={12}>
                                <form.Field name="pacienteNuevo.apellidoMaterno">
                                    {(field) => (
                                        <Form.Item label="Apellido materno">
                                            <Input
                                                placeholder="Opcional"
                                                value={field.state.value}
                                                onChange={(event) =>
                                                    field.handleChange(event.target.value)
                                                }
                                                onBlur={field.handleBlur}
                                                disabled={busy}
                                            />
                                        </Form.Item>
                                    )}
                                </form.Field>
                            </Col>
                            <Col xs={24} sm={12}>
                                <form.Field name="pacienteNuevo.fechaNacimiento">
                                    {(field) => {
                                        const error = getFieldError(field.state.meta.errors)
                                        return (
                                            <Form.Item
                                                label="Nacimiento"
                                                required
                                                validateStatus={error ? 'error' : undefined}
                                                help={error || undefined}
                                            >
                                                <DatePicker
                                                    style={{ width: '100%' }}
                                                    format={DATE_DISPLAY_FORMAT}
                                                    value={
                                                        field.state.value
                                                            ? dayjs(
                                                                  field.state.value,
                                                                  DATE_VALUE_FORMAT,
                                                              )
                                                            : null
                                                    }
                                                    onChange={(date) =>
                                                        field.handleChange(
                                                            date
                                                                ? date.format(DATE_VALUE_FORMAT)
                                                                : '',
                                                        )
                                                    }
                                                    onBlur={field.handleBlur}
                                                    disabled={busy}
                                                />
                                            </Form.Item>
                                        )
                                    }}
                                </form.Field>
                            </Col>
                            <Col xs={24} sm={12}>
                                <form.Field name="pacienteNuevo.sexoId">
                                    {(field) => {
                                        const error = getFieldError(field.state.meta.errors)
                                        return (
                                            <Form.Item
                                                label="Sexo"
                                                required
                                                validateStatus={error ? 'error' : undefined}
                                                help={error || undefined}
                                            >
                                                <Select
                                                    options={sexoOptions}
                                                    value={field.state.value || undefined}
                                                    onChange={field.handleChange}
                                                    onBlur={field.handleBlur}
                                                    disabled={busy}
                                                />
                                            </Form.Item>
                                        )
                                    }}
                                </form.Field>
                            </Col>
                            <Col xs={24} sm={12}>
                                <form.Field name="pacienteNuevo.telefono">
                                    {(field) => {
                                        const error = getFieldError(field.state.meta.errors)
                                        return (
                                            <Form.Item
                                                label="Teléfono"
                                                required
                                                validateStatus={error ? 'error' : undefined}
                                                help={error || undefined}
                                            >
                                                <Input
                                                    value={field.state.value}
                                                    onChange={(event) =>
                                                        field.handleChange(event.target.value)
                                                    }
                                                    onBlur={field.handleBlur}
                                                    disabled={busy}
                                                />
                                            </Form.Item>
                                        )
                                    }}
                                </form.Field>
                            </Col>
                        </Row>
                    </div>
                )}
            </div>

            <div className="atencion-recepcion-form__section">
                <div className="atencion-recepcion-form__section-head">
                    <span className="atencion-recepcion-form__step">2</span>
                    <div>
                        <p className="atencion-recepcion-form__section-title">
                            Tipo de atención
                        </p>
                        <p className="atencion-recepcion-form__section-hint">
                            El formulario clínico activo se asigna automáticamente
                        </p>
                    </div>
                </div>

                <form.Field name="tipoAtencionId">
                    {(field) => {
                        const error = getFieldError(field.state.meta.errors)

                        return (
                            <Form.Item
                                label="Tipo de atención"
                                validateStatus={error ? 'error' : undefined}
                                help={error || undefined}
                            >
                                <Select
                                    showSearch
                                    size="large"
                                    placeholder="Seleccione el tipo"
                                    optionFilterProp="label"
                                    options={tipoOptions}
                                    value={field.state.value || undefined}
                                    onChange={(value) => {
                                        field.handleChange(value)
                                        setTipoAtencionId(value)
                                    }}
                                    onBlur={field.handleBlur}
                                    disabled={formDisabled}
                                    loading={loadingTipos}
                                />
                            </Form.Item>
                        )
                    }}
                </form.Field>

                {tipoAtencionIdForQuery ? (
                    <div
                        className={[
                            'atencion-recepcion-form__formulario-activo',
                            !loadingFormularios && !formularioActivo
                                ? 'atencion-recepcion-form__formulario-activo--empty'
                                : '',
                        ]
                            .filter(Boolean)
                            .join(' ')}
                    >
                        {loadingFormularios ? (
                            <Text type="secondary">Cargando formulario activo…</Text>
                        ) : formularioActivo ? (
                            <>
                                <FileTextOutlined />
                                <div>
                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                        Formulario clínico
                                    </Text>
                                    <div className="atencion-recepcion-form__formulario-activo-row">
                                        <Text strong>{formularioActivo.nombre}</Text>
                                        <Tag color="success">Activo</Tag>
                                        <Tag>
                                            {formularioActivo.codigo} · v
                                            {formularioActivo.version}
                                        </Tag>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <Text type="danger">
                                No hay un formulario clínico activo para este tipo.
                            </Text>
                        )}
                    </div>
                ) : null}
            </div>

            <div className="atencion-recepcion-form__section">
                <div className="atencion-recepcion-form__section-head">
                    <span className="atencion-recepcion-form__step">3</span>
                    <div>
                        <p className="atencion-recepcion-form__section-title">Detalle</p>
                        <p className="atencion-recepcion-form__section-hint">
                            Fecha y observaciones (opcional)
                        </p>
                    </div>
                </div>

                <form.Field name="fechaAtencion">
                    {(field) => {
                        const error = getFieldError(field.state.meta.errors)

                        return (
                            <Form.Item
                                label="Fecha de atención"
                                validateStatus={error ? 'error' : undefined}
                                help={error || undefined}
                            >
                                <Input
                                    type="datetime-local"
                                    size="large"
                                    value={field.state.value}
                                    onChange={(event) =>
                                        field.handleChange(event.target.value)
                                    }
                                    onBlur={field.handleBlur}
                                    disabled={formDisabled}
                                />
                            </Form.Item>
                        )
                    }}
                </form.Field>

                <form.Field name="observaciones">
                    {(field) => (
                        <Form.Item label="Observaciones">
                            <Input.TextArea
                                rows={2}
                                placeholder="Opcional"
                                value={field.state.value}
                                onChange={(event) => field.handleChange(event.target.value)}
                                onBlur={field.handleBlur}
                                disabled={formDisabled}
                            />
                        </Form.Item>
                    )}
                </form.Field>
            </div>

            <Flex
                justify="flex-end"
                gap={12}
                wrap="wrap"
                className="atencion-recepcion-form__actions"
            >
                <Space wrap>
                    <Button
                        icon={<ClearOutlined />}
                        onClick={resetForm}
                        disabled={formDisabled}
                    >
                        Limpiar
                    </Button>
                    <Button
                        type="primary"
                        size="large"
                        icon={<CheckCircleOutlined />}
                        loading={loading}
                        disabled={!formularioActivo && Boolean(tipoAtencionIdForQuery)}
                        onClick={() => void form.handleSubmit()}
                    >
                        {submitLabel}
                    </Button>
                </Space>
            </Flex>
        </Form>
    )
})
