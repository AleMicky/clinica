import { useMemo } from 'react'
import {
    createColumnHelper,
    type ColumnDef,
} from '@tanstack/react-table'
import { Button, Popconfirm, Space, Typography } from 'antd'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons'

import { AppDataTable } from '../../../shared/components/ui/data-table/AppDataTable'
import type { Paciente } from '../types/paciente.types'

const { Text } = Typography

type PacientesTableProps = {
    pacientes: Paciente[]
    loading: boolean
    total: number
    page: number
    pageSize: number
    onPageChange: (page: number, pageSize: number) => void
    onEdit: (paciente: Paciente) => void
    onDelete: (paciente: Paciente) => void
    deletingId: string | null
}

const columnHelper = createColumnHelper<Paciente>()

function formatDate(value: string) {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value
    return date.toLocaleDateString('es-BO')
}

export function PacientesTable({
    pacientes,
    loading,
    total,
    page,
    pageSize,
    onPageChange,
    onEdit,
    onDelete,
    deletingId,
}: PacientesTableProps) {
    const columns = useMemo(
        () => [
            columnHelper.accessor('numeroHistoriaClinica', {
                header: 'Historia clínica',
                size: 140,
                cell: ({ getValue }) => (
                    <Text code style={{ fontSize: 12 }}>
                        {getValue()}
                    </Text>
                ),
            }),
            columnHelper.accessor('personaNombreCompleto', {
                header: 'Paciente',
                cell: ({ getValue }) => <Text strong>{getValue()}</Text>,
            }),
            columnHelper.accessor('grupoSanguineoNombre', {
                header: 'Grupo sanguíneo',
                size: 130,
                cell: ({ getValue }) => getValue() || '—',
            }),
            columnHelper.accessor('alergias', {
                header: 'Alergias',
                size: 180,
                cell: ({ getValue }) => getValue() || '—',
            }),
            columnHelper.accessor('fechaRegistro', {
                header: 'Registro',
                size: 120,
                cell: ({ getValue }) => formatDate(getValue()),
            }),
            columnHelper.display({
                id: 'actions',
                header: 'Acciones',
                size: 120,
                meta: {
                    align: 'right',
                    headerAlign: 'right',
                },
                cell: ({ row }) => {
                    const paciente = row.original

                    return (
                        <Space size="small">
                            <Button
                                type="text"
                                icon={<EditOutlined />}
                                aria-label={`Editar ${paciente.personaNombreCompleto}`}
                                onClick={() => onEdit(paciente)}
                            />
                            <Popconfirm
                                title="Eliminar paciente"
                                description={`¿Desea eliminar la ficha de "${paciente.personaNombreCompleto}"?`}
                                okText="Eliminar"
                                cancelText="Cancelar"
                                okButtonProps={{
                                    danger: true,
                                    loading: deletingId === paciente.id,
                                }}
                                onConfirm={() => onDelete(paciente)}
                            >
                                <Button
                                    type="text"
                                    danger
                                    icon={<DeleteOutlined />}
                                    aria-label={`Eliminar ${paciente.personaNombreCompleto}`}
                                    loading={deletingId === paciente.id}
                                />
                            </Popconfirm>
                        </Space>
                    )
                },
            }),
        ] as ColumnDef<Paciente, any>[],
        [onEdit, onDelete, deletingId],
    )

    return (
        <AppDataTable
            data={pacientes}
            columns={columns}
            loading={loading}
            emptyText="No hay pacientes registrados."
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
