import { Button, Flex, Select, Switch, Typography } from 'antd'
import { ClearOutlined } from '@ant-design/icons'

const { Text } = Typography

type Option = { label: string; value: string }

type MovimientosFiltersBarProps = {
    tipoMovimiento: string | undefined
    conceptoCajaId: string | undefined
    metodoPagoId: string | undefined
    estado: string | undefined
    filtroTurnoAbierto: boolean
    hasTurnoAbierto: boolean
    conceptoOptions: Option[]
    metodoOptions: Option[]
    hasActiveFilters: boolean
    onTipoChange: (value: string | undefined) => void
    onConceptoChange: (value: string | undefined) => void
    onMetodoChange: (value: string | undefined) => void
    onEstadoChange: (value: string | undefined) => void
    onTurnoAbiertoChange: (value: boolean) => void
    onClearFilters: () => void
}

export function MovimientosFiltersBar({
    tipoMovimiento,
    conceptoCajaId,
    metodoPagoId,
    estado,
    filtroTurnoAbierto,
    hasTurnoAbierto,
    conceptoOptions,
    metodoOptions,
    hasActiveFilters,
    onTipoChange,
    onConceptoChange,
    onMetodoChange,
    onEstadoChange,
    onTurnoAbiertoChange,
    onClearFilters,
}: MovimientosFiltersBarProps) {
    return (
        <Flex
            gap={6}
            wrap="wrap"
            align="center"
            className="rrhh-empleados__filters"
            role="search"
            aria-label="Filtros de movimientos de caja"
        >
            {hasTurnoAbierto ? (
                <Flex align="center" gap={6}>
                    <Switch
                        size="small"
                        checked={filtroTurnoAbierto}
                        onChange={onTurnoAbiertoChange}
                        aria-label="Solo turno abierto"
                    />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        Turno abierto
                    </Text>
                </Flex>
            ) : null}
            <Select
                allowClear
                size="small"
                placeholder="Tipo"
                className="rrhh-empleados__filter-select"
                value={tipoMovimiento}
                options={[
                    { label: 'Ingreso', value: 'INGRESO' },
                    { label: 'Egreso', value: 'EGRESO' },
                ]}
                onChange={(value) => onTipoChange(value)}
                aria-label="Filtrar por tipo"
                style={{ minWidth: 120 }}
            />
            <Select
                allowClear
                size="small"
                showSearch
                optionFilterProp="label"
                placeholder="Concepto"
                className="rrhh-empleados__filter-select"
                value={conceptoCajaId}
                options={conceptoOptions}
                onChange={(value) => onConceptoChange(value)}
                aria-label="Filtrar por concepto"
                style={{ minWidth: 200 }}
            />
            <Select
                allowClear
                size="small"
                showSearch
                optionFilterProp="label"
                placeholder="Método"
                className="rrhh-empleados__filter-select"
                value={metodoPagoId}
                options={metodoOptions}
                onChange={(value) => onMetodoChange(value)}
                aria-label="Filtrar por método de pago"
                style={{ minWidth: 140 }}
            />
            <Select
                allowClear
                size="small"
                placeholder="Estado"
                className="rrhh-empleados__filter-select"
                value={estado}
                options={[
                    { label: 'Confirmado', value: 'CONFIRMADO' },
                    { label: 'Anulado', value: 'ANULADO' },
                ]}
                onChange={(value) => onEstadoChange(value)}
                aria-label="Filtrar por estado"
                style={{ minWidth: 130 }}
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
