import { useMemo } from 'react'
import { createColumnHelper, type ColumnDef } from '@tanstack/react-table'
import { Button, Empty, Space, Tag, Tooltip, Typography } from 'antd'
import { LockOutlined, ScheduleOutlined, UnlockOutlined } from '@ant-design/icons'

import { AppDataTable } from '../../../shared/components/ui/data-table/AppDataTable'
import type { TurnoCaja } from '../types/caja.types'

const { Text } = Typography
const columnHelper = createColumnHelper<TurnoCaja>()

type TurnosTableProps = {
    turnos: TurnoCaja[]
    loading: boolean
    total: number
    page: number
    pageSize: number
    onPageChange: (page: number, pageSize: number) => void
    onCerrar: (turno: TurnoCaja) => void
    onAbrir?: () => void
    hasActiveFilters?: boolean
    className?: string
}

function formatMoney(value: number | null | undefined) {
    if (value == null) return '—'
    return value.toLocaleString('es-BO', { style: 'currency', currency: 'BOB' })
}

function formatDateTime(value: string | null | undefined) {
    if (!value) return '—'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value
    return date.toLocaleString('es-BO')
}

function getInitials(nombre: string) {
    const parts = nombre.trim().split(/\s+/).filter(Boolean)
    if (parts.length >= 2) {
        return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase()
    }
    return nombre.trim().slice(0, 2).toUpperCase() || '—'
}

function estadoColor(estado: string) {
    switch (estado) {
        case 'ABIERTO':
            return 'success'
        case 'CERRADO':
            return 'default'
        case 'ANULADO':
            return 'error'
        default:
            return 'processing'
    }
}

function EmpleadoCell({
    nombre,
    id,
}: {
    nombre?: string | null
    id: string
}) {
    const label = nombre?.trim() || id.slice(0, 8)
    return (
        <div className="paciente-cell">
            <span className="paciente-cell__avatar" aria-hidden>
                {getInitials(label)}
            </span>
            <span className="paciente-cell__text">
                <Text strong className="paciente-cell__name">
                    {label}
                </Text>
            </span>
        </div>
    )
}

export function TurnosTable({
    turnos,
    loading,
    total,
    page,
    pageSize,
    onPageChange,
    onCerrar,
    onAbrir,
    hasActiveFilters = false,
    className,
}: TurnosTableProps) {
    const columns = useMemo(
        () =>
            [
                columnHelper.accessor('cajaCodigo', {
                    header: 'Caja',
                    size: 180,
                    cell: ({ row }) => (
                        <div className="paciente-cell">
                            <span className="paciente-cell__text">
                                <Text strong className="paciente-cell__name">
                                    {row.original.cajaCodigo}
                                </Text>
                                <Text type="secondary" className="paciente-cell__sub">
                                    {row.original.cajaNombre}
                                </Text>
                            </span>
                        </div>
                    ),
                }),
                columnHelper.accessor('empleadoAperturaNombre', {
                    header: 'Apertura por',
                    cell: ({ row }) => (
                        <EmpleadoCell
                            nombre={row.original.empleadoAperturaNombre}
                            id={row.original.empleadoAperturaId}
                        />
                    ),
                }),
                columnHelper.accessor('empleadoCierreNombre', {
                    header: 'Cierre por',
                    cell: ({ row }) => {
                        const { empleadoCierreNombre, empleadoCierreId } = row.original
                        if (!empleadoCierreId) {
                            return <Text type="secondary">—</Text>
                        }
                        return (
                            <EmpleadoCell
                                nombre={empleadoCierreNombre}
                                id={empleadoCierreId}
                            />
                        )
                    },
                }),
                columnHelper.accessor('fechaApertura', {
                    header: 'Apertura',
                    size: 160,
                    cell: ({ getValue }) => formatDateTime(getValue()),
                }),
                columnHelper.accessor('fechaCierre', {
                    header: 'Cierre',
                    size: 160,
                    cell: ({ getValue }) => formatDateTime(getValue()),
                }),
                columnHelper.accessor('montoInicial', {
                    header: 'Inicial',
                    size: 110,
                    cell: ({ getValue }) => formatMoney(getValue()),
                }),
                columnHelper.accessor('montoContado', {
                    header: 'Contado',
                    size: 110,
                    cell: ({ getValue }) => formatMoney(getValue()),
                }),
                columnHelper.accessor('diferencia', {
                    header: 'Diferencia',
                    size: 110,
                    cell: ({ getValue }) => {
                        const value = getValue()
                        if (value == null) return '—'
                        const color =
                            Math.abs(value) < 0.01
                                ? undefined
                                : value > 0
                                  ? 'success'
                                  : 'danger'
                        return (
                            <Text type={color}>{formatMoney(value)}</Text>
                        )
                    },
                }),
                columnHelper.accessor('estado', {
                    header: 'Estado',
                    size: 110,
                    cell: ({ getValue }) => (
                        <Tag color={estadoColor(getValue())}>{getValue()}</Tag>
                    ),
                }),
                columnHelper.display({
                    id: 'actions',
                    header: '',
                    size: 72,
                    meta: {
                        align: 'right',
                        headerAlign: 'right',
                    },
                    cell: ({ row }) => {
                        const turno = row.original
                        if (turno.estado !== 'ABIERTO') return null

                        return (
                            <Space size={4}>
                                <Tooltip title="Cerrar turno">
                                    <Button
                                        type="text"
                                        size="small"
                                        icon={<LockOutlined />}
                                        aria-label={`Cerrar turno ${turno.cajaCodigo}`}
                                        onClick={() => onCerrar(turno)}
                                    />
                                </Tooltip>
                            </Space>
                        )
                    },
                }),
            ] as ColumnDef<TurnoCaja, unknown>[],
        [onCerrar],
    )

    const showCustomEmpty = !loading && turnos.length === 0

    if (showCustomEmpty) {
        return (
            <div className={className}>
                <div className="app-data-table__wrapper">
                    <div className="pacientes-empty">
                        <Empty
                            image={
                                <ScheduleOutlined
                                    style={{ fontSize: 48, color: '#94a3b8' }}
                                />
                            }
                            description={
                                hasActiveFilters
                                    ? 'No se encontraron turnos con los filtros aplicados.'
                                    : 'No hay turnos registrados.'
                            }
                        >
                            {!hasActiveFilters && onAbrir ? (
                                <Button
                                    type="primary"
                                    icon={<UnlockOutlined />}
                                    onClick={onAbrir}
                                >
                                    Abrir turno
                                </Button>
                            ) : null}
                        </Empty>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <AppDataTable
            className={className}
            data={turnos}
            columns={columns}
            loading={loading}
            emptyText="No hay turnos registrados."
            getRowId={(row) => row.id}
            pagination={{
                page,
                pageSize,
                total,
                pageSizeOptions: [10, 20, 50],
                onChange: onPageChange,
            }}
        />
    )
}
