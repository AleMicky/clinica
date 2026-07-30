import { useMemo } from 'react'
import { createColumnHelper, type ColumnDef } from '@tanstack/react-table'
import { Button, Popconfirm, Space, Tag, Typography } from 'antd'
import { DeleteOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons'
import { Link } from '@tanstack/react-router'

import { AppDataTable } from '../../../../shared/components/ui/data-table/AppDataTable'
import { useAppQuery } from '../../../../shared/hooks/use-app-query'
import { queryKeys } from '../../../../shared/constants/query-keys'
import { pacientesService } from '../../../pacientes/services/pacientes.service'
import {
    SOLICITUD_ESTADO_COLORS,
    SOLICITUD_ESTADO_LABELS,
    SOLICITUD_ORIGEN_LABELS,
    type Solicitud,
} from '../types/solicitud.types'

const { Text } = Typography
const columnHelper = createColumnHelper<Solicitud>()

function formatDateTime(value: string) {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value
    return date.toLocaleString('es-BO')
}

function PacienteCell({ pacienteId }: { pacienteId: string }) {
    const { data: paciente, isFetching } = useAppQuery({
        queryKey: queryKeys.pacientes.detail(pacienteId),
        queryFn: () => pacientesService.getById(pacienteId),
        staleTime: 5 * 60 * 1000,
    })

    if (isFetching && !paciente) {
        return <Text type="secondary">Cargando…</Text>
    }

    return <Text>{paciente?.personaNombreCompleto ?? '—'}</Text>
}

type SolicitudesTableProps = {
    solicitudes: Solicitud[]
    loading: boolean
    total: number
    page: number
    pageSize: number
    onPageChange: (page: number, pageSize: number) => void
    onEdit: (item: Solicitud) => void
    onDelete: (item: Solicitud) => void
    deletingId: string | null
    className?: string
}

export function SolicitudesTable({
    solicitudes,
    loading,
    total,
    page,
    pageSize,
    onPageChange,
    onEdit,
    onDelete,
    deletingId,
    className,
}: SolicitudesTableProps) {
    const columns = useMemo(
        () =>
            [
                columnHelper.accessor('numero', {
                    header: 'Número',
                    size: 130,
                    cell: ({ getValue }) => <Text code>{getValue()}</Text>,
                }),
                columnHelper.accessor('fechaSolicitud', {
                    header: 'Fecha',
                    size: 170,
                    cell: ({ getValue }) => formatDateTime(getValue()),
                }),
                columnHelper.display({
                    id: 'paciente',
                    header: 'Paciente',
                    size: 200,
                    cell: ({ row }) => <PacienteCell pacienteId={row.original.pacienteId} />,
                }),
                columnHelper.accessor('origen', {
                    header: 'Origen',
                    size: 150,
                    cell: ({ getValue }) => {
                        const value = getValue()
                        return SOLICITUD_ORIGEN_LABELS[value] ?? value
                    },
                }),
                columnHelper.display({
                    id: 'detalles',
                    header: 'Pruebas',
                    size: 100,
                    cell: ({ row }) => <Tag>{row.original.detalles.length}</Tag>,
                }),
                columnHelper.accessor('estado', {
                    header: 'Estado',
                    size: 160,
                    cell: ({ getValue }) => {
                        const value = getValue()
                        return (
                            <Tag color={SOLICITUD_ESTADO_COLORS[value] ?? 'default'}>
                                {SOLICITUD_ESTADO_LABELS[value] ?? value}
                            </Tag>
                        )
                    },
                }),
                columnHelper.accessor('observaciones', {
                    header: 'Observaciones',
                    cell: ({ getValue }) => getValue()?.trim() || '—',
                }),
                columnHelper.display({
                    id: 'actions',
                    header: '',
                    size: 120,
                    meta: { align: 'right', headerAlign: 'right' },
                    cell: ({ row }) => {
                        const item = row.original
                        const canMutate = item.estado === 'BORRADOR'

                        return (
                            <Space size={0}>
                                <Link
                                    to="/laboratorio/solicitudes/$id"
                                    params={{ id: item.id }}
                                >
                                    <Button
                                        type="text"
                                        size="small"
                                        icon={<EyeOutlined />}
                                        aria-label={`Ver solicitud ${item.numero}`}
                                    />
                                </Link>
                                {canMutate ? (
                                    <>
                                        <Button
                                            type="text"
                                            size="small"
                                            icon={<EditOutlined />}
                                            aria-label={`Editar solicitud ${item.numero}`}
                                            onClick={() => onEdit(item)}
                                        />
                                        <Popconfirm
                                            title="Eliminar solicitud"
                                            description={`¿Eliminar "${item.numero}"?`}
                                            okText="Eliminar"
                                            cancelText="Cancelar"
                                            okButtonProps={{
                                                danger: true,
                                                loading: deletingId === item.id,
                                            }}
                                            onConfirm={() => onDelete(item)}
                                        >
                                            <Button
                                                type="text"
                                                size="small"
                                                danger
                                                icon={<DeleteOutlined />}
                                                aria-label={`Eliminar solicitud ${item.numero}`}
                                                loading={deletingId === item.id}
                                            />
                                        </Popconfirm>
                                    </>
                                ) : null}
                            </Space>
                        )
                    },
                }),
            ] as ColumnDef<Solicitud, unknown>[],
        [onEdit, onDelete, deletingId],
    )

    return (
        <AppDataTable
            data={solicitudes}
            columns={columns}
            loading={loading}
            emptyText="No hay solicitudes registradas."
            getRowId={(row) => row.id}
            className={['solicitudes-table', className].filter(Boolean).join(' ')}
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
