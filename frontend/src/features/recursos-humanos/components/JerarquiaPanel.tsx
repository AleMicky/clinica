import { useCallback, useEffect, useMemo, useState } from 'react'
import type { DataNode } from 'antd/es/tree'
import {
    Breadcrumb,
    Drawer,
    Modal,
} from 'antd'
import type { MenuProps } from 'antd'
import {
    BankOutlined,
    DeleteOutlined,
    PlusOutlined,
} from '@ant-design/icons'

import {
    useCreateArea,
    useDeleteArea,
    useUpdateArea,
} from '../../catalogo-clinico/hooks/catalogo-clinico.hooks'
import type { Area } from '../../catalogo-clinico/types/catalogo-clinico.types'
import { useJerarquiaOrganizacional } from '../hooks/jerarquia.hooks'
import type { AreaFormValues } from '../schemas/area.schema'
import {
    collectExpandableKeys,
    filterJerarquiaTree,
    formatEmpleados,
    nodeKey,
    parseNodeKey,
    toArea,
    toAreaPayload,
    type JerarquiaSelectionKind,
    type JerarquiaTreeNode,
} from '../utils/jerarquia-tree'
import { DepartmentHeader } from './DepartmentHeader'
import { DepartmentStats } from './DepartmentStats'
import { JerarquiaEmpleadosSection } from './JerarquiaEmpleadosSection'
import { JerarquiaAreaDrawer } from './JerarquiaFormDrawers'
import { JerarquiaTreeNodeTitle } from './JerarquiaTreeNodeTitle'
import { OrganizationTree } from './OrganizationTree'

export function JerarquiaPanel() {
    const [treeSearchInput, setTreeSearchInput] = useState('')
    const [treeSearch, setTreeSearch] = useState('')
    const [selectedKeys, setSelectedKeys] = useState<string[]>([])
    const [expandedKeys, setExpandedKeys] = useState<string[]>([])

    const [selectedArea, setSelectedArea] = useState<Area | null>(null)
    const [selectionKind, setSelectionKind] = useState<JerarquiaSelectionKind>(null)

    const [areaDrawerOpen, setAreaDrawerOpen] = useState(false)
    const [editingArea, setEditingArea] = useState<Area | null>(null)
    const [createParentAreaId, setCreateParentAreaId] = useState<string | null>(null)

    const [deletingAreaId, setDeletingAreaId] = useState<string | null>(null)

    const { data: jerarquia, isPending: loadingJerarquia } = useJerarquiaOrganizacional(true)

    const createArea = useCreateArea()
    const updateArea = useUpdateArea()
    const deleteArea = useDeleteArea()

    const areaNodes = jerarquia?.areas ?? []

    const areaNodesById = useMemo(
        () => new Map(areaNodes.map((area) => [area.id, area])),
        [areaNodes],
    )

    const filteredAreaTree = useMemo(
        () => filterJerarquiaTree(areaNodes, treeSearch),
        [areaNodes, treeSearch],
    )

    const selectedAreaNode = selectedArea ? areaNodesById.get(selectedArea.id) ?? null : null

    const isSavingArea = createArea.isPending || updateArea.isPending

    const hasSelection = selectionKind !== null

    useEffect(() => {
        const timer = window.setTimeout(() => {
            setTreeSearch(treeSearchInput.trim())
        }, 300)
        return () => window.clearTimeout(timer)
    }, [treeSearchInput])

    const treeStructureKey = useMemo(
        () =>
            `${treeSearch}::${areaNodes
                .map((area) => `${area.id}:${area.areaPadreId ?? ''}`)
                .sort()
                .join('|')}`,
        [areaNodes, treeSearch],
    )

    // Expandir al cargar / al cambiar jerarquía o búsqueda (evita depender de defaultExpandAll).
    useEffect(() => {
        if (areaNodes.length === 0) {
            setExpandedKeys([])
            return
        }
        setExpandedKeys(collectExpandableKeys(filteredAreaTree))
        // filteredAreaTree se deriva de areaNodes + treeSearch (cubiertos por treeStructureKey).
        // eslint-disable-next-line react-hooks/exhaustive-deps -- solo re-expandir cuando cambia la estructura
    }, [treeStructureKey])

    const syncSelection = useCallback((kind: JerarquiaSelectionKind, area: Area | null) => {
        setSelectionKind(kind)
        setSelectedArea(area)

        if (area) {
            setSelectedKeys([nodeKey('area', area.id)])
            return
        }
        setSelectedKeys([])
    }, [])

    const openCreateArea = (parentAreaId: string | null = null) => {
        setEditingArea(null)
        setCreateParentAreaId(parentAreaId)
        setAreaDrawerOpen(true)
    }

    const openEditArea = (area: Area) => {
        setEditingArea(area)
        setCreateParentAreaId(null)
        setAreaDrawerOpen(true)
    }

    const handleDeleteArea = async (areaId: string) => {
        setDeletingAreaId(areaId)
        try {
            await deleteArea.mutateAsync(areaId)
            if (selectedArea?.id === areaId) {
                syncSelection(null, null)
            }
        } finally {
            setDeletingAreaId(null)
        }
    }

    const handleAreaSubmit = async (values: AreaFormValues) => {
        const payload = toAreaPayload(values)

        if (editingArea) {
            await updateArea.mutateAsync({ id: editingArea.id, data: payload })
        } else {
            await createArea.mutateAsync(payload)
        }

        setAreaDrawerOpen(false)
        setEditingArea(null)
        setCreateParentAreaId(null)
    }

    const buildAreaMenu = (area: Area): MenuProps['items'] => [
        {
            key: 'add-child',
            icon: <PlusOutlined />,
            label: 'Agregar subárea',
            onClick: ({ domEvent }) => {
                domEvent.stopPropagation()
                openCreateArea(area.id)
            },
        },
        {
            key: 'delete',
            danger: true,
            icon: <DeleteOutlined />,
            label: 'Eliminar área',
            onClick: ({ domEvent }) => {
                domEvent.stopPropagation()
                Modal.confirm({
                    title: '¿Eliminar área?',
                    content:
                        'No se podrá eliminar si tiene subáreas o empleados asignados.',
                    okText: 'Eliminar',
                    okType: 'danger',
                    cancelText: 'Cancelar',
                    onOk: () => handleDeleteArea(area.id),
                })
            },
        },
    ]

    const mapTreeNodes = useCallback(
        (nodes: JerarquiaTreeNode[]): DataNode[] =>
            nodes.map((area) => {
                const areaEntity = toArea(area)
                const empleados = formatEmpleados(area.empleadosCount)

                return {
                    key: nodeKey('area', area.id),
                    isLeaf: area.children.length === 0,
                    title: (
                        <JerarquiaTreeNodeTitle
                            icon={<BankOutlined />}
                            nombre={area.nombre}
                            codigo={`${area.tipoAreaCodigo} · ${area.codigo}`}
                            countLabel={empleados ?? undefined}
                            menuItems={buildAreaMenu(areaEntity)}
                            deleting={deletingAreaId === area.id}
                            onEdit={() => openEditArea(areaEntity)}
                        />
                    ),
                    children: mapTreeNodes(area.children),
                }
            }),
        [deletingAreaId],
    )

    const treeData = useMemo(
        () => mapTreeNodes(filteredAreaTree),
        [filteredAreaTree, mapTreeNodes],
    )

    const handleTreeSelect = (keys: React.Key[]) => {
        const key = String(keys[0] ?? '')
        if (!key) {
            syncSelection(null, null)
            return
        }

        const parsed = parseNodeKey(key)
        if (!parsed) return

        const areaNode = areaNodesById.get(parsed.id)
        if (!areaNode) return

        syncSelection('area', toArea(areaNode))
    }

    const breadcrumbItems = useMemo(() => {
        const items: { title: React.ReactNode }[] = [
            { title: <span className="jerarquia-explorer__crumb-static">Recursos Humanos</span> },
        ]

        if (!selectedAreaNode) return items

        const path: typeof areaNodes = []
        let current: typeof selectedAreaNode | undefined = selectedAreaNode

        while (current) {
            path.unshift(current)
            current = current.areaPadreId
                ? areaNodesById.get(current.areaPadreId)
                : undefined
        }

        for (const node of path) {
            items.push({ title: node.nombre })
        }

        return items
    }, [selectedAreaNode, areaNodesById])

    const renderTreePanel = () => (
        <OrganizationTree
            areaCount={areaNodes.length}
            treeSearchInput={treeSearchInput}
            loading={loadingJerarquia}
            hasAreas={areaNodes.length > 0}
            hasFilteredAreas={filteredAreaTree.length > 0}
            treeData={treeData}
            selectedKeys={selectedKeys}
            expandedKeys={expandedKeys}
            onCreateArea={() => openCreateArea(null)}
            onSearchChange={setTreeSearchInput}
            onSearchClear={() => {
                setTreeSearchInput('')
                setTreeSearch('')
            }}
            onSelect={handleTreeSelect}
            onExpand={(keys) => setExpandedKeys(keys.map(String))}
        />
    )

    const renderAreaDetail = () => {
        if (!selectedArea || !selectedAreaNode) return null

        const empleados = formatEmpleados(selectedAreaNode.empleadosCount)
        const stats = [
            { label: 'Tipo', value: selectedAreaNode.tipoAreaNombre },
            ...(empleados ? [{ label: 'Empleados', value: empleados }] : []),
        ]

        const hierarchy = [{ label: 'Tipo', nombre: selectedAreaNode.tipoAreaNombre }]
        if (selectedAreaNode.areaPadreId) {
            const parent = areaNodesById.get(selectedAreaNode.areaPadreId)
            if (parent) {
                hierarchy.push({ label: 'Padre', nombre: parent.nombre })
            }
        }
        hierarchy.push({ label: 'Área', nombre: selectedArea.nombre })

        return (
            <>
                <DepartmentHeader
                    icon={<BankOutlined />}
                    codigo={selectedArea.codigo}
                    nombre={selectedArea.nombre}
                    hierarchy={hierarchy}
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

    return (
        <div className="jerarquia-explorer jerarquia-explorer--tree-only">
            {renderTreePanel()}

            <Drawer
                title="Detalle del área"
                open={hasSelection}
                onClose={() => syncSelection(null, null)}
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
                    {renderAreaDetail()}
                </div>
            </Drawer>

            <JerarquiaAreaDrawer
                open={areaDrawerOpen}
                entity={editingArea}
                parentAreaId={createParentAreaId}
                loading={isSavingArea}
                onClose={() => {
                    if (!isSavingArea) {
                        setAreaDrawerOpen(false)
                        setEditingArea(null)
                        setCreateParentAreaId(null)
                    }
                }}
                onSubmit={handleAreaSubmit}
            />
        </div>
    )
}
