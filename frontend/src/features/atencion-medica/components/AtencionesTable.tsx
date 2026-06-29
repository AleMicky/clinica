import { useMemo } from 'react'
import { createColumnHelper, type ColumnDef } from '@tanstack/react-table'
import { Button, Popconfirm, Space, Tag, Typography } from 'antd'
import { DeleteOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons'
import { Link } from '@tanstack/react-router'

import { AppDataTable } from '../../../shared/components/ui/data-table/AppDataTable'
import type { Atencion } from '../types/atencion-medica.types'
import { formatDateTime } from '../utils/format'

const { Text } = Typography

type AtencionesTableProps = {
    atenciones: Atencion[]
    loading: boolean
    total: number
    page: number
    pageSize: number
    onPageChange: (page: number, pageSize: number) => void
    onEdit: (atencion: Atencion) => void
    onDelete: (atencion: Atencion) => void
    deletingId: string | null
}

const columnHelper = createColumnHelper<Atencion>()

const estadoColors: Record<string, string> = {
    BORRADOR: 'default',
    EN_PROCESO: 'processing',
    FINALIZADA: 'success',
    ANULADA: 'error',
}

export function AtencionesTable({
    atenciones,
    loading,
    total,
    page,
    pageSize,
    onPageChange,
    onEdit,
    onDelete,
    deletingId,
}: AtencionesTableProps) {
    const columns = useMemo(
        () => [
            columnHelper.accessor('numeroAtencion', {
                header: 'Atención',
                size: 120,
                cell: ({ getValue }) => (
                    <Text code style={{ fontSize: 12 }}>
                        {getValue()}
                    </Text>
                ),
            }),
            columnHelper.accessor('fechaAtencion', {
                header: 'Fecha',
                size: 150,
                cell: ({ getValue }) => formatDateTime(getValue()),
            }),
            columnHelper.accessor('estado', {
                header: 'Estado',
                size: 120,
                cell: ({ getValue }) => (
                    <Tag color={estadoColors[getValue()] ?? 'default'}>
                        {getValue()}
                    </Tag>
                ),
            }),
            columnHelper.accessor('observaciones', {
                header: 'Observaciones',
                cell: ({ getValue }) => getValue() || '—',
            }),
            columnHelper.display({
                id: 'actions',
                header: 'Acciones',
                size: 140,
                meta: { align: 'right', headerAlign: 'right' },
                cell: ({ row }) => {
                    const atencion = row.original

                    return (
                        <Space size="small">
                            <Link
                                to="/atenciones/$atencionId"
                                params={{ atencionId: atencion.id }}
                            >
                                <Button
                                    type="text"
                                    icon={<EyeOutlined />}
                                    aria-label={`Ver atención ${atencion.numeroAtencion}`}
                                />
                            </Link>
                            <Button
                                type="text"
                                icon={<EditOutlined />}
                                aria-label={`Editar atención ${atencion.numeroAtencion}`}
                                onClick={() => onEdit(atencion)}
                            />
                            <Popconfirm
                                title="Eliminar atención"
                                description={`¿Desea eliminar la atención "${atencion.numeroAtencion}"?`}
                                okText="Eliminar"
                                cancelText="Cancelar"
                                okButtonProps={{
                                    danger: true,
                                    loading: deletingId === atencion.id,
                                }}
                                onConfirm={() => onDelete(atencion)}
                            >
                                <Button
                                    type="text"
                                    danger
                                    icon={<DeleteOutlined />}
                                    aria-label={`Eliminar atención ${atencion.numeroAtencion}`}
                                    loading={deletingId === atencion.id}
                                />
                            </Popconfirm>
                        </Space>
                    )
                },
            }),
        ] as ColumnDef<Atencion, unknown>[],
        [onEdit, onDelete, deletingId],
    )

    return (
        <AppDataTable
            data={atenciones}
            columns={columns}
            loading={loading}
            emptyText="No hay atenciones registradas."
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
