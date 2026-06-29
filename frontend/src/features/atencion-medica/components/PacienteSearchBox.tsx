import { useMemo, useState } from 'react'
import { PlusOutlined } from '@ant-design/icons'
import { useQueryClient } from '@tanstack/react-query'
import { Button, Flex, Form, Select, Typography } from 'antd'

import { PacienteFormModal } from '../../pacientes/components/PacienteFormModal'
import { useCreatePaciente, usePacientes } from '../../pacientes/hooks/pacientes.hooks'
import {
    toCreatePacientePayload,
    type PacienteFormValues,
    type PacienteUpdateFormValues,
} from '../../pacientes/schemas/paciente.schema'
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
    disabled?: boolean
}

export function PacienteSearchBox({ value, onChange, disabled }: PacienteSearchBoxProps) {
    const [pacienteSearch, setPacienteSearch] = useState('')
    const [registrarOpen, setRegistrarOpen] = useState(false)

    const queryClient = useQueryClient()
    const createPaciente = useCreatePaciente()

    const { data: pacientesData, isFetching: loadingPacientes } = usePacientes({
        page: 1,
        pageSize: 20,
        search: pacienteSearch || undefined,
    })

    const pacienteOptions = useMemo(
        () =>
            (pacientesData?.items ?? []).map((paciente) => ({
                value: paciente.id,
                label: `${paciente.personaNombreCompleto} · HC ${paciente.numeroHistoriaClinica}`,
                paciente,
            })),
        [pacientesData?.items],
    )

    const sinResultados =
        Boolean(pacienteSearch.trim()) &&
        !loadingPacientes &&
        (pacientesData?.items.length ?? 0) === 0

    const cerrarRegistroPaciente = () => {
        if (createPaciente.isPending) return
        setRegistrarOpen(false)
    }

    const handleRegistrarPaciente = async (
        values: PacienteFormValues | PacienteUpdateFormValues,
    ) => {
        const paciente = await createPaciente.mutateAsync(
            toCreatePacientePayload(values as PacienteFormValues),
        )
        await queryClient.invalidateQueries({ queryKey: queryKeys.pacientes.all })
        seleccionarPaciente(paciente)
        setRegistrarOpen(false)
    }

    const seleccionarPaciente = (paciente: Paciente) => {
        onChange({
            id: paciente.id,
            personaId: paciente.personaId,
            label: `${paciente.personaNombreCompleto} · HC ${paciente.numeroHistoriaClinica}`,
            numeroHistoriaClinica: paciente.numeroHistoriaClinica,
            personaNombreCompleto: paciente.personaNombreCompleto,
        })
        setPacienteSearch(paciente.personaNombreCompleto)
    }

    return (
        <>
            <Form.Item label="Buscar paciente" required>
                <Flex gap={8} align="start">
                    <Select
                        showSearch
                        allowClear
                        disabled={disabled}
                        style={{ flex: 1 }}
                        placeholder="Nombre, documento o historia clínica"
                        filterOption={false}
                        onSearch={setPacienteSearch}
                        loading={loadingPacientes}
                        options={pacienteOptions}
                        value={value || undefined}
                        onChange={(nextId) => {
                            if (!nextId) {
                                onChange(null)
                                return
                            }

                            const option = pacienteOptions.find((item) => item.value === nextId)
                            if (option) {
                                seleccionarPaciente(option.paciente)
                            }
                        }}
                        notFoundContent={
                            sinResultados ? (
                                <div style={{ padding: '8px 0', textAlign: 'center' }}>
                                    <Text type="secondary">No se encontró el paciente</Text>
                                    <br />
                                    <Button
                                        type="link"
                                        size="small"
                                        onClick={() => setRegistrarOpen(true)}
                                    >
                                        Registrar nuevo paciente
                                    </Button>
                                </div>
                            ) : undefined
                        }
                    />
                    <Button
                        icon={<PlusOutlined />}
                        onClick={() => setRegistrarOpen(true)}
                        disabled={disabled}
                    >
                        Nuevo
                    </Button>
                </Flex>
            </Form.Item>

            <PacienteFormModal
                open={registrarOpen}
                paciente={null}
                loading={createPaciente.isPending}
                title="Registrar paciente"
                onClose={cerrarRegistroPaciente}
                onSubmit={handleRegistrarPaciente}
            />
        </>
    )
}
