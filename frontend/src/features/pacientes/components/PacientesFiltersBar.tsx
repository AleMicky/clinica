import { Flex, Input, theme } from 'antd'
import { SearchOutlined } from '@ant-design/icons'

type PacientesFiltersBarProps = {
    searchInput: string
    onSearchInputChange: (value: string) => void
    onSearch: (value: string) => void
}

export function PacientesFiltersBar({
    searchInput,
    onSearchInputChange,
    onSearch,
}: PacientesFiltersBarProps) {
    const { token } = theme.useToken()

    return (
        <Flex
            gap={6}
            wrap="wrap"
            align="center"
            className="rrhh-pacientes__filters"
            role="search"
            aria-label="Filtros de pacientes"
        >
            <Input
                allowClear
                size="small"
                className="rrhh-pacientes__filter-search"
                prefix={<SearchOutlined style={{ color: token.colorTextQuaternary }} />}
                placeholder="Buscar por nombre, HC o documento…"
                value={searchInput}
                onChange={(event) => onSearchInputChange(event.target.value)}
                onPressEnter={() => onSearch(searchInput)}
                onClear={() => {
                    onSearchInputChange('')
                    onSearch('')
                }}
                aria-label="Buscar paciente"
            />
        </Flex>
    )
}
