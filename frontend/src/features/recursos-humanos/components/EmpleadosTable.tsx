import { useMemo } from 'react'
import {
    createColumnHelper,
    type ColumnDef,
} from '@tanstack/react-table'
import { Button, Popconfirm, Space, Tag, Tooltip, Typography } from 'antd'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons'

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
    deletingId: string | null
}

const columnHelper = createColumnHelper<Empleado>()

function formatDate(value?: string | null) {
    if (!value) return '—'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value
    return date.toLocaleDateString('es-BO')
}

function OrgCell({ empleado }: { empleado: Empleado }) {
    const path = `${empleado.areaNombre} › ${empleado.departamentoNombre} › ${empleado.servicioNombre}`

    return (
        <Tooltip title={path}>
            <Text className="rrhh-page__org-path" ellipsis>
                {path}
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
    deletingId,
}: EmpleadosTableProps) {
    const columns = useMemo(
        () => [
            columnHelper.accessor('codigoEmpleado', {
                header: 'Código',
                size: 100,
                cell: ({ getValue }) => (
                    <Text code className="rrhh-page__code">
                        {getValue()}
                    </Text>
                ),
            }),
            columnHelper.accessor('personaNombreCompleto', {
                header: 'Empleado',
                cell: ({ row }) => (
                    <div className="rrhh-page__employee-cell">
                        <Text strong>{row.original.personaNombreCompleto}</Text>
                        <Text type="secondary" className="rrhh-page__employee-meta">
                            {row.original.cargoNombre} · {row.original.profesionNombre}
                        </Text>
                    </div>
                ),
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
                cell: ({ getValue }) => (
                    <Tag variant="filled" className="rrhh-page__date-tag">
                        {formatDate(getValue())}
                    </Tag>
                ),
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
                            <Button
                                type="text"
                                size="small"
                                icon={<EditOutlined />}
                                aria-label={`Editar ${empleado.personaNombreCompleto}`}
                                onClick={() => onEdit(empleado)}
                            />
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
                                <Button
                                    type="text"
                                    size="small"
                                    danger
                                    icon={<DeleteOutlined />}
                                    aria-label={`Eliminar ${empleado.personaNombreCompleto}`}
                                    loading={deletingId === empleado.id}
                                />
                            </Popconfirm>
                        </Space>
                    )
                },
            }),
        ] as ColumnDef<Empleado, any>[],
        [onEdit, onDelete, deletingId],
    )

    return (
        <AppDataTable
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
