import { useMemo } from 'react'
import { createColumnHelper, type ColumnDef } from '@tanstack/react-table'
import { Button, Popconfirm, Space, Tag, Tooltip, Typography } from 'antd'
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
    className?: string
}

const columnHelper = createColumnHelper<Atencion>()

const estadoLabels: Record<string, string> = {
    BORRADOR: 'Borrador',
    EN_PROCESO: 'En proceso',
    FINALIZADA: 'Finalizada',
    ANULADA: 'Anulada',
}

const estadoColors: Record<string, string> = {
    BORRADOR: 'default',
    EN_PROCESO: 'processing',
    FINALIZADA: 'success',
    ANULADA: 'error',
}

function getInitials(nombre: string) {
    const parts = nombre.trim().split(/\s+/).filter(Boolean)
    if (parts.length >= 2) {
        return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase()
    }
    return nombre.trim().slice(0, 2).toUpperCase() || '—'
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
    className,
}: AtencionesTableProps) {
    const columns = useMemo(
        () =>
            [
                columnHelper.display({
                    id: 'atencion',
                    header: 'Atención',
                    size: 130,
                    cell: ({ row }) => {
                        const atencion = row.original
                        return (
                            <div className="atencion-cell">
                                <Text code className="atencion-cell__numero">
                                    {atencion.numeroAtencion}
                                </Text>
                                <Text type="secondary" className="atencion-cell__fecha">
                                    {formatDateTime(atencion.fechaAtencion)}
                                </Text>
                            </div>
                        )
                    },
                }),
                columnHelper.display({
                    id: 'paciente',
                    header: 'Paciente',
                    size: 200,
                    cell: ({ row }) => {
                        const atencion = row.original
                        const nombre = atencion.pacienteNombre?.trim() || '—'
                        return (
                            <div className="paciente-cell paciente-cell--compact">
                                <span className="paciente-cell__avatar" aria-hidden>
                                    {getInitials(nombre === '—' ? 'PA' : nombre)}
                                </span>
                                <span className="paciente-cell__text">
                                    <Text strong className="paciente-cell__name" ellipsis>
                                        {nombre}
                                    </Text>
                                    <Text type="secondary" className="paciente-cell__sub">
                                        {atencion.numeroHistoriaClinica
                                            ? `HC ${atencion.numeroHistoriaClinica}`
                                            : 'Sin HC'}
                                    </Text>
                                </span>
                            </div>
                        )
                    },
                }),
                columnHelper.display({
                    id: 'tipo',
                    header: 'Tipo',
                    size: 150,
                    cell: ({ row }) => {
                        const atencion = row.original
                        const color = atencion.tipoAtencionColor || '#1677ff'
                        return (
                            <Tag
                                className="atencion-tipo-tag"
                                style={{
                                    color,
                                    background: `${color}18`,
                                    borderColor: `${color}55`,
                                }}
                            >
                                {atencion.tipoAtencionNombre || atencion.tipoAtencionCodigo || '—'}
                            </Tag>
                        )
                    },
                }),
                columnHelper.accessor('estado', {
                    header: 'Estado',
                    size: 100,
                    cell: ({ getValue }) => {
                        const estado = getValue()
                        return (
                            <Tag color={estadoColors[estado] ?? 'default'}>
                                {estadoLabels[estado] ?? estado}
                            </Tag>
                        )
                    },
                }),
                columnHelper.display({
                    id: 'formulario',
                    header: 'Formulario',
                    size: 150,
                    cell: ({ row }) => (
                        <Text
                            type="secondary"
                            ellipsis
                            className="atencion-cell__meta"
                            title={row.original.formularioClinicoNombre ?? undefined}
                        >
                            {row.original.formularioClinicoNombre || '—'}
                        </Text>
                    ),
                }),
                columnHelper.accessor('observaciones', {
                    header: 'Obs.',
                    size: 140,
                    cell: ({ getValue }) => {
                        const value = getValue()?.trim()
                        if (!value) return <Text type="secondary">—</Text>
                        return (
                            <Tooltip title={value}>
                                <Text ellipsis className="atencion-cell__obs">
                                    {value}
                                </Text>
                            </Tooltip>
                        )
                    },
                }),
                columnHelper.display({
                    id: 'actions',
                    header: '',
                    size: 108,
                    meta: { align: 'right', headerAlign: 'right' },
                    cell: ({ row }) => {
                        const atencion = row.original

                        return (
                            <Space size={0} className="atencion-actions">
                                <Link
                                    to="/atenciones/$atencionId"
                                    params={{ atencionId: atencion.id }}
                                >
                                    <Button
                                        type="text"
                                        size="small"
                                        icon={<EyeOutlined />}
                                        aria-label={`Ver atención ${atencion.numeroAtencion}`}
                                    />
                                </Link>
                                <Button
                                    type="text"
                                    size="small"
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
                                        size="small"
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
            className={['atenciones-table', className].filter(Boolean).join(' ')}
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
