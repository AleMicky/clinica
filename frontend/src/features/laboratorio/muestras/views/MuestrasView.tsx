import { useMemo, useState } from 'react'
import { createColumnHelper, type ColumnDef } from '@tanstack/react-table'
import { Select, Tag, Typography } from 'antd'
import { Link } from '@tanstack/react-router'

import { AppDataTable } from '../../../../shared/components/ui/data-table/AppDataTable'
import {
    CrudSearchFiltersBar,
    CrudSectionPanel,
} from '../../../../shared/components/ui/crud-section'
import { formatRegistrosCaption } from '../../../../shared/utils/crud-search'
import { usePagedSearchFilters } from '../../../../shared/hooks/use-paged-search-filters'
import { useMuestras } from '../hooks/muestras.hooks'
import {
    MUESTRA_ESTADO_COLORS,
    MUESTRA_ESTADO_LABELS,
    type Muestra,
} from '../types/muestra.types'

const { Text } = Typography
const columnHelper = createColumnHelper<Muestra>()

function formatDateTime(value: string) {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value
    return date.toLocaleString('es-BO')
}

const ESTADO_OPTIONS = Object.entries(MUESTRA_ESTADO_LABELS).map(([value, label]) => ({
    value,
    label,
}))

export function MuestrasView() {
    const filters = usePagedSearchFilters()
    const [estado, setEstado] = useState<string | undefined>(undefined)

    const { data, isFetching } = useMuestras({
        page: filters.page,
        pageSize: filters.pageSize,
        estado,
        search: filters.search || undefined,
    })

    const items = data?.items ?? []
    const total = data?.totalRecords ?? 0
    const hasActiveFilters = Boolean(filters.search || estado)

    const clearAllFilters = () => {
        filters.clearFilters()
        setEstado(undefined)
    }

    const columns = useMemo(
        () =>
            [
                columnHelper.accessor('codigo', {
                    header: 'Código',
                    size: 140,
                    cell: ({ getValue }) => (
                        <Text code className="rrhh-page__code">
                            {getValue()}
                        </Text>
                    ),
                }),
                columnHelper.display({
                    id: 'solicitud',
                    header: 'Solicitud',
                    size: 160,
                    cell: ({ row }) => (
                        <Link
                            to="/laboratorio/solicitudes/$id"
                            params={{ id: row.original.solicitudId }}
                        >
                            <Text code>{row.original.solicitudId.slice(0, 8)}…</Text>
                        </Link>
                    ),
                }),
                columnHelper.accessor('fechaToma', {
                    header: 'Fecha de toma',
                    size: 180,
                    cell: ({ getValue }) => formatDateTime(getValue()),
                }),
                columnHelper.accessor('estado', {
                    header: 'Estado',
                    size: 130,
                    cell: ({ getValue }) => {
                        const value = getValue()
                        return (
                            <Tag color={MUESTRA_ESTADO_COLORS[value] ?? 'default'}>
                                {MUESTRA_ESTADO_LABELS[value] ?? value}
                            </Tag>
                        )
                    },
                }),
                columnHelper.display({
                    id: 'detalles',
                    header: 'Pruebas',
                    size: 100,
                    cell: ({ row }) => (
                        <Tag>{row.original.detalles.length}</Tag>
                    ),
                }),
                columnHelper.accessor('observaciones', {
                    header: 'Observaciones',
                    cell: ({ getValue }) => getValue()?.trim() || '—',
                }),
            ] as ColumnDef<Muestra, unknown>[],
        [],
    )

    return (
        <CrudSectionPanel
            className="laboratorio-muestras"
            filters={
                <>
                    <CrudSearchFiltersBar
                        searchInput={filters.searchInput}
                        hasActiveFilters={hasActiveFilters}
                        onSearchInputChange={filters.handleSearchInputChange}
                        onSearch={filters.handleSearch}
                        onClearFilters={clearAllFilters}
                        ariaLabel="Filtros de muestras"
                        searchAriaLabel="Buscar muestra"
                        placeholder="Buscar por código…"
                    />
                    <Select
                        allowClear
                        size="small"
                        style={{ minWidth: 200 }}
                        placeholder="Filtrar por estado"
                        options={ESTADO_OPTIONS}
                        value={estado}
                        onChange={(value) => {
                            setEstado(value ?? undefined)
                            filters.handlePageChange(1, filters.pageSize)
                        }}
                        aria-label="Filtrar por estado"
                    />
                </>
            }
            actions={<span />}
            caption={formatRegistrosCaption(total, hasActiveFilters)}
        >
            <AppDataTable
                data={items}
                columns={columns}
                loading={isFetching}
                emptyText="No hay muestras registradas."
                getRowId={(row) => row.id}
                pagination={{
                    page: filters.page,
                    pageSize: filters.pageSize,
                    total,
                    pageSizeOptions: [10, 20, 50],
                    onChange: filters.handlePageChange,
                }}
            />
        </CrudSectionPanel>
    )
}
