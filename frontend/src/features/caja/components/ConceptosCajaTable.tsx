import { useMemo } from 'react'
import { createColumnHelper, type ColumnDef } from '@tanstack/react-table'
import { Button, Empty, Popconfirm, Space, Tag, Tooltip, Typography } from 'antd'
import { DeleteOutlined, EditOutlined, TagsOutlined } from '@ant-design/icons'

import { AppDataTable } from '../../../shared/components/ui/data-table/AppDataTable'
import { StatusBadge } from '../../../shared/components/ui/status-badge/StatusBadge'
import type { ConceptoCaja } from '../types/caja.types'

const { Text } = Typography
const columnHelper = createColumnHelper<ConceptoCaja>()

type ConceptosCajaTableProps = {
    conceptos: ConceptoCaja[]
    loading: boolean
    total: number
    page: number
    pageSize: number
    onPageChange: (page: number, pageSize: number) => void
    onEdit: (item: ConceptoCaja) => void
    onDelete: (item: ConceptoCaja) => void
    onCreate?: () => void
    deletingId: string | null
    hasActiveFilters?: boolean
    className?: string
}

function getInitials(nombre: string) {
    const parts = nombre.trim().split(/\s+/).filter(Boolean)

    if (parts.length >= 2) {
        return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase()
    }

    return nombre.trim().slice(0, 2).toUpperCase()
}

function ConceptoIdentityCell({ concepto }: { concepto: ConceptoCaja }) {
    return (
        <div className="paciente-cell">
            <span className="paciente-cell__avatar" aria-hidden>
                {getInitials(concepto.nombre)}
            </span>
            <span className="paciente-cell__text">
                <Text strong className="paciente-cell__name">
                    {concepto.nombre}
                </Text>
                <Text type="secondary" className="paciente-cell__sub">
                    {concepto.tipoMovimiento === 'INGRESO' ? 'Ingreso' : 'Egreso'}
                </Text>
            </span>
        </div>
    )
}

export function ConceptosCajaTable({
    conceptos,
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
}: ConceptosCajaTableProps) {
    const columns = useMemo(
        () =>
            [
                columnHelper.accessor('codigo', {
                    header: 'Código',
                    size: 160,
                    cell: ({ getValue }) => (
                        <Tag className="paciente-hc-tag">{getValue()}</Tag>
                    ),
                }),
                columnHelper.accessor('nombre', {
                    header: 'Concepto',
                    cell: ({ row }) => <ConceptoIdentityCell concepto={row.original} />,
                }),
                columnHelper.accessor('tipoMovimiento', {
                    header: 'Tipo',
                    size: 110,
                    cell: ({ getValue }) => {
                        const tipo = getValue()
                        return (
                            <Tag color={tipo === 'INGRESO' ? 'green' : 'orange'}>
                                {tipo === 'INGRESO' ? 'Ingreso' : 'Egreso'}
                            </Tag>
                        )
                    },
                }),
                columnHelper.accessor('activo', {
                    header: 'Estado',
                    size: 120,
                    cell: ({ getValue }) => (
                        <StatusBadge
                            active={getValue()}
                            activeLabel="Activo"
                            inactiveLabel="Inactivo"
                        />
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
                        const concepto = row.original
                        const isProtected = concepto.codigo === 'FONDO_INICIAL'

                        return (
                            <Space size={4}>
                                <Tooltip title="Editar concepto">
                                    <Button
                                        type="text"
                                        size="small"
                                        icon={<EditOutlined />}
                                        aria-label={`Editar ${concepto.nombre}`}
                                        onClick={() => onEdit(concepto)}
                                    />
                                </Tooltip>
                                <Popconfirm
                                    title="Eliminar concepto"
                                    description={`¿Eliminar "${concepto.nombre}"?`}
                                    okText="Eliminar"
                                    cancelText="Cancelar"
                                    okButtonProps={{
                                        danger: true,
                                        loading: deletingId === concepto.id,
                                    }}
                                    onConfirm={() => onDelete(concepto)}
                                    disabled={isProtected}
                                >
                                    <Tooltip
                                        title={
                                            isProtected
                                                ? 'Concepto protegido del sistema'
                                                : 'Eliminar concepto'
                                        }
                                    >
                                        <Button
                                            type="text"
                                            size="small"
                                            danger
                                            icon={<DeleteOutlined />}
                                            aria-label={`Eliminar ${concepto.nombre}`}
                                            loading={deletingId === concepto.id}
                                            disabled={isProtected}
                                        />
                                    </Tooltip>
                                </Popconfirm>
                            </Space>
                        )
                    },
                }),
            ] as ColumnDef<ConceptoCaja, unknown>[],
        [onEdit, onDelete, deletingId],
    )

    const showCustomEmpty = !loading && conceptos.length === 0

    if (showCustomEmpty) {
        return (
            <div className={className}>
                <div className="app-data-table__wrapper">
                    <div className="pacientes-empty">
                        <Empty
                            image={
                                <TagsOutlined
                                    style={{ fontSize: 48, color: '#94a3b8' }}
                                />
                            }
                            description={
                                hasActiveFilters
                                    ? 'No se encontraron conceptos con los filtros aplicados.'
                                    : 'No hay conceptos registrados.'
                            }
                        >
                            {!hasActiveFilters && onCreate ? (
                                <Button type="primary" onClick={onCreate}>
                                    Nuevo concepto
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
            data={conceptos}
            columns={columns}
            loading={loading}
            emptyText="No hay conceptos registrados."
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
