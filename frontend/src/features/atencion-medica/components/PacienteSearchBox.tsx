import { useEffect, useMemo, useState } from 'react'
import {
    Button,
    Descriptions,
    Flex,
    Form,
    Select,
    Tag,
    Typography,
} from 'antd'
import {
    CheckCircleOutlined,
    SearchOutlined,
    SwapOutlined,
    UserAddOutlined,
    UserOutlined,
} from '@ant-design/icons'

import { pacientesService } from '../../pacientes/services/pacientes.service'
import {
    calcularEdadPaciente,
    formatPacienteDocumento,
    type Paciente,
} from '../../pacientes/types/paciente.types'
import { useAppQuery } from '../../../shared/hooks/use-app-query'
import { queryKeys } from '../../../shared/constants/query-keys'

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
    return `${paciente.personaNombreCompleto} · Nro. cuenta ${paciente.numeroHistoriaClinica}`
}

function formatDate(value: string) {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value
    return date.toLocaleDateString('es-BO')
}

function toSeleccionado(paciente: Paciente): PacienteSeleccionado {
    return {
        id: paciente.id,
        personaId: paciente.personaId,
        label: formatPacienteLabel(paciente),
        numeroHistoriaClinica: paciente.numeroHistoriaClinica,
        personaNombreCompleto: paciente.personaNombreCompleto,
    }
}

function PacienteOptionRow({ paciente }: { paciente: Paciente }) {
    return (
        <div className="paciente-search-box__option">
            <span className="paciente-search-box__option-name">
                {paciente.personaNombreCompleto}
            </span>
            <span className="paciente-search-box__option-meta">
                <span className="paciente-search-box__option-cuenta">
                    Nro. cuenta {paciente.numeroHistoriaClinica}
                </span>
                <span className="paciente-search-box__option-doc">
                    {formatPacienteDocumento(paciente)}
                </span>
            </span>
        </div>
    )
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
    const [debouncedSearch, setDebouncedSearch] = useState('')

    useEffect(() => {
        const timer = window.setTimeout(() => {
            setDebouncedSearch(pacienteSearch.trim())
        }, 300)

        return () => window.clearTimeout(timer)
    }, [pacienteSearch])

    const searchTerm = debouncedSearch
    const hasSearch = searchTerm.length > 0
    const isDebouncing =
        pacienteSearch.trim() !== debouncedSearch && pacienteSearch.trim().length > 0
    const searchQuery = { page: 1, pageSize: 20, search: searchTerm }

    const { data: pacientesData, isFetching: loadingPacientes } = useAppQuery({
        queryKey: queryKeys.pacientes.list(searchQuery),
        queryFn: () => pacientesService.getPaged(searchQuery),
        enabled: hasSearch && !value,
        staleTime: 60_000,
    })

    const { data: pacienteById, isFetching: loadingDetalle } = useAppQuery({
        queryKey: queryKeys.pacientes.detail(value ?? ''),
        queryFn: () => pacientesService.getById(value!),
        enabled: Boolean(value),
    })

    const pacienteOptions = useMemo(() => {
        if (!hasSearch) return []

        return (pacientesData?.items ?? []).map((paciente) => ({
            value: paciente.id,
            label: formatPacienteLabel(paciente),
            paciente,
        }))
    }, [hasSearch, pacientesData?.items])

    const sinResultados =
        hasSearch &&
        !isDebouncing &&
        !loadingPacientes &&
        (pacientesData?.items.length ?? 0) === 0

    const seleccionarPaciente = (paciente: Paciente) => {
        onChange(toSeleccionado(paciente))
        setPacienteSearch('')
        setDebouncedSearch('')
    }

    const limpiarSeleccion = () => {
        onChange(null)
        setPacienteSearch('')
        setDebouncedSearch('')
    }

    const handleRegistrar = () => {
        if (!onRegistrar || !sinResultados) return
        onRegistrar(searchTerm)
        setPacienteSearch('')
        setDebouncedSearch('')
    }

    if (value) {
        const paciente = pacienteById

        return (
            <Form.Item
                label={label === null ? undefined : label}
                required={label !== null}
                validateStatus={error ? 'error' : undefined}
                help={error || undefined}
                className="paciente-search-box"
            >
                <div className="paciente-search-box__ficha">
                    <div className="paciente-search-box__ficha-head">
                        <div className="paciente-search-box__ficha-title">
                            <span className="paciente-search-box__ficha-icon" aria-hidden>
                                <UserOutlined />
                            </span>
                            <div className="paciente-search-box__ficha-heading">
                                <Tag
                                    color="success"
                                    icon={<CheckCircleOutlined />}
                                    className="paciente-search-box__ficha-tag"
                                >
                                    Paciente encontrado
                                </Tag>
                                <p className="paciente-search-box__ficha-name">
                                    {paciente?.personaNombreCompleto ?? 'Cargando…'}
                                </p>
                                <p className="paciente-search-box__ficha-hc">
                                    Nro. cuenta{' '}
                                    <strong>
                                        {paciente?.numeroHistoriaClinica ?? '—'}
                                    </strong>
                                </p>
                            </div>
                        </div>
                        <Button
                            type="default"
                            size="small"
                            icon={<SwapOutlined />}
                            onClick={limpiarSeleccion}
                            disabled={disabled || loadingDetalle}
                        >
                            Cambiar
                        </Button>
                    </div>

                    {paciente ? (
                        <Descriptions
                            size="small"
                            column={{ xs: 1, sm: 2, md: 3 }}
                            className="paciente-search-box__ficha-grid"
                            items={[
                                {
                                    key: 'documento',
                                    label: 'Documento',
                                    children: formatPacienteDocumento(paciente),
                                },
                                {
                                    key: 'nacimiento',
                                    label: 'Nacimiento',
                                    children: formatDate(paciente.fechaNacimiento),
                                },
                                {
                                    key: 'edad',
                                    label: 'Edad',
                                    children: calcularEdadPaciente(paciente.fechaNacimiento),
                                },
                                {
                                    key: 'sexo',
                                    label: 'Sexo',
                                    children: paciente.sexoNombre || '—',
                                },
                                {
                                    key: 'telefono',
                                    label: 'Teléfono',
                                    children: paciente.telefono?.trim() || '—',
                                },
                                {
                                    key: 'direccion',
                                    label: 'Dirección',
                                    children: paciente.direccion?.trim() || '—',
                                },
                            ]}
                        />
                    ) : (
                        <Text type="secondary">Cargando ficha del paciente…</Text>
                    )}
                </div>
            </Form.Item>
        )
    }

    return (
        <Form.Item
            label={label === null ? undefined : label}
            required={label !== null}
            validateStatus={error ? 'error' : undefined}
            help={error || undefined}
            className="paciente-search-box"
        >
            <Select
                showSearch
                allowClear
                disabled={disabled}
                className="paciente-search-box__select"
                style={{ width: '100%' }}
                size="large"
                placeholder="Buscar por nombre, documento o nro. cuenta"
                suffixIcon={<SearchOutlined />}
                filterOption={false}
                optionLabelProp="label"
                searchValue={pacienteSearch}
                onSearch={setPacienteSearch}
                onBlur={onBlur}
                loading={(loadingPacientes || isDebouncing) && hasSearch}
                options={pacienteOptions}
                optionRender={(option) => {
                    const paciente = (
                        option.data as { paciente?: Paciente }
                    ).paciente
                    if (!paciente) return option.label
                    return <PacienteOptionRow paciente={paciente} />
                }}
                value={undefined}
                onChange={(nextId) => {
                    if (!nextId) {
                        onChange(null)
                        setPacienteSearch('')
                        setDebouncedSearch('')
                        return
                    }

                    const option = pacienteOptions.find((item) => item.value === nextId)
                    if (option) {
                        seleccionarPaciente(option.paciente)
                    }
                }}
                notFoundContent={
                    !hasSearch && !pacienteSearch.trim() ? (
                        <Text type="secondary">Escriba para buscar un paciente</Text>
                    ) : loadingPacientes || isDebouncing ? (
                        <Text type="secondary">Buscando…</Text>
                    ) : sinResultados && onRegistrar ? (
                        <Flex vertical align="center" gap={8} style={{ padding: '8px 4px' }}>
                            <Text type="secondary">Sin coincidencias</Text>
                            <Button
                                type="primary"
                                size="small"
                                htmlType="button"
                                icon={<UserAddOutlined />}
                                disabled={disabled}
                                onMouseDown={(event) => {
                                    event.preventDefault()
                                    event.stopPropagation()
                                    handleRegistrar()
                                }}
                            >
                                Registrar paciente nuevo
                            </Button>
                        </Flex>
                    ) : (
                        <Text type="secondary">Sin coincidencias</Text>
                    )
                }
            />
        </Form.Item>
    )
}
