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
    useAreaDepartamentos,
    useAreas,
    useCreateArea,
    useCreateDepartamento,
    useCreateServicio,
    useDeleteArea,
    useDeleteDepartamento,
    useDeleteServicio,
    useDepartamentoServicios,
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

const { Text, Title, Paragraph } = Typography
const { useBreakpoint } = Grid

const DEFAULT_PAGE_SIZE = 15
const LOOKUP_PAGE_SIZE = 100

type HierarchyStep = 'area' | 'departamento' | 'servicio'

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

    const [areaModalOpen, setAreaModalOpen] = useState(false)
    const [editingArea, setEditingArea] = useState<Area | null>(null)
    const [deptModalOpen, setDeptModalOpen] = useState(false)
    const [editingDept, setEditingDept] = useState<Departamento | null>(null)
    const [servicioModalOpen, setServicioModalOpen] = useState(false)
    const [editingServicio, setEditingServicio] = useState<Servicio | null>(null)

    const [deletingAreaId, setDeletingAreaId] = useState<string | null>(null)
    const [deletingDeptId, setDeletingDeptId] = useState<string | null>(null)
    const [deletingServicioId, setDeletingServicioId] = useState<string | null>(null)

    const { data: areaData, isFetching: loadingAreas } = useAreas({
        page: areaPage,
        pageSize: DEFAULT_PAGE_SIZE,
    })

    const { data: areasForSelect } = useAreas({
        page: 1,
        pageSize: LOOKUP_PAGE_SIZE,
    })

    const { data: departamentos = [], isFetching: loadingDepts } =
        useAreaDepartamentos(selectedArea?.id ?? null)

    const { data: servicios = [], isFetching: loadingServicios } =
        useDepartamentoServicios(selectedDept?.id ?? null)

    const createArea = useCreateArea()
    const updateArea = useUpdateArea()
    const deleteArea = useDeleteArea()
    const createDept = useCreateDepartamento()
    const updateDept = useUpdateDepartamento()
    const deleteDept = useDeleteDepartamento()
    const createServicio = useCreateServicio()
    const updateServicio = useUpdateServicio()
    const deleteServicio = useDeleteServicio()

    const areas = areaData?.items ?? []
    const totalAreas = areaData?.totalRecords ?? 0
    const areaOptions = areasForSelect?.items ?? areas

    const filteredAreas = useMemo(
        () => filterBySearch(areas, areaSearch),
        [areas, areaSearch],
    )

    const filteredDepartamentos = useMemo(
        () => filterBySearch(departamentos, deptSearch),
        [departamentos, deptSearch],
    )

    const filteredServicios = useMemo(
        () => filterBySearch(servicios, servicioSearch),
        [servicios, servicioSearch],
    )

    useEffect(() => {
        setSelectedDept(null)
        setDeptSearch('')
        setServicioSearch('')
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

    const mobileStep = useMemo<HierarchyStep>(() => {
        if (!selectedArea) return 'area'
        if (!selectedDept) return 'departamento'
        return 'servicio'
    }, [selectedArea, selectedDept])

    const handleMobileBack = () => {
        if (mobileStep === 'servicio') {
            setSelectedDept(null)
            return
        }
        if (mobileStep === 'departamento') {
            setSelectedArea(null)
        }
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
                items={filteredAreas}
                loading={loadingAreas}
                total={areaSearch ? filteredAreas.length : totalAreas}
                page={areaPage}
                pageSize={DEFAULT_PAGE_SIZE}
                selectedId={selectedArea?.id ?? null}
                emptyText={
                    areaSearch
                        ? 'No hay áreas que coincidan con la búsqueda.'
                        : 'Cree la primera área.'
                }
                icon={<BankOutlined />}
                onPageChange={(page) => {
                    setAreaPage(page)
                    setAreaSearchInput('')
                    setAreaSearch('')
                }}
                onSelect={(item) =>
                    setSelectedArea(areas.find((area) => area.id === item.id) ?? null)
                }
                onEdit={(item) => {
                    setEditingArea(areas.find((area) => area.id === item.id) ?? null)
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
        <section className="jerarquia-rrhh__subpanel">
            <div className="jerarquia-rrhh__subpanel-head">
                <Flex align="center" gap={8}>
                    <ApartmentOutlined />
                    <div>
                        <Text strong>Departamentos</Text>
                        <Text type="secondary" className="jerarquia-rrhh__subpanel-caption">
                            {departamentos.length} en esta área
                        </Text>
                    </div>
                </Flex>
                <Button
                    type="primary"
                    size="small"
                    icon={<PlusOutlined />}
                    disabled={!selectedArea}
                    onClick={() => {
                        setEditingDept(null)
                        setDeptModalOpen(true)
                    }}
                >
                    Nuevo
                </Button>
            </div>

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
                items={filteredDepartamentos}
                loading={loadingDepts}
                selectedId={selectedDept?.id ?? null}
                emptyText={
                    deptSearch
                        ? 'Sin coincidencias.'
                        : 'Sin departamentos en esta área.'
                }
                icon={<ApartmentOutlined />}
                onSelect={(item) =>
                    setSelectedDept(
                        departamentos.find((departamento) => departamento.id === item.id) ??
                            null,
                    )
                }
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
        <section className="jerarquia-rrhh__subpanel">
            <div className="jerarquia-rrhh__subpanel-head">
                <Flex align="center" gap={8}>
                    <ExperimentOutlined />
                    <div>
                        <Text strong>Servicios</Text>
                        <Text type="secondary" className="jerarquia-rrhh__subpanel-caption">
                            {selectedDept
                                ? `${servicios.length} en ${selectedDept.nombre}`
                                : 'Seleccione un departamento'}
                        </Text>
                    </div>
                </Flex>
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
                    Nuevo
                </Button>
            </div>

            {selectedDept ? (
                <>
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
                        items={filteredServicios}
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
                        description="Seleccione un departamento"
                    />
                </div>
            )}
        </section>
    )

    const renderDetail = () => {
        if (!selectedArea) return renderDetailEmpty()

        return (
            <>
                <div className="catalogos-view__detail-hero jerarquia-rrhh__detail-hero">
                    <div className="catalogos-view__detail-hero-content">
                        <code className="catalogos-view__detail-code">{selectedArea.codigo}</code>
                        <Title level={4} className="catalogos-view__detail-name">
                            {selectedArea.nombre}
                        </Title>
                        {selectedArea.descripcion ? (
                            <Paragraph
                                type="secondary"
                                className="catalogos-view__detail-description"
                            >
                                {selectedArea.descripcion}
                            </Paragraph>
                        ) : null}
                    </div>
                </div>

                <div className="catalogos-view__detail-body jerarquia-rrhh__detail-body">
                    <Row gutter={[16, 16]}>
                        {showMobilePanel('departamento') ? (
                            <Col xs={24} md={12}>
                                {renderDepartamentosPanel()}
                            </Col>
                        ) : null}
                        {showMobilePanel('servicio') ? (
                            <Col xs={24} md={12}>
                                {renderServiciosPanel()}
                            </Col>
                        ) : null}
                    </Row>
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
                            Volver
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
                                ? [
                                      {
                                          title: (
                                              <button
                                                  type="button"
                                                  className="jerarquia-rrhh__crumb"
                                                  onClick={() => setSelectedDept(null)}
                                              >
                                                  {selectedArea.nombre}
                                              </button>
                                          ),
                                      },
                                  ]
                                : []),
                            ...(selectedDept
                                ? [{ title: selectedDept.nombre }]
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
