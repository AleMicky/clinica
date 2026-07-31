import { useMemo, useState } from 'react'
import { createColumnHelper, type ColumnDef } from '@tanstack/react-table'
import { Button, Drawer, Popconfirm, Select, Space, Tag, Typography } from 'antd'
import {
    CheckCircleOutlined,
    EyeOutlined,
    SendOutlined,
} from '@ant-design/icons'
import { Link } from '@tanstack/react-router'

import { AppDataTable } from '../../../../shared/components/ui/data-table/AppDataTable'
import { CrudSectionPanel } from '../../../../shared/components/ui/crud-section'
import { formatRegistrosCaption } from '../../../../shared/utils/crud-search'
import { usePagedSearchFilters } from '../../../../shared/hooks/use-paged-search-filters'
import { WorkflowEmployeeSelect } from '../../../workflow/components/WorkflowEmployeeSelect'
import { ResultadoDetallesTable } from '../components/ResultadoDetallesTable'
import {
    useEntregarResultado,
    useResultados,
    useValidarResultado,
} from '../hooks/resultados.hooks'
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
    const [detalle, setDetalle] = useState<Resultado | null>(null)

    const { data, isFetching } = useResultados({
        page: filters.page,
        pageSize: filters.pageSize,
        estado,
    })
    const validarMutation = useValidarResultado()
    const entregarMutation = useEntregarResultado()

    const items = data?.items ?? []
    const total = data?.totalRecords ?? 0
    const hasActiveFilters = Boolean(estado)

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
                    cell: ({ row }) => {
                        const fueraDeRango = row.original.detalles.filter(
                            (d) => d.fueraDeRango,
                        ).length
                        return (
                            <Space size={4}>
                                <Tag>{row.original.detalles.length}</Tag>
                                {fueraDeRango > 0 ? (
                                    <Tag color="error">{fueraDeRango} fuera</Tag>
                                ) : null}
                            </Space>
                        )
                    },
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
                    size: 220,
                    meta: { align: 'right', headerAlign: 'right' },
                    cell: ({ row }) => {
                        const resultado = row.original
                        return (
                            <Space size={4}>
                                <Button
                                    type="text"
                                    size="small"
                                    icon={<EyeOutlined />}
                                    aria-label="Ver detalle del resultado"
                                    onClick={() => setDetalle(resultado)}
                                >
                                    Detalle
                                </Button>
                                {resultado.estado === 'REGISTRADO' ? (
                                    <Popconfirm
                                        title="Validar resultado"
                                        description="¿Confirma la validación de este resultado?"
                                        okText="Validar"
                                        cancelText="Cancelar"
                                        disabled={!empleadoId}
                                        okButtonProps={{
                                            loading: validarMutation.isPending,
                                        }}
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
                                ) : null}
                                {resultado.estado === 'VALIDADO' ? (
                                    <Popconfirm
                                        title="Entregar resultado"
                                        description="¿Confirma la entrega de este resultado?"
                                        okText="Entregar"
                                        cancelText="Cancelar"
                                        disabled={!empleadoId}
                                        okButtonProps={{
                                            loading: entregarMutation.isPending,
                                        }}
                                        onConfirm={() =>
                                            void entregarMutation.mutateAsync({
                                                id: resultado.id,
                                                data: { empleadoId },
                                            })
                                        }
                                    >
                                        <Button
                                            type="text"
                                            size="small"
                                            icon={<SendOutlined />}
                                            disabled={!empleadoId}
                                            aria-label="Entregar resultado"
                                        >
                                            Entregar
                                        </Button>
                                    </Popconfirm>
                                ) : null}
                            </Space>
                        )
                    },
                }),
            ] as ColumnDef<Resultado, unknown>[],
        [empleadoId, validarMutation, entregarMutation],
    )

    return (
        <>
            <CrudSectionPanel
                className="laboratorio-resultados"
                filters={
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
                }
                actions={
                    <WorkflowEmployeeSelect
                        value={empleadoId || undefined}
                        onChange={(value) =>
                            setEmpleadoId(
                                typeof value === 'string' ? value : value[0] ?? '',
                            )
                        }
                        placeholder="Empleado"
                    />
                }
                caption={formatRegistrosCaption(total, hasActiveFilters)}
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

            <Drawer
                title="Detalle del resultado"
                open={Boolean(detalle)}
                onClose={() => setDetalle(null)}
                width={720}
                destroyOnHidden
            >
                {detalle ? (
                    <ResultadoDetallesTable detalles={detalle.detalles} />
                ) : null}
            </Drawer>
        </>
    )
}
