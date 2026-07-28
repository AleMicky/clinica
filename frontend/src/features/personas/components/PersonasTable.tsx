import { useMemo } from 'react'
import {
    createColumnHelper,
    type ColumnDef,
} from '@tanstack/react-table'
import { Button, Empty, Tag, Tooltip, Typography } from 'antd'
import { EditOutlined, IdcardOutlined } from '@ant-design/icons'

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
    hasActiveFilters?: boolean
    className?: string
}

const columnHelper = createColumnHelper<Persona>()

function formatDate(value: string) {
    const [year, month, day] = value.split('-')
    if (!year || !month || !day) return value
    return `${day}/${month}/${year}`
}

function calcularEdad(fechaNacimiento: string) {
    const birth = new Date(`${fechaNacimiento}T00:00:00`)
    if (Number.isNaN(birth.getTime())) return null

    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age -= 1
    }

    if (age < 0 || age > 130) return null

    return `${age} años`
}

function formatNumeroDocumento(persona: Persona) {
    const parts = [persona.numeroDocumento]

    if (persona.extensionDocumentoNombre) {
        parts.push(persona.extensionDocumentoNombre)
    }

    if (persona.complementoDocumento) {
        parts.push(persona.complementoDocumento)
    }

    return parts.join(' ')
}

function getInitials(nombre: string) {
    const parts = nombre.trim().split(/\s+/).filter(Boolean)

    if (parts.length >= 2) {
        return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase()
    }

    return nombre.trim().slice(0, 2).toUpperCase()
}

function textOrDash(value?: string | null) {
    return typeof value === 'string' && value.trim() ? value.trim() : '—'
}

function PersonaIdentityCell({ persona }: { persona: Persona }) {
    return (
        <div className="paciente-cell">
            <span className="paciente-cell__avatar" aria-hidden>
                {getInitials(persona.nombreCompleto)}
            </span>
            <span className="paciente-cell__text">
                <Text strong className="paciente-cell__name">
                    {persona.nombreCompleto}
                </Text>
            </span>
        </div>
    )
}

export function PersonasTable({
    personas,
    loading,
    total,
    page,
    pageSize,
    onPageChange,
    onEdit,
    hasActiveFilters = false,
    className,
}: PersonasTableProps) {
    const columns = useMemo(
        () => [
            columnHelper.display({
                id: 'persona',
                header: 'Persona',
                size: 240,
                cell: ({ row }) => <PersonaIdentityCell persona={row.original} />,
            }),
            columnHelper.display({
                id: 'documento',
                header: 'Documento',
                size: 180,
                cell: ({ row }) => (
                    <span
                        className="paciente-cell__text"
                        style={{ alignItems: 'flex-start' }}
                    >
                        <Tag className="paciente-hc-tag">
                            {row.original.tipoDocumentoNombre}
                        </Tag>
                        <Text type="secondary" className="paciente-cell__sub">
                            {formatNumeroDocumento(row.original)}
                        </Text>
                    </span>
                ),
            }),
            columnHelper.accessor('fechaNacimiento', {
                header: 'Nacimiento',
                size: 140,
                cell: ({ getValue }) => {
                    const value = getValue()
                    const edad = calcularEdad(value)

                    return (
                        <span className="paciente-cell__text">
                            <Text>{formatDate(value)}</Text>
                            {edad ? (
                                <Text type="secondary" className="paciente-cell__sub">
                                    {edad}
                                </Text>
                            ) : null}
                        </span>
                    )
                },
            }),
            columnHelper.accessor('sexoNombre', {
                header: 'Sexo',
                size: 100,
                cell: ({ getValue }) => textOrDash(getValue()),
            }),
            columnHelper.accessor('estadoCivilNombre', {
                header: 'Estado civil',
                size: 130,
                cell: ({ getValue }) => textOrDash(getValue()),
            }),
            columnHelper.accessor('telefono', {
                header: 'Teléfono',
                size: 120,
                cell: ({ getValue }) => textOrDash(getValue()),
            }),
            columnHelper.display({
                id: 'actions',
                header: '',
                size: 52,
                meta: {
                    align: 'right',
                    headerAlign: 'right',
                },
                cell: ({ row }) => {
                    const persona = row.original

                    return (
                        <Tooltip title="Editar datos personales">
                            <Button
                                type="text"
                                size="small"
                                icon={<EditOutlined />}
                                aria-label={`Editar ${persona.nombreCompleto}`}
                                onClick={() => onEdit(persona)}
                            />
                        </Tooltip>
                    )
                },
            }),
        ] as ColumnDef<Persona, any>[],
        [onEdit],
    )

    const showCustomEmpty = !loading && personas.length === 0

    if (showCustomEmpty) {
        return (
            <div className={className}>
                <div className="app-data-table__wrapper">
                    <div className="pacientes-empty">
                        <Empty
                            image={
                                <IdcardOutlined
                                    style={{ fontSize: 48, color: '#94a3b8' }}
                                />
                            }
                            description={
                                hasActiveFilters
                                    ? 'No se encontraron personas con los filtros aplicados.'
                                    : 'No hay personas registradas. Se crean automáticamente al registrar pacientes o empleados.'
                            }
                        />
                    </div>
                </div>
            </div>
        )
    }

    return (
        <AppDataTable
            className={className}
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
