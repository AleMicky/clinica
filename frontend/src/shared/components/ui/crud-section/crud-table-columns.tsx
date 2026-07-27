import {
    createColumnHelper,
    type ColumnDef,
    type DisplayColumnDef,
} from '@tanstack/react-table'
import { Button, Popconfirm, Space, Typography } from 'antd'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons'

const { Text } = Typography

type IdentifiableNamed = {
    id: string
    nombre: string
}

type CodigoNombreDescripcion = IdentifiableNamed & {
    codigo: string
    descripcion?: string | null
}

type RowActionsOptions<T extends IdentifiableNamed> = {
    onEdit: (item: T) => void
    onDelete: (item: T) => void
    deletingId: string | null
    deleteTitle: string
    deleteVerb?: string
    size?: number
}

export function createCodigoColumn<T extends { codigo: string }>() {
    const columnHelper = createColumnHelper<T>()
    return columnHelper.accessor((row) => row.codigo, {
        id: 'codigo',
        header: 'Código',
        size: 120,
        cell: ({ getValue }) => (
            <Text code className="rrhh-page__code">
                {getValue()}
            </Text>
        ),
    })
}

export function createNombreConDescripcionColumn<
    T extends { nombre: string; descripcion?: string | null },
>() {
    const columnHelper = createColumnHelper<T>()
    return columnHelper.accessor((row) => row.nombre, {
        id: 'nombre',
        header: 'Nombre',
        cell: ({ row }) => (
            <div className="rrhh-page__employee-cell">
                <Text strong>{row.original.nombre}</Text>
                {row.original.descripcion ? (
                    <Text type="secondary" className="rrhh-page__employee-meta">
                        {row.original.descripcion}
                    </Text>
                ) : null}
            </div>
        ),
    })
}

export function createRowActionsColumn<T extends IdentifiableNamed>(
    options: RowActionsOptions<T>,
): DisplayColumnDef<T, unknown> {
    const {
        onEdit,
        onDelete,
        deletingId,
        deleteTitle,
        deleteVerb = 'Eliminar',
        size = 88,
    } = options

    return {
        id: 'actions',
        header: '',
        size,
        meta: {
            align: 'right',
            headerAlign: 'right',
        },
        cell: ({ row }) => {
            const item = row.original

            return (
                <Space size={4}>
                    <Button
                        type="text"
                        size="small"
                        icon={<EditOutlined />}
                        aria-label={`Editar ${item.nombre}`}
                        onClick={() => onEdit(item)}
                    />
                    <Popconfirm
                        title={deleteTitle}
                        description={`¿${deleteVerb} "${item.nombre}"?`}
                        okText={deleteVerb}
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
                            aria-label={`${deleteVerb} ${item.nombre}`}
                            loading={deletingId === item.id}
                        />
                    </Popconfirm>
                </Space>
            )
        },
    }
}

/** Columnas base código + nombre/descripción + acciones. */
export function createCodigoNombreDescripcionColumns<
    T extends CodigoNombreDescripcion,
>(options: RowActionsOptions<T>): ColumnDef<T, unknown>[] {
    return [
        createCodigoColumn<T>(),
        createNombreConDescripcionColumn<T>(),
        createRowActionsColumn(options),
    ] as ColumnDef<T, unknown>[]
}
