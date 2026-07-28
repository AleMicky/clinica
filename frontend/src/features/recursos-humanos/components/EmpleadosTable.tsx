import { useMemo } from 'react'
import {
    createColumnHelper,
    type ColumnDef,
} from '@tanstack/react-table'
import { Button, Empty, Popconfirm, Space, Tag, Tooltip, Typography } from 'antd'
import { DeleteOutlined, EditOutlined, SolutionOutlined } from '@ant-design/icons'

import { AppDataTable } from '../../../shared/components/ui/data-table/AppDataTable'
import type { Empleado } from '../types/empleado.types'

const { Text } = Typography

type EmpleadosTableProps = {
    empleados: Empleado[]
    loading: boolean
    total: number
    page: number
    pageSize: number
    onPageChange: (page: number, pageSize: number) => void
    onEdit: (empleado: Empleado) => void
    onDelete: (empleado: Empleado) => void
    onCreate?: () => void
    deletingId: string | null
    hasActiveFilters?: boolean
    className?: string
}

const columnHelper = createColumnHelper<Empleado>()

function formatDate(value?: string | null) {
    if (!value) return null
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value
    return date.toLocaleDateString('es-BO')
}

function getInitials(nombre: string) {
    const parts = nombre.trim().split(/\s+/).filter(Boolean)

    if (parts.length >= 2) {
        return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase()
    }

    return nombre.trim().slice(0, 2).toUpperCase()
}

function EmpleadoIdentityCell({ empleado }: { empleado: Empleado }) {
    return (
        <div className="paciente-cell">
            <span className="paciente-cell__avatar" aria-hidden>
                {getInitials(empleado.personaNombreCompleto)}
            </span>
            <span className="paciente-cell__text">
                <Text strong className="paciente-cell__name">
                    {empleado.personaNombreCompleto}
                </Text>
                <Text type="secondary" className="paciente-cell__sub">
                    {empleado.cargoNombre} · {empleado.profesionNombre}
                    {empleado.esMedico ? ' · Médico' : ''}
                </Text>
            </span>
        </div>
    )
}

function OrgCell({ empleado }: { empleado: Empleado }) {
    return (
        <Tooltip title={empleado.areaNombre}>
            <Text className="rrhh-page__org-path" ellipsis>
                {empleado.areaNombre}
            </Text>
        </Tooltip>
    )
}

export function EmpleadosTable({
    empleados,
    loading,
    total,
    page,
    pageSize,
    onPageChange,
    onEdit,
    onDelete,
    onCreate,
    deletingId,
    hasActiveFilters = false,
    className,
}: EmpleadosTableProps) {
    const columns = useMemo(
        () => [
            columnHelper.accessor('codigoEmpleado', {
                header: 'Código',
                size: 100,
                cell: ({ getValue }) => (
                    <Tag className="paciente-hc-tag">{getValue()}</Tag>
                ),
            }),
            columnHelper.accessor('personaNombreCompleto', {
                header: 'Empleado',
                cell: ({ row }) => <EmpleadoIdentityCell empleado={row.original} />,
            }),
            columnHelper.display({
                id: 'ubicacion',
                header: 'Ubicación',
                size: 220,
                cell: ({ row }) => <OrgCell empleado={row.original} />,
            }),
            columnHelper.accessor('fechaIngreso', {
                header: 'Ingreso',
                size: 100,
                cell: ({ getValue }) => {
                    const formatted = formatDate(getValue())

                    if (!formatted) return '—'

                    return (
                        <Tag variant="filled" className="rrhh-page__date-tag">
                            {formatted}
                        </Tag>
                    )
                },
            }),
            columnHelper.display({
                id: 'actions',
                header: '',
                size: 88,
                meta: {
                    align: 'right',
                    headerAlign: 'right',
                },
                cell: ({ row }) => {
                    const empleado = row.original

                    return (
                        <Space size={4}>
                            <Tooltip title="Editar empleado">
                                <Button
                                    type="text"
                                    size="small"
                                    icon={<EditOutlined />}
                                    aria-label={`Editar ${empleado.personaNombreCompleto}`}
                                    onClick={() => onEdit(empleado)}
                                />
                            </Tooltip>
                            <Popconfirm
                                title="Eliminar empleado"
                                description={`¿Eliminar el registro de "${empleado.personaNombreCompleto}"?`}
                                okText="Eliminar"
                                cancelText="Cancelar"
                                okButtonProps={{
                                    danger: true,
                                    loading: deletingId === empleado.id,
                                }}
                                onConfirm={() => onDelete(empleado)}
                            >
                                <Tooltip title="Eliminar empleado">
                                    <Button
                                        type="text"
                                        size="small"
                                        danger
                                        icon={<DeleteOutlined />}
                                        aria-label={`Eliminar ${empleado.personaNombreCompleto}`}
                                        loading={deletingId === empleado.id}
                                    />
                                </Tooltip>
                            </Popconfirm>
                        </Space>
                    )
                },
            }),
        ] as ColumnDef<Empleado, any>[],
        [onEdit, onDelete, deletingId],
    )

    const showCustomEmpty = !loading && empleados.length === 0

    if (showCustomEmpty) {
        return (
            <div className={className}>
                <div className="app-data-table__wrapper">
                    <div className="pacientes-empty">
                        <Empty
                            image={
                                <SolutionOutlined
                                    style={{ fontSize: 48, color: '#94a3b8' }}
                                />
                            }
                            description={
                                hasActiveFilters
                                    ? 'No se encontraron empleados con los filtros aplicados.'
                                    : 'No hay empleados registrados.'
                            }
                        >
                            {!hasActiveFilters && onCreate ? (
                                <Button type="primary" onClick={onCreate}>
                                    Nuevo empleado
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
            data={empleados}
            columns={columns}
            loading={loading}
            emptyText="No hay empleados registrados."
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
