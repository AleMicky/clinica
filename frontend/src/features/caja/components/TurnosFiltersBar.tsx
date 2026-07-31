import { Button, Flex, Select } from 'antd'
import { ClearOutlined } from '@ant-design/icons'

type Option = { label: string; value: string }

type TurnosFiltersBarProps = {
    cajaId: string | undefined
    estado: string | undefined
    cajaOptions: Option[]
    hasActiveFilters: boolean
    onCajaFilterChange: (value: string | undefined) => void
    onEstadoFilterChange: (value: string | undefined) => void
    onClearFilters: () => void
}

export function TurnosFiltersBar({
    cajaId,
    estado,
    cajaOptions,
    hasActiveFilters,
    onCajaFilterChange,
    onEstadoFilterChange,
    onClearFilters,
}: TurnosFiltersBarProps) {
    return (
        <Flex
            gap={6}
            wrap="wrap"
            align="center"
            className="rrhh-empleados__filters"
            role="search"
            aria-label="Filtros de turnos de caja"
        >
            <Select
                allowClear
                size="small"
                placeholder="Caja"
                className="rrhh-empleados__filter-select"
                value={cajaId}
                options={cajaOptions}
                onChange={(value) => onCajaFilterChange(value)}
                aria-label="Filtrar por caja"
                style={{ minWidth: 180 }}
            />
            <Select
                allowClear
                size="small"
                placeholder="Estado"
                className="rrhh-empleados__filter-select"
                value={estado}
                options={[
                    { label: 'Abierto', value: 'ABIERTO' },
                    { label: 'Cerrado', value: 'CERRADO' },
                    { label: 'Anulado', value: 'ANULADO' },
                ]}
                onChange={(value) => onEstadoFilterChange(value)}
                aria-label="Filtrar por estado"
                style={{ minWidth: 140 }}
            />
            {hasActiveFilters ? (
                <Button
                    type="text"
                    size="small"
                    icon={<ClearOutlined />}
                    onClick={onClearFilters}
                    className="rrhh-empleados__filter-clear"
                    aria-label="Limpiar filtros"
                >
                    Limpiar
                </Button>
            ) : null}
        </Flex>
    )
}
