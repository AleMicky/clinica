import { useMemo, type MouseEvent } from 'react'
import {
    createColumnHelper,
    type ColumnDef,
} from '@tanstack/react-table'
import { Button, Popconfirm, Space } from 'antd'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons'

import { AppDataTable } from '../../../../shared/components/ui/data-table/AppDataTable'
import type { CatalogoGrupo } from '../types/catalogo.types'

type CatalogoGruposTableProps = {
    grupos: CatalogoGrupo[]
    loading: boolean
    total: number
    page: number
    pageSize: number
    selectedGrupoId: string | null
    compact?: boolean
    onPageChange: (page: number, pageSize: number) => void
    onSelect: (grupo: CatalogoGrupo) => void
    onEdit: (grupo: CatalogoGrupo) => void
    onDelete: (grupo: CatalogoGrupo) => void
    deletingId: string | null
}

const columnHelper = createColumnHelper<CatalogoGrupo>()

function stopRowClick(event: MouseEvent) {
    event.stopPropagation()
}

export function CatalogoGruposTable({
    grupos,
    loading,
    total,
    page,
    pageSize,
    selectedGrupoId,
    compact = false,
    onPageChange,
    onSelect,
    onEdit,
    onDelete,
    deletingId,
}: CatalogoGruposTableProps) {
    const columns = useMemo(
        () => [
            columnHelper.accessor('codigo', {
                header: 'Código',
                size: compact ? 100 : 160,
            }),
            columnHelper.accessor('nombre', {
                header: 'Nombre',
            }),
            ...(compact
                ? []
                : [
                      columnHelper.accessor('descripcion', {
                          header: 'Descripción',
                          cell: ({ getValue }) => getValue() || '—',
                      }),
                  ]),
            columnHelper.display({
                id: 'actions',
                header: 'Acciones',
                size: 140,
                meta: {
                    align: 'right',
                    headerAlign: 'right',
                },
                cell: ({ row }) => {
                    const grupo = row.original

                    return (
                        <Space size="small" onClick={stopRowClick}>
                            <Button
                                type="text"
                                icon={<EditOutlined />}
                                aria-label={`Editar ${grupo.nombre}`}
                                onClick={() => onEdit(grupo)}
                            />
                            <Popconfirm
                                title="Desactivar grupo"
                                description={`¿Desea desactivar el catálogo "${grupo.nombre}"?`}
                                okText="Desactivar"
                                cancelText="Cancelar"
                                okButtonProps={{
                                    danger: true,
                                    loading: deletingId === grupo.id,
                                }}
                                onConfirm={() => onDelete(grupo)}
                            >
                                <Button
                                    type="text"
                                    danger
                                    icon={<DeleteOutlined />}
                                    aria-label={`Desactivar ${grupo.nombre}`}
                                    loading={deletingId === grupo.id}
                                />
                            </Popconfirm>
                        </Space>
                    )
                },
            }),
        ] as ColumnDef<CatalogoGrupo, any>[],
        [compact, onEdit, onDelete, deletingId],
    )

    return (
        <AppDataTable
            data={grupos}
            columns={columns}
            loading={loading}
            emptyText="No hay grupos de catálogo registrados."
            getRowId={(row) => String(row.id)}
            selectedRowId={
                selectedGrupoId !== null ? String(selectedGrupoId) : undefined
            }
            onRowClick={onSelect}
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
