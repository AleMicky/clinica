import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from 'react'
import { useForm, useStore } from '@tanstack/react-form'
import {
    Button,
    Flex,
    Form,
    Input,
    Space,
    Tag,
    Typography,
} from 'antd'
import {
    ClearOutlined,
    CalendarOutlined,
    CheckCircleOutlined,
    CloseOutlined,
    FileTextOutlined,
    UserAddOutlined,
} from '@ant-design/icons'

import { useCatalogoGruposGrouped } from '../../parametros/catalogos/hooks/catalogo-grupos.hooks'
import { PersonaFormFields } from '../../personas/components/PersonaFormFields'
import {
    applyFieldErrors,
    collectFieldErrors,
} from '../../usuarios/utils/form-errors'
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
import { TipoAtencionCardSwitch } from './TipoAtencionCardSwitch'

const { Text } = Typography

function formatFechaAtencion(value: string) {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value

    return date.toLocaleString('es-BO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    })
}

function nowFechaAtencion() {
    const now = new Date()
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
}

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
    const [relojAhora, setRelojAhora] = useState(nowFechaAtencion)

    const { data: tiposData, isFetching: loadingTipos } = useTiposAtencion()
    const { data: catalogos } = useCatalogoGruposGrouped()

    const form = useForm({
        defaultValues: {
            ...recepcionDefaultValues,
            fechaAtencion: nowFechaAtencion(),
        },
    })

    const modoPaciente = useStore(form.store, (state) => state.values.modoPaciente)
    const formValues = useStore(form.store, (state) => state.values)
    const tipoAtencionIdForQuery = tipoAtencionId || undefined

    // Reloj solo en estado local: evita re-render/validación del form cada segundo.
    useEffect(() => {
        const timer = window.setInterval(() => {
            setRelojAhora(nowFechaAtencion())
        }, 1000)
        return () => window.clearInterval(timer)
    }, [])

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
        const ahora = nowFechaAtencion()
        form.reset({
            ...recepcionDefaultValues,
            fechaAtencion: ahora,
        })
        setRelojAhora(ahora)
        setTipoAtencionId('')
        setFormKey((key) => key + 1)
    }

    const handleSubmitClick = () => {
        const fechaAtencion = nowFechaAtencion()
        const result = recepcionFormSchema.safeParse({
            ...formValues,
            fechaAtencion,
        })

        if (!result.success) {
            applyFieldErrors(
                form,
                collectFieldErrors(
                    result.error.issues.map((issue) => ({
                        path: issue.path,
                        message: issue.message,
                    })),
                ),
            )
            return
        }

        void (async () => {
            try {
                await onSubmit({
                    ...(result.data as RecepcionFormValues),
                    fechaAtencion,
                })
                resetForm()
            } catch {
                // El error ya se notifica en el mutation hook.
            }
        })()
    }

    useImperativeHandle(ref, () => ({
        submit: handleSubmitClick,
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

        const term = searchTerm.trim()
        const esDocumento = /^\d+$/.test(term)

        form.setFieldValue('pacienteId', '')
        form.setFieldValue('pacienteNuevo', {
            ...recepcionDefaultValues.pacienteNuevo!,
            tipoDocumentoId,
            estadoCivilId,
            numeroDocumento: esDocumento ? term : '',
            nombres: esDocumento ? '' : term,
        })
        form.setFieldValue('modoPaciente', 'nuevo')
        setFormKey((key) => key + 1)
    }

    const volverABuscar = () => {
        form.setFieldValue('modoPaciente', 'existente')
        form.setFieldValue('pacienteId', '')
        form.setFieldValue('pacienteNuevo', recepcionDefaultValues.pacienteNuevo)
        setFormKey((key) => key + 1)
    }

    const tipos = tiposData?.items ?? []

    return (
        <Form
            layout="vertical"
            requiredMark
            size="middle"
            className="atencion-recepcion-form atencion-recepcion-form--compact"
        >
            <header className="atenciones-recepcion-view__hero atenciones-recepcion-view__hero--compact">
                <div className="atenciones-recepcion-view__hero-main">
                    <div className="atenciones-recepcion-view__hero-icon" aria-hidden>
                        <UserAddOutlined />
                    </div>
                    <div className="atenciones-recepcion-view__hero-text">
                        <p className="atenciones-recepcion-view__hero-title">
                            Nueva recepción
                        </p>
                        <Text
                            type="secondary"
                            className="atenciones-recepcion-view__hero-subtitle"
                        >
                            Paciente → tipo → recepcionar
                        </Text>
                    </div>
                </div>
                <div className="atenciones-recepcion-view__hero-fecha" aria-live="polite">
                    <CalendarOutlined />
                    <span>{formatFechaAtencion(relojAhora)}</span>
                </div>
            </header>

            <div className="atencion-recepcion-form__grid">
                <section className="atencion-recepcion-form__section">
                    <div className="atencion-recepcion-form__section-head">
                        <span className="atencion-recepcion-form__step">1</span>
                        <p className="atencion-recepcion-form__section-title">Paciente</p>
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
                        <div
                            key={`nuevo-${formKey}`}
                            className="paciente-search-box__inline paciente-search-box__inline--compact"
                        >
                            <div className="paciente-search-box__inline-head">
                                <div className="paciente-search-box__inline-title">
                                    <UserAddOutlined />
                                    <p className="paciente-search-box__inline-heading">
                                        Paciente nuevo
                                    </p>
                                </div>
                                <Button
                                    type="link"
                                    size="small"
                                    icon={<CloseOutlined />}
                                    onClick={volverABuscar}
                                    disabled={loading}
                                >
                                    Buscar otro
                                </Button>
                            </div>

                            <PersonaFormFields
                                form={form}
                                loading={loading}
                                fieldPrefix="pacienteNuevo"
                                variant="default"
                            />
                        </div>
                    )}
                </section>

                <section className="atencion-recepcion-form__section atencion-recepcion-form__section--tipo">
                    <div className="atencion-recepcion-form__section-head">
                        <span className="atencion-recepcion-form__step">2</span>
                        <p className="atencion-recepcion-form__section-title">
                            Tipo de atención
                        </p>
                    </div>

                    <form.Field name="tipoAtencionId">
                        {(field) => {
                            const error = getFieldError(field.state.meta.errors)

                            return (
                                <Form.Item
                                    className="atencion-recepcion-form__tipo-item"
                                    required
                                    validateStatus={error ? 'error' : undefined}
                                    help={error || undefined}
                                >
                                    <TipoAtencionCardSwitch
                                        tipos={tipos}
                                        value={field.state.value || undefined}
                                        loading={loadingTipos}
                                        disabled={loading}
                                        error={error || undefined}
                                        onBlur={field.handleBlur}
                                        onChange={(tipoId) => {
                                            field.handleChange(tipoId)
                                            setTipoAtencionId(tipoId)
                                        }}
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
                                <Text type="secondary">Buscando formulario…</Text>
                            ) : formularioActivo ? (
                                <>
                                    <FileTextOutlined />
                                    <Text ellipsis className="atencion-recepcion-form__formulario-nombre">
                                        {formularioActivo.nombre}
                                    </Text>
                                    <Tag color="success">Activo</Tag>
                                </>
                            ) : (
                                <Text type="danger">Sin formulario activo</Text>
                            )}
                        </div>
                    ) : null}

                    <form.Field name="observaciones">
                        {(field) => (
                            <Form.Item
                                label="Observaciones"
                                className="atencion-recepcion-form__obs-item"
                            >
                                <Input.TextArea
                                    rows={2}
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
                </section>
            </div>

            <Flex
                justify="flex-end"
                gap={8}
                wrap="wrap"
                className="atencion-recepcion-form__actions"
            >
                <Space wrap size={8}>
                    <Button
                        icon={<ClearOutlined />}
                        onClick={resetForm}
                        disabled={loading}
                    >
                        Limpiar
                    </Button>
                    <Button
                        type="primary"
                        icon={<CheckCircleOutlined />}
                        loading={loading}
                        disabled={!formularioActivo && Boolean(tipoAtencionIdForQuery)}
                        onClick={handleSubmitClick}
                    >
                        {submitLabel}
                    </Button>
                </Space>
            </Flex>
        </Form>
    )
})
