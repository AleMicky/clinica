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
    Tag,
    Typography,
    theme,
} from 'antd'
import {
    ApartmentOutlined,
    ArrowLeftOutlined,
    BankOutlined,
    ExperimentOutlined,
    PlusOutlined,
    SearchOutlined,
    MedicineBoxOutlined,
} from '@ant-design/icons'

import {
    useAreaDepartamentos,
    useAreas,
    useCreateArea,
    useCreateDepartamento,
    useCreatePrestacion,
    useCreateServicio,
    useDeleteArea,
    useDeleteDepartamento,
    useDeletePrestacion,
    useDeleteServicio,
    useDepartamentoServicios,
    useServicioPrestaciones,
    useUpdateArea,
    useUpdateDepartamento,
    useUpdatePrestacion,
    useUpdateServicio,
} from '../hooks/catalogo-clinico.hooks'
import { CatalogoBaseFormModal } from './CatalogoBaseFormModal'
import { DepartamentoFormModal } from './DepartamentoFormModal'
import { HierarchyList } from './HierarchyList'
import { PrestacionFormModal } from './PrestacionFormModal'
import { ServicioFormModal } from './ServicioFormModal'
import type {
    CatalogoBaseFormValues,
    DepartamentoFormValues,
    PrestacionFormValues,
    ServicioFormValues,
} from '../schemas/catalogo-clinico.schema'
import type { Area, Departamento, Prestacion, Servicio } from '../types/catalogo-clinico.types'

const { Text, Title } = Typography
const { useBreakpoint } = Grid
const DEFAULT_PAGE_SIZE = 15

type HierarchyStep = 'area' | 'departamento' | 'servicio' | 'prestacion'

export function CatalogoJerarquiaPanel() {
    const { token } = theme.useToken()
    const screens = useBreakpoint()
    const isMobile = !screens.md

    const [areaPage, setAreaPage] = useState(1)
    const [areaSearch, setAreaSearch] = useState('')
    const [areaSearchInput, setAreaSearchInput] = useState('')
    const [selectedArea, setSelectedArea] = useState<Area | null>(null)
    const [selectedDept, setSelectedDept] = useState<Departamento | null>(null)
    const [selectedServicio, setSelectedServicio] = useState<Servicio | null>(null)

    const [areaModalOpen, setAreaModalOpen] = useState(false)
    const [editingArea, setEditingArea] = useState<Area | null>(null)
    const [deptModalOpen, setDeptModalOpen] = useState(false)
    const [editingDept, setEditingDept] = useState<Departamento | null>(null)
    const [servicioModalOpen, setServicioModalOpen] = useState(false)
    const [editingServicio, setEditingServicio] = useState<Servicio | null>(null)
    const [prestacionModalOpen, setPrestacionModalOpen] = useState(false)
    const [editingPrestacion, setEditingPrestacion] = useState<Prestacion | null>(null)

    const [deletingAreaId, setDeletingAreaId] = useState<string | null>(null)
    const [deletingDeptId, setDeletingDeptId] = useState<string | null>(null)
    const [deletingServicioId, setDeletingServicioId] = useState<string | null>(null)
    const [deletingPrestacionId, setDeletingPrestacionId] = useState<string | null>(null)

    const { data: areaData, isFetching: loadingAreas } = useAreas({
        page: areaPage,
        pageSize: DEFAULT_PAGE_SIZE,
        search: areaSearch || undefined,
    })

    const { data: areasForSelect } = useAreas({
        page: 1,
        pageSize: 100,
    })

    const { data: departamentos = [], isFetching: loadingDepts } =
        useAreaDepartamentos(selectedArea?.id ?? null)

    const { data: servicios = [], isFetching: loadingServicios } =
        useDepartamentoServicios(selectedDept?.id ?? null)

    const { data: prestaciones = [], isFetching: loadingPrestaciones } =
        useServicioPrestaciones(selectedServicio?.id ?? null)

    const createArea = useCreateArea()
    const updateArea = useUpdateArea()
    const deleteArea = useDeleteArea()
    const createDept = useCreateDepartamento()
    const updateDept = useUpdateDepartamento()
    const deleteDept = useDeleteDepartamento()
    const createServicio = useCreateServicio()
    const updateServicio = useUpdateServicio()
    const deleteServicio = useDeleteServicio()
    const createPrestacion = useCreatePrestacion()
    const updatePrestacion = useUpdatePrestacion()
    const deletePrestacion = useDeletePrestacion()

    const areas = areaData?.items ?? []
    const totalAreas = areaData?.totalRecords ?? 0
    const areaOptions = areasForSelect?.items ?? areas

    useEffect(() => {
        setSelectedDept(null)
        setSelectedServicio(null)
    }, [selectedArea?.id])

    useEffect(() => {
        setSelectedServicio(null)
    }, [selectedDept?.id])

    const isSavingArea = createArea.isPending || updateArea.isPending
    const isSavingDept = createDept.isPending || updateDept.isPending
    const isSavingServicio = createServicio.isPending || updateServicio.isPending
    const isSavingPrestacion = createPrestacion.isPending || updatePrestacion.isPending

    const mobileStep = useMemo<HierarchyStep>(() => {
        if (!selectedArea) return 'area'
        if (!selectedDept) return 'departamento'
        if (!selectedServicio) return 'servicio'
        return 'prestacion'
    }, [selectedArea, selectedDept, selectedServicio])

    const handleMobileBack = () => {
        if (mobileStep === 'prestacion') {
            setSelectedServicio(null)
            return
        }
        if (mobileStep === 'servicio') {
            setSelectedDept(null)
            return
        }
        if (mobileStep === 'departamento') {
            setSelectedArea(null)
        }
    }

    const showMobileColumn = (step: HierarchyStep) => !isMobile || mobileStep === step

    const handleAreaSubmit = async (values: CatalogoBaseFormValues) => {
        const payload = {
            codigo: values.codigo,
            nombre: values.nombre,
            descripcion: values.descripcion || null,
        }

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
            areaId: values.areaId,
            codigo: values.codigo,
            nombre: values.nombre,
            descripcion: values.descripcion || null,
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
            departamentoId: values.departamentoId,
            codigo: values.codigo,
            nombre: values.nombre,
            descripcion: values.descripcion || null,
        }

        if (editingServicio) {
            await updateServicio.mutateAsync({ id: editingServicio.id, data: payload })
        } else {
            await createServicio.mutateAsync(payload)
        }
        setServicioModalOpen(false)
        setEditingServicio(null)
    }

    const handlePrestacionSubmit = async (values: PrestacionFormValues) => {
        const payload = {
            servicioId: values.servicioId,
            codigo: values.codigo,
            nombre: values.nombre,
            descripcion: values.descripcion || null,
            precio: values.precio,
            requiereOrdenMedica: values.requiereOrdenMedica,
            requiereMedico: values.requiereMedico,
        }

        if (editingPrestacion) {
            await updatePrestacion.mutateAsync({ id: editingPrestacion.id, data: payload })
        } else {
            await createPrestacion.mutateAsync(payload)
        }
        setPrestacionModalOpen(false)
        setEditingPrestacion(null)
    }

    return (
        <div className="catalogo-clinico-jerarquia">
            <div className="catalogo-clinico-jerarquia__intro">
                <Text type="secondary">
                    {isMobile
                        ? 'Seleccione cada nivel en orden: área, departamento, servicio y prestación.'
                        : 'Navegue de izquierda a derecha: área → departamento → servicio → prestación. Cada nivel desbloquea el siguiente.'}
                </Text>
            </div>

            {isMobile ? (
                <div className="catalogo-clinico-jerarquia__mobile-nav">
                    {mobileStep !== 'area' ? (
                        <Button
                            type="text"
                            size="small"
                            icon={<ArrowLeftOutlined />}
                            onClick={handleMobileBack}
                            className="catalogo-clinico-jerarquia__back"
                        >
                            Volver
                        </Button>
                    ) : null}

                    <Breadcrumb
                        className="catalogo-clinico-jerarquia__breadcrumb"
                        items={[
                            {
                                title: (
                                    <button
                                        type="button"
                                        className="catalogo-clinico-jerarquia__crumb"
                                        onClick={() => {
                                            setSelectedArea(null)
                                            setSelectedDept(null)
                                            setSelectedServicio(null)
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
                                                  className="catalogo-clinico-jerarquia__crumb"
                                                  onClick={() => {
                                                      setSelectedDept(null)
                                                      setSelectedServicio(null)
                                                  }}
                                              >
                                                  {selectedArea.nombre}
                                              </button>
                                          ),
                                      },
                                  ]
                                : []),
                            ...(selectedDept
                                ? [
                                      {
                                          title: (
                                              <button
                                                  type="button"
                                                  className="catalogo-clinico-jerarquia__crumb"
                                                  onClick={() => setSelectedServicio(null)}
                                              >
                                                  {selectedDept.nombre}
                                              </button>
                                          ),
                                      },
                                  ]
                                : []),
                            ...(selectedServicio
                                ? [{ title: selectedServicio.nombre }]
                                : []),
                        ]}
                    />
                </div>
            ) : null}

            <div className="catalogo-clinico-jerarquia__scroll">
                <Row gutter={[12, 16]} className="catalogo-clinico-jerarquia__columns">
                    {/* Áreas */}
                    {showMobileColumn('area') ? (
                    <Col xs={24} sm={12} xl={6}>
                        <section className="catalogo-clinico-column">
                            <div className="catalogo-clinico-column__header">
                                <Flex align="center" gap={8}>
                                    <BankOutlined />
                                    <Title level={5} className="catalogo-clinico-column__title">
                                        Áreas
                                    </Title>
                                </Flex>
                                <Button
                                    type="primary"
                                    size="small"
                                    icon={<PlusOutlined />}
                                    onClick={() => {
                                        setEditingArea(null)
                                        setAreaModalOpen(true)
                                    }}
                                >
                                    Nuevo
                                </Button>
                            </div>
                            <div className="catalogo-clinico-column__search">
                                <Input
                                    allowClear
                                    size="small"
                                    prefix={
                                        <SearchOutlined
                                            style={{ color: token.colorTextQuaternary }}
                                        />
                                    }
                                    placeholder="Buscar…"
                                    value={areaSearchInput}
                                    onChange={(e) => setAreaSearchInput(e.target.value)}
                                    onPressEnter={() => {
                                        setAreaSearch(areaSearchInput.trim())
                                        setAreaPage(1)
                                    }}
                                    onClear={() => {
                                        setAreaSearchInput('')
                                        setAreaSearch('')
                                        setAreaPage(1)
                                    }}
                                />
                            </div>
                            <HierarchyList
                                items={areas}
                                loading={loadingAreas}
                                total={totalAreas}
                                page={areaPage}
                                pageSize={DEFAULT_PAGE_SIZE}
                                selectedId={selectedArea?.id ?? null}
                                emptyText="Cree la primera área."
                                icon={<BankOutlined />}
                                onPageChange={(page) => setAreaPage(page)}
                                onSelect={(item) =>
                                    setSelectedArea(areas.find((a) => a.id === item.id) ?? null)
                                }
                                onEdit={(item) => {
                                    setEditingArea(areas.find((a) => a.id === item.id) ?? null)
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
                    </Col>
                    ) : null}

                    {/* Departamentos */}
                    {showMobileColumn('departamento') ? (
                    <Col xs={24} sm={12} xl={6}>
                        <section
                            className={[
                                'catalogo-clinico-column',
                                selectedArea ? 'catalogo-clinico-column--active' : '',
                            ]
                                .filter(Boolean)
                                .join(' ')}
                        >
                            <div className="catalogo-clinico-column__header">
                                <Flex align="center" gap={8}>
                                    <ApartmentOutlined />
                                    <Title level={5} className="catalogo-clinico-column__title">
                                        Departamentos
                                    </Title>
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

                            {selectedArea ? (
                                <>
                                    <div className="catalogo-clinico-column__context">
                                        <Tag color="purple">{selectedArea.codigo}</Tag>
                                        <Text type="secondary">{selectedArea.nombre}</Text>
                                    </div>
                                    <HierarchyList
                                        items={departamentos}
                                        loading={loadingDepts}
                                        selectedId={selectedDept?.id ?? null}
                                        emptyText="Sin departamentos en esta área."
                                        icon={<ApartmentOutlined />}
                                        onSelect={(item) =>
                                            setSelectedDept(
                                                departamentos.find((d) => d.id === item.id) ??
                                                    null,
                                            )
                                        }
                                        onEdit={(item) => {
                                            setEditingDept(
                                                departamentos.find((d) => d.id === item.id) ??
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
                                </>
                            ) : (
                                <div className="catalogo-clinico-column__placeholder">
                                    <Empty
                                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                                        description="Seleccione un área"
                                    />
                                </div>
                            )}
                        </section>
                    </Col>
                    ) : null}

                    {/* Servicios */}
                    {showMobileColumn('servicio') ? (
                    <Col xs={24} sm={12} xl={6}>
                        <section
                            className={[
                                'catalogo-clinico-column',
                                selectedDept ? 'catalogo-clinico-column--active' : '',
                            ]
                                .filter(Boolean)
                                .join(' ')}
                        >
                            <div className="catalogo-clinico-column__header">
                                <Flex align="center" gap={8}>
                                    <ExperimentOutlined />
                                    <Title level={5} className="catalogo-clinico-column__title">
                                        Servicios
                                    </Title>
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
                                    <div className="catalogo-clinico-column__context">
                                        <Tag color="blue">{selectedDept.codigo}</Tag>
                                        <Text type="secondary">{selectedDept.nombre}</Text>
                                    </div>
                                    <HierarchyList
                                        items={servicios}
                                        loading={loadingServicios}
                                        selectedId={selectedServicio?.id ?? null}
                                        emptyText="Sin servicios en este departamento."
                                        icon={<ExperimentOutlined />}
                                        onSelect={(item) =>
                                            setSelectedServicio(
                                                servicios.find((s) => s.id === item.id) ?? null,
                                            )
                                        }
                                        onEdit={(item) => {
                                            setEditingServicio(
                                                servicios.find((s) => s.id === item.id) ?? null,
                                            )
                                            setServicioModalOpen(true)
                                        }}
                                        onDelete={async (item) => {
                                            setDeletingServicioId(item.id)
                                            try {
                                                await deleteServicio.mutateAsync(item.id)
                                                if (selectedServicio?.id === item.id) {
                                                    setSelectedServicio(null)
                                                }
                                            } finally {
                                                setDeletingServicioId(null)
                                            }
                                        }}
                                        deletingId={deletingServicioId}
                                    />
                                </>
                            ) : (
                                <div className="catalogo-clinico-column__placeholder">
                                    <Empty
                                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                                        description="Seleccione un departamento"
                                    />
                                </div>
                            )}
                        </section>
                    </Col>
                    ) : null}

                    {/* Prestaciones */}
                    {showMobileColumn('prestacion') ? (
                    <Col xs={24} sm={12} xl={6}>
                        <section
                            className={[
                                'catalogo-clinico-column',
                                selectedServicio ? 'catalogo-clinico-column--active' : '',
                            ]
                                .filter(Boolean)
                                .join(' ')}
                        >
                            <div className="catalogo-clinico-column__header">
                                <Flex align="center" gap={8}>
                                    <MedicineBoxOutlined />
                                    <Title level={5} className="catalogo-clinico-column__title">
                                        Prestaciones
                                    </Title>
                                </Flex>
                                <Button
                                    type="primary"
                                    size="small"
                                    icon={<PlusOutlined />}
                                    disabled={!selectedServicio}
                                    onClick={() => {
                                        setEditingPrestacion(null)
                                        setPrestacionModalOpen(true)
                                    }}
                                >
                                    Nuevo
                                </Button>
                            </div>

                            {selectedServicio ? (
                                <>
                                    <div className="catalogo-clinico-column__context">
                                        <Tag color="green">{selectedServicio.codigo}</Tag>
                                        <Text type="secondary">{selectedServicio.nombre}</Text>
                                    </div>
                                    <HierarchyList
                                        items={prestaciones.map((p) => ({
                                            ...p,
                                            meta: `Bs. ${p.precio.toFixed(2)}`,
                                        }))}
                                        loading={loadingPrestaciones}
                                        selectedId={null}
                                        emptyText="Sin prestaciones registradas."
                                        icon={<MedicineBoxOutlined />}
                                        onSelect={() => {}}
                                        onEdit={(item) => {
                                            setEditingPrestacion(
                                                prestaciones.find((p) => p.id === item.id) ??
                                                    null,
                                            )
                                            setPrestacionModalOpen(true)
                                        }}
                                        onDelete={async (item) => {
                                            setDeletingPrestacionId(item.id)
                                            try {
                                                await deletePrestacion.mutateAsync(item.id)
                                            } finally {
                                                setDeletingPrestacionId(null)
                                            }
                                        }}
                                        deletingId={deletingPrestacionId}
                                    />
                                </>
                            ) : (
                                <div className="catalogo-clinico-column__placeholder">
                                    <Empty
                                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                                        description="Seleccione un servicio"
                                    />
                                </div>
                            )}
                        </section>
                    </Col>
                    ) : null}
                </Row>
            </div>

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

            <PrestacionFormModal
                open={prestacionModalOpen}
                prestacion={editingPrestacion}
                servicioId={selectedServicio?.id ?? null}
                servicioNombre={selectedServicio?.nombre}
                loading={isSavingPrestacion}
                onClose={() => {
                    if (!isSavingPrestacion) {
                        setPrestacionModalOpen(false)
                        setEditingPrestacion(null)
                    }
                }}
                onSubmit={handlePrestacionSubmit}
            />
        </div>
    )
}
