import { useMemo } from 'react'
import { createColumnHelper, type ColumnDef } from '@tanstack/react-table'
import { Button, Empty, Popconfirm, Space, Tag, Tooltip, Typography } from 'antd'
import {
    DeleteOutlined,
    EditOutlined,
    ExperimentOutlined,
    EyeOutlined,
} from '@ant-design/icons'

import { AppDataTable } from '../../../../shared/components/ui/data-table/AppDataTable'
import { useAppQuery } from '../../../../shared/hooks/use-app-query'
import { queryKeys } from '../../../../shared/constants/query-keys'
import { pacientesService } from '../../../pacientes/services/pacientes.service'
import {
    SOLICITUD_ESTADO_COLORS,
    SOLICITUD_ESTADO_LABELS,
    type Solicitud,
} from '../types/solicitud.types'

const { Text } = Typography
const columnHelper = createColumnHelper<Solicitud>()

const ORIGEN_SHORT_LABELS: Record<string, string> = {
    PACIENTE: 'Mostrador',
    ATENCION_MEDICA: 'Atención médica',
    MEDICO_EXTERNO: 'Médico externo',
}

function formatDate(value: string) {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value
    return date.toLocaleDateString('es-BO')
}

function getInitials(nombre: string) {
    const parts = nombre.trim().split(/\s+/).filter(Boolean)

    if (parts.length >= 2) {
        return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase()
    }

    return nombre.trim().slice(0, 2).toUpperCase() || '—'
}

function PacienteIdentityCell({ solicitud }: { solicitud: Solicitud }) {
    const { data: paciente, isFetching } = useAppQuery({
        queryKey: queryKeys.pacientes.detail(solicitud.pacienteId),
        queryFn: () => pacientesService.getById(solicitud.pacienteId),
        staleTime: 5 * 60 * 1000,
    })

    const nombre = paciente?.personaNombreCompleto?.trim()
    const display = nombre || (isFetching ? 'Cargando…' : 'Paciente')
    const origen = ORIGEN_SHORT_LABELS[solicitud.origen] ?? solicitud.origen
    const pruebas = solicitud.detalles.length

    return (
        <div className="paciente-cell">
            <span className="paciente-cell__avatar" aria-hidden>
                {getInitials(nombre || 'PA')}
            </span>
            <span className="paciente-cell__text">
                <Text strong className="paciente-cell__name">
                    {display}
                </Text>
                <Text type="secondary" className="paciente-cell__sub">
                    {origen} · {pruebas} {pruebas === 1 ? 'prueba' : 'pruebas'}
                </Text>
            </span>
        </div>
    )
}

type SolicitudesTableProps = {
    solicitudes: Solicitud[]
    loading: boolean
    total: number
    page: number
    pageSize: number
    onPageChange: (page: number, pageSize: number) => void
    onView: (item: Solicitud) => void
    onEdit: (item: Solicitud) => void
    onDelete: (item: Solicitud) => void
    onCreate?: () => void
    deletingId: string | null
    hasActiveFilters?: boolean
    className?: string
}

export function SolicitudesTable({
    solicitudes,
    loading,
    total,
    page,
    pageSize,
    onPageChange,
    onView,
    onEdit,
    onDelete,
    onCreate,
    deletingId,
    hasActiveFilters = false,
    className,
}: SolicitudesTableProps) {
    const columns = useMemo(
        () =>
            [
                columnHelper.accessor('numero', {
                    header: 'Número',
                    size: 120,
                    cell: ({ row }) => (
                        <Tag
                            className="paciente-hc-tag"
                            style={{ cursor: 'pointer' }}
                            onClick={() => onView(row.original)}
                            role="link"
                            tabIndex={0}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter' || event.key === ' ') {
                                    event.preventDefault()
                                    onView(row.original)
                                }
                            }}
                            aria-label={`Ver solicitud ${row.original.numero}`}
                        >
                            {row.original.numero}
                        </Tag>
                    ),
                }),
                columnHelper.display({
                    id: 'paciente',
                    header: 'Paciente',
                    cell: ({ row }) => <PacienteIdentityCell solicitud={row.original} />,
                }),
                columnHelper.accessor('fechaSolicitud', {
                    header: 'Fecha',
                    size: 110,
                    cell: ({ getValue }) => (
                        <Tag variant="filled" className="rrhh-page__date-tag">
                            {formatDate(getValue())}
                        </Tag>
                    ),
                }),
                columnHelper.accessor('estado', {
                    header: 'Estado',
                    size: 150,
                    cell: ({ getValue }) => {
                        const value = getValue()
                        return (
                            <Tag color={SOLICITUD_ESTADO_COLORS[value] ?? 'default'}>
                                {SOLICITUD_ESTADO_LABELS[value] ?? value}
                            </Tag>
                        )
                    },
                }),
                columnHelper.display({
                    id: 'actions',
                    header: '',
                    size: 110,
                    meta: {
                        align: 'right',
                        headerAlign: 'right',
                    },
                    cell: ({ row }) => {
                        const item = row.original
                        const canMutate = item.estado === 'BORRADOR'

                        return (
                            <Space size={4}>
                                <Tooltip title="Ver solicitud">
                                    <Button
                                        type="text"
                                        size="small"
                                        icon={<EyeOutlined />}
                                        aria-label={`Ver solicitud ${item.numero}`}
                                        onClick={() => onView(item)}
                                    />
                                </Tooltip>
                                {canMutate ? (
                                    <>
                                        <Tooltip title="Editar solicitud">
                                            <Button
                                                type="text"
                                                size="small"
                                                icon={<EditOutlined />}
                                                aria-label={`Editar solicitud ${item.numero}`}
                                                onClick={() => onEdit(item)}
                                            />
                                        </Tooltip>
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
                                            <Tooltip title="Eliminar solicitud">
                                                <Button
                                                    type="text"
                                                    size="small"
                                                    danger
                                                    icon={<DeleteOutlined />}
                                                    aria-label={`Eliminar solicitud ${item.numero}`}
                                                    loading={deletingId === item.id}
                                                />
                                            </Tooltip>
                                        </Popconfirm>
                                    </>
                                ) : null}
                            </Space>
                        )
                    },
                }),
            ] as ColumnDef<Solicitud, unknown>[],
        [onView, onEdit, onDelete, deletingId],
    )

    const showCustomEmpty = !loading && solicitudes.length === 0

    if (showCustomEmpty) {
        return (
            <div className={className}>
                <div className="app-data-table__wrapper">
                    <div className="pacientes-empty">
                        <Empty
                            image={
                                <ExperimentOutlined
                                    style={{ fontSize: 48, color: '#94a3b8' }}
                                />
                            }
                            description={
                                hasActiveFilters
                                    ? 'No se encontraron solicitudes con los filtros aplicados.'
                                    : 'No hay solicitudes registradas.'
                            }
                        >
                            {!hasActiveFilters && onCreate ? (
                                <Button type="primary" onClick={onCreate}>
                                    Nueva solicitud
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
            data={solicitudes}
            columns={columns}
            loading={loading}
            emptyText="No hay solicitudes registradas."
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
