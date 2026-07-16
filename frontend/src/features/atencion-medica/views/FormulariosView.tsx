import { useEffect, useMemo, useState, type KeyboardEvent, type MouseEvent } from 'react'
import {
    createColumnHelper,
    type ColumnDef,
} from '@tanstack/react-table'
import {
    Alert,
    Badge,
    Button,
    Col,
    Divider,
    Drawer,
    Dropdown,
    Empty,
    Flex,
    Form,
    Grid,
    Input,
    InputNumber,
    Modal,
    Row,
    Select,
    Skeleton,
    Switch,
    Tabs,
    Tooltip,
    Typography,
    theme,
} from 'antd'
import type { MenuProps } from 'antd'

const { useBreakpoint } = Grid
import {
    ArrowLeftOutlined,
    CalendarOutlined,
    CheckOutlined,
    CheckSquareOutlined,
    ClockCircleOutlined,
    CopyOutlined,
    DeleteOutlined,
    DownSquareOutlined,
    EditOutlined,
    EyeInvisibleOutlined,
    FieldNumberOutlined,
    FileTextOutlined,
    FolderOpenOutlined,
    FontSizeOutlined,
    MoreOutlined,
    PlusOutlined,
    SearchOutlined,
    SendOutlined,
    UnorderedListOutlined,
} from '@ant-design/icons'
import { useNavigate } from '@tanstack/react-router'

import { AppDataTable } from '../../../shared/components/ui/data-table/AppDataTable'
import {
    formularioCamposHooks,
    formularioSeccionesHooks,
    formulariosClinicosHooks,
    tiposAtencionHooks,
    useFormularioCampos,
    useFormularioSecciones,
    useFormulariosClinicos,
    useTiposAtencion,
    useTiposCampoFormulario,
} from '../hooks/atencion-medica.hooks'
import type {
    FormularioCampo,
    FormularioClinico,
    FormularioSeccion,
} from '../types/atencion-medica.types'

const { Text } = Typography

const COMPACT_FORM_CLASS = 'formularios-view__drawer-form'

type FormularioEstadoFiltro = 'todos' | 'activos' | 'inactivos'

type PanelEmptyProps = {
    icon: React.ReactNode
    title: string
    description: string
    action?: React.ReactNode
    steps?: string[]
}

function PanelEmpty({ icon, title, description, action, steps }: PanelEmptyProps) {
    return (
        <div className="catalogos-view__panel-empty formularios-view__panel-empty">
            <span className="formularios-view__panel-empty-icon" aria-hidden>
                {icon}
            </span>
            <Text strong className="catalogos-view__panel-empty-title">
                {title}
            </Text>
            <Text type="secondary" className="catalogos-view__panel-empty-desc">
                {description}
            </Text>
            {steps && steps.length > 0 ? (
                <ol className="formularios-view__empty-steps">
                    {steps.map((step) => (
                        <li key={step}>{step}</li>
                    ))}
                </ol>
            ) : null}
            {action ? <div className="formularios-view__empty-action">{action}</div> : null}
        </div>
    )
}

type TipoCampoInfo = {
    nombre: string
    controlFrontend: string
}

function getCampoTipoVisual(controlFrontend: string | undefined): {
    icon: React.ReactNode
    label: string
} {
    const control = (controlFrontend ?? '').toLowerCase()

    if (control.includes('checkbox') || control.includes('switch')) {
        return { icon: <CheckSquareOutlined />, label: 'Checkbox' }
    }
    if (control.includes('date') && !control.includes('time')) {
        return { icon: <CalendarOutlined />, label: 'Fecha' }
    }
    if (control.includes('time')) {
        return { icon: <ClockCircleOutlined />, label: 'Hora' }
    }
    if (
        control.includes('select') ||
        control.includes('dropdown') ||
        control.includes('radio')
    ) {
        return { icon: <DownSquareOutlined />, label: 'Lista' }
    }
    if (control.includes('number')) {
        return { icon: <FieldNumberOutlined />, label: 'Número' }
    }
    if (control.includes('textarea')) {
        return { icon: <FontSizeOutlined />, label: 'Texto largo' }
    }

    return { icon: <FontSizeOutlined />, label: 'Texto' }
}

function CamposSkeleton() {
    return (
        <div className="catalogos-view__items-skeleton" aria-busy aria-label="Cargando campos">
            {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="catalogos-view__items-skeleton-row">
                    <Skeleton.Input active size="small" style={{ width: 88 }} />
                    <Skeleton.Input active size="small" style={{ flex: 1 }} />
                    <Skeleton.Input active size="small" style={{ width: 120 }} />
                    <Skeleton.Input active size="small" style={{ width: 48 }} />
                </div>
            ))}
        </div>
    )
}

function stopPropagation(event: MouseEvent | KeyboardEvent) {
    event.stopPropagation()
}

function formularioEstadoLabel(activo: boolean): string {
    return activo ? 'Activo' : 'Inactivo'
}

function formularioEstadoBadgeStatus(activo: boolean): 'success' | 'default' {
    return activo ? 'success' : 'default'
}

function normalizeCodigo(value: string): string {
    return value.toUpperCase().replace(/\s+/g, '_')
}

const campoColumnHelper = createColumnHelper<FormularioCampo>()

type CampoRowActionsProps = {
    campo: FormularioCampo
    onEdit: (campo: FormularioCampo) => void
    onDuplicate: (campo: FormularioCampo) => void
    onDelete: (id: string) => void
}

function CampoRowActions({ campo, onEdit, onDuplicate, onDelete }: CampoRowActionsProps) {
    const menuItems: MenuProps['items'] = [
        {
            key: 'edit',
            label: 'Editar',
            icon: <EditOutlined />,
            onClick: () => onEdit(campo),
        },
        {
            key: 'duplicate',
            label: 'Duplicar',
            icon: <CopyOutlined />,
            onClick: () => onDuplicate(campo),
        },
        { type: 'divider' },
        {
            key: 'delete',
            label: 'Eliminar',
            icon: <DeleteOutlined />,
            danger: true,
            onClick: () => {
                Modal.confirm({
                    title: '¿Eliminar campo?',
                    content: `Se eliminará el campo "${campo.etiqueta}".`,
                    okText: 'Eliminar',
                    okType: 'danger',
                    cancelText: 'Cancelar',
                    onOk: () => onDelete(campo.id),
                })
            },
        },
    ]

    return (
        <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
            <Button
                type="text"
                size="small"
                className="formularios-view__row-actions"
                icon={<MoreOutlined />}
                aria-label={`Acciones para ${campo.etiqueta}`}
                onClick={(event) => event.stopPropagation()}
            />
        </Dropdown>
    )
}

type FormulariosViewProps = {
    tipoAtencionId: string
    formularioId?: string
}

export function FormulariosView({ tipoAtencionId, formularioId }: FormulariosViewProps) {
    const { token } = theme.useToken()
    const screens = useBreakpoint()
    const navigate = useNavigate()
    const compactTabsExtra = !screens.md

    const [selectedSeccionId, setSelectedSeccionId] = useState<string | null>(null)
    const [formularioSearchInput, setFormularioSearchInput] = useState('')
    const [estadoFiltro, setEstadoFiltro] = useState<FormularioEstadoFiltro>('todos')
    const [campoSearchInput, setCampoSearchInput] = useState('')
    const [campoSearchSeccionId, setCampoSearchSeccionId] = useState<string | null>(null)

    const {
        data: tipoAtencion,
        isFetching: loadingTipo,
        isError: errorTipo,
        refetch: refetchTipo,
    } = tiposAtencionHooks.useDetail(tipoAtencionId)

    const {
        data: formulariosData,
        isFetching: loadingFormularios,
        isLoading: initialLoadingFormularios,
        isError: errorFormularios,
        refetch: refetchFormularios,
        isRefetching: refetchingFormularios,
    } = useFormulariosClinicos({
        page: 1,
        pageSize: 100,
        tipoAtencionId,
    })

    const { data: tiposData } = useTiposAtencion()

    const formularios = useMemo(() => {
        const items = formulariosData?.items ?? []
        return items.filter((item) => item.tipoAtencionId === tipoAtencionId)
    }, [formulariosData?.items, tipoAtencionId])

    const selectedFormulario = useMemo(() => {
        if (!formularioId) return null
        return formularios.find((item) => item.id === formularioId) ?? null
    }, [formularioId, formularios])

    const { data: seccionesData, isFetching: loadingSecciones } = useFormularioSecciones({
        page: 1,
        pageSize: 100,
        formularioClinicoId: selectedFormulario?.id,
    })

    const secciones = useMemo(() => seccionesData?.items ?? [], [seccionesData?.items])

    const selectedSeccion = useMemo(() => {
        if (secciones.length === 0) return null
        return secciones.find((item) => item.id === selectedSeccionId) ?? secciones[0] ?? null
    }, [secciones, selectedSeccionId])

    const { data: camposData, isFetching: loadingCampos } = useFormularioCampos({
        page: 1,
        pageSize: 200,
        formularioSeccionId: selectedSeccion?.id,
    })
    const { data: tiposCampoData } = useTiposCampoFormulario()

    const createFormulario = formulariosClinicosHooks.useCreate()
    const updateFormulario = formulariosClinicosHooks.useUpdate()
    const deleteFormulario = formulariosClinicosHooks.useDelete()
    const createSeccion = formularioSeccionesHooks.useCreate()
    const updateSeccion = formularioSeccionesHooks.useUpdate()
    const deleteSeccion = formularioSeccionesHooks.useDelete()
    const createCampo = formularioCamposHooks.useCreate()
    const updateCampo = formularioCamposHooks.useUpdate()
    const deleteCampo = formularioCamposHooks.useDelete()

    const [formularioDrawer, setFormularioDrawer] = useState(false)
    const [seccionDrawer, setSeccionDrawer] = useState(false)
    const [campoDrawer, setCampoDrawer] = useState(false)
    const [editingFormulario, setEditingFormulario] = useState<FormularioClinico | null>(null)
    const [editingSeccion, setEditingSeccion] = useState<FormularioSeccion | null>(null)
    const [editingCampo, setEditingCampo] = useState<FormularioCampo | null>(null)

    const [formularioForm] = Form.useForm()
    const [seccionForm] = Form.useForm()
    const [campoForm] = Form.useForm()

    const tipoCampoMap = useMemo(() => {
        const map = new Map<string, TipoCampoInfo>()
        for (const item of tiposCampoData?.items ?? []) {
            map.set(item.id, {
                nombre: item.nombre,
                controlFrontend: item.controlFrontend,
            })
        }
        return map
    }, [tiposCampoData?.items])

    const campos = useMemo(() => camposData?.items ?? [], [camposData?.items])

    const effectiveCampoSearch =
        campoSearchSeccionId === selectedSeccion?.id ? campoSearchInput : ''

    const selectFormulario = (id: string | undefined) => {
        setSelectedSeccionId(null)
        setCampoSearchInput('')
        setCampoSearchSeccionId(null)
        void navigate({
            to: '/atenciones/formularios/$tipoAtencionId',
            params: { tipoAtencionId },
            search: id ? { formularioId: id } : {},
            replace: false,
        })
    }

    useEffect(() => {
        if (!formularioId || loadingFormularios) return
        const stillExists = formularios.some((item) => item.id === formularioId)
        if (!stillExists && formularios.length > 0) {
            void navigate({
                to: '/atenciones/formularios/$tipoAtencionId',
                params: { tipoAtencionId },
                search: {},
                replace: true,
            })
        }
    }, [formularios, loadingFormularios, formularioId, navigate, tipoAtencionId])

    const filteredFormularios = useMemo(() => {
        const term = formularioSearchInput.trim().toLowerCase()

        return formularios.filter((item) => {
            if (estadoFiltro === 'activos' && !item.activo) return false
            if (estadoFiltro === 'inactivos' && item.activo) return false

            if (!term) return true

            const codigo = item.codigo.toLowerCase()
            const nombre = item.nombre.toLowerCase()
            const descripcion = item.descripcion?.toLowerCase() ?? ''

            return codigo.includes(term) || nombre.includes(term) || descripcion.includes(term)
        })
    }, [formularios, formularioSearchInput, estadoFiltro])

    const filteredCampos = useMemo(() => {
        const term = effectiveCampoSearch.trim().toLowerCase()
        if (!term) return campos

        return campos.filter((item) => {
            const codigo = item.codigo.toLowerCase()
            const etiqueta = item.etiqueta.toLowerCase()
            const tipo = tipoCampoMap.get(item.tipoCampoFormularioId)?.nombre.toLowerCase() ?? ''
            const valor = item.valorDefecto?.toLowerCase() ?? ''

            return (
                codigo.includes(term) ||
                etiqueta.includes(term) ||
                tipo.includes(term) ||
                valor.includes(term)
            )
        })
    }, [campos, effectiveCampoSearch, tipoCampoMap])

    const campoSearchActive = effectiveCampoSearch.trim().length > 0
    const showNoCampoSearchResults =
        campoSearchActive && filteredCampos.length === 0 && campos.length > 0

    const openFormularioDrawer = (item?: FormularioClinico) => {
        setEditingFormulario(item ?? null)
        formularioForm.resetFields()
        if (item) {
            formularioForm.setFieldsValue(item)
        } else {
            formularioForm.setFieldsValue({
                version: 1,
                activo: true,
                tipoAtencionId,
            })
        }
        setFormularioDrawer(true)
    }

    const openSeccionDrawer = (item?: FormularioSeccion) => {
        if (!selectedFormulario) return
        setEditingSeccion(item ?? null)
        seccionForm.resetFields()
        if (item) {
            seccionForm.setFieldsValue(item)
        } else {
            seccionForm.setFieldsValue({
                orden: secciones.length + 1,
                visible: true,
            })
        }
        setSeccionDrawer(true)
    }

    const openCampoDrawer = (item?: FormularioCampo) => {
        if (!selectedSeccion) return
        setEditingCampo(item ?? null)
        campoForm.resetFields()
        if (item) {
            campoForm.setFieldsValue(item)
        } else {
            campoForm.setFieldsValue({
                orden: campos.length + 1,
                esRequerido: false,
                visible: true,
            })
        }
        setCampoDrawer(true)
    }

    const openDuplicateCampoDrawer = (item: FormularioCampo) => {
        if (!selectedSeccion) return
        setEditingCampo(null)
        campoForm.resetFields()
        campoForm.setFieldsValue({
            codigo: `${item.codigo}_COPIA`,
            etiqueta: `${item.etiqueta} (copia)`,
            tipoCampoFormularioId: item.tipoCampoFormularioId,
            esRequerido: item.esRequerido,
            visible: item.visible,
            orden: campos.length + 1,
            placeholder: item.placeholder ?? undefined,
            valorDefecto: item.valorDefecto ?? undefined,
            opcionesJson: item.opcionesJson ?? undefined,
        })
        setCampoDrawer(true)
    }

    const handleFormularioSubmit = async () => {
        const values = await formularioForm.validateFields()
        const payload = {
            tipoAtencionId: values.tipoAtencionId,
            codigo: normalizeCodigo(values.codigo),
            nombre: values.nombre,
            descripcion: values.descripcion || '',
            version: values.version ?? 1,
            activo: values.activo ?? true,
        }

        if (editingFormulario) {
            await updateFormulario.mutateAsync({ id: editingFormulario.id, data: payload })
        } else {
            const created = await createFormulario.mutateAsync(payload)
            if (created?.id) {
                selectFormulario(created.id)
            }
        }

        setFormularioDrawer(false)
    }

    const handleToggleActivo = async (formulario: FormularioClinico) => {
        await updateFormulario.mutateAsync({
            id: formulario.id,
            data: {
                tipoAtencionId: formulario.tipoAtencionId,
                codigo: formulario.codigo,
                nombre: formulario.nombre,
                descripcion: formulario.descripcion || '',
                version: formulario.version,
                activo: !formulario.activo,
            },
        })
    }

    const handleSeccionSubmit = async () => {
        if (!selectedFormulario) return
        const values = await seccionForm.validateFields()
        const payload = {
            formularioClinicoId: selectedFormulario.id,
            codigo: normalizeCodigo(values.codigo),
            nombre: values.nombre,
            orden: values.orden,
            etapaFlujo: editingSeccion?.etapaFlujo ?? null,
            visible: values.visible ?? true,
        }

        if (editingSeccion) {
            await updateSeccion.mutateAsync({ id: editingSeccion.id, data: payload })
        } else {
            await createSeccion.mutateAsync(payload)
        }

        setSeccionDrawer(false)
    }

    const handleCampoSubmit = async () => {
        if (!selectedSeccion) return
        const values = await campoForm.validateFields()
        const payload = {
            formularioSeccionId: selectedSeccion.id,
            codigo: normalizeCodigo(values.codigo),
            etiqueta: values.etiqueta,
            tipoCampoFormularioId: values.tipoCampoFormularioId,
            esRequerido: values.esRequerido ?? false,
            visible: values.visible ?? true,
            orden: values.orden,
            placeholder: values.placeholder || null,
            valorDefecto: values.valorDefecto || null,
            opcionesJson: values.opcionesJson || null,
        }

        if (editingCampo) {
            await updateCampo.mutateAsync({ id: editingCampo.id, data: payload })
        } else {
            await createCampo.mutateAsync(payload)
        }

        setCampoDrawer(false)
    }

    const campoColumns = useMemo(
        () =>
            [
                campoColumnHelper.accessor('etiqueta', {
                    header: 'Campo',
                    cell: ({ row }) => {
                        const { etiqueta, codigo } = row.original
                        return (
                            <div className="formularios-view__campo-cell">
                                <Tooltip title={etiqueta}>
                                    <Text
                                        className="formularios-view__campo-nombre"
                                        ellipsis={{ tooltip: false }}
                                    >
                                        {etiqueta}
                                    </Text>
                                </Tooltip>
                                <Tooltip title={codigo}>
                                    <Text
                                        type="secondary"
                                        code
                                        className="formularios-view__campo-codigo"
                                        ellipsis={{ tooltip: false }}
                                    >
                                        {codigo}
                                    </Text>
                                </Tooltip>
                            </div>
                        )
                    },
                }),
                campoColumnHelper.accessor('tipoCampoFormularioId', {
                    header: 'Tipo',
                    size: 140,
                    cell: ({ row }) => {
                        const info = tipoCampoMap.get(row.original.tipoCampoFormularioId)
                        const visual = getCampoTipoVisual(info?.controlFrontend)
                        const title = info?.nombre ?? visual.label
                        const defecto = row.original.valorDefecto

                        return (
                            <Tooltip
                                title={
                                    defecto
                                        ? `${title} · Defecto: ${defecto}`
                                        : title
                                }
                            >
                                <span className="formularios-view__tipo-cell">
                                    <span className="formularios-view__tipo-cell-icon" aria-hidden>
                                        {visual.icon}
                                    </span>
                                    <Text
                                        type="secondary"
                                        className="formularios-view__tipo-cell-label"
                                    >
                                        {visual.label}
                                    </Text>
                                </span>
                            </Tooltip>
                        )
                    },
                }),
                campoColumnHelper.accessor('orden', {
                    header: 'Orden',
                    size: 72,
                    meta: { align: 'center', headerAlign: 'center' },
                }),
                campoColumnHelper.accessor('visible', {
                    header: 'Visibilidad',
                    size: 96,
                    meta: { align: 'center', headerAlign: 'center' },
                    cell: ({ getValue }) => {
                        const isVisible = getValue()
                        return (
                            <Tooltip title={isVisible ? 'Visible' : 'No visible'}>
                                <span
                                    className={[
                                        'formularios-view__visibility-icon',
                                        isVisible
                                            ? 'formularios-view__visibility-icon--visible'
                                            : 'formularios-view__visibility-icon--hidden',
                                    ].join(' ')}
                                    aria-label={isVisible ? 'Visible' : 'No visible'}
                                >
                                    {isVisible ? (
                                        <CheckOutlined />
                                    ) : (
                                        <EyeInvisibleOutlined />
                                    )}
                                </span>
                            </Tooltip>
                        )
                    },
                }),
                campoColumnHelper.display({
                    id: 'actions',
                    header: '',
                    size: 48,
                    meta: { align: 'center', headerAlign: 'center' },
                    cell: ({ row }) => (
                        <CampoRowActions
                            campo={row.original}
                            onEdit={openCampoDrawer}
                            onDuplicate={openDuplicateCampoDrawer}
                            onDelete={(id) => deleteCampo.mutate(id)}
                        />
                    ),
                }),
            ] as ColumnDef<FormularioCampo, unknown>[],
        [tipoCampoMap, deleteCampo],
    )

    const recordCountLabel = `${campos.length} campo${campos.length === 1 ? '' : 's'}`
    const formularioDesc = selectedFormulario?.descripcion?.trim()
    const searchTerm = formularioSearchInput.trim()
    const isLoadingSidebar = initialLoadingFormularios || loadingTipo
    const hasFormularios = formularios.length > 0
    const hasSearchOrFilter = searchTerm.length > 0 || estadoFiltro !== 'todos'
    const showSearchEmpty =
        !isLoadingSidebar &&
        !errorFormularios &&
        hasFormularios &&
        filteredFormularios.length === 0 &&
        hasSearchOrFilter
    const showNoFormularios =
        !isLoadingSidebar && !errorFormularios && !hasFormularios
    const showSelectPrompt =
        !isLoadingSidebar &&
        !errorFormularios &&
        hasFormularios &&
        !selectedFormulario

    const seccionTabItems = useMemo(
        () =>
            secciones.map((seccion) => ({
                key: seccion.id,
                label: (
                    <Tooltip
                        title={
                            seccion.visible
                                ? seccion.nombre
                                : `${seccion.nombre} (oculta)`
                        }
                    >
                        <span
                            className={[
                                'formularios-view__tab-label',
                                seccion.visible
                                    ? ''
                                    : 'formularios-view__tab-label--hidden',
                            ]
                                .filter(Boolean)
                                .join(' ')}
                        >
                            {!seccion.visible ? (
                                <EyeInvisibleOutlined
                                    className="formularios-view__tab-hidden-icon"
                                    aria-hidden
                                />
                            ) : null}
                            <Text ellipsis className="formularios-view__tab-name">
                                {seccion.nombre}
                            </Text>
                        </span>
                    </Tooltip>
                ),
            })),
        [secciones],
    )

    const buildFormularioMenu = (formulario: FormularioClinico): MenuProps['items'] => [
        {
            key: 'edit',
            label: 'Editar',
            icon: <EditOutlined />,
            onClick: () => openFormularioDrawer(formulario),
        },
        {
            key: 'toggle',
            label: formulario.activo ? 'Desactivar' : 'Activar',
            onClick: () => void handleToggleActivo(formulario),
        },
        { type: 'divider' },
        {
            key: 'delete',
            label: 'Eliminar',
            icon: <DeleteOutlined />,
            danger: true,
            onClick: () => {
                Modal.confirm({
                    title: '¿Eliminar formulario?',
                    content: `Se eliminará "${formulario.nombre}".`,
                    okText: 'Eliminar',
                    okType: 'danger',
                    cancelText: 'Cancelar',
                    onOk: async () => {
                        await deleteFormulario.mutateAsync(formulario.id)
                        if (formularioId === formulario.id) {
                            selectFormulario(undefined)
                        }
                    },
                })
            },
        },
    ]

    const buildSeccionMenu = (seccion: FormularioSeccion): MenuProps['items'] => [
        {
            key: 'edit',
            label: 'Editar sección',
            icon: <EditOutlined />,
            onClick: () => openSeccionDrawer(seccion),
        },
        {
            key: 'delete',
            label: 'Eliminar sección',
            icon: <DeleteOutlined />,
            danger: true,
            onClick: () => {
                Modal.confirm({
                    title: '¿Eliminar sección?',
                    content: `Se eliminará la sección "${seccion.nombre}".`,
                    okText: 'Eliminar',
                    okType: 'danger',
                    cancelText: 'Cancelar',
                    onOk: () => {
                        deleteSeccion.mutate(seccion.id)
                        setSelectedSeccionId(null)
                    },
                })
            },
        },
    ]

    const renderMainEmpty = () => {
        if (isLoadingSidebar) {
            return (
                <div className="catalogos-view__main-empty" aria-busy aria-label="Cargando">
                    <Skeleton active paragraph={{ rows: 4 }} />
                </div>
            )
        }

        if (errorFormularios || errorTipo) {
            return (
                <div className="catalogos-view__main-empty">
                    <Alert
                        type="error"
                        showIcon
                        title="No se pudieron cargar los formularios."
                        action={
                            <Button
                                size="small"
                                loading={refetchingFormularios}
                                onClick={() => {
                                    void refetchFormularios()
                                    void refetchTipo()
                                }}
                            >
                                Reintentar
                            </Button>
                        }
                    />
                </div>
            )
        }

        if (showNoFormularios) {
            return (
                <div className="catalogos-view__main-empty">
                    <PanelEmpty
                        icon={<FolderOpenOutlined />}
                        title="Cree el primer formulario clínico"
                        description="Configure secciones, campos y validaciones para este tipo de atención."
                        steps={[
                            'Cree el formulario.',
                            'Agregue secciones.',
                            'Configure los campos.',
                            'Publique una versión.',
                        ]}
                        action={
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={() => openFormularioDrawer()}
                            >
                                Crear primer formulario
                            </Button>
                        }
                    />
                </div>
            )
        }

        if (showSelectPrompt) {
            return (
                <div className="catalogos-view__main-empty">
                    <PanelEmpty
                        icon={<FileTextOutlined />}
                        title="Seleccione un formulario"
                        description="Elija un formulario del panel izquierdo para editar su estructura y configuración."
                    />
                </div>
            )
        }

        return null
    }

    return (
        <div className="module-object-page__panel catalogos-view catalogos-view--compact catalogos-view--erp formularios-view">
            <div className="catalogos-view__split">
                <aside className="catalogos-view__sidebar formularios-view__sidebar">
                    <div className="formularios-view__sidebar-context">
                        <Button
                            type="link"
                            size="small"
                            icon={<ArrowLeftOutlined />}
                            className="formularios-view__back-btn"
                            onClick={() => navigate({ to: '/atenciones/tipos-atencion' })}
                        >
                            Volver a tipos de atención
                        </Button>

                        {loadingTipo && !tipoAtencion ? (
                            <Skeleton active title={{ width: '80%' }} paragraph={{ rows: 1 }} />
                        ) : tipoAtencion ? (
                            <div className="formularios-view__tipo-context">
                                <Text strong className="formularios-view__tipo-nombre">
                                    {tipoAtencion.nombre}
                                </Text>
                                <Flex gap={8} align="center" wrap="wrap">
                                    <Text code className="formularios-view__tipo-codigo">
                                        {tipoAtencion.codigo}
                                    </Text>
                                    {/* TODO: estado del tipo cuando el backend lo exponga. */}
                                </Flex>
                            </div>
                        ) : (
                            <Text type="secondary">Tipo de atención no encontrado.</Text>
                        )}
                    </div>

                    <Divider className="formularios-view__sidebar-divider" />

                    <div className="formularios-view__sidebar-toolbar">
                        <Text strong className="formularios-view__sidebar-heading">
                            Formularios clínicos
                            <Text type="secondary" className="formularios-view__sidebar-count">
                                {' '}
                                ({formularios.length})
                            </Text>
                        </Text>
                        <Button
                            type="primary"
                            size="small"
                            icon={<PlusOutlined />}
                            onClick={() => openFormularioDrawer()}
                        >
                            Nuevo formulario
                        </Button>
                    </div>

                    <div className="formularios-view__sidebar-filters">
                        <Input
                            allowClear
                            size="small"
                            className="catalogos-view__search-input"
                            prefix={<SearchOutlined style={{ color: token.colorTextQuaternary }} />}
                            placeholder="Buscar formulario..."
                            value={formularioSearchInput}
                            onChange={(event) => setFormularioSearchInput(event.target.value)}
                            onClear={() => setFormularioSearchInput('')}
                        />
                        <Select
                            size="small"
                            className="formularios-view__estado-filter"
                            value={estadoFiltro}
                            aria-label="Filtrar formularios por estado"
                            options={[
                                { value: 'todos', label: 'Todos' },
                                { value: 'activos', label: 'Activos' },
                                { value: 'inactivos', label: 'Inactivos' },
                            ]}
                            onChange={(value: FormularioEstadoFiltro) => setEstadoFiltro(value)}
                        />
                    </div>

                    <div className="catalogos-view__sidebar-body">
                        {isLoadingSidebar ? (
                            <div aria-busy aria-label="Cargando formularios">
                                {Array.from({ length: 5 }).map((_, index) => (
                                    <div key={index} className="catalogos-grupos-list__skeleton">
                                        <Skeleton.Input active size="small" style={{ width: '100%' }} />
                                    </div>
                                ))}
                            </div>
                        ) : errorFormularios ? (
                            <Alert
                                type="error"
                                showIcon
                                title="No se pudieron cargar los formularios."
                                action={
                                    <Button
                                        size="small"
                                        loading={refetchingFormularios}
                                        onClick={() => void refetchFormularios()}
                                    >
                                        Reintentar
                                    </Button>
                                }
                            />
                        ) : showNoFormularios ? (
                            <Text type="secondary" className="formularios-view__sidebar-empty">
                                Aún no existen formularios.
                            </Text>
                        ) : showSearchEmpty ? (
                            <Empty
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                description={
                                    searchTerm
                                        ? `No se encontraron formularios con “${searchTerm}”.`
                                        : 'No hay formularios con ese estado.'
                                }
                            />
                        ) : (
                            <div
                                className="formularios-view__form-list"
                                role="listbox"
                                aria-label="Formularios clínicos"
                            >
                                {filteredFormularios.map((formulario) => {
                                    const isSelected = selectedFormulario?.id === formulario.id

                                    return (
                                        <div
                                            key={formulario.id}
                                            role="option"
                                            aria-selected={isSelected}
                                            tabIndex={0}
                                            className={[
                                                'admin-sidebar__nav-item',
                                                'formularios-view__form-item',
                                                isSelected
                                                    ? 'admin-sidebar__nav-item--active'
                                                    : '',
                                            ]
                                                .filter(Boolean)
                                                .join(' ')}
                                            onClick={() => selectFormulario(formulario.id)}
                                            onKeyDown={(event) => {
                                                if (event.key === 'Enter' || event.key === ' ') {
                                                    event.preventDefault()
                                                    selectFormulario(formulario.id)
                                                }
                                            }}
                                        >
                                            <span
                                                className="admin-sidebar__nav-icon formularios-view__form-item-icon"
                                                aria-hidden
                                            >
                                                <FileTextOutlined />
                                            </span>
                                            <div className="formularios-view__form-item-content">
                                                <div
                                                    className="formularios-view__form-item-title"
                                                    title={formulario.nombre}
                                                >
                                                    {formulario.nombre}
                                                </div>
                                                <div className="formularios-view__form-item-code">
                                                    {formulario.codigo}
                                                </div>
                                                <div className="formularios-view__form-item-meta">
                                                    {formularioEstadoLabel(formulario.activo)} · v
                                                    {formulario.version}
                                                </div>
                                            </div>
                                            <div
                                                className="formularios-view__form-item-actions"
                                                onClick={stopPropagation}
                                                onKeyDown={stopPropagation}
                                            >
                                                <Dropdown
                                                    menu={{
                                                        items: buildFormularioMenu(formulario),
                                                    }}
                                                    trigger={['click']}
                                                    placement="bottomRight"
                                                >
                                                    <Button
                                                        type="text"
                                                        size="small"
                                                        icon={<MoreOutlined />}
                                                        aria-label={`Acciones de ${formulario.nombre}`}
                                                    />
                                                </Dropdown>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </aside>

                <main
                    className={[
                        'catalogos-view__main',
                        selectedFormulario ? 'catalogos-view__main--active' : '',
                    ]
                        .filter(Boolean)
                        .join(' ')}
                >
                    {selectedFormulario ? (
                        <>
                            <header className="formularios-view__editor-header">
                                <div className="formularios-view__editor-header-main">
                                    <Flex align="center" gap={8} wrap="wrap">
                                        <FileTextOutlined
                                            className="formularios-view__editor-header-icon"
                                            aria-hidden
                                        />
                                        <Tooltip title={selectedFormulario.nombre}>
                                            <Text
                                                strong
                                                className="formularios-view__context-name"
                                                ellipsis={{ tooltip: false }}
                                            >
                                                {selectedFormulario.nombre}
                                            </Text>
                                        </Tooltip>
                                    </Flex>
                                    <Flex gap={8} wrap="wrap" align="center">
                                        <Text code className="formularios-view__context-code-text">
                                            {selectedFormulario.codigo}
                                        </Text>
                                        <Badge
                                            status={formularioEstadoBadgeStatus(
                                                selectedFormulario.activo,
                                            )}
                                            text={formularioEstadoLabel(selectedFormulario.activo)}
                                            className="formularios-view__estado-badge"
                                        />
                                        <Text
                                            type="secondary"
                                            className="formularios-view__context-desc"
                                        >
                                            Versión {selectedFormulario.version}
                                            {formularioDesc ? ` · ${formularioDesc}` : ''}
                                        </Text>
                                    </Flex>
                                </div>
                                <Flex gap={8} wrap="wrap" className="formularios-view__editor-actions">
                                    <Button
                                        size="small"
                                        icon={<EditOutlined />}
                                        onClick={() => openFormularioDrawer(selectedFormulario)}
                                    >
                                        Editar
                                    </Button>
                                    <Tooltip
                                        title={
                                            selectedFormulario.activo
                                                ? 'Desactivar formulario'
                                                : 'Activar formulario'
                                        }
                                    >
                                        <Button
                                            size="small"
                                            icon={<SendOutlined />}
                                            onClick={() =>
                                                void handleToggleActivo(selectedFormulario)
                                            }
                                            loading={updateFormulario.isPending}
                                        >
                                            {selectedFormulario.activo ? 'Desactivar' : 'Activar'}
                                        </Button>
                                    </Tooltip>
                                </Flex>
                            </header>

                            {/* TODO: cuando exista selección de campo en la tabla, mostrar
                                Drawer de propiedades (~360px) a la derecha en lugar de un panel fijo. */}
                            <div className="formularios-view__workspace">
                                <section className="formularios-view__workspace-main">
                                    {loadingSecciones && secciones.length === 0 ? (
                                        <div className="formularios-view__tabs-wrap">
                                            <Skeleton.Input
                                                active
                                                size="small"
                                                style={{ width: 240 }}
                                            />
                                        </div>
                                    ) : secciones.length === 0 ? (
                                        <div className="catalogos-view__main-body formularios-view__fields-body">
                                            <PanelEmpty
                                                icon={<UnorderedListOutlined />}
                                                title="Sin secciones"
                                                description="Agregue la primera sección para comenzar a organizar los campos del formulario."
                                                action={
                                                    <Button
                                                        type="primary"
                                                        icon={<PlusOutlined />}
                                                        onClick={() => openSeccionDrawer()}
                                                    >
                                                        Nueva sección
                                                    </Button>
                                                }
                                            />
                                        </div>
                                    ) : (
                                        <>
                                            <div className="formularios-view__tabs-wrap">
                                                <Tabs
                                                    size="small"
                                                    type="card"
                                                    className="formularios-view__tabs"
                                                    activeKey={selectedSeccion?.id}
                                                    tabBarGutter={4}
                                                    onChange={(key) => {
                                                        setSelectedSeccionId(key)
                                                        setCampoSearchInput('')
                                                        setCampoSearchSeccionId(key)
                                                    }}
                                                    items={seccionTabItems}
                                                    tabBarExtraContent={
                                                        <div className="formularios-view__tabs-extra">
                                                            {selectedSeccion ? (
                                                                <Dropdown
                                                                    menu={{
                                                                        items: buildSeccionMenu(
                                                                            selectedSeccion,
                                                                        ),
                                                                    }}
                                                                    trigger={['click']}
                                                                    placement="bottomRight"
                                                                >
                                                                    <Button
                                                                        type="text"
                                                                        size="small"
                                                                        icon={<MoreOutlined />}
                                                                        aria-label={`Acciones de ${selectedSeccion.nombre}`}
                                                                    />
                                                                </Dropdown>
                                                            ) : null}
                                                            {compactTabsExtra ? (
                                                                <Tooltip title="Nueva sección">
                                                                    <Button
                                                                        type="text"
                                                                        size="small"
                                                                        icon={<PlusOutlined />}
                                                                        aria-label="Nueva sección"
                                                                        onClick={() =>
                                                                            openSeccionDrawer()
                                                                        }
                                                                    />
                                                                </Tooltip>
                                                            ) : (
                                                                <Button
                                                                    type="text"
                                                                    size="small"
                                                                    icon={<PlusOutlined />}
                                                                    onClick={() =>
                                                                        openSeccionDrawer()
                                                                    }
                                                                >
                                                                    Nueva sección
                                                                </Button>
                                                            )}
                                                        </div>
                                                    }
                                                />
                                            </div>

                                            {selectedSeccion ? (
                                                <div className="formularios-view__action-bar">
                                                    <Input
                                                        allowClear
                                                        size="small"
                                                        className="formularios-view__action-search catalogos-view__search-input"
                                                        prefix={
                                                            <SearchOutlined
                                                                style={{
                                                                    color: token.colorTextQuaternary,
                                                                }}
                                                            />
                                                        }
                                                        placeholder="Buscar campo..."
                                                        value={effectiveCampoSearch}
                                                        onChange={(event) => {
                                                            setCampoSearchInput(
                                                                event.target.value,
                                                            )
                                                            setCampoSearchSeccionId(
                                                                selectedSeccion.id,
                                                            )
                                                        }}
                                                        onClear={() => {
                                                            setCampoSearchInput('')
                                                            setCampoSearchSeccionId(
                                                                selectedSeccion.id,
                                                            )
                                                        }}
                                                    />
                                                    <span className="formularios-view__action-count">
                                                        {recordCountLabel}
                                                    </span>
                                                    <Button
                                                        type="primary"
                                                        size="small"
                                                        icon={<PlusOutlined />}
                                                        onClick={() => openCampoDrawer()}
                                                    >
                                                        Nuevo campo
                                                    </Button>
                                                </div>
                                            ) : null}

                                            <div className="catalogos-view__main-body formularios-view__fields-body">
                                                {!selectedSeccion ? (
                                                    <PanelEmpty
                                                        icon={<UnorderedListOutlined />}
                                                        title="Seleccione una sección"
                                                        description="Elija una sección de la franja superior para ver sus campos."
                                                    />
                                                ) : loadingCampos && campos.length === 0 ? (
                                                    <CamposSkeleton />
                                                ) : showNoCampoSearchResults ? (
                                                    <PanelEmpty
                                                        icon={<SearchOutlined />}
                                                        title="Sin resultados"
                                                        description="No hay campos que coincidan con la búsqueda."
                                                    />
                                                ) : !loadingCampos && campos.length === 0 ? (
                                                    <PanelEmpty
                                                        icon={<UnorderedListOutlined />}
                                                        title="Sin campos"
                                                        description="Agregue el primer campo con el botón Nuevo campo."
                                                    />
                                                ) : (
                                                    <div className="catalogos-view__table formularios-view__table">
                                                        <AppDataTable
                                                            data={filteredCampos}
                                                            columns={campoColumns}
                                                            loading={loadingCampos}
                                                            emptyText="Sin campos en esta sección."
                                                            getRowId={(row) => String(row.id)}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </section>
                            </div>
                        </>
                    ) : (
                        renderMainEmpty()
                    )}
                </main>
            </div>

            <Drawer
                title={
                    editingFormulario ? 'Editar formulario clínico' : 'Nuevo formulario clínico'
                }
                open={formularioDrawer}
                onClose={() => setFormularioDrawer(false)}
                size={420}
                destroyOnClose
                className="formularios-view__drawer"
                footer={
                    <Flex justify="end" gap={8}>
                        <Button onClick={() => setFormularioDrawer(false)}>Cancelar</Button>
                        <Button
                            type="primary"
                            loading={createFormulario.isPending || updateFormulario.isPending}
                            onClick={() => void handleFormularioSubmit()}
                        >
                            {editingFormulario ? 'Guardar' : 'Crear'}
                        </Button>
                    </Flex>
                }
            >
                <Form
                    form={formularioForm}
                    layout="vertical"
                    requiredMark={false}
                    className={COMPACT_FORM_CLASS}
                    size="small"
                >
                    <Form.Item
                        name="tipoAtencionId"
                        label="Tipo de atención"
                        rules={[{ required: true }]}
                    >
                        <Select
                            disabled
                            options={(tiposData?.items ?? []).map((t) => ({
                                value: t.id,
                                label: `${t.codigo} — ${t.nombre}`,
                            }))}
                        />
                    </Form.Item>
                    <Row gutter={8}>
                        <Col span={12}>
                            <Form.Item name="codigo" label="Código" rules={[{ required: true }]}>
                                <Input
                                    autoFocus={!editingFormulario}
                                    onChange={(event) => {
                                        formularioForm.setFieldValue(
                                            'codigo',
                                            normalizeCodigo(event.target.value),
                                        )
                                    }}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="version" label="Versión">
                                <InputNumber min={1} style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item name="nombre" label="Nombre" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="descripcion" label="Descripción">
                        <Input.TextArea rows={2} />
                    </Form.Item>
                    <Form.Item name="activo" label="Activo" valuePropName="checked">
                        <Switch size="small" />
                    </Form.Item>
                </Form>
            </Drawer>

            <Drawer
                title={editingSeccion ? 'Editar sección' : 'Nueva sección'}
                open={seccionDrawer}
                onClose={() => setSeccionDrawer(false)}
                size={400}
                destroyOnClose
                className="formularios-view__drawer"
                footer={
                    <Flex justify="end" gap={8}>
                        <Button onClick={() => setSeccionDrawer(false)}>Cancelar</Button>
                        <Button
                            type="primary"
                            loading={createSeccion.isPending || updateSeccion.isPending}
                            onClick={() => void handleSeccionSubmit()}
                        >
                            {editingSeccion ? 'Guardar' : 'Crear'}
                        </Button>
                    </Flex>
                }
            >
                <Form
                    form={seccionForm}
                    layout="vertical"
                    requiredMark={false}
                    className={COMPACT_FORM_CLASS}
                    size="small"
                >
                    <Row gutter={8}>
                        <Col span={12}>
                            <Form.Item name="codigo" label="Código" rules={[{ required: true }]}>
                                <Input
                                    autoFocus={!editingSeccion}
                                    onChange={(event) => {
                                        seccionForm.setFieldValue(
                                            'codigo',
                                            normalizeCodigo(event.target.value),
                                        )
                                    }}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="orden" label="Orden" rules={[{ required: true }]}>
                                <InputNumber min={1} style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item name="nombre" label="Nombre" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="visible"
                        label="Visible"
                        valuePropName="checked"
                        extra="Si está desactivado, la sección no se muestra en la atención clínica."
                    >
                        <Switch size="small" />
                    </Form.Item>
                </Form>
            </Drawer>

            <Drawer
                title={editingCampo ? 'Editar campo' : 'Nuevo campo'}
                open={campoDrawer}
                onClose={() => setCampoDrawer(false)}
                size={440}
                destroyOnClose
                className="formularios-view__drawer"
                footer={
                    <Flex justify="end" gap={8}>
                        <Button onClick={() => setCampoDrawer(false)}>Cancelar</Button>
                        <Button
                            type="primary"
                            loading={createCampo.isPending || updateCampo.isPending}
                            onClick={() => void handleCampoSubmit()}
                        >
                            {editingCampo ? 'Guardar' : 'Crear'}
                        </Button>
                    </Flex>
                }
            >
                <Form
                    form={campoForm}
                    layout="vertical"
                    requiredMark={false}
                    className={COMPACT_FORM_CLASS}
                    size="small"
                >
                    <Row gutter={8}>
                        <Col span={12}>
                            <Form.Item name="codigo" label="Código" rules={[{ required: true }]}>
                                <Input
                                    autoFocus={!editingCampo}
                                    onChange={(event) => {
                                        campoForm.setFieldValue(
                                            'codigo',
                                            normalizeCodigo(event.target.value),
                                        )
                                    }}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="etiqueta" label="Nombre" rules={[{ required: true }]}>
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={8}>
                        <Col span={12}>
                            <Form.Item
                                name="tipoCampoFormularioId"
                                label="Tipo de campo"
                                rules={[{ required: true }]}
                            >
                                <Select
                                    showSearch
                                    optionFilterProp="label"
                                    options={tiposCampoData?.items.map((t) => ({
                                        value: t.id,
                                        label: `${t.nombre} (${t.controlFrontend})`,
                                    }))}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="orden" label="Orden" rules={[{ required: true }]}>
                                <InputNumber min={1} style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={8}>
                        <Col span={12}>
                            <Form.Item name="placeholder" label="Placeholder">
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="valorDefecto" label="Valor por defecto">
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={8}>
                        <Col span={12}>
                            <Form.Item name="esRequerido" label="Requerido" valuePropName="checked">
                                <Switch size="small" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="visible"
                                label="Visible"
                                valuePropName="checked"
                                extra="Si está desactivado, el campo no se muestra en la atención clínica."
                            >
                                <Switch size="small" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item
                        name="opcionesJson"
                        label="Opciones JSON"
                        extra='Para select/multiselect. Ej: ["Opción 1","Opción 2"]'
                    >
                        <Input.TextArea rows={2} />
                    </Form.Item>
                </Form>
            </Drawer>
        </div>
    )
}
