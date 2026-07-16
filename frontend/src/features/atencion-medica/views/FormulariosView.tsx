import { useEffect, useMemo, useState, type KeyboardEvent, type MouseEvent } from 'react'
import {
    createColumnHelper,
    type ColumnDef,
} from '@tanstack/react-table'
import {
    Button,
    Col,
    Drawer,
    Dropdown,
    Flex,
    Form,
    Input,
    InputNumber,
    Modal,
    Popconfirm,
    Row,
    Select,
    Skeleton,
    Switch,
    Tabs,
    Tag,
    Tooltip,
    Typography,
    theme,
} from 'antd'
import type { MenuProps } from 'antd'
import {
    ArrowLeftOutlined,
    CopyOutlined,
    DeleteOutlined,
    EditOutlined,
    FileTextOutlined,
    FolderOpenOutlined,
    MoreOutlined,
    PlusOutlined,
    SearchOutlined,
    UnorderedListOutlined,
} from '@ant-design/icons'
import { useNavigate } from '@tanstack/react-router'

import { AppDataTable } from '../../../shared/components/ui/data-table/AppDataTable'
import {
    formularioCamposHooks,
    formularioSeccionesHooks,
    formulariosClinicosHooks,
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

type PanelEmptyProps = {
    icon: React.ReactNode
    title: string
    description: string
}

function PanelEmpty({ icon, title, description }: PanelEmptyProps) {
    return (
        <div className="catalogos-view__panel-empty">
            <div className="catalogos-view__panel-empty-ring" aria-hidden>
                <span className="catalogos-view__panel-empty-icon">{icon}</span>
            </div>
            <Text strong className="catalogos-view__panel-empty-title">
                {title}
            </Text>
            <Text type="secondary" className="catalogos-view__panel-empty-desc">
                {description}
            </Text>
        </div>
    )
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
}

export function FormulariosView({ tipoAtencionId }: FormulariosViewProps) {
    const { token } = theme.useToken()
    const navigate = useNavigate()

    const [selectedFormulario, setSelectedFormulario] = useState<FormularioClinico | null>(null)
    const [selectedSeccion, setSelectedSeccion] = useState<FormularioSeccion | null>(null)

    const [formularioSearchInput, setFormularioSearchInput] = useState('')
    const [campoSearchInput, setCampoSearchInput] = useState('')

    const { data: tiposData } = useTiposAtencion()
    const { data: formulariosData, isFetching: loadingFormularios } = useFormulariosClinicos({
        page: 1,
        pageSize: 100,
        tipoAtencionId,
    })
    const { data: seccionesData, isFetching: loadingSecciones } = useFormularioSecciones({
        page: 1,
        pageSize: 100,
        formularioClinicoId: selectedFormulario?.id,
    })
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

    const tipoCampoMap = useMemo(
        () => new Map(tiposCampoData?.items.map((t) => [t.id, t.nombre]) ?? []),
        [tiposCampoData?.items],
    )

    const formularios = useMemo(() => {
        const items = formulariosData?.items ?? []
        return items.filter((item) => item.tipoAtencionId === tipoAtencionId)
    }, [formulariosData?.items, tipoAtencionId])
    const secciones = seccionesData?.items ?? []
    const campos = camposData?.items ?? []

    const tipoAtencionLabel = useMemo(() => {
        const tipo = tiposData?.items.find((t) => t.id === tipoAtencionId)
        return tipo ? `${tipo.codigo} — ${tipo.nombre}` : null
    }, [tipoAtencionId, tiposData?.items])

    useEffect(() => {
        setSelectedFormulario(null)
        setFormularioSearchInput('')
    }, [tipoAtencionId])

    const filteredFormularios = useMemo(() => {
        const term = formularioSearchInput.trim().toLowerCase()
        if (!term) return formularios

        return formularios.filter((item) => {
            const codigo = item.codigo.toLowerCase()
            const nombre = item.nombre.toLowerCase()
            const descripcion = item.descripcion?.toLowerCase() ?? ''

            return codigo.includes(term) || nombre.includes(term) || descripcion.includes(term)
        })
    }, [formularios, formularioSearchInput])

    const filteredCampos = useMemo(() => {
        const term = campoSearchInput.trim().toLowerCase()
        if (!term) return campos

        return campos.filter((item) => {
            const codigo = item.codigo.toLowerCase()
            const etiqueta = item.etiqueta.toLowerCase()
            const tipo = tipoCampoMap.get(item.tipoCampoFormularioId)?.toLowerCase() ?? ''
            const valor = item.valorDefecto?.toLowerCase() ?? ''

            return (
                codigo.includes(term) ||
                etiqueta.includes(term) ||
                tipo.includes(term) ||
                valor.includes(term)
            )
        })
    }, [campos, campoSearchInput, tipoCampoMap])

    const campoSearchActive = campoSearchInput.trim().length > 0
    const showNoCampoSearchResults =
        campoSearchActive && filteredCampos.length === 0 && campos.length > 0

    useEffect(() => {
        setSelectedSeccion(null)
    }, [selectedFormulario?.id])

    useEffect(() => {
        if (!selectedFormulario || loadingFormularios) return

        const stillExists = formularios.some((item) => item.id === selectedFormulario.id)
        if (!stillExists) {
            setSelectedFormulario(formularios[0] ?? null)
        }
    }, [formularios, loadingFormularios, selectedFormulario])

    useEffect(() => {
        if (!selectedFormulario || loadingSecciones) return
        if (secciones.length === 0) {
            setSelectedSeccion(null)
            return
        }

        const updatedSeccion = secciones.find((item) => item.id === selectedSeccion?.id)
        if (!updatedSeccion) {
            setSelectedSeccion(secciones[0])
        }
    }, [secciones, loadingSecciones, selectedFormulario, selectedSeccion?.id])

    useEffect(() => {
        setCampoSearchInput('')
    }, [selectedSeccion?.id])

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
            codigo: values.codigo,
            nombre: values.nombre,
            descripcion: values.descripcion || '',
            version: values.version ?? 1,
            activo: values.activo ?? true,
        }

        if (editingFormulario) {
            await updateFormulario.mutateAsync({ id: editingFormulario.id, data: payload })
        } else {
            await createFormulario.mutateAsync(payload)
        }

        setFormularioDrawer(false)
    }

    const handleSeccionSubmit = async () => {
        if (!selectedFormulario) return
        const values = await seccionForm.validateFields()
        const payload = {
            formularioClinicoId: selectedFormulario.id,
            codigo: values.codigo,
            nombre: values.nombre,
            orden: values.orden,
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
            codigo: values.codigo,
            etiqueta: values.etiqueta,
            tipoCampoFormularioId: values.tipoCampoFormularioId,
            esRequerido: values.esRequerido ?? false,
            visible: editingCampo?.visible ?? true,
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
                campoColumnHelper.accessor('codigo', {
                    header: 'Código',
                    size: 120,
                    cell: ({ getValue }) => (
                        <Tooltip title={getValue()}>
                            <span className="formularios-view__cell-text">{getValue()}</span>
                        </Tooltip>
                    ),
                }),
                campoColumnHelper.accessor('etiqueta', {
                    header: 'Nombre',
                    cell: ({ getValue }) => (
                        <Tooltip title={getValue()}>
                            <span className="formularios-view__cell-text">{getValue()}</span>
                        </Tooltip>
                    ),
                }),
                campoColumnHelper.accessor('tipoCampoFormularioId', {
                    header: 'Valor',
                    size: 140,
                    cell: ({ row }) => {
                        const tipo = tipoCampoMap.get(row.original.tipoCampoFormularioId)
                        const defecto = row.original.valorDefecto

                        if (defecto) {
                            return (
                                <Tooltip title={defecto}>
                                    <span className="formularios-view__cell-text formularios-view__cell-text--muted">
                                        {defecto}
                                    </span>
                                </Tooltip>
                            )
                        }

                        return (
                            <Tooltip title={tipo ?? undefined}>
                                <span className="formularios-view__cell-text formularios-view__cell-text--muted">
                                    {tipo ?? '—'}
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
        [tipoCampoMap, deleteCampo, openCampoDrawer, openDuplicateCampoDrawer],
    )

    const recordCountLabel = `${campos.length} registro${campos.length === 1 ? '' : 's'}`
    const formularioDesc = selectedFormulario?.descripcion?.trim()

    const seccionTabItems = useMemo(
        () =>
            secciones.map((seccion) => ({
                key: seccion.id,
                label: (
                    <Tooltip title={seccion.nombre}>
                        <span className="formularios-view__tab-label">
                            <Text ellipsis className="formularios-view__tab-name">
                                {seccion.nombre}
                            </Text>
                        </span>
                    </Tooltip>
                ),
            })),
        [secciones],
    )

    return (
        <div className="module-object-page__panel catalogos-view catalogos-view--compact catalogos-view--erp formularios-view">
            <div className="catalogos-view__split">
                <aside className="catalogos-view__sidebar">
                    <div className="catalogos-view__sidebar-head">
                        <Flex align="center" gap={8} className="catalogos-view__sidebar-title">
                            <span className="catalogos-view__sidebar-icon" aria-hidden>
                                <FileTextOutlined />
                            </span>
                            <div className="catalogos-view__sidebar-title-text">
                                <Text strong className="catalogos-view__sidebar-label">
                                    Formularios
                                </Text>
                                <Text type="secondary" className="catalogos-view__sidebar-count">
                                    {formularios.length}
                                </Text>
                            </div>
                        </Flex>
                        <Button
                            type="primary"
                            size="small"
                            icon={<PlusOutlined />}
                            onClick={() => openFormularioDrawer()}
                        >
                            Nuevo
                        </Button>
                    </div>

                    <div className="formularios-view__sidebar-filters">
                        <Button
                            type="text"
                            size="small"
                            icon={<ArrowLeftOutlined />}
                            className="formularios-view__back-btn"
                            onClick={() =>
                                navigate({ to: '/atenciones/tipos-atencion' })
                            }
                        >
                            Tipos de atención
                        </Button>
                        {tipoAtencionLabel ? (
                            <Tag variant="filled" className="formularios-view__tipo-tag">
                                {tipoAtencionLabel}
                            </Tag>
                        ) : null}
                    </div>

                    <div className="catalogos-view__sidebar-search">
                        <Input
                            allowClear
                            size="small"
                            className="catalogos-view__search-input"
                            prefix={<SearchOutlined style={{ color: token.colorTextQuaternary }} />}
                            placeholder="Buscar formulario…"
                            value={formularioSearchInput}
                            onChange={(event) => setFormularioSearchInput(event.target.value)}
                            onClear={() => setFormularioSearchInput('')}
                        />
                    </div>

                    <div className="catalogos-view__sidebar-body">
                        {!loadingFormularios && filteredFormularios.length === 0 ? (
                            <PanelEmpty
                                icon={<FolderOpenOutlined />}
                                title="Sin formularios"
                                description={
                                    formularioSearchInput
                                        ? 'No se encontraron formularios con ese criterio.'
                                        : 'Cree un formulario con el botón Nuevo para comenzar.'
                                }
                            />
                        ) : (
                            <div className="catalogos-grupos-list catalogos-grupos-list--compact">
                                <div
                                    className="catalogos-grupos-list__items"
                                    role="listbox"
                                    aria-label="Formularios clínicos"
                                >
                                    {loadingFormularios
                                        ? Array.from({ length: 6 }).map((_, index) => (
                                              <div
                                                  key={index}
                                                  className="catalogos-grupos-list__skeleton"
                                              >
                                                  <Skeleton.Input
                                                      active
                                                      size="small"
                                                      style={{ width: '100%' }}
                                                  />
                                              </div>
                                          ))
                                        : filteredFormularios.map((formulario) => {
                                              const isSelected =
                                                  selectedFormulario?.id === formulario.id

                                              return (
                                                  <div
                                                      key={formulario.id}
                                                      role="option"
                                                      aria-selected={isSelected}
                                                      tabIndex={0}
                                                      className={[
                                                          'catalogos-grupos-list__item',
                                                          isSelected
                                                              ? 'catalogos-grupos-list__item--selected'
                                                              : '',
                                                      ]
                                                          .filter(Boolean)
                                                          .join(' ')}
                                                      onClick={() => setSelectedFormulario(formulario)}
                                                      onKeyDown={(event) => {
                                                          if (
                                                              event.key === 'Enter' ||
                                                              event.key === ' '
                                                          ) {
                                                              event.preventDefault()
                                                              setSelectedFormulario(formulario)
                                                          }
                                                      }}
                                                  >
                                                      <Tooltip
                                                          title={formulario.nombre}
                                                          placement="right"
                                                          mouseEnterDelay={0.35}
                                                      >
                                                          <div className="catalogos-grupos-list__item-content">
                                                              <Text
                                                                  strong={isSelected}
                                                                  className="catalogos-grupos-list__item-name"
                                                                  ellipsis={{ tooltip: false }}
                                                              >
                                                                  {formulario.nombre}
                                                              </Text>
                                                              <Tag
                                                                  variant="filled"
                                                                  className="formularios-view__item-tag"
                                                              >
                                                                  {formulario.codigo}
                                                              </Tag>
                                                          </div>
                                                      </Tooltip>

                                                      <Flex
                                                          align="center"
                                                          gap={2}
                                                          className="catalogos-grupos-list__item-actions"
                                                          onClick={stopPropagation}
                                                          onKeyDown={stopPropagation}
                                                      >
                                                          <Tooltip title="Editar">
                                                              <Button
                                                                  type="text"
                                                                  size="small"
                                                                  icon={<EditOutlined />}
                                                                  aria-label={`Editar ${formulario.nombre}`}
                                                                  onClick={() =>
                                                                      openFormularioDrawer(formulario)
                                                                  }
                                                              />
                                                          </Tooltip>
                                                          <Popconfirm
                                                              title="¿Eliminar formulario?"
                                                              onConfirm={() => {
                                                                  deleteFormulario.mutate(
                                                                      formulario.id,
                                                                  )
                                                                  if (
                                                                      selectedFormulario?.id ===
                                                                      formulario.id
                                                                  ) {
                                                                      setSelectedFormulario(null)
                                                                  }
                                                              }}
                                                          >
                                                              <Tooltip title="Eliminar">
                                                                  <Button
                                                                      type="text"
                                                                      size="small"
                                                                      danger
                                                                      icon={<DeleteOutlined />}
                                                                      aria-label={`Eliminar ${formulario.nombre}`}
                                                                  />
                                                              </Tooltip>
                                                          </Popconfirm>
                                                      </Flex>
                                                  </div>
                                              )
                                          })}
                                </div>
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
                            <div className="formularios-view__context-bar">
                                <Tag variant="filled" className="formularios-view__context-code">
                                    {selectedFormulario.codigo}
                                </Tag>
                                <div className="formularios-view__context-text">
                                    <Tooltip title={selectedFormulario.nombre}>
                                        <Text
                                            strong
                                            className="formularios-view__context-name"
                                            ellipsis={{ tooltip: false }}
                                        >
                                            {selectedFormulario.nombre}
                                        </Text>
                                    </Tooltip>
                                    {formularioDesc ? (
                                        <Tooltip title={formularioDesc}>
                                            <Text
                                                type="secondary"
                                                className="formularios-view__context-desc"
                                                ellipsis={{ tooltip: false }}
                                            >
                                                {formularioDesc}
                                            </Text>
                                        </Tooltip>
                                    ) : (
                                        <Text type="secondary" className="formularios-view__context-desc">
                                            v{selectedFormulario.version}
                                        </Text>
                                    )}
                                </div>
                            </div>

                            <div className="formularios-view__tabs-wrap">
                                {loadingSecciones && secciones.length === 0 ? (
                                    <Skeleton.Input active size="small" style={{ width: 240 }} />
                                ) : (
                                    <Tabs
                                        size="small"
                                        type="line"
                                        className="formularios-view__tabs"
                                        activeKey={selectedSeccion?.id}
                                        onChange={(key) => {
                                            const seccion = secciones.find((item) => item.id === key)
                                            if (seccion) setSelectedSeccion(seccion)
                                        }}
                                        items={seccionTabItems}
                                        tabBarExtraContent={
                                            <Flex align="center" gap={4} className="formularios-view__tabs-extra">
                                                {selectedSeccion ? (
                                                    <>
                                                        <Tooltip title="Editar sección">
                                                            <Button
                                                                type="text"
                                                                size="small"
                                                                icon={<EditOutlined />}
                                                                onClick={() =>
                                                                    openSeccionDrawer(selectedSeccion)
                                                                }
                                                            />
                                                        </Tooltip>
                                                        <Popconfirm
                                                            title="¿Eliminar sección?"
                                                            onConfirm={() => {
                                                                deleteSeccion.mutate(selectedSeccion.id)
                                                                setSelectedSeccion(null)
                                                            }}
                                                        >
                                                            <Tooltip title="Eliminar sección">
                                                                <Button
                                                                    type="text"
                                                                    size="small"
                                                                    danger
                                                                    icon={<DeleteOutlined />}
                                                                />
                                                            </Tooltip>
                                                        </Popconfirm>
                                                    </>
                                                ) : null}
                                                <Button
                                                    size="small"
                                                    type="link"
                                                    icon={<PlusOutlined />}
                                                    onClick={() => openSeccionDrawer()}
                                                >
                                                    Sección
                                                </Button>
                                            </Flex>
                                        }
                                    />
                                )}
                            </div>

                            <div className="formularios-view__action-bar">
                                <Input
                                    allowClear
                                    size="small"
                                    className="formularios-view__action-search catalogos-view__search-input"
                                    prefix={
                                        <SearchOutlined
                                            style={{ color: token.colorTextQuaternary }}
                                        />
                                    }
                                    placeholder="Buscar en campos…"
                                    value={campoSearchInput}
                                    onChange={(event) => setCampoSearchInput(event.target.value)}
                                    onClear={() => setCampoSearchInput('')}
                                    disabled={!selectedSeccion}
                                />
                                <span className="formularios-view__action-count">
                                    {recordCountLabel}
                                </span>
                                <Button
                                    type="primary"
                                    size="small"
                                    icon={<PlusOutlined />}
                                    disabled={!selectedSeccion}
                                    onClick={() => openCampoDrawer()}
                                >
                                    Nuevo registro
                                </Button>
                            </div>

                            <div className="catalogos-view__main-body">
                                {!selectedSeccion ? (
                                    <PanelEmpty
                                        icon={<UnorderedListOutlined />}
                                        title={
                                            secciones.length === 0
                                                ? 'Sin secciones'
                                                : 'Seleccione una sección'
                                        }
                                        description={
                                            secciones.length === 0
                                                ? 'Agregue la primera sección para definir campos del formulario.'
                                                : 'Elija una sección de la franja superior para ver sus campos.'
                                        }
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
                                        title="Sin registros"
                                        description="Agregue el primer campo con el botón Nuevo registro."
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
                    ) : (
                        <div className="catalogos-view__main-empty">
                            <PanelEmpty
                                icon={<FolderOpenOutlined />}
                                title="Seleccione un formulario"
                                description="Elija un formulario del panel izquierdo para administrar secciones y campos."
                            />
                        </div>
                    )}
                </main>
            </div>

            <Drawer
                title={editingFormulario ? 'Editar formulario' : 'Nuevo formulario'}
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
                            options={tiposData?.items.map((t) => ({
                                value: t.id,
                                label: `${t.codigo} — ${t.nombre}`,
                            }))}
                        />
                    </Form.Item>
                    <Row gutter={8}>
                        <Col span={12}>
                            <Form.Item name="codigo" label="Código" rules={[{ required: true }]}>
                                <Input autoFocus={!editingFormulario} />
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
                                <Input autoFocus={!editingSeccion} />
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
                                <Input autoFocus={!editingCampo} />
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
                    <Form.Item name="esRequerido" label="Requerido" valuePropName="checked">
                        <Switch size="small" />
                    </Form.Item>
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
