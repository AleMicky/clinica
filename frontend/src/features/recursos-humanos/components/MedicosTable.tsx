import { useMemo } from 'react'
import {
    createColumnHelper,
    type ColumnDef,
} from '@tanstack/react-table'
import { Button, Popconfirm, Space, Tag, Typography } from 'antd'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons'

import { AppDataTable } from '../../../shared/components/ui/data-table/AppDataTable'
import type { Medico } from '../types/medico.types'

const { Text } = Typography

type MedicosTableProps = {
    medicos: Medico[]
    loading: boolean
    total: number
    page: number
    pageSize: number
    onPageChange: (page: number, pageSize: number) => void
    onEdit: (medico: Medico) => void
    onDelete: (medico: Medico) => void
    deletingId: string | null
    className?: string
}

const columnHelper = createColumnHelper<Medico>()

export function MedicosTable({
    medicos,
    loading,
    total,
    page,
    pageSize,
    onPageChange,
    onEdit,
    onDelete,
    deletingId,
    className,
}: MedicosTableProps) {
    const columns = useMemo(
        () => [
            columnHelper.accessor('matriculaProfesional', {
                header: 'Matrícula',
                size: 120,
                cell: ({ getValue }) => (
                    <Text code className="rrhh-page__code">
                        {getValue()}
                    </Text>
                ),
            }),
            columnHelper.accessor('personaNombreCompleto', {
                header: 'Médico',
                cell: ({ row }) => (
                    <div className="rrhh-page__employee-cell">
                        <Text strong>{row.original.personaNombreCompleto}</Text>
                        <Text type="secondary" className="rrhh-page__employee-meta">
                            {row.original.empleadoCodigo} ·{' '}
                            {row.original.especialidadPrincipalNombre}
                        </Text>
                    </div>
                ),
            }),
            columnHelper.accessor('registroColegioMedico', {
                header: 'Colegio médico',
                size: 140,
                cell: ({ getValue }) => getValue() || '—',
            }),
            columnHelper.display({
                id: 'especialidad',
                header: 'Especialidades',
                size: 180,
                cell: ({ row }) => (
                    <Space size={[4, 4]} wrap>
                        {row.original.especialidades.map((especialidad) => (
                            <Tag
                                key={especialidad.especialidadId}
                                variant="filled"
                                className="rrhh-page__date-tag"
                                color={especialidad.esPrincipal ? 'blue' : undefined}
                            >
                                {especialidad.especialidadNombre}
                                {especialidad.esPrincipal ? ' · principal' : ''}
                            </Tag>
                        ))}
                    </Space>
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
                    const medico = row.original

                    return (
                        <Space size={4}>
                            <Button
                                type="text"
                                size="small"
                                icon={<EditOutlined />}
                                aria-label={`Editar ${medico.personaNombreCompleto}`}
                                onClick={() => onEdit(medico)}
                            />
                            <Popconfirm
                                title="Eliminar médico"
                                description={`¿Eliminar el registro de "${medico.personaNombreCompleto}"?`}
                                okText="Eliminar"
                                cancelText="Cancelar"
                                okButtonProps={{
                                    danger: true,
                                    loading: deletingId === medico.id,
                                }}
                                onConfirm={() => onDelete(medico)}
                            >
                                <Button
                                    type="text"
                                    size="small"
                                    danger
                                    icon={<DeleteOutlined />}
                                    aria-label={`Eliminar ${medico.personaNombreCompleto}`}
                                    loading={deletingId === medico.id}
                                />
                            </Popconfirm>
                        </Space>
                    )
                },
            }),
        ] as ColumnDef<Medico, any>[],
        [onEdit, onDelete, deletingId],
    )

    return (
        <AppDataTable
            className={className}
            data={medicos}
            columns={columns}
            loading={loading}
            emptyText="No hay médicos registrados."
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
