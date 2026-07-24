import { Flex, Input, theme } from 'antd'
import { SearchOutlined } from '@ant-design/icons'

type TiposAtencionFiltersBarProps = {
    searchInput: string
    onSearchInputChange: (value: string) => void
    onSearch: (value: string) => void
}

export function TiposAtencionFiltersBar({
    searchInput,
    onSearchInputChange,
    onSearch,
}: TiposAtencionFiltersBarProps) {
    const { token } = theme.useToken()

    return (
        <Flex
            gap={6}
            wrap="wrap"
            align="center"
            className="rrhh-tipos-atencion__filters"
            role="search"
            aria-label="Filtros de tipos de atención"
        >
            <Input
                allowClear
                size="small"
                className="rrhh-tipos-atencion__filter-search"
                prefix={<SearchOutlined style={{ color: token.colorTextQuaternary }} />}
                placeholder="Buscar por código o nombre…"
                value={searchInput}
                onChange={(event) => onSearchInputChange(event.target.value)}
                onPressEnter={() => onSearch(searchInput)}
                onClear={() => {
                    onSearchInputChange('')
                    onSearch('')
                }}
                aria-label="Buscar tipo de atención"
            />
        </Flex>
    )
}
