import { useCallback, useEffect, useMemo, useState } from 'react'
import type { DataNode } from 'antd/es/tree'
import {
    Breadcrumb,
    Drawer,
    Modal,
} from 'antd'
import type { MenuProps } from 'antd'
import {
    ApartmentOutlined,
    BankOutlined,
    DeleteOutlined,
    ExperimentOutlined,
} from '@ant-design/icons'

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
import {
    collectExpandedKeys,
    countAreaServicios,
    filterJerarquiaTree,
    formatEmpleados,
    nodeKey,
    parseNodeKey,
    toArea,
    toBasePayload,
    toDepartamento,
    toServicio,
    type JerarquiaSelectionKind,
} from '../utils/jerarquia-tree'
import { DepartmentHeader } from './DepartmentHeader'
import { DepartmentStats } from './DepartmentStats'
import { JerarquiaEmpleadosSection } from './JerarquiaEmpleadosSection'
import {
    JerarquiaAreaDrawer,
    JerarquiaDepartamentoDrawer,
    JerarquiaServicioDrawer,
} from './JerarquiaFormDrawers'
import { JerarquiaTreeNodeTitle } from './JerarquiaTreeNodeTitle'
import { OrganizationTree } from './OrganizationTree'

export function JerarquiaPanel() {
    const [treeSearchInput, setTreeSearchInput] = useState('')
    const [treeSearch, setTreeSearch] = useState('')
    const [expandedKeys, setExpandedKeys] = useState<string[]>([])
    const [selectedKeys, setSelectedKeys] = useState<string[]>([])

    const [selectedArea, setSelectedArea] = useState<Area | null>(null)
    const [selectedDept, setSelectedDept] = useState<Departamento | null>(null)
    const [selectedServicio, setSelectedServicio] = useState<Servicio | null>(null)
    const [selectionKind, setSelectionKind] = useState<JerarquiaSelectionKind>(null)

    const [areaDrawerOpen, setAreaDrawerOpen] = useState(false)
    const [editingArea, setEditingArea] = useState<Area | null>(null)
    const [deptDrawerOpen, setDeptDrawerOpen] = useState(false)
    const [editingDept, setEditingDept] = useState<Departamento | null>(null)
    const [servicioDrawerOpen, setServicioDrawerOpen] = useState(false)
    const [editingServicio, setEditingServicio] = useState<Servicio | null>(null)
    const [defaultAreaId, setDefaultAreaId] = useState<string | null>(null)
    const [defaultDepartamentoId, setDefaultDepartamentoId] = useState<string | null>(null)

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

    const filteredAreaNodes = useMemo(
        () => filterJerarquiaTree(areaNodes, treeSearch),
        [areaNodes, treeSearch],
    )

    const selectedAreaNode = selectedArea ? areaNodesById.get(selectedArea.id) ?? null : null

    const departamentos = useMemo(
        () =>
            selectedAreaNode
                ? selectedAreaNode.departamentos.map((dept) =>
                      toDepartamento(dept, selectedAreaNode.nombre),
                  )
                : [],
        [selectedAreaNode],
    )

    const selectedDeptNode = useMemo(() => {
        if (!selectedDept) return null
        for (const area of areaNodes) {
            const dept = area.departamentos.find((item) => item.id === selectedDept.id)
            if (dept) return dept
        }
        return null
    }, [selectedDept, areaNodes])

    const selectedServicioNode = useMemo(() => {
        if (!selectedServicio) return null
        for (const area of areaNodes) {
            for (const dept of area.departamentos) {
                const servicio = dept.servicios.find((item) => item.id === selectedServicio.id)
                if (servicio) return { servicio, dept, area }
            }
        }
        return null
    }, [selectedServicio, areaNodes])

    const serviciosDepartamentos = useMemo(() => {
        if (editingServicio) {
            for (const area of areaNodes) {
                const areaDepartamentos = area.departamentos.map((dept) =>
                    toDepartamento(dept, area.nombre),
                )
                if (
                    areaDepartamentos.some(
                        (dept) => dept.id === editingServicio.departamentoId,
                    )
                ) {
                    return areaDepartamentos
                }
            }
        }

        if (selectedAreaNode) {
            return selectedAreaNode.departamentos.map((dept) =>
                toDepartamento(dept, selectedAreaNode.nombre),
            )
        }

        if (defaultAreaId) {
            const area = areaNodesById.get(defaultAreaId)
            if (!area) return []
            return area.departamentos.map((dept) => toDepartamento(dept, area.nombre))
        }

        return departamentos
    }, [
        editingServicio,
        areaNodes,
        selectedAreaNode,
        defaultAreaId,
        areaNodesById,
        departamentos,
    ])

    const isSavingArea = createArea.isPending || updateArea.isPending
    const isSavingDept = createDept.isPending || updateDept.isPending
    const isSavingServicio = createServicio.isPending || updateServicio.isPending

    const hasSelection = selectionKind !== null

    useEffect(() => {
        const timer = window.setTimeout(() => {
            setTreeSearch(treeSearchInput.trim())
        }, 300)
        return () => window.clearTimeout(timer)
    }, [treeSearchInput])

    useEffect(() => {
        if (!treeSearch) return
        setExpandedKeys(collectExpandedKeys(areaNodes, treeSearch))
    }, [treeSearch, areaNodes])

    const syncSelection = useCallback(
        (kind: JerarquiaSelectionKind, area: Area | null, dept: Departamento | null, servicio: Servicio | null) => {
            setSelectionKind(kind)
            setSelectedArea(area)
            setSelectedDept(dept)
            setSelectedServicio(servicio)

            if (servicio) {
                setSelectedKeys([nodeKey('servicio', servicio.id)])
                return
            }
            if (dept) {
                setSelectedKeys([nodeKey('departamento', dept.id)])
                return
            }
            if (area) {
                setSelectedKeys([nodeKey('area', area.id)])
                return
            }
            setSelectedKeys([])
        },
        [],
    )

    const openCreateArea = () => {
        setEditingArea(null)
        setAreaDrawerOpen(true)
    }

    const openEditArea = (area: Area) => {
        setEditingArea(area)
        setAreaDrawerOpen(true)
    }

    const openCreateDept = (areaId?: string) => {
        setEditingDept(null)
        setDefaultAreaId(areaId ?? selectedArea?.id ?? null)
        setDeptDrawerOpen(true)
    }

    const openEditDept = (dept: Departamento) => {
        setEditingDept(dept)
        setDefaultAreaId(null)
        setDeptDrawerOpen(true)
    }

    const openCreateServicio = (departamentoId?: string, areaId?: string) => {
        setEditingServicio(null)
        setDefaultDepartamentoId(departamentoId ?? selectedDept?.id ?? null)
        setDefaultAreaId(areaId ?? selectedArea?.id ?? null)
        setServicioDrawerOpen(true)
    }

    const openEditServicio = (servicio: Servicio) => {
        setEditingServicio(servicio)
        setDefaultDepartamentoId(null)
        setDefaultAreaId(null)
        setServicioDrawerOpen(true)
    }

    const handleDeleteArea = async (areaId: string) => {
        setDeletingAreaId(areaId)
        try {
            await deleteArea.mutateAsync(areaId)
            if (selectedArea?.id === areaId) {
                syncSelection(null, null, null, null)
            }
        } finally {
            setDeletingAreaId(null)
        }
    }

    const handleDeleteDept = async (deptId: string) => {
        setDeletingDeptId(deptId)
        try {
            await deleteDept.mutateAsync(deptId)
            if (selectedDept?.id === deptId) {
                syncSelection(
                    selectedArea ? 'area' : null,
                    selectedArea,
                    null,
                    null,
                )
            }
        } finally {
            setDeletingDeptId(null)
        }
    }

    const handleDeleteServicio = async (servicioId: string) => {
        setDeletingServicioId(servicioId)
        try {
            await deleteServicio.mutateAsync(servicioId)
            if (selectedServicio?.id === servicioId) {
                syncSelection(
                    selectedDept ? 'departamento' : selectedArea ? 'area' : null,
                    selectedArea,
                    selectedDept,
                    null,
                )
            }
        } finally {
            setDeletingServicioId(null)
        }
    }

    const handleAreaSubmit = async (values: CatalogoBaseFormValues) => {
        const payload = toBasePayload(values)

        if (editingArea) {
            await updateArea.mutateAsync({ id: editingArea.id, data: payload })
        } else {
            await createArea.mutateAsync(payload)
        }

        setAreaDrawerOpen(false)
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

        setDeptDrawerOpen(false)
        setEditingDept(null)
        setDefaultAreaId(null)
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

        setServicioDrawerOpen(false)
        setEditingServicio(null)
        setDefaultDepartamentoId(null)
        setDefaultAreaId(null)
    }

    const buildAreaMenu = (area: Area): MenuProps['items'] => [
        {
            key: 'delete',
            danger: true,
            icon: <DeleteOutlined />,
            label: 'Eliminar área',
            onClick: ({ domEvent }) => {
                domEvent.stopPropagation()
                Modal.confirm({
                    title: '¿Eliminar área?',
                    content: 'Se eliminará el área y su jerarquía asociada.',
                    okText: 'Eliminar',
                    okType: 'danger',
                    cancelText: 'Cancelar',
                    onOk: () => handleDeleteArea(area.id),
                })
            },
        },
    ]

    const buildDeptMenu = (dept: Departamento): MenuProps['items'] => [
        {
            key: 'delete',
            danger: true,
            icon: <DeleteOutlined />,
            label: 'Eliminar departamento',
            onClick: ({ domEvent }) => {
                domEvent.stopPropagation()
                Modal.confirm({
                    title: '¿Eliminar departamento?',
                    content: 'Se eliminará el departamento y sus servicios.',
                    okText: 'Eliminar',
                    okType: 'danger',
                    cancelText: 'Cancelar',
                    onOk: () => handleDeleteDept(dept.id),
                })
            },
        },
    ]

    const buildServicioMenu = (servicio: Servicio): MenuProps['items'] => [
        {
            key: 'delete',
            danger: true,
            icon: <DeleteOutlined />,
            label: 'Eliminar servicio',
            onClick: ({ domEvent }) => {
                domEvent.stopPropagation()
                Modal.confirm({
                    title: '¿Eliminar servicio?',
                    okText: 'Eliminar',
                    okType: 'danger',
                    cancelText: 'Cancelar',
                    onOk: () => handleDeleteServicio(servicio.id),
                })
            },
        },
    ]

    const treeData = useMemo<DataNode[]>(() => {
        return filteredAreaNodes.map((area) => {
            const areaEntity = toArea(area)
            const serviciosCount = countAreaServicios(area)
            const deptCount = area.departamentos.length
            const areaEmpleados = formatEmpleados(area.empleadosCount)
            const areaCountLabel = [
                `${deptCount} depto${deptCount === 1 ? '' : 's'}`,
                `${serviciosCount} serv.`,
                areaEmpleados,
            ]
                .filter(Boolean)
                .join(' · ')

            return {
                key: nodeKey('area', area.id),
                title: (
                    <JerarquiaTreeNodeTitle
                        level="area"
                        icon={<BankOutlined />}
                        nombre={area.nombre}
                        codigo={area.codigo}
                        countLabel={areaCountLabel}
                        menuItems={buildAreaMenu(areaEntity)}
                        deleting={deletingAreaId === area.id}
                        onEdit={() => openEditArea(areaEntity)}
                        onCreate={() => openCreateDept(area.id)}
                        createLabel="Nuevo departamento"
                    />
                ),
                children: area.departamentos.map((dept) => {
                    const deptEntity = toDepartamento(dept, area.nombre)
                    const servCount = dept.servicios.length
                    const deptEmpleados = formatEmpleados(dept.empleadosCount)
                    const deptCountLabel = [
                        `${servCount} servicio${servCount === 1 ? '' : 's'}`,
                        deptEmpleados,
                    ]
                        .filter(Boolean)
                        .join(' · ')

                    return {
                        key: nodeKey('departamento', dept.id),
                        title: (
                            <JerarquiaTreeNodeTitle
                                level="departamento"
                                icon={<ApartmentOutlined />}
                                nombre={dept.nombre}
                                codigo={dept.codigo}
                                countLabel={deptCountLabel}
                                menuItems={buildDeptMenu(deptEntity)}
                                deleting={deletingDeptId === dept.id}
                                onEdit={() => openEditDept(deptEntity)}
                                onCreate={() => openCreateServicio(dept.id, dept.areaId)}
                                createLabel="Nuevo servicio"
                            />
                        ),
                        children: dept.servicios.map((servicio) => {
                            const servicioEntity = toServicio(servicio, dept.nombre)
                            const empleados = formatEmpleados(servicio.empleadosCount)

                            return {
                                key: nodeKey('servicio', servicio.id),
                                isLeaf: true,
                                title: (
                                    <JerarquiaTreeNodeTitle
                                        level="servicio"
                                        icon={<ExperimentOutlined />}
                                        nombre={servicio.nombre}
                                        codigo={servicio.codigo}
                                        countLabel={empleados ?? undefined}
                                        menuItems={buildServicioMenu(servicioEntity)}
                                        deleting={deletingServicioId === servicio.id}
                                        onEdit={() => openEditServicio(servicioEntity)}
                                    />
                                ),
                            }
                        }),
                    }
                }),
            }
        })
    }, [
        filteredAreaNodes,
        deletingAreaId,
        deletingDeptId,
        deletingServicioId,
    ])

    const handleTreeSelect = (keys: React.Key[]) => {
        const key = String(keys[0] ?? '')
        if (!key) {
            syncSelection(null, null, null, null)
            return
        }

        const parsed = parseNodeKey(key)
        if (!parsed) return

        if (parsed.kind === 'area') {
            const area = allAreas.find((item) => item.id === parsed.id) ?? null
            syncSelection(area ? 'area' : null, area, null, null)
            return
        }

        if (parsed.kind === 'departamento') {
            for (const areaNode of areaNodes) {
                const deptNode = areaNode.departamentos.find((item) => item.id === parsed.id)
                if (!deptNode) continue
                const area = toArea(areaNode)
                const dept = toDepartamento(deptNode, areaNode.nombre)
                syncSelection('departamento', area, dept, null)
                return
            }
        }

        if (parsed.kind === 'servicio') {
            for (const areaNode of areaNodes) {
                for (const deptNode of areaNode.departamentos) {
                    const servicioNode = deptNode.servicios.find((item) => item.id === parsed.id)
                    if (!servicioNode) continue
                    const area = toArea(areaNode)
                    const dept = toDepartamento(deptNode, areaNode.nombre)
                    const servicio = toServicio(servicioNode, deptNode.nombre)
                    syncSelection('servicio', area, dept, servicio)
                    return
                }
            }
        }
    }

    const breadcrumbItems = useMemo(() => {
        const items: { title: React.ReactNode }[] = [
            { title: <span className="jerarquia-explorer__crumb-static">Recursos Humanos</span> },
        ]

        if (selectedArea) {
            items.push({
                title: (
                    <button
                        type="button"
                        className="jerarquia-explorer__crumb"
                        onClick={() => syncSelection('area', selectedArea, null, null)}
                    >
                        {selectedArea.nombre}
                    </button>
                ),
            })
        }

        if (selectedDept && selectionKind !== 'area') {
            items.push({
                title: (
                    <button
                        type="button"
                        className="jerarquia-explorer__crumb"
                        onClick={() =>
                            syncSelection('departamento', selectedArea, selectedDept, null)
                        }
                    >
                        {selectedDept.nombre}
                    </button>
                ),
            })
        }

        if (selectedServicio && selectionKind === 'servicio') {
            items.push({ title: selectedServicio.nombre })
        }

        return items
    }, [selectedArea, selectedDept, selectedServicio, selectionKind, syncSelection])

    const renderTreePanel = () => (
        <OrganizationTree
            areaCount={areaNodes.length}
            treeSearchInput={treeSearchInput}
            loading={loadingJerarquia}
            hasAreas={areaNodes.length > 0}
            hasFilteredAreas={filteredAreaNodes.length > 0}
            treeData={treeData}
            selectedKeys={selectedKeys}
            expandedKeys={expandedKeys}
            onCreateArea={openCreateArea}
            onSearchChange={setTreeSearchInput}
            onSearchClear={() => {
                setTreeSearchInput('')
                setTreeSearch('')
            }}
            onExpand={setExpandedKeys}
            onSelect={handleTreeSelect}
        />
    )

    const renderAreaDetail = () => {
        if (!selectedArea || !selectedAreaNode) return null

        const serviciosTotal = countAreaServicios(selectedAreaNode)
        const empleados = formatEmpleados(selectedAreaNode.empleadosCount)
        const stats = [
            { label: 'Departamentos', value: selectedAreaNode.departamentos.length },
            { label: 'Servicios', value: serviciosTotal },
            ...(empleados ? [{ label: 'Empleados', value: empleados }] : []),
        ]

        return (
            <>
                <DepartmentHeader
                    icon={<BankOutlined />}
                    codigo={selectedArea.codigo}
                    nombre={selectedArea.nombre}
                    hierarchy={[{ label: 'Área', nombre: selectedArea.nombre }]}
                    descripcion={selectedArea.descripcion}
                    stats={<DepartmentStats items={stats} />}
                />

                <JerarquiaEmpleadosSection
                    areaId={selectedArea.id}
                    compactMeta
                />
            </>
        )
    }

    const renderDepartamentoDetail = () => {
        if (!selectedArea || !selectedDept || !selectedDeptNode) return null

        const empleados = formatEmpleados(selectedDeptNode.empleadosCount)
        const stats = [
            { label: 'Servicios', value: selectedDeptNode.servicios.length },
            ...(empleados ? [{ label: 'Empleados', value: empleados }] : []),
        ]

        return (
            <>
                <DepartmentHeader
                    icon={<ApartmentOutlined />}
                    codigo={selectedDept.codigo}
                    nombre={selectedDept.nombre}
                    hierarchy={[
                        { label: 'Área', nombre: selectedArea.nombre },
                        { label: 'Departamento', nombre: selectedDept.nombre },
                    ]}
                    descripcion={selectedDept.descripcion}
                    stats={<DepartmentStats items={stats} />}
                />

                <JerarquiaEmpleadosSection
                    areaId={selectedArea.id}
                    departamentoId={selectedDept.id}
                />
            </>
        )
    }

    const renderServicioDetail = () => {
        if (!selectedArea || !selectedDept || !selectedServicio || !selectedServicioNode) {
            return null
        }

        const empleados = formatEmpleados(selectedServicioNode.servicio.empleadosCount)
        const stats = empleados ? [{ label: 'Empleados', value: empleados }] : []

        return (
            <>
                <DepartmentHeader
                    icon={<ExperimentOutlined />}
                    codigo={selectedServicio.codigo}
                    nombre={selectedServicio.nombre}
                    hierarchy={[
                        { label: 'Área', nombre: selectedArea.nombre },
                        { label: 'Departamento', nombre: selectedDept.nombre },
                        { label: 'Servicio', nombre: selectedServicio.nombre },
                    ]}
                    descripcion={selectedServicio.descripcion}
                    stats={<DepartmentStats items={stats} />}
                />

                <JerarquiaEmpleadosSection
                    areaId={selectedArea.id}
                    departamentoId={selectedDept.id}
                    servicioId={selectedServicio.id}
                />
            </>
        )
    }

    const renderDetailContent = () => {
        if (selectionKind === 'servicio') return renderServicioDetail()
        if (selectionKind === 'departamento') return renderDepartamentoDetail()
        if (selectionKind === 'area') return renderAreaDetail()
        return null
    }

    const detailTitle =
        selectionKind === 'servicio'
            ? 'Detalle del servicio'
            : selectionKind === 'departamento'
              ? 'Detalle del departamento'
              : selectionKind === 'area'
                ? 'Detalle del área'
                : 'Detalle'

    return (
        <div className="jerarquia-explorer jerarquia-explorer--tree-only">
            {renderTreePanel()}

            <Drawer
                title={detailTitle}
                open={hasSelection}
                onClose={() => syncSelection(null, null, null, null)}
                placement="right"
                width={420}
                destroyOnHidden
                className="jerarquia-explorer__detail-drawer"
                styles={{ body: { padding: '10px 12px' } }}
            >
                <div className="jerarquia-explorer__detail-drawer-breadcrumb">
                    <Breadcrumb items={breadcrumbItems} />
                </div>
                <div className="jerarquia-explorer__detail-drawer-body">
                    {renderDetailContent()}
                </div>
            </Drawer>

            <JerarquiaAreaDrawer
                open={areaDrawerOpen}
                entity={editingArea}
                loading={isSavingArea}
                onClose={() => {
                    if (!isSavingArea) {
                        setAreaDrawerOpen(false)
                        setEditingArea(null)
                    }
                }}
                onSubmit={handleAreaSubmit}
            />

            <JerarquiaDepartamentoDrawer
                open={deptDrawerOpen}
                departamento={editingDept}
                areas={areaOptions}
                defaultAreaId={defaultAreaId ?? selectedArea?.id}
                loading={isSavingDept}
                onClose={() => {
                    if (!isSavingDept) {
                        setDeptDrawerOpen(false)
                        setEditingDept(null)
                        setDefaultAreaId(null)
                    }
                }}
                onSubmit={handleDeptSubmit}
            />

            <JerarquiaServicioDrawer
                open={servicioDrawerOpen}
                servicio={editingServicio}
                departamentos={serviciosDepartamentos}
                defaultDepartamentoId={defaultDepartamentoId ?? selectedDept?.id}
                loading={isSavingServicio}
                onClose={() => {
                    if (!isSavingServicio) {
                        setServicioDrawerOpen(false)
                        setEditingServicio(null)
                        setDefaultDepartamentoId(null)
                        setDefaultAreaId(null)
                    }
                }}
                onSubmit={handleServicioSubmit}
            />
        </div>
    )
}
