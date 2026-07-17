import type { DataNode } from 'antd/es/tree'
import { Button, Empty, Flex, Input, Skeleton, Tree, Typography, theme } from 'antd'
import { NodeIndexOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons'

const { Text } = Typography

type OrganizationTreeProps = {
    areaCount: number
    treeSearchInput: string
    loading: boolean
    hasAreas: boolean
    hasFilteredAreas: boolean
    treeData: DataNode[]
    selectedKeys: string[]
    expandedKeys: string[]
    onCreateArea: () => void
    onSearchChange: (value: string) => void
    onSearchClear: () => void
    onExpand: (keys: string[]) => void
    onSelect: (keys: React.Key[]) => void
}

export function OrganizationTree({
    areaCount,
    treeSearchInput,
    loading,
    hasAreas,
    hasFilteredAreas,
    treeData,
    selectedKeys,
    expandedKeys,
    onCreateArea,
    onSearchChange,
    onSearchClear,
    onExpand,
    onSelect,
}: OrganizationTreeProps) {
    const { token } = theme.useToken()

    return (
        <section className="jerarquia-explorer__tree-panel">
            <div className="jerarquia-explorer__sidebar-head">
                <Flex align="center" gap={8}>
                    <NodeIndexOutlined className="jerarquia-explorer__sidebar-icon" />
                    <div>
                        <Text strong className="jerarquia-explorer__sidebar-title">
                            Explorador organizacional
                        </Text>
                        <Text type="secondary" className="jerarquia-explorer__sidebar-caption">
                            {areaCount} área{areaCount === 1 ? '' : 's'} · seleccione un nodo para
                            ver detalle
                        </Text>
                    </div>
                </Flex>
                <Button
                    type="primary"
                    size="small"
                    icon={<PlusOutlined />}
                    onClick={onCreateArea}
                >
                    Área
                </Button>
            </div>

            <div className="jerarquia-explorer__sidebar-search">
                <Input
                    allowClear
                    size="middle"
                    prefix={<SearchOutlined style={{ color: token.colorTextQuaternary }} />}
                    placeholder="Buscar área, departamento o servicio…"
                    value={treeSearchInput}
                    onChange={(event) => onSearchChange(event.target.value)}
                    onClear={onSearchClear}
                    className="jerarquia-explorer__search-input"
                />
            </div>

            <div className="jerarquia-explorer__sidebar-body">
                {loading ? (
                    <div className="jerarquia-explorer__sidebar-loading">
                        <Skeleton active paragraph={{ rows: 10 }} />
                    </div>
                ) : !hasAreas ? (
                    <div className="jerarquia-explorer__sidebar-empty">
                        <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description="No hay áreas registradas"
                        >
                            <Button type="primary" icon={<PlusOutlined />} onClick={onCreateArea}>
                                Crear primera área
                            </Button>
                        </Empty>
                    </div>
                ) : !hasFilteredAreas ? (
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
                        onExpand={(keys) => onExpand(keys.map(String))}
                        onSelect={(keys) => onSelect(keys)}
                        className="jerarquia-explorer__tree"
                    />
                )}
            </div>
        </section>
    )
}
