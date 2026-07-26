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
} from '@ant-design/icons'

import {
    useCreateArea,
    useDeleteArea,
    useUpdateArea,
} from '../../catalogo-clinico/hooks/catalogo-clinico.hooks'
import type { CatalogoBaseFormValues } from '../../catalogo-clinico/schemas/catalogo-clinico.schema'
import type { Area } from '../../catalogo-clinico/types/catalogo-clinico.types'
import { useJerarquiaOrganizacional } from '../hooks/jerarquia.hooks'
import {
    filterJerarquiaTree,
    formatEmpleados,
    nodeKey,
    parseNodeKey,
    toArea,
    toBasePayload,
    type JerarquiaSelectionKind,
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

    const [selectedArea, setSelectedArea] = useState<Area | null>(null)
    const [selectionKind, setSelectionKind] = useState<JerarquiaSelectionKind>(null)

    const [areaDrawerOpen, setAreaDrawerOpen] = useState(false)
    const [editingArea, setEditingArea] = useState<Area | null>(null)

    const [deletingAreaId, setDeletingAreaId] = useState<string | null>(null)

    const { data: jerarquia, isFetching: loadingJerarquia } = useJerarquiaOrganizacional(true)

    const createArea = useCreateArea()
    const updateArea = useUpdateArea()
    const deleteArea = useDeleteArea()

    const areaNodes = jerarquia?.areas ?? []

    const areaNodesById = useMemo(
        () => new Map(areaNodes.map((area) => [area.id, area])),
        [areaNodes],
    )

    const filteredAreaNodes = useMemo(
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

    const syncSelection = useCallback((kind: JerarquiaSelectionKind, area: Area | null) => {
        setSelectionKind(kind)
        setSelectedArea(area)

        if (area) {
            setSelectedKeys([nodeKey('area', area.id)])
            return
        }
        setSelectedKeys([])
    }, [])

    const openCreateArea = () => {
        setEditingArea(null)
        setAreaDrawerOpen(true)
    }

    const openEditArea = (area: Area) => {
        setEditingArea(area)
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
                    content: 'Se eliminará el área y sus empleados quedarán sin asignación.',
                    okText: 'Eliminar',
                    okType: 'danger',
                    cancelText: 'Cancelar',
                    onOk: () => handleDeleteArea(area.id),
                })
            },
        },
    ]

    const treeData = useMemo<DataNode[]>(() => {
        return filteredAreaNodes.map((area) => {
            const areaEntity = toArea(area)
            const empleados = formatEmpleados(area.empleadosCount)

            return {
                key: nodeKey('area', area.id),
                isLeaf: true,
                title: (
                    <JerarquiaTreeNodeTitle
                        icon={<BankOutlined />}
                        nombre={area.nombre}
                        codigo={area.codigo}
                        countLabel={empleados ?? undefined}
                        menuItems={buildAreaMenu(areaEntity)}
                        deleting={deletingAreaId === area.id}
                        onEdit={() => openEditArea(areaEntity)}
                    />
                ),
            }
        })
    }, [filteredAreaNodes, deletingAreaId])

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

        if (selectedArea) {
            items.push({ title: selectedArea.nombre })
        }

        return items
    }, [selectedArea])

    const renderTreePanel = () => (
        <OrganizationTree
            areaCount={areaNodes.length}
            treeSearchInput={treeSearchInput}
            loading={loadingJerarquia}
            hasAreas={areaNodes.length > 0}
            hasFilteredAreas={filteredAreaNodes.length > 0}
            treeData={treeData}
            selectedKeys={selectedKeys}
            onCreateArea={openCreateArea}
            onSearchChange={setTreeSearchInput}
            onSearchClear={() => {
                setTreeSearchInput('')
                setTreeSearch('')
            }}
            onSelect={handleTreeSelect}
        />
    )

    const renderAreaDetail = () => {
        if (!selectedArea || !selectedAreaNode) return null

        const empleados = formatEmpleados(selectedAreaNode.empleadosCount)
        const stats = empleados ? [{ label: 'Empleados', value: empleados }] : []

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
                loading={isSavingArea}
                onClose={() => {
                    if (!isSavingArea) {
                        setAreaDrawerOpen(false)
                        setEditingArea(null)
                    }
                }}
                onSubmit={handleAreaSubmit}
            />
        </div>
    )
}
