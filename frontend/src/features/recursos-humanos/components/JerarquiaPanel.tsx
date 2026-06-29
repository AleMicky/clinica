import { useEffect, useMemo, useState } from 'react'
import {
    Breadcrumb,
    Button,
    Col,
    Empty,
    Flex,
    Grid,
    Input,
    Row,
    Tabs,
    Typography,
    theme,
} from 'antd'
import {
    ApartmentOutlined,
    ArrowLeftOutlined,
    BankOutlined,
    ExperimentOutlined,
    NodeIndexOutlined,
    PlusOutlined,
    SearchOutlined,
} from '@ant-design/icons'

import { CatalogoBaseFormModal } from '../../catalogo-clinico/components/CatalogoBaseFormModal'
import { DepartamentoFormModal } from '../../catalogo-clinico/components/DepartamentoFormModal'
import { HierarchyList } from '../../catalogo-clinico/components/HierarchyList'
import { ServicioFormModal } from '../../catalogo-clinico/components/ServicioFormModal'
import {
    useCreateArea,
    useCreateDepartamento,
    useCreateServicio,
    useDeleteArea,
    useDeleteDepartamento,
    useDeleteServicio,
    useUpdateArea,
    useUpdateDepartamento,
    useUpdateServicio,
} from '../../catalogo-clinico/hooks/catalogo-clinico.hooks'
import type {
    CatalogoBaseFormValues,
    DepartamentoFormValues,
    ServicioFormValues,
} from '../../catalogo-clinico/schemas/catalogo-clinico.schema'
import type { Area, Departamento, Servicio } from '../../catalogo-clinico/types/catalogo-clinico.types'
import { useJerarquiaOrganizacional } from '../hooks/jerarquia.hooks'
import type {
    JerarquiaAreaNode,
    JerarquiaDepartamentoNode,
    JerarquiaServicioNode,
} from '../types/jerarquia.types'

const { Text, Paragraph } = Typography
const { useBreakpoint } = Grid

const DEFAULT_PAGE_SIZE = 15

type HierarchyStep = 'area' | 'detail'
type DetailTab = 'departamentos' | 'servicios'

function toArea(node: JerarquiaAreaNode): Area {
    return {
        id: node.id,
        codigo: node.codigo,
        nombre: node.nombre,
        descripcion: node.descripcion || null,
    }
}

function toDepartamento(node: JerarquiaDepartamentoNode, areaNombre: string): Departamento {
    return {
        id: node.id,
        areaId: node.areaId,
        areaNombre,
        codigo: node.codigo,
        nombre: node.nombre,
        descripcion: node.descripcion || null,
    }
}

function toServicio(node: JerarquiaServicioNode, departamentoNombre: string): Servicio {
    return {
        id: node.id,
        departamentoId: node.departamentoId,
        departamentoNombre,
        codigo: node.codigo,
        nombre: node.nombre,
        descripcion: node.descripcion || null,
    }
}

function formatEmpleadosMeta(count?: number | null) {
    if (count == null) return undefined
    return `${count} empleado${count === 1 ? '' : 's'}`
}

function toBasePayload(values: CatalogoBaseFormValues) {
    return {
        codigo: values.codigo,
        nombre: values.nombre,
        descripcion: values.descripcion?.trim() || '',
    }
}

function filterBySearch<T extends { codigo: string; nombre: string }>(
    items: T[],
    search: string,
) {
    const query = search.trim().toLowerCase()
    if (!query) return items

    return items.filter(
        (item) =>
            item.nombre.toLowerCase().includes(query) ||
            item.codigo.toLowerCase().includes(query),
    )
}

export function JerarquiaPanel() {
    const { token } = theme.useToken()
    const screens = useBreakpoint()
    const isMobile = !screens.lg

    const [areaPage, setAreaPage] = useState(1)
    const [areaSearchInput, setAreaSearchInput] = useState('')
    const [areaSearch, setAreaSearch] = useState('')
    const [deptSearch, setDeptSearch] = useState('')
    const [servicioSearch, setServicioSearch] = useState('')

    const [selectedArea, setSelectedArea] = useState<Area | null>(null)
    const [selectedDept, setSelectedDept] = useState<Departamento | null>(null)
    const [detailTab, setDetailTab] = useState<DetailTab>('departamentos')

    const [areaModalOpen, setAreaModalOpen] = useState(false)
    const [editingArea, setEditingArea] = useState<Area | null>(null)
    const [deptModalOpen, setDeptModalOpen] = useState(false)
    const [editingDept, setEditingDept] = useState<Departamento | null>(null)
    const [servicioModalOpen, setServicioModalOpen] = useState(false)
    const [editingServicio, setEditingServicio] = useState<Servicio | null>(null)

    const [deletingAreaId, setDeletingAreaId] = useState<string | null>(null)
    const [deletingDeptId, setDeletingDeptId] = useState<string | null>(null)
    const [deletingServicioId, setDeletingServicioId] = useState<string | null>(null)

    const { data: jerarquia, isFetching: loadingJerarquia } = useJerarquiaOrganizacional(true)

    const createArea = useCreateArea()
    const updateArea = useUpdateArea()
    const deleteArea = useDeleteArea()
    const createDept = useCreateDepartamento()
    const updateDept = useUpdateDepartamento()
    const deleteDept = useDeleteDepartamento()
    const createServicio = useCreateServicio()
    const updateServicio = useUpdateServicio()
    const deleteServicio = useDeleteServicio()

    const areaNodes = jerarquia?.areas ?? []

    const areaNodesById = useMemo(
        () => new Map(areaNodes.map((area) => [area.id, area])),
        [areaNodes],
    )

    const allAreas = useMemo(() => areaNodes.map(toArea), [areaNodes])
    const areaOptions = allAreas

    const selectedAreaNode = selectedArea
        ? areaNodesById.get(selectedArea.id) ?? null
        : null

    const departamentos = useMemo(
        () =>
            selectedAreaNode
                ? selectedAreaNode.departamentos.map((dept) =>
                      toDepartamento(dept, selectedAreaNode.nombre),
                  )
                : [],
        [selectedAreaNode],
    )

    const selectedDeptNode = useMemo(
        () =>
            selectedDept && selectedAreaNode
                ? selectedAreaNode.departamentos.find(
                      (dept) => dept.id === selectedDept.id,
                  ) ?? null
                : null,
        [selectedDept, selectedAreaNode],
    )

    const servicios = useMemo(
        () =>
            selectedDeptNode
                ? selectedDeptNode.servicios.map((servicio) =>
                      toServicio(servicio, selectedDeptNode.nombre),
                  )
                : [],
        [selectedDeptNode],
    )

    const filteredAreas = useMemo(
        () => filterBySearch(allAreas, areaSearch),
        [allAreas, areaSearch],
    )

    const displayAreas = useMemo(() => {
        if (areaSearch) return filteredAreas

        const start = (areaPage - 1) * DEFAULT_PAGE_SIZE
        return filteredAreas.slice(start, start + DEFAULT_PAGE_SIZE)
    }, [filteredAreas, areaSearch, areaPage])

    const totalAreas = filteredAreas.length
    const loadingAreas = loadingJerarquia
    const loadingDepts = loadingJerarquia
    const loadingServicios = loadingJerarquia

    const filteredDepartamentos = useMemo(
        () => filterBySearch(departamentos, deptSearch),
        [departamentos, deptSearch],
    )

    const filteredServicios = useMemo(
        () => filterBySearch(servicios, servicioSearch),
        [servicios, servicioSearch],
    )

    const areaListItems = useMemo(
        () =>
            displayAreas.map((area) => ({
                ...area,
                meta: formatEmpleadosMeta(areaNodesById.get(area.id)?.empleadosCount),
            })),
        [displayAreas, areaNodesById],
    )

    const departamentoListItems = useMemo(
        () =>
            filteredDepartamentos.map((dept) => {
                const node = selectedAreaNode?.departamentos.find(
                    (item) => item.id === dept.id,
                )

                return {
                    ...dept,
                    meta: formatEmpleadosMeta(node?.empleadosCount),
                }
            }),
        [filteredDepartamentos, selectedAreaNode],
    )

    const servicioListItems = useMemo(
        () =>
            filteredServicios.map((servicio) => {
                const node = selectedDeptNode?.servicios.find(
                    (item) => item.id === servicio.id,
                )

                return {
                    ...servicio,
                    meta: formatEmpleadosMeta(node?.empleadosCount),
                }
            }),
        [filteredServicios, selectedDeptNode],
    )

    useEffect(() => {
        setSelectedDept(null)
        setDeptSearch('')
        setServicioSearch('')
        setDetailTab('departamentos')
    }, [selectedArea?.id])

    useEffect(() => {
        setServicioSearch('')
    }, [selectedDept?.id])

    useEffect(() => {
        const timer = window.setTimeout(() => {
            setAreaSearch(areaSearchInput.trim())
        }, 300)

        return () => window.clearTimeout(timer)
    }, [areaSearchInput])

    const isSavingArea = createArea.isPending || updateArea.isPending
    const isSavingDept = createDept.isPending || updateDept.isPending
    const isSavingServicio = createServicio.isPending || updateServicio.isPending

    const mobileStep = useMemo<HierarchyStep>(
        () => (selectedArea ? 'detail' : 'area'),
        [selectedArea],
    )

    const handleMobileBack = () => {
        setSelectedArea(null)
        setSelectedDept(null)
    }

    const showMobilePanel = (step: HierarchyStep) => !isMobile || mobileStep === step

    const handleAreaSubmit = async (values: CatalogoBaseFormValues) => {
        const payload = toBasePayload(values)

        if (editingArea) {
            await updateArea.mutateAsync({ id: editingArea.id, data: payload })
        } else {
            await createArea.mutateAsync(payload)
        }

        setAreaModalOpen(false)
        setEditingArea(null)
    }

    const handleDeptSubmit = async (values: DepartamentoFormValues) => {
        const payload = {
            ...toBasePayload(values),
            areaId: values.areaId,
        }

        if (editingDept) {
            await updateDept.mutateAsync({ id: editingDept.id, data: payload })
        } else {
            await createDept.mutateAsync(payload)
        }

        setDeptModalOpen(false)
        setEditingDept(null)
    }

    const handleServicioSubmit = async (values: ServicioFormValues) => {
        const payload = {
            ...toBasePayload(values),
            departamentoId: values.departamentoId,
        }

        if (editingServicio) {
            await updateServicio.mutateAsync({ id: editingServicio.id, data: payload })
        } else {
            await createServicio.mutateAsync(payload)
        }

        setServicioModalOpen(false)
        setEditingServicio(null)
    }

    const renderAreaMaster = () => (
        <section className="catalogos-view__panel catalogos-view__panel--master jerarquia-rrhh__master">
            <div className="catalogos-view__panel-toolbar">
                <div>
                    <Text strong>Áreas</Text>
                    <Text type="secondary" className="catalogos-view__panel-caption">
                        {totalAreas} registrada{totalAreas === 1 ? '' : 's'}
                    </Text>
                </div>
                <Button
                    type="primary"
                    size="small"
                    icon={<PlusOutlined />}
                    onClick={() => {
                        setEditingArea(null)
                        setAreaModalOpen(true)
                    }}
                >
                    Nueva
                </Button>
            </div>

            <div className="catalogos-view__panel-search">
                <Input
                    allowClear
                    prefix={<SearchOutlined style={{ color: token.colorTextQuaternary }} />}
                    placeholder="Buscar área…"
                    value={areaSearchInput}
                    onChange={(event) => setAreaSearchInput(event.target.value)}
                    onClear={() => {
                        setAreaSearchInput('')
                        setAreaSearch('')
                    }}
                />
            </div>

            <HierarchyList
                items={areaListItems}
                loading={loadingAreas}
                total={totalAreas}
                page={areaSearch ? 1 : areaPage}
                pageSize={DEFAULT_PAGE_SIZE}
                selectedId={selectedArea?.id ?? null}
                emptyText={
                    areaSearch
                        ? 'No hay áreas que coincidan con la búsqueda.'
                        : 'Cree la primera área.'
                }
                icon={<BankOutlined />}
                onPageChange={
                    areaSearch
                        ? undefined
                        : (page) => {
                              setAreaPage(page)
                              setAreaSearchInput('')
                              setAreaSearch('')
                          }
                }
                onSelect={(item) =>
                    setSelectedArea(
                        allAreas.find((area) => area.id === item.id) ?? null,
                    )
                }
                onEdit={(item) => {
                    setEditingArea(
                        allAreas.find((area) => area.id === item.id) ?? null,
                    )
                    setAreaModalOpen(true)
                }}
                onDelete={async (item) => {
                    setDeletingAreaId(item.id)
                    try {
                        await deleteArea.mutateAsync(item.id)
                        if (selectedArea?.id === item.id) {
                            setSelectedArea(null)
                        }
                    } finally {
                        setDeletingAreaId(null)
                    }
                }}
                deletingId={deletingAreaId}
            />
        </section>
    )

    const renderDetailEmpty = () => (
        <div className="catalogos-view__empty jerarquia-rrhh__empty">
            <div className="catalogos-view__empty-visual" aria-hidden>
                <div className="catalogos-view__empty-icon">
                    <NodeIndexOutlined />
                </div>
                <div className="catalogos-view__empty-ring" />
            </div>
            <Empty
                image={false}
                description={
                    <Flex vertical gap={6} align="center">
                        <Text strong style={{ fontSize: 16 }}>
                            Seleccione un área
                        </Text>
                        <Paragraph
                            type="secondary"
                            style={{ marginBottom: 0, maxWidth: 360, textAlign: 'center' }}
                        >
                            Elija un área en el panel izquierdo para administrar sus
                            departamentos y servicios.
                        </Paragraph>
                    </Flex>
                }
            />
        </div>
    )

    const renderDepartamentosPanel = () => (
        <section className="jerarquia-rrhh__subpanel jerarquia-rrhh__subpanel--flat">
            <div className="jerarquia-rrhh__subpanel-search">
                <Input
                    allowClear
                    size="small"
                    prefix={<SearchOutlined style={{ color: token.colorTextQuaternary }} />}
                    placeholder="Buscar departamento…"
                    value={deptSearch}
                    onChange={(event) => setDeptSearch(event.target.value)}
                />
            </div>

            <HierarchyList
                items={departamentoListItems}
                loading={loadingDepts}
                selectedId={selectedDept?.id ?? null}
                emptyText={
                    deptSearch
                        ? 'Sin coincidencias.'
                        : 'Sin departamentos en esta área.'
                }
                icon={<ApartmentOutlined />}
                onSelect={(item) => {
                    const dept =
                        departamentos.find(
                            (departamento) => departamento.id === item.id,
                        ) ?? null
                    setSelectedDept(dept)
                    if (dept && isMobile) {
                        setDetailTab('servicios')
                    }
                }}
                onEdit={(item) => {
                    setEditingDept(
                        departamentos.find((departamento) => departamento.id === item.id) ??
                            null,
                    )
                    setDeptModalOpen(true)
                }}
                onDelete={async (item) => {
                    setDeletingDeptId(item.id)
                    try {
                        await deleteDept.mutateAsync(item.id)
                        if (selectedDept?.id === item.id) {
                            setSelectedDept(null)
                        }
                    } finally {
                        setDeletingDeptId(null)
                    }
                }}
                deletingId={deletingDeptId}
            />
        </section>
    )

    const renderServiciosPanel = () => (
        <section className="jerarquia-rrhh__subpanel jerarquia-rrhh__subpanel--flat">
            {selectedDept ? (
                <>
                    <div className="jerarquia-rrhh__subpanel-context">
                        <Text type="secondary">Departamento:</Text>
                        <Text strong>{selectedDept.nombre}</Text>
                        <Button
                            type="link"
                            size="small"
                            onClick={() => {
                                setSelectedDept(null)
                                setDetailTab('departamentos')
                            }}
                        >
                            Cambiar
                        </Button>
                    </div>

                    <div className="jerarquia-rrhh__subpanel-search">
                        <Input
                            allowClear
                            size="small"
                            prefix={
                                <SearchOutlined
                                    style={{ color: token.colorTextQuaternary }}
                                />
                            }
                            placeholder="Buscar servicio…"
                            value={servicioSearch}
                            onChange={(event) => setServicioSearch(event.target.value)}
                        />
                    </div>

                    <HierarchyList
                        items={servicioListItems}
                        loading={loadingServicios}
                        selectedId={null}
                        emptyText={
                            servicioSearch
                                ? 'Sin coincidencias.'
                                : 'Sin servicios en este departamento.'
                        }
                        icon={<ExperimentOutlined />}
                        onSelect={() => {}}
                        onEdit={(item) => {
                            setEditingServicio(
                                servicios.find((servicio) => servicio.id === item.id) ??
                                    null,
                            )
                            setServicioModalOpen(true)
                        }}
                        onDelete={async (item) => {
                            setDeletingServicioId(item.id)
                            try {
                                await deleteServicio.mutateAsync(item.id)
                            } finally {
                                setDeletingServicioId(null)
                            }
                        }}
                        deletingId={deletingServicioId}
                    />
                </>
            ) : (
                <div className="jerarquia-rrhh__subpanel-placeholder">
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="Seleccione un departamento en la pestaña anterior"
                    />
                </div>
            )}
        </section>
    )

    const renderDetail = () => {
        if (!selectedArea) return renderDetailEmpty()

        const tabItems = [
            {
                key: 'departamentos',
                label: (
                    <Flex align="center" gap={6}>
                        <ApartmentOutlined />
                        <span>Departamentos</span>
                        <Text type="secondary" className="jerarquia-rrhh__tab-count">
                            {departamentos.length}
                        </Text>
                    </Flex>
                ),
                children: renderDepartamentosPanel(),
            },
            {
                key: 'servicios',
                label: (
                    <Flex align="center" gap={6}>
                        <ExperimentOutlined />
                        <span>Servicios</span>
                        {selectedDept ? (
                            <Text type="secondary" className="jerarquia-rrhh__tab-count">
                                {servicios.length}
                            </Text>
                        ) : null}
                    </Flex>
                ),
                children: renderServiciosPanel(),
            },
        ]

        return (
            <>
                <div className="jerarquia-rrhh__detail-head">
                    <Flex align="center" gap={10} wrap="wrap" className="jerarquia-rrhh__detail-title">
                        <BankOutlined className="jerarquia-rrhh__detail-icon" />
                        <div>
                            <Flex align="center" gap={8} wrap="wrap">
                                <Text strong className="jerarquia-rrhh__detail-name">
                                    {selectedArea.nombre}
                                </Text>
                                <code className="catalogos-view__detail-code">
                                    {selectedArea.codigo}
                                </code>
                            </Flex>
                            {selectedArea.descripcion ? (
                                <Paragraph
                                    type="secondary"
                                    className="jerarquia-rrhh__detail-description"
                                >
                                    {selectedArea.descripcion}
                                </Paragraph>
                            ) : null}
                        </div>
                    </Flex>

                    <Flex gap={8} wrap="wrap" className="jerarquia-rrhh__detail-actions">
                        <Button
                            size="small"
                            icon={<PlusOutlined />}
                            onClick={() => {
                                setEditingDept(null)
                                setDeptModalOpen(true)
                            }}
                        >
                            Departamento
                        </Button>
                        <Button
                            type="primary"
                            size="small"
                            icon={<PlusOutlined />}
                            disabled={!selectedDept}
                            onClick={() => {
                                setEditingServicio(null)
                                setServicioModalOpen(true)
                            }}
                        >
                            Servicio
                        </Button>
                    </Flex>
                </div>

                <div className="jerarquia-rrhh__detail-body">
                    <Tabs
                        activeKey={detailTab}
                        onChange={(key) => setDetailTab(key as DetailTab)}
                        items={tabItems}
                        className="jerarquia-rrhh__tabs"
                    />
                </div>
            </>
        )
    }

    return (
        <div className="jerarquia-rrhh">
            {isMobile ? (
                <div className="jerarquia-rrhh__mobile-nav">
                    {mobileStep !== 'area' ? (
                        <Button
                            type="text"
                            size="small"
                            icon={<ArrowLeftOutlined />}
                            onClick={handleMobileBack}
                        >
                            Áreas
                        </Button>
                    ) : null}

                    <Breadcrumb
                        items={[
                            {
                                title: (
                                    <button
                                        type="button"
                                        className="jerarquia-rrhh__crumb"
                                        onClick={() => {
                                            setSelectedArea(null)
                                            setSelectedDept(null)
                                        }}
                                    >
                                        Áreas
                                    </button>
                                ),
                            },
                            ...(selectedArea
                                ? [{ title: selectedArea.nombre }]
                                : []),
                        ]}
                    />
                </div>
            ) : null}

            <Row gutter={[20, 20]} className="catalogos-view__master-detail">
                {showMobilePanel('area') ? (
                    <Col xs={24} lg={9} xl={8}>
                        {renderAreaMaster()}
                    </Col>
                ) : null}

                {(!isMobile || mobileStep !== 'area') ? (
                    <Col xs={24} lg={15} xl={16}>
                        <section
                            className={[
                                'catalogos-view__panel',
                                'catalogos-view__panel--detail',
                                selectedArea ? 'catalogos-view__panel--active' : '',
                            ]
                                .filter(Boolean)
                                .join(' ')}
                        >
                            {renderDetail()}
                        </section>
                    </Col>
                ) : null}
            </Row>

            <CatalogoBaseFormModal
                open={areaModalOpen}
                entityLabel="área"
                entity={editingArea}
                loading={isSavingArea}
                onClose={() => {
                    if (!isSavingArea) {
                        setAreaModalOpen(false)
                        setEditingArea(null)
                    }
                }}
                onSubmit={handleAreaSubmit}
            />

            <DepartamentoFormModal
                open={deptModalOpen}
                departamento={editingDept}
                areas={areaOptions}
                defaultAreaId={selectedArea?.id}
                loading={isSavingDept}
                onClose={() => {
                    if (!isSavingDept) {
                        setDeptModalOpen(false)
                        setEditingDept(null)
                    }
                }}
                onSubmit={handleDeptSubmit}
            />

            <ServicioFormModal
                open={servicioModalOpen}
                servicio={editingServicio}
                departamentos={departamentos}
                defaultDepartamentoId={selectedDept?.id}
                loading={isSavingServicio}
                onClose={() => {
                    if (!isSavingServicio) {
                        setServicioModalOpen(false)
                        setEditingServicio(null)
                    }
                }}
                onSubmit={handleServicioSubmit}
            />
        </div>
    )
}
