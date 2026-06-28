import { useMemo } from 'react'
import {
    createColumnHelper,
    type ColumnDef,
} from '@tanstack/react-table'
import { Button, Popconfirm, Space, Typography } from 'antd'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons'

import { AppDataTable } from '../../../shared/components/ui/data-table/AppDataTable'
import type { Persona } from '../types/persona.types'

const { Text } = Typography

type PersonasTableProps = {
    personas: Persona[]
    loading: boolean
    total: number
    page: number
    pageSize: number
    onPageChange: (page: number, pageSize: number) => void
    onEdit: (persona: Persona) => void
    onDelete: (persona: Persona) => void
    deletingId: string | null
}

const columnHelper = createColumnHelper<Persona>()

function formatDate(value: string) {
    const [year, month, day] = value.split('-')
    if (!year || !month || !day) return value
    return `${day}/${month}/${year}`
}

function formatDocumento(persona: Persona) {
    const parts = [persona.tipoDocumentoNombre, persona.numeroDocumento]

    if (persona.extensionDocumentoNombre) {
        parts.push(persona.extensionDocumentoNombre)
    }

    if (persona.complementoDocumento) {
        parts.push(persona.complementoDocumento)
    }

    return parts.join(' ')
}

export function PersonasTable({
    personas,
    loading,
    total,
    page,
    pageSize,
    onPageChange,
    onEdit,
    onDelete,
    deletingId,
}: PersonasTableProps) {
    const columns = useMemo(
        () => [
            columnHelper.display({
                id: 'documento',
                header: 'Documento',
                size: 180,
                cell: ({ row }) => (
                    <Text code style={{ fontSize: 12 }}>
                        {formatDocumento(row.original)}
                    </Text>
                ),
            }),
            columnHelper.accessor('nombreCompleto', {
                header: 'Nombre completo',
                cell: ({ getValue }) => <Text strong>{getValue()}</Text>,
            }),
            columnHelper.accessor('fechaNacimiento', {
                header: 'Nacimiento',
                size: 120,
                cell: ({ getValue }) => formatDate(getValue()),
            }),
            columnHelper.accessor('sexoNombre', {
                header: 'Sexo',
                size: 100,
            }),
            columnHelper.accessor('estadoCivilNombre', {
                header: 'Estado civil',
                size: 130,
            }),
            columnHelper.accessor('telefono', {
                header: 'Teléfono',
                size: 130,
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
                    const persona = row.original

                    return (
                        <Space size="small">
                            <Button
                                type="text"
                                icon={<EditOutlined />}
                                aria-label={`Editar ${persona.nombreCompleto}`}
                                onClick={() => onEdit(persona)}
                            />
                            <Popconfirm
                                title="Eliminar persona"
                                description={`¿Desea eliminar a "${persona.nombreCompleto}"?`}
                                okText="Eliminar"
                                cancelText="Cancelar"
                                okButtonProps={{
                                    danger: true,
                                    loading: deletingId === persona.id,
                                }}
                                onConfirm={() => onDelete(persona)}
                            >
                                <Button
                                    type="text"
                                    danger
                                    icon={<DeleteOutlined />}
                                    aria-label={`Eliminar ${persona.nombreCompleto}`}
                                    loading={deletingId === persona.id}
                                />
                            </Popconfirm>
                        </Space>
                    )
                },
            }),
        ] as ColumnDef<Persona, any>[],
        [onEdit, onDelete, deletingId],
    )

    return (
        <AppDataTable
            data={personas}
            columns={columns}
            loading={loading}
            emptyText="No hay personas registradas."
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
