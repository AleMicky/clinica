import { useCallback, useEffect, useMemo, useState } from 'react'
import type { DataNode } from 'antd/es/tree'
import {
    Breadcrumb,
    Button,
    Empty,
    Flex,
    Grid,
    Input,
    Modal,
    Skeleton,
    Tag,
    Tree,
    Typography,
    theme,
} from 'antd'
import type { MenuProps } from 'antd'
import {
    ApartmentOutlined,
    ArrowLeftOutlined,
    BankOutlined,
    DeleteOutlined,
    EditOutlined,
    ExperimentOutlined,
    NodeIndexOutlined,
    PlusOutlined,
    SearchOutlined,
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
import { JerarquiaChildCard } from './JerarquiaChildCard'
import {
    JerarquiaAreaDrawer,
    JerarquiaDepartamentoDrawer,
    JerarquiaServicioDrawer,
} from './JerarquiaFormDrawers'
import { JerarquiaTreeNodeTitle } from './JerarquiaTreeNodeTitle'

const { Text, Paragraph, Title } = Typography
const { useBreakpoint } = Grid

export function JerarquiaPanel() {
    const { token } = theme.useToken()
    const screens = useBreakpoint()
    const isMobile = !screens.lg

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
            key: 'edit',
            icon: <EditOutlined />,
            label: 'Editar área',
            onClick: ({ domEvent }) => {
                domEvent.stopPropagation()
                openEditArea(area)
            },
        },
        {
            key: 'new-dept',
            icon: <PlusOutlined />,
            label: 'Nuevo departamento',
            onClick: ({ domEvent }) => {
                domEvent.stopPropagation()
                openCreateDept(area.id)
            },
        },
        { type: 'divider' },
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
            key: 'edit',
            icon: <EditOutlined />,
            label: 'Editar departamento',
            onClick: ({ domEvent }) => {
                domEvent.stopPropagation()
                openEditDept(dept)
            },
        },
        {
            key: 'new-serv',
            icon: <PlusOutlined />,
            label: 'Nuevo servicio',
            onClick: ({ domEvent }) => {
                domEvent.stopPropagation()
                openCreateServicio(dept.id, dept.areaId)
            },
        },
        { type: 'divider' },
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
            key: 'edit',
            icon: <EditOutlined />,
            label: 'Editar servicio',
            onClick: ({ domEvent }) => {
                domEvent.stopPropagation()
                openEditServicio(servicio)
            },
        },
        { type: 'divider' },
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

            return {
                key: nodeKey('area', area.id),
                title: (
                    <JerarquiaTreeNodeTitle
                        icon={<BankOutlined />}
                        nombre={area.nombre}
                        codigo={area.codigo}
                        countLabel={`${deptCount} depto${deptCount === 1 ? '' : 's'} · ${serviciosCount} serv.`}
                        menuItems={buildAreaMenu(areaEntity)}
                        deleting={deletingAreaId === area.id}
                    />
                ),
                children: area.departamentos.map((dept) => {
                    const deptEntity = toDepartamento(dept, area.nombre)
                    const servCount = dept.servicios.length

                    return {
                        key: nodeKey('departamento', dept.id),
                        title: (
                            <JerarquiaTreeNodeTitle
                                icon={<ApartmentOutlined />}
                                nombre={dept.nombre}
                                codigo={dept.codigo}
                                countLabel={`${servCount} servicio${servCount === 1 ? '' : 's'}`}
                                menuItems={buildDeptMenu(deptEntity)}
                                deleting={deletingDeptId === dept.id}
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
                                        icon={<ExperimentOutlined />}
                                        nombre={servicio.nombre}
                                        codigo={servicio.codigo}
                                        countLabel={empleados ?? undefined}
                                        menuItems={buildServicioMenu(servicioEntity)}
                                        deleting={deletingServicioId === servicio.id}
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
        <aside className="jerarquia-explorer__sidebar">
            <div className="jerarquia-explorer__sidebar-head">
                <Flex align="center" gap={8}>
                    <NodeIndexOutlined className="jerarquia-explorer__sidebar-icon" />
                    <div>
                        <Text strong className="jerarquia-explorer__sidebar-title">
                            Explorador organizacional
                        </Text>
                        <Text type="secondary" className="jerarquia-explorer__sidebar-caption">
                            {areaNodes.length} área{areaNodes.length === 1 ? '' : 's'}
                        </Text>
                    </div>
                </Flex>
                <Button
                    type="primary"
                    size="small"
                    icon={<PlusOutlined />}
                    onClick={openCreateArea}
                >
                    Área
                </Button>
            </div>

            <div className="jerarquia-explorer__sidebar-search">
                <Input
                    allowClear
                    size="small"
                    prefix={<SearchOutlined style={{ color: token.colorTextQuaternary }} />}
                    placeholder="Buscar área, departamento o servicio…"
                    value={treeSearchInput}
                    onChange={(event) => setTreeSearchInput(event.target.value)}
                    onClear={() => {
                        setTreeSearchInput('')
                        setTreeSearch('')
                    }}
                />
            </div>

            <div className="jerarquia-explorer__sidebar-body">
                {loadingJerarquia ? (
                    <div className="jerarquia-explorer__sidebar-loading">
                        <Skeleton active paragraph={{ rows: 8 }} />
                    </div>
                ) : areaNodes.length === 0 ? (
                    <div className="jerarquia-explorer__sidebar-empty">
                        <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description="No hay áreas registradas"
                        >
                            <Button type="primary" icon={<PlusOutlined />} onClick={openCreateArea}>
                                Crear primera área
                            </Button>
                        </Empty>
                    </div>
                ) : filteredAreaNodes.length === 0 ? (
                    <div className="jerarquia-explorer__sidebar-empty">
                        <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description="Sin coincidencias en la búsqueda"
                        />
                    </div>
                ) : (
                    <Tree
                        blockNode
                        showLine={{ showLeafIcon: false }}
                        treeData={treeData}
                        selectedKeys={selectedKeys}
                        expandedKeys={expandedKeys}
                        onExpand={(keys) => setExpandedKeys(keys.map(String))}
                        onSelect={(keys) => handleTreeSelect(keys)}
                        className="jerarquia-explorer__tree"
                    />
                )}
            </div>
        </aside>
    )

    const renderStat = (label: string, value: string | number) => (
        <div className="jerarquia-explorer__stat">
            <Text type="secondary" className="jerarquia-explorer__stat-label">
                {label}
            </Text>
            <Text strong className="jerarquia-explorer__stat-value">
                {value}
            </Text>
        </div>
    )

    const renderAreaDetail = () => {
        if (!selectedArea || !selectedAreaNode) return null

        const serviciosTotal = countAreaServicios(selectedAreaNode)
        const empleados = formatEmpleados(selectedAreaNode.empleadosCount)

        return (
            <>
                <div className="jerarquia-explorer__detail-hero">
                    <Flex align="flex-start" justify="space-between" gap={16} wrap="wrap">
                        <Flex align="flex-start" gap={12} className="jerarquia-explorer__detail-main">
                            <div className="jerarquia-explorer__detail-badge" aria-hidden>
                                <BankOutlined />
                            </div>
                            <div>
                                <Tag className="jerarquia-explorer__detail-code-tag" variant="filled">
                                    {selectedArea.codigo}
                                </Tag>
                                <Title level={4} className="jerarquia-explorer__detail-title">
                                    {selectedArea.nombre}
                                </Title>
                                {selectedArea.descripcion ? (
                                    <Paragraph
                                        type="secondary"
                                        className="jerarquia-explorer__detail-description"
                                    >
                                        {selectedArea.descripcion}
                                    </Paragraph>
                                ) : null}
                            </div>
                        </Flex>
                        <Flex gap={8} wrap="wrap" className="jerarquia-explorer__detail-actions">
                            <Button
                                icon={<EditOutlined />}
                                onClick={() => openEditArea(selectedArea)}
                            >
                                Editar
                            </Button>
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={() => openCreateDept(selectedArea.id)}
                            >
                                Nuevo departamento
                            </Button>
                        </Flex>
                    </Flex>

                    <div className="jerarquia-explorer__stats-row">
                        {renderStat('Departamentos', selectedAreaNode.departamentos.length)}
                        {renderStat('Servicios', serviciosTotal)}
                        {empleados ? renderStat('Empleados', empleados) : null}
                    </div>
                </div>

                <div className="jerarquia-explorer__detail-section">
                    <Text strong className="jerarquia-explorer__section-title">
                        Departamentos
                    </Text>
                    {selectedAreaNode.departamentos.length === 0 ? (
                        <div className="jerarquia-explorer__section-empty">
                            <Empty
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                description="Esta área no tiene departamentos"
                            >
                                <Button
                                    type="primary"
                                    icon={<PlusOutlined />}
                                    onClick={() => openCreateDept(selectedArea.id)}
                                >
                                    Agregar departamento
                                </Button>
                            </Empty>
                        </div>
                    ) : (
                        <div className="jerarquia-explorer__child-grid">
                            {selectedAreaNode.departamentos.map((dept) => {
                                const servCount = dept.servicios.length
                                const meta = [
                                    `${servCount} servicio${servCount === 1 ? '' : 's'}`,
                                    formatEmpleados(dept.empleadosCount),
                                ]
                                    .filter(Boolean)
                                    .join(' · ')

                                return (
                                    <JerarquiaChildCard
                                        key={dept.id}
                                        icon={<ApartmentOutlined />}
                                        nombre={dept.nombre}
                                        codigo={dept.codigo}
                                        meta={meta}
                                        selected={selectedDept?.id === dept.id}
                                        onClick={() =>
                                            syncSelection(
                                                'departamento',
                                                selectedArea,
                                                toDepartamento(dept, selectedArea.nombre),
                                                null,
                                            )
                                        }
                                    />
                                )
                            })}
                        </div>
                    )}
                </div>
            </>
        )
    }

    const renderDepartamentoDetail = () => {
        if (!selectedArea || !selectedDept || !selectedDeptNode) return null

        const empleados = formatEmpleados(selectedDeptNode.empleadosCount)

        return (
            <>
                <div className="jerarquia-explorer__detail-hero">
                    <Flex align="flex-start" justify="space-between" gap={16} wrap="wrap">
                        <Flex align="flex-start" gap={12} className="jerarquia-explorer__detail-main">
                            <div className="jerarquia-explorer__detail-badge" aria-hidden>
                                <ApartmentOutlined />
                            </div>
                            <div>
                                <Tag className="jerarquia-explorer__detail-code-tag" variant="filled">
                                    {selectedDept.codigo}
                                </Tag>
                                <Title level={4} className="jerarquia-explorer__detail-title">
                                    {selectedDept.nombre}
                                </Title>
                                <Text type="secondary" className="jerarquia-explorer__detail-parent">
                                    Área: {selectedArea.nombre}
                                </Text>
                                {selectedDept.descripcion ? (
                                    <Paragraph
                                        type="secondary"
                                        className="jerarquia-explorer__detail-description"
                                    >
                                        {selectedDept.descripcion}
                                    </Paragraph>
                                ) : null}
                            </div>
                        </Flex>
                        <Flex gap={8} wrap="wrap" className="jerarquia-explorer__detail-actions">
                            <Button
                                icon={<EditOutlined />}
                                onClick={() => openEditDept(selectedDept)}
                            >
                                Editar
                            </Button>
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={() => openCreateServicio(selectedDept.id, selectedDept.areaId)}
                            >
                                Nuevo servicio
                            </Button>
                        </Flex>
                    </Flex>

                    <div className="jerarquia-explorer__stats-row">
                        {renderStat('Servicios', selectedDeptNode.servicios.length)}
                        {empleados ? renderStat('Empleados', empleados) : null}
                    </div>
                </div>

                <div className="jerarquia-explorer__detail-section">
                    <Text strong className="jerarquia-explorer__section-title">
                        Servicios
                    </Text>
                    {selectedDeptNode.servicios.length === 0 ? (
                        <div className="jerarquia-explorer__section-empty">
                            <Empty
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                description="Este departamento no tiene servicios"
                            >
                                <Button
                                    type="primary"
                                    icon={<PlusOutlined />}
                                    onClick={() =>
                                        openCreateServicio(selectedDept.id, selectedDept.areaId)
                                    }
                                >
                                    Agregar servicio
                                </Button>
                            </Empty>
                        </div>
                    ) : (
                        <div className="jerarquia-explorer__child-grid">
                            {selectedDeptNode.servicios.map((servicio) => (
                                <JerarquiaChildCard
                                    key={servicio.id}
                                    icon={<ExperimentOutlined />}
                                    nombre={servicio.nombre}
                                    codigo={servicio.codigo}
                                    meta={formatEmpleados(servicio.empleadosCount)}
                                    selected={selectedServicio?.id === servicio.id}
                                    onClick={() =>
                                        syncSelection(
                                            'servicio',
                                            selectedArea,
                                            selectedDept,
                                            toServicio(servicio, selectedDept.nombre),
                                        )
                                    }
                                />
                            ))}
                        </div>
                    )}
                </div>
            </>
        )
    }

    const renderServicioDetail = () => {
        if (!selectedArea || !selectedDept || !selectedServicio || !selectedServicioNode) {
            return null
        }

        const empleados = formatEmpleados(selectedServicioNode.servicio.empleadosCount)

        return (
            <div className="jerarquia-explorer__detail-hero jerarquia-explorer__detail-hero--solo">
                <Flex align="flex-start" justify="space-between" gap={16} wrap="wrap">
                    <Flex align="flex-start" gap={12} className="jerarquia-explorer__detail-main">
                        <div className="jerarquia-explorer__detail-badge" aria-hidden>
                            <ExperimentOutlined />
                        </div>
                        <div>
                            <Tag className="jerarquia-explorer__detail-code-tag" variant="filled">
                                {selectedServicio.codigo}
                            </Tag>
                            <Title level={4} className="jerarquia-explorer__detail-title">
                                {selectedServicio.nombre}
                            </Title>
                            <Text type="secondary" className="jerarquia-explorer__detail-parent">
                                {selectedArea.nombre} › {selectedDept.nombre}
                            </Text>
                            {selectedServicio.descripcion ? (
                                <Paragraph
                                    type="secondary"
                                    className="jerarquia-explorer__detail-description"
                                >
                                    {selectedServicio.descripcion}
                                </Paragraph>
                            ) : null}
                        </div>
                    </Flex>
                    <Flex gap={8} wrap="wrap" className="jerarquia-explorer__detail-actions">
                        <Button
                            icon={<EditOutlined />}
                            onClick={() => openEditServicio(selectedServicio)}
                        >
                            Editar
                        </Button>
                    </Flex>
                </Flex>

                {empleados ? (
                    <div className="jerarquia-explorer__stats-row">
                        {renderStat('Empleados', empleados)}
                    </div>
                ) : null}
            </div>
        )
    }

    const renderDetailContent = () => {
        if (!hasSelection) {
            return (
                <div className="jerarquia-explorer__detail-empty">
                    <div className="jerarquia-explorer__detail-empty-visual" aria-hidden>
                        <NodeIndexOutlined />
                    </div>
                    <Empty
                        image={false}
                        description={
                            <Flex vertical gap={6} align="center">
                                <Text strong style={{ fontSize: 16 }}>
                                    Seleccione un elemento
                                </Text>
                                <Paragraph
                                    type="secondary"
                                    style={{ marginBottom: 0, maxWidth: 360, textAlign: 'center' }}
                                >
                                    Elija un área, departamento o servicio en el árbol para ver su
                                    detalle y administrar su jerarquía.
                                </Paragraph>
                            </Flex>
                        }
                    />
                </div>
            )
        }

        if (selectionKind === 'servicio') return renderServicioDetail()
        if (selectionKind === 'departamento') return renderDepartamentoDetail()
        return renderAreaDetail()
    }

    const showTreeOnMobile = isMobile && !hasSelection
    const showDetailOnMobile = !isMobile || hasSelection

    return (
        <div className="jerarquia-explorer">
            {isMobile && hasSelection ? (
                <div className="jerarquia-explorer__mobile-nav">
                    <Button
                        type="text"
                        size="small"
                        icon={<ArrowLeftOutlined />}
                        onClick={() => syncSelection(null, null, null, null)}
                    >
                        Explorador
                    </Button>
                </div>
            ) : null}

            <div className="jerarquia-explorer__split">
                {(!isMobile || showTreeOnMobile) && renderTreePanel()}

                {showDetailOnMobile ? (
                    <main className="jerarquia-explorer__main">
                        <div className="jerarquia-explorer__main-breadcrumb">
                            <Breadcrumb items={breadcrumbItems} />
                        </div>
                        <div className="jerarquia-explorer__main-body">{renderDetailContent()}</div>
                    </main>
                ) : null}
            </div>

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
