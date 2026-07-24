import { useMemo } from 'react'
import { createColumnHelper, type ColumnDef } from '@tanstack/react-table'
import { Button, Empty, Flex, Popconfirm, Space, Typography } from 'antd'
import {
    DeleteOutlined,
    EditOutlined,
    FormOutlined,
    PlusOutlined,
    UnorderedListOutlined,
} from '@ant-design/icons'

import { AppDataTable } from '../../../shared/components/ui/data-table/AppDataTable'
import {
    DEFAULT_TIPO_ATENCION_COLOR,
    getTipoAtencionIcon,
} from '../constants/tipo-atencion-icons'
import type { TipoAtencion } from '../types/atencion-medica.types'

const { Text } = Typography

type TiposAtencionTableProps = {
    items: TipoAtencion[]
    loading: boolean
    total: number
    page: number
    pageSize: number
    onPageChange: (page: number, pageSize: number) => void
    onEdit: (tipo: TipoAtencion) => void
    onDelete: (tipo: TipoAtencion) => void
    onManageForms: (tipo: TipoAtencion) => void
    onCreate: () => void
    deletingId: string | null
    hasActiveFilters?: boolean
    className?: string
}

const columnHelper = createColumnHelper<TipoAtencion>()

function TipoIdentityCell({ tipo }: { tipo: TipoAtencion }) {
    const descripcion = tipo.descripcion?.trim()
    const color = tipo.color || DEFAULT_TIPO_ATENCION_COLOR
    const Icon = getTipoAtencionIcon(tipo.icono)

    return (
        <Flex gap={10} align="center" className="tipo-atencion-cell">
            <span
                className="tipo-atencion-cell__badge"
                style={{
                    background: `${color}1a`,
                    color,
                }}
                aria-hidden
            >
                <Icon />
            </span>
            <span className="tipo-atencion-cell__text">
                <Text strong className="tipo-atencion-cell__name">
                    {tipo.nombre}
                </Text>
                <Text type="secondary" className="tipo-atencion-cell__desc">
                    {descripcion || 'Sin descripción'}
                </Text>
            </span>
        </Flex>
    )
}

export function TiposAtencionTable({
    items,
    loading,
    total,
    page,
    pageSize,
    onPageChange,
    onEdit,
    onDelete,
    onManageForms,
    onCreate,
    deletingId,
    hasActiveFilters,
    className,
}: TiposAtencionTableProps) {
    const columns = useMemo(
        () =>
            [
                columnHelper.accessor('codigo', {
                    header: 'Código',
                    size: 120,
                    cell: ({ getValue }) => (
                        <Text code className="tipo-atencion-cell__code">
                            {getValue()}
                        </Text>
                    ),
                }),
                columnHelper.display({
                    id: 'tipo',
                    header: 'Tipo de atención',
                    cell: ({ row }) => <TipoIdentityCell tipo={row.original} />,
                }),
                columnHelper.display({
                    id: 'actions',
                    header: '',
                    size: 120,
                    meta: { align: 'right', headerAlign: 'right' },
                    cell: ({ row }) => {
                        const tipo = row.original

                        return (
                            <Space size={4}>
                                <Button
                                    type="text"
                                    size="small"
                                    icon={<FormOutlined />}
                                    aria-label={`Administrar formularios de ${tipo.nombre}`}
                                    onClick={() => onManageForms(tipo)}
                                />
                                <Button
                                    type="text"
                                    size="small"
                                    icon={<EditOutlined />}
                                    aria-label={`Editar ${tipo.nombre}`}
                                    onClick={() => onEdit(tipo)}
                                />
                                <Popconfirm
                                    title="Eliminar tipo de atención"
                                    description={`¿Eliminar "${tipo.nombre}"? Si está en uso, el sistema rechazará la operación.`}
                                    okText="Eliminar"
                                    cancelText="Cancelar"
                                    okButtonProps={{
                                        danger: true,
                                        loading: deletingId === tipo.id,
                                    }}
                                    onConfirm={() => onDelete(tipo)}
                                >
                                    <Button
                                        type="text"
                                        size="small"
                                        danger
                                        icon={<DeleteOutlined />}
                                        aria-label={`Eliminar ${tipo.nombre}`}
                                        loading={deletingId === tipo.id}
                                    />
                                </Popconfirm>
                            </Space>
                        )
                    },
                }),
            ] as ColumnDef<TipoAtencion, unknown>[],
        [deletingId, onDelete, onEdit, onManageForms],
    )

    const showCustomEmpty = !loading && items.length === 0

    if (showCustomEmpty) {
        return (
            <div className={className}>
                <div className="app-data-table__wrapper">
                    <div className="tipos-atencion-empty">
                        <Empty
                            image={
                                <UnorderedListOutlined
                                    style={{ fontSize: 48, color: '#94a3b8' }}
                                />
                            }
                            description={
                                hasActiveFilters
                                    ? 'No se encontraron tipos con los filtros aplicados.'
                                    : 'Aún no hay tipos de atención registrados.'
                            }
                        >
                            {!hasActiveFilters ? (
                                <Button
                                    type="primary"
                                    icon={<PlusOutlined />}
                                    onClick={onCreate}
                                >
                                    Nuevo tipo de atención
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
            data={items}
            columns={columns}
            loading={loading}
            emptyText="No hay tipos de atención registrados."
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
