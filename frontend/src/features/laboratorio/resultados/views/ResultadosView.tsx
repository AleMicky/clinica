import { useMemo, useState } from 'react'
import { createColumnHelper, type ColumnDef } from '@tanstack/react-table'
import { Button, Popconfirm, Select, Tag, Typography } from 'antd'
import { CheckCircleOutlined } from '@ant-design/icons'
import { Link } from '@tanstack/react-router'

import { AppDataTable } from '../../../../shared/components/ui/data-table/AppDataTable'
import {
    CrudSearchFiltersBar,
    CrudSectionPanel,
} from '../../../../shared/components/ui/crud-section'
import { formatRegistrosCaption } from '../../../../shared/utils/crud-search'
import { usePagedSearchFilters } from '../../../../shared/hooks/use-paged-search-filters'
import { WorkflowEmployeeSelect } from '../../../workflow/components/WorkflowEmployeeSelect'
import { useResultados, useValidarResultado } from '../hooks/resultados.hooks'
import {
    RESULTADO_ESTADO_COLORS,
    RESULTADO_ESTADO_LABELS,
    type Resultado,
} from '../types/resultado.types'

const { Text } = Typography
const columnHelper = createColumnHelper<Resultado>()

const ESTADO_OPTIONS = Object.entries(RESULTADO_ESTADO_LABELS).map(([value, label]) => ({
    value,
    label,
}))

export function ResultadosView() {
    const filters = usePagedSearchFilters()
    const [estado, setEstado] = useState<string | undefined>(undefined)
    const [empleadoId, setEmpleadoId] = useState('')

    const { data, isFetching } = useResultados({
        page: filters.page,
        pageSize: filters.pageSize,
    })
    const validarMutation = useValidarResultado()

    const items = useMemo(() => {
        const source = data?.items ?? []
        return estado ? source.filter((item) => item.estado === estado) : source
    }, [data?.items, estado])

    const total = estado ? items.length : (data?.totalRecords ?? 0)

    const columns = useMemo(
        () =>
            [
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
                columnHelper.accessor('estado', {
                    header: 'Estado',
                    size: 130,
                    cell: ({ getValue }) => {
                        const value = getValue()
                        return (
                            <Tag color={RESULTADO_ESTADO_COLORS[value] ?? 'default'}>
                                {RESULTADO_ESTADO_LABELS[value] ?? value}
                            </Tag>
                        )
                    },
                }),
                columnHelper.display({
                    id: 'detalles',
                    header: 'Parámetros',
                    size: 110,
                    cell: ({ row }) => <Tag>{row.original.detalles.length}</Tag>,
                }),
                columnHelper.accessor('fechaValidacion', {
                    header: 'Validado',
                    size: 180,
                    cell: ({ getValue }) => {
                        const value = getValue()
                        if (!value) return '—'
                        const date = new Date(value)
                        return Number.isNaN(date.getTime())
                            ? value
                            : date.toLocaleString('es-BO')
                    },
                }),
                columnHelper.accessor('observaciones', {
                    header: 'Observaciones',
                    cell: ({ getValue }) => getValue()?.trim() || '—',
                }),
                columnHelper.display({
                    id: 'actions',
                    header: '',
                    size: 130,
                    meta: { align: 'right', headerAlign: 'right' },
                    cell: ({ row }) => {
                        const resultado = row.original
                        if (resultado.estado !== 'REGISTRADO') return null

                        return (
                            <Popconfirm
                                title="Validar resultado"
                                description="¿Confirma la validación de este resultado?"
                                okText="Validar"
                                cancelText="Cancelar"
                                disabled={!empleadoId}
                                okButtonProps={{ loading: validarMutation.isPending }}
                                onConfirm={() =>
                                    void validarMutation.mutateAsync({
                                        id: resultado.id,
                                        data: { empleadoId },
                                    })
                                }
                            >
                                <Button
                                    type="text"
                                    size="small"
                                    icon={<CheckCircleOutlined />}
                                    disabled={!empleadoId}
                                    aria-label="Validar resultado"
                                >
                                    Validar
                                </Button>
                            </Popconfirm>
                        )
                    },
                }),
            ] as ColumnDef<Resultado, unknown>[],
        [empleadoId, validarMutation],
    )

    return (
        <CrudSectionPanel
            className="laboratorio-resultados"
            filters={
                <>
                    <CrudSearchFiltersBar
                        searchInput={filters.searchInput}
                        hasActiveFilters={filters.hasActiveFilters}
                        onSearchInputChange={filters.handleSearchInputChange}
                        onSearch={filters.handleSearch}
                        onClearFilters={filters.clearFilters}
                        ariaLabel="Filtros de resultados"
                        searchAriaLabel="Buscar resultado"
                        placeholder="Buscar…"
                    />
                    <Select
                        allowClear
                        size="small"
                        style={{ minWidth: 200 }}
                        placeholder="Filtrar por estado"
                        options={ESTADO_OPTIONS}
                        value={estado}
                        onChange={(value) => setEstado(value ?? undefined)}
                        aria-label="Filtrar por estado"
                    />
                </>
            }
            actions={
                <WorkflowEmployeeSelect
                    value={empleadoId || undefined}
                    onChange={(value) =>
                        setEmpleadoId(typeof value === 'string' ? value : value[0] ?? '')
                    }
                    placeholder="Empleado validador"
                />
            }
            caption={formatRegistrosCaption(total, Boolean(estado))}
        >
            <AppDataTable
                data={items}
                columns={columns}
                loading={isFetching}
                emptyText="No hay resultados registrados."
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
