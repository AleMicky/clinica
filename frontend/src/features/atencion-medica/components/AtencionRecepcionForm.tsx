import { forwardRef, useImperativeHandle, useMemo, useState } from 'react'
import { useForm, useStore } from '@tanstack/react-form'
import {
    Button,
    Flex,
    Form,
    Input,
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

import { useCatalogoGruposGrouped } from '../../parametros/catalogos/hooks/catalogo-grupos.hooks'
import { PersonaFormFields } from '../../personas/components/PersonaFormFields'
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
    const { data: catalogos } = useCatalogoGruposGrouped()

    const form = useForm({
        defaultValues: recepcionDefaultValues,
        // Cast: Zod input (optional defaults) no coincide 1:1 con los valores del form.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        validators: { onSubmit: recepcionFormSchema as any },
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

        const esDocumento = /^\d+$/.test(searchTerm.trim())

        form.setFieldValue('pacienteId', '')
        form.setFieldValue('pacienteNuevo', {
            ...recepcionDefaultValues.pacienteNuevo!,
            tipoDocumentoId,
            estadoCivilId,
            numeroDocumento: esDocumento ? searchTerm.trim() : '',
            nombres: esDocumento ? '' : searchTerm.trim(),
        })
        form.setFieldValue('modoPaciente', 'nuevo')
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

    return (
        <Form layout="vertical" requiredMark={false} className="atencion-recepcion-form">
            <div className="atencion-recepcion-form__section">
                <div className="atencion-recepcion-form__section-head">
                    <span className="atencion-recepcion-form__step">1</span>
                    <div>
                        <p className="atencion-recepcion-form__section-title">Paciente</p>
                        <p className="atencion-recepcion-form__section-hint">
                            Busque al paciente para ver su ficha, o regístrelo si no
                            existe
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
                                    disabled={loading}
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
                                        Mismos datos que en Pacientes; se registra al
                                        pulsar Recepcionar
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

                        <PersonaFormFields
                            form={form}
                            loading={loading}
                            fieldPrefix="pacienteNuevo"
                            variant="sections"
                        />
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
                                    disabled={loading}
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
                                    disabled={loading}
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
                                disabled={loading}
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
                        disabled={loading}
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
