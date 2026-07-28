import { Table, Tag, Typography } from 'antd'

import { useMedicoDisponibilidad } from '../../recursos-humanos/hooks/turnos.hooks'
import type { MedicoDisponibilidad } from '../../recursos-humanos/types/turnos.types'

const { Text } = Typography

type MedicoDisponibilidadPanelProps = {
    especialidadId?: string
    areaId?: string
    selectedMedicoId?: string
    onSelectMedico?: (medicoId: string) => void
}

function formatHora(value: string) {
    return value.slice(0, 5)
}

function formatProxima(value?: string | null) {
    if (!value) return '—'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return '—'
    return date.toLocaleString('es-BO', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    })
}

export function MedicoDisponibilidadPanel({
    especialidadId,
    areaId,
    selectedMedicoId,
    onSelectMedico,
}: MedicoDisponibilidadPanelProps) {
    const now = new Date()
    const fecha = now.toISOString().slice(0, 10)
    const hora = now.toTimeString().slice(0, 8)

    const { data, isFetching } = useMedicoDisponibilidad({
        fecha,
        hora,
        especialidadId: especialidadId || undefined,
        areaId: areaId || undefined,
        incluirProximaDisponibilidad: true,
    })

    const medicos = data ?? []
    const medicosTurno = medicos.filter((m) => m.esMedicoTurno)
    const disponiblesAhora = medicos.filter((m) => m.disponibleAhora)

    const columns = [
        {
            title: 'Médico',
            dataIndex: 'medicoNombre',
            key: 'medicoNombre',
        },
        {
            title: 'Especialidad',
            dataIndex: 'especialidadNombre',
            key: 'especialidadNombre',
            render: (value: string | null) => value ?? '—',
        },
        {
            title: 'Horario',
            key: 'horario',
            render: (_: unknown, row: MedicoDisponibilidad) =>
                `${formatHora(row.horaInicio)} – ${formatHora(row.horaFin)}`,
        },
        {
            title: 'Área / Consultorio',
            dataIndex: 'areaNombre',
            key: 'areaNombre',
        },
        {
            title: 'Estado',
            key: 'estado',
            render: (_: unknown, row: MedicoDisponibilidad) => (
                <Tag color={row.disponibleAhora ? 'success' : 'default'}>
                    {row.disponibleAhora ? 'Disponible' : 'Fuera de horario'}
                </Tag>
            ),
        },
        {
            title: 'Próxima disp.',
            key: 'proxima',
            render: (_: unknown, row: MedicoDisponibilidad) =>
                formatProxima(row.proximaDisponibilidad),
        },
    ]

    return (
        <div className="atencion-recepcion-form__disponibilidad">
            <div className="atencion-recepcion-form__disponibilidad-head">
                <Text strong>Médicos programados hoy</Text>
                <Text type="secondary">
                    {disponiblesAhora.length} disponible(s) · {medicosTurno.length} de turno
                </Text>
            </div>

            <Table
                size="small"
                rowKey="programacionId"
                loading={isFetching}
                columns={columns}
                dataSource={medicos}
                pagination={false}
                rowClassName={(row) =>
                    row.medicoId === selectedMedicoId ? 'atencion-recepcion-form__row-selected' : ''
                }
                onRow={(row) => ({
                    onClick: () => onSelectMedico?.(row.medicoId),
                    style: { cursor: onSelectMedico ? 'pointer' : undefined },
                })}
            />
        </div>
    )
}
