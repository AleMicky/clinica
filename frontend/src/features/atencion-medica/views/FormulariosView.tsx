import { useEffect, useMemo, useState, type KeyboardEvent, type MouseEvent } from 'react'
import {
    createColumnHelper,
    type ColumnDef,
} from '@tanstack/react-table'
import {
    Button,
    Col,
    Drawer,
    Flex,
    Form,
    Input,
    InputNumber,
    Popconfirm,
    Row,
    Select,
    Skeleton,
    Space,
    Switch,
    Tooltip,
    Typography,
    theme,
} from 'antd'
import {
    DeleteOutlined,
    EditOutlined,
    FileTextOutlined,
    FolderOpenOutlined,
    PlusOutlined,
    SearchOutlined,
    UnorderedListOutlined,
} from '@ant-design/icons'

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

export function FormulariosView() {
    const { token } = theme.useToken()

    const [tipoAtencionId, setTipoAtencionId] = useState<string>()
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

    const formularios = formulariosData?.items ?? []
    const secciones = seccionesData?.items ?? []
    const campos = camposData?.items ?? []

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
                }),
                campoColumnHelper.accessor('etiqueta', {
                    header: 'Nombre',
                }),
                campoColumnHelper.accessor('tipoCampoFormularioId', {
                    header: 'Valor',
                    size: 140,
                    cell: ({ row }) => {
                        const tipo = tipoCampoMap.get(row.original.tipoCampoFormularioId)
                        const defecto = row.original.valorDefecto

                        if (defecto) {
                            return (
                                <Tooltip title={tipo ?? undefined}>
                                    <Text ellipsis style={{ maxWidth: 140, fontSize: 12.5 }}>
                                        {defecto}
                                    </Text>
                                </Tooltip>
                            )
                        }

                        return (
                            <Text type="secondary" ellipsis style={{ maxWidth: 140, fontSize: 12.5 }}>
                                {tipo ?? '—'}
                            </Text>
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
                    header: 'Acciones',
                    size: 72,
                    meta: { align: 'right', headerAlign: 'right' },
                    cell: ({ row }) => (
                        <Space size={0}>
                            <Button
                                type="text"
                                size="small"
                                icon={<EditOutlined />}
                                aria-label={`Editar ${row.original.etiqueta}`}
                                onClick={() => openCampoDrawer(row.original)}
                            />
                            <Popconfirm
                                title="¿Eliminar campo?"
                                onConfirm={() => deleteCampo.mutate(row.original.id)}
                            >
                                <Button
                                    type="text"
                                    size="small"
                                    danger
                                    icon={<DeleteOutlined />}
                                    aria-label={`Eliminar ${row.original.etiqueta}`}
                                />
                            </Popconfirm>
                        </Space>
                    ),
                }),
            ] as ColumnDef<FormularioCampo, unknown>[],
        [tipoCampoMap, deleteCampo],
    )

    const recordCountLabel = `${campos.length} registro${campos.length === 1 ? '' : 's'}`
    const formularioDesc = selectedFormulario?.descripcion?.trim()
    const seccionDesc = selectedFormulario
        ? `${selectedFormulario.nombre} · v${selectedFormulario.version}`
        : ''

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
                        <Select
                            allowClear
                            size="small"
                            placeholder="Tipo de atención"
                            className="formularios-view__tipo-select"
                            value={tipoAtencionId}
                            onChange={setTipoAtencionId}
                            options={tiposData?.items.map((t) => ({
                                value: t.id,
                                label: `${t.codigo} — ${t.nombre}`,
                            }))}
                        />
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
                                    formularioSearchInput || tipoAtencionId
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
                                                          title={
                                                              formulario.descripcion || undefined
                                                          }
                                                          placement="right"
                                                          mouseEnterDelay={0.4}
                                                      >
                                                          <div className="catalogos-grupos-list__item-content">
                                                              <Text
                                                                  strong={isSelected}
                                                                  className="catalogos-grupos-list__item-name"
                                                                  ellipsis
                                                              >
                                                                  {formulario.nombre}
                                                              </Text>
                                                              <code className="catalogos-grupos-list__item-code">
                                                                  {formulario.codigo}
                                                              </code>
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
                            <div className="formularios-view__detail-head">
                                <div className="formularios-view__detail-head-main">
                                    {selectedSeccion ? (
                                        <>
                                            <span className="catalogos-view__catalog-badge">
                                                {selectedSeccion.codigo}
                                            </span>
                                            <Text
                                                strong
                                                className="formularios-view__detail-name"
                                                ellipsis
                                            >
                                                {selectedSeccion.nombre}
                                            </Text>
                                            <Text
                                                type="secondary"
                                                className="formularios-view__detail-desc"
                                                ellipsis
                                            >
                                                {formularioDesc || seccionDesc}
                                            </Text>
                                        </>
                                    ) : (
                                        <>
                                            <span className="catalogos-view__catalog-badge">
                                                {selectedFormulario.codigo}
                                            </span>
                                            <Text
                                                strong
                                                className="formularios-view__detail-name"
                                                ellipsis
                                            >
                                                {selectedFormulario.nombre}
                                            </Text>
                                            <Text
                                                type="secondary"
                                                className="formularios-view__detail-desc"
                                                ellipsis
                                            >
                                                {formularioDesc || `Versión ${selectedFormulario.version}`}
                                            </Text>
                                        </>
                                    )}
                                    <span className="catalogos-view__catalog-count">
                                        {recordCountLabel}
                                    </span>
                                </div>

                                <Flex align="center" gap={8} className="formularios-view__detail-actions">
                                    {selectedSeccion ? (
                                        <>
                                            <Tooltip title="Editar sección">
                                                <Button
                                                    type="text"
                                                    size="small"
                                                    icon={<EditOutlined />}
                                                    onClick={() => openSeccionDrawer(selectedSeccion)}
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
                                        type="primary"
                                        size="small"
                                        icon={<PlusOutlined />}
                                        disabled={!selectedSeccion}
                                        onClick={() => openCampoDrawer()}
                                    >
                                        Nuevo registro
                                    </Button>
                                </Flex>
                            </div>

                            <div className="formularios-view__secciones-strip">
                                <div
                                    className="formularios-view__secciones-scroll"
                                    role="tablist"
                                    aria-label="Secciones del formulario"
                                >
                                    {loadingSecciones && secciones.length === 0 ? (
                                        <Skeleton.Input active size="small" style={{ width: 180 }} />
                                    ) : (
                                        secciones.map((seccion) => {
                                            const isActive = selectedSeccion?.id === seccion.id

                                            return (
                                                <button
                                                    key={seccion.id}
                                                    type="button"
                                                    role="tab"
                                                    aria-selected={isActive}
                                                    className={[
                                                        'formularios-view__seccion-tab',
                                                        isActive
                                                            ? 'formularios-view__seccion-tab--active'
                                                            : '',
                                                    ]
                                                        .filter(Boolean)
                                                        .join(' ')}
                                                    onClick={() => setSelectedSeccion(seccion)}
                                                >
                                                    <Text ellipsis className="formularios-view__seccion-tab-label">
                                                        {seccion.nombre}
                                                    </Text>
                                                    <code className="formularios-view__seccion-tab-code">
                                                        {seccion.codigo}
                                                    </code>
                                                </button>
                                            )
                                        })
                                    )}
                                </div>
                                <Button
                                    size="small"
                                    type="dashed"
                                    icon={<PlusOutlined />}
                                    className="formularios-view__seccion-add"
                                    onClick={() => openSeccionDrawer()}
                                >
                                    Sección
                                </Button>
                            </div>

                            <div className="catalogos-view__items-toolbar">
                                <Input
                                    allowClear
                                    size="small"
                                    className="catalogos-view__search-input"
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
                width={420}
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
                width={400}
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
                width={440}
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
