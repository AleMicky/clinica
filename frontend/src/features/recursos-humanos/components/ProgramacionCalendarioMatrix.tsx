import { Table, Tag, Tooltip } from 'antd'
import type { ColumnsType } from 'antd/es/table'

import type {
    GrupoProgramacionEmpleado,
    ProgramacionDiaria,
} from '../types/turnos.types'

export type CalendarioRow = {
    key: string
    empleadoId: string
    empleadoCodigo: string
    empleadoNombre: string
    celdas: Record<string, ProgramacionDiaria | undefined>
}

type ProgramacionCalendarioMatrixProps = {
    dias: string[]
    empleados: GrupoProgramacionEmpleado[]
    asignaciones: ProgramacionDiaria[]
    loading?: boolean
    onCellClick: (empleadoId: string, fecha: string, existing?: ProgramacionDiaria) => void
}

function cellLabel(asignacion?: ProgramacionDiaria) {
    if (!asignacion) return '—'
    if (asignacion.tipoAsignacion === 2) return 'D'
    return asignacion.turnoCodigo?.slice(0, 6) || asignacion.turnoNombre?.slice(0, 6) || 'T'
}

function cellColor(asignacion?: ProgramacionDiaria) {
    if (!asignacion) return undefined
    if (asignacion.tipoAsignacion === 2) return 'default'
    return 'blue'
}

export function ProgramacionCalendarioMatrix({
    dias,
    empleados,
    asignaciones,
    loading,
    onCellClick,
}: ProgramacionCalendarioMatrixProps) {
    const byKey = new Map<string, ProgramacionDiaria>()
    for (const item of asignaciones) {
        byKey.set(`${item.empleadoId}|${item.fecha}`, item)
    }

    const dataSource: CalendarioRow[] = empleados.map((empleado) => {
        const celdas: CalendarioRow['celdas'] = {}
        for (const fecha of dias) {
            celdas[fecha] = byKey.get(`${empleado.empleadoId}|${fecha}`)
        }
        return {
            key: empleado.empleadoId,
            empleadoId: empleado.empleadoId,
            empleadoCodigo: empleado.empleadoCodigo,
            empleadoNombre: empleado.empleadoNombre,
            celdas,
        }
    })

    const columns: ColumnsType<CalendarioRow> = [
        {
            title: 'Empleado',
            key: 'empleado',
            fixed: 'left',
            width: 220,
            render: (_: unknown, row) => (
                <span>
                    <strong>{row.empleadoCodigo}</strong>
                    <br />
                    <span style={{ color: 'var(--ant-color-text-secondary)' }}>
                        {row.empleadoNombre || '—'}
                    </span>
                </span>
            ),
        },
        ...dias.map((fecha) => {
            const day = fecha.slice(-2)
            return {
                title: day,
                key: fecha,
                width: 56,
                align: 'center' as const,
                render: (_: unknown, row: CalendarioRow) => {
                    const asignacion = row.celdas[fecha]
                    const label = cellLabel(asignacion)
                    const title = !asignacion
                        ? 'Asignar'
                        : asignacion.tipoAsignacion === 2
                          ? 'Descanso'
                          : `${asignacion.turnoNombre ?? 'Turno'}${
                                asignacion.horaInicio
                                    ? ` (${asignacion.horaInicio.slice(0, 5)}–${asignacion.horaFin?.slice(0, 5) ?? ''})`
                                    : ''
                            }`

                    return (
                        <Tooltip title={title}>
                            <Tag
                                color={cellColor(asignacion)}
                                style={{
                                    margin: 0,
                                    cursor: 'pointer',
                                    minWidth: 36,
                                    textAlign: 'center',
                                }}
                                onClick={() => onCellClick(row.empleadoId, fecha, asignacion)}
                            >
                                {label}
                            </Tag>
                        </Tooltip>
                    )
                },
            }
        }),
    ]

    return (
        <Table
            rowKey="key"
            size="small"
            loading={loading}
            columns={columns}
            dataSource={dataSource}
            pagination={false}
            scroll={{ x: 220 + dias.length * 56 }}
            locale={{
                emptyText:
                    empleados.length === 0
                        ? 'El grupo no tiene empleados. Administre los miembros del grupo.'
                        : 'Sin datos',
            }}
        />
    )
}
