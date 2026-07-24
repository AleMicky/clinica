import { useMemo, useState } from 'react'
import { Button, Form, Select, Typography } from 'antd'

import { pacientesService } from '../../pacientes/services/pacientes.service'
import { useAppQuery } from '../../../shared/hooks/use-app-query'
import { queryKeys } from '../../../shared/constants/query-keys'
import type { Paciente } from '../../pacientes/types/paciente.types'

const { Text } = Typography

export type PacienteSeleccionado = {
    id: string
    personaId: string
    label: string
    numeroHistoriaClinica: string
    personaNombreCompleto: string
}

type PacienteSearchBoxProps = {
    value?: string
    onChange: (paciente: PacienteSeleccionado | null) => void
    onRegistrar?: (searchTerm: string) => void
    onBlur?: () => void
    disabled?: boolean
    error?: string
    label?: string | null
}

function formatPacienteLabel(paciente: Paciente) {
    return `${paciente.personaNombreCompleto} · HC ${paciente.numeroHistoriaClinica}`
}

export function PacienteSearchBox({
    value,
    onChange,
    onRegistrar,
    onBlur,
    disabled,
    error,
    label = 'Paciente',
}: PacienteSearchBoxProps) {
    const [pacienteSearch, setPacienteSearch] = useState('')

    const searchTerm = pacienteSearch.trim()
    const hasSearch = searchTerm.length > 0
    const searchQuery = { page: 1, pageSize: 20, search: searchTerm }

    const { data: pacientesData, isFetching: loadingPacientes } = useAppQuery({
        queryKey: queryKeys.pacientes.list(searchQuery),
        queryFn: () => pacientesService.getPaged(searchQuery),
        enabled: hasSearch,
    })

    const { data: pacienteById } = useAppQuery({
        queryKey: queryKeys.pacientes.detail(value ?? ''),
        queryFn: () => pacientesService.getById(value!),
        enabled: Boolean(value),
    })

    const pacienteOptions = useMemo(() => {
        if (!hasSearch && !value) return []

        const items = hasSearch
            ? (pacientesData?.items ?? []).map((paciente) => ({
                  value: paciente.id,
                  label: formatPacienteLabel(paciente),
                  paciente,
              }))
            : []

        if (
            pacienteById &&
            value &&
            !items.some((item) => item.value === value)
        ) {
            items.unshift({
                value: pacienteById.id,
                label: formatPacienteLabel(pacienteById),
                paciente: pacienteById,
            })
        }

        return items
    }, [hasSearch, pacientesData?.items, pacienteById, value])

    const sinResultados =
        hasSearch && !loadingPacientes && (pacientesData?.items.length ?? 0) === 0

    const seleccionarPaciente = (paciente: Paciente) => {
        onChange({
            id: paciente.id,
            personaId: paciente.personaId,
            label: formatPacienteLabel(paciente),
            numeroHistoriaClinica: paciente.numeroHistoriaClinica,
            personaNombreCompleto: paciente.personaNombreCompleto,
        })
        setPacienteSearch(paciente.personaNombreCompleto)
    }

    return (
        <Form.Item
            label={label === null ? undefined : label}
            required={label !== null}
            validateStatus={error ? 'error' : undefined}
            help={
                error ||
                (sinResultados && onRegistrar ? (
                    <span>
                        No se encontró el paciente.{' '}
                        <Button
                            type="link"
                            size="small"
                            style={{ padding: 0, height: 'auto' }}
                            onClick={() => onRegistrar(searchTerm)}
                            disabled={disabled}
                        >
                            Completar datos para recepcionar
                        </Button>
                    </span>
                ) : sinResultados ? (
                    'No se encontró el paciente'
                ) : undefined)
            }
        >
            <Select
                showSearch
                allowClear
                disabled={disabled}
                style={{ width: '100%' }}
                placeholder="Buscar por nombre, documento o HC"
                filterOption={false}
                onSearch={setPacienteSearch}
                onBlur={onBlur}
                loading={loadingPacientes && hasSearch}
                options={pacienteOptions}
                value={value || undefined}
                onChange={(nextId) => {
                    if (!nextId) {
                        onChange(null)
                        setPacienteSearch('')
                        return
                    }

                    const option = pacienteOptions.find((item) => item.value === nextId)
                    if (option) {
                        seleccionarPaciente(option.paciente)
                    }
                }}
                notFoundContent={
                    !hasSearch ? (
                        <Text type="secondary">Escriba para buscar un paciente</Text>
                    ) : loadingPacientes ? (
                        <Text type="secondary">Buscando…</Text>
                    ) : sinResultados ? (
                        <div style={{ padding: '8px 0', textAlign: 'center' }}>
                            <Text type="secondary">No se encontró el paciente</Text>
                            {onRegistrar ? (
                                <>
                                    <br />
                                    <Button
                                        type="link"
                                        size="small"
                                        onClick={() => onRegistrar(searchTerm)}
                                    >
                                        Completar datos para recepcionar
                                    </Button>
                                </>
                            ) : null}
                        </div>
                    ) : undefined
                }
            />
        </Form.Item>
    )
}
