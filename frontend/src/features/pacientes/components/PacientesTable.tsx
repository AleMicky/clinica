import { useMemo } from 'react'
import {
    createColumnHelper,
    type ColumnDef,
} from '@tanstack/react-table'
import {
    Button,
    Dropdown,
    Empty,
    Modal,
    Tag,
    Typography,
} from 'antd'
import type { MenuProps } from 'antd'
import {
    DeleteOutlined,
    EditOutlined,
    EyeOutlined,
    MedicineBoxOutlined,
    MoreOutlined,
    TeamOutlined,
} from '@ant-design/icons'

import { AppDataTable } from '../../../shared/components/ui/data-table/AppDataTable'
import type { Paciente } from '../types/paciente.types'

const { Text } = Typography

type PacientesTableProps = {
    pacientes: Paciente[]
    loading: boolean
    total: number
    page: number
    pageSize: number
    onPageChange: (page: number, pageSize: number) => void
    onEdit: (paciente: Paciente) => void
    onViewFicha: (paciente: Paciente) => void
    onNuevaAtencion: (paciente: Paciente) => void
    onDelete: (paciente: Paciente) => void
    onCreate: () => void
    deletingId: string | null
    hasActiveFilters?: boolean
    className?: string
}

const columnHelper = createColumnHelper<Paciente>()

function getInitials(nombre: string) {
    const parts = nombre.trim().split(/\s+/).filter(Boolean)

    if (parts.length >= 2) {
        return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase()
    }

    return nombre.trim().slice(0, 2).toUpperCase()
}

function formatDate(value: string) {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value
    return date.toLocaleDateString('es-BO')
}

function extractDocumentoHint(numeroHistoriaClinica: string) {
    const match = numeroHistoriaClinica.match(/\d+$/)
    return match?.[0] ?? '—'
}

function PacienteIdentityCell({ paciente }: { paciente: Paciente }) {
    return (
        <div className="paciente-cell">
            <span className="paciente-cell__avatar" aria-hidden>
                {getInitials(paciente.personaNombreCompleto)}
            </span>
            <span className="paciente-cell__text">
                <Text strong className="paciente-cell__name">
                    {paciente.personaNombreCompleto}
                </Text>
            </span>
        </div>
    )
}

function PacienteActionsCell({
    paciente,
    onEdit,
    onViewFicha,
    onNuevaAtencion,
    onDelete,
    deletingId,
}: {
    paciente: Paciente
    onEdit: (paciente: Paciente) => void
    onViewFicha: (paciente: Paciente) => void
    onNuevaAtencion: (paciente: Paciente) => void
    onDelete: (paciente: Paciente) => void
    deletingId: string | null
}) {
    const isDeleting = deletingId === paciente.id

    const handleDeleteClick = () => {
        Modal.confirm({
            title: 'Eliminar paciente',
            content: `¿Desea eliminar la ficha de "${paciente.personaNombreCompleto}"?`,
            okText: 'Eliminar',
            cancelText: 'Cancelar',
            okButtonProps: { danger: true, loading: isDeleting },
            onOk: () => onDelete(paciente),
        })
    }

    const menuItems: MenuProps['items'] = [
        {
            key: 'edit',
            icon: <EditOutlined />,
            label: 'Editar',
            onClick: () => onEdit(paciente),
        },
        {
            key: 'ficha',
            icon: <EyeOutlined />,
            label: 'Ver ficha',
            onClick: () => onViewFicha(paciente),
        },
        {
            key: 'atencion',
            icon: <MedicineBoxOutlined />,
            label: 'Nueva atención',
            onClick: () => onNuevaAtencion(paciente),
        },
        { type: 'divider' },
        {
            key: 'delete',
            icon: <DeleteOutlined />,
            label: <span style={{ color: 'var(--ant-color-error)' }}>Eliminar</span>,
            onClick: handleDeleteClick,
            disabled: isDeleting,
        },
    ]

    return (
        <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
            <Button
                type="text"
                size="small"
                icon={<MoreOutlined />}
                className="paciente-actions-btn"
                aria-label={`Acciones para ${paciente.personaNombreCompleto}`}
                loading={isDeleting}
            />
        </Dropdown>
    )
}

export function PacientesTable({
    pacientes,
    loading,
    total,
    page,
    pageSize,
    onPageChange,
    onEdit,
    onViewFicha,
    onNuevaAtencion,
    onDelete,
    onCreate,
    deletingId,
    hasActiveFilters = false,
    className,
}: PacientesTableProps) {
    const columns = useMemo(
        () =>
            [
                columnHelper.display({
                    id: 'paciente',
                    header: 'Paciente',
                    size: 220,
                    cell: ({ row }) => <PacienteIdentityCell paciente={row.original} />,
                }),
                columnHelper.display({
                    id: 'documento',
                    header: 'Documento',
                    size: 120,
                    cell: ({ row }) => (
                        <Text type="secondary" className="paciente-cell__sub">
                            {extractDocumentoHint(row.original.numeroHistoriaClinica)}
                        </Text>
                    ),
                }),
                columnHelper.accessor('numeroHistoriaClinica', {
                    header: 'Historia clínica',
                    size: 140,
                    cell: ({ getValue }) => (
                        <Tag className="paciente-hc-tag">{getValue()}</Tag>
                    ),
                }),
                columnHelper.accessor('grupoSanguineoNombre', {
                    header: 'Grupo sanguíneo',
                    size: 120,
                    cell: ({ getValue }) => getValue() || '—',
                }),
                columnHelper.display({
                    id: 'estado',
                    header: 'Estado',
                    size: 100,
                    cell: () => <Tag className="paciente-status-tag">Registrado</Tag>,
                }),
                columnHelper.accessor('fechaRegistro', {
                    header: 'Fecha de registro',
                    size: 130,
                    cell: ({ getValue }) => (
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            {formatDate(getValue())}
                        </Text>
                    ),
                }),
                columnHelper.display({
                    id: 'actions',
                    header: '',
                    size: 52,
                    meta: {
                        align: 'right',
                        headerAlign: 'right',
                    },
                    cell: ({ row }) => (
                        <PacienteActionsCell
                            paciente={row.original}
                            onEdit={onEdit}
                            onViewFicha={onViewFicha}
                            onNuevaAtencion={onNuevaAtencion}
                            onDelete={onDelete}
                            deletingId={deletingId}
                        />
                    ),
                }),
            ] as ColumnDef<Paciente, unknown>[],
        [onEdit, onViewFicha, onNuevaAtencion, onDelete, deletingId],
    )

    const showCustomEmpty = !loading && pacientes.length === 0

    if (showCustomEmpty) {
        return (
            <div className={['pacientes-module__table', className].filter(Boolean).join(' ')}>
                <div className="app-data-table__wrapper">
                    <div className="pacientes-empty">
                        <Empty
                            image={<TeamOutlined style={{ fontSize: 48, color: '#94a3b8' }} />}
                            description={
                                hasActiveFilters
                                    ? 'No se encontraron pacientes con los filtros aplicados.'
                                    : 'No existen pacientes registrados.'
                            }
                        >
                            {!hasActiveFilters ? (
                                <Button type="primary" onClick={onCreate}>
                                    Nuevo paciente
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
            data={pacientes}
            columns={columns}
            loading={loading}
            emptyText="No existen pacientes registrados."
            getRowId={(row) => row.id}
            className={['pacientes-module__table', className].filter(Boolean).join(' ')}
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
