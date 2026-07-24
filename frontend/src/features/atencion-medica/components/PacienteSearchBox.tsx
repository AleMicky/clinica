import { useEffect, useMemo, useState } from 'react'
import {
    Button,
    Descriptions,
    Empty,
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
    const [emptyTerm, setEmptyTerm] = useState<string | null>(null)

    const searchTerm = pacienteSearch.trim()
    const hasSearch = searchTerm.length > 0
    const searchQuery = { page: 1, pageSize: 20, search: searchTerm }

    const { data: pacientesData, isFetching: loadingPacientes } = useAppQuery({
        queryKey: queryKeys.pacientes.list(searchQuery),
        queryFn: () => pacientesService.getPaged(searchQuery),
        enabled: hasSearch && !value,
    })

    const { data: pacienteById, isFetching: loadingDetalle } = useAppQuery({
        queryKey: queryKeys.pacientes.detail(value ?? ''),
        queryFn: () => pacientesService.getById(value!),
        enabled: Boolean(value),
    })

    useEffect(() => {
        if (value) {
            setEmptyTerm(null)
            return
        }

        if (!hasSearch) return
        if (loadingPacientes) return

        if ((pacientesData?.items.length ?? 0) === 0) {
            setEmptyTerm(searchTerm)
            return
        }

        setEmptyTerm(null)
    }, [value, hasSearch, searchTerm, loadingPacientes, pacientesData?.items.length])

    const pacienteOptions = useMemo(() => {
        if (!hasSearch) return []

        return (pacientesData?.items ?? []).map((paciente) => ({
            value: paciente.id,
            label: formatPacienteLabel(paciente),
            paciente,
        }))
    }, [hasSearch, pacientesData?.items])

    const termForRegister = emptyTerm ?? searchTerm
    const showEmptyCta = Boolean(emptyTerm) && !value

    const seleccionarPaciente = (paciente: Paciente) => {
        onChange(toSeleccionado(paciente))
        setPacienteSearch('')
        setEmptyTerm(null)
    }

    const limpiarSeleccion = () => {
        onChange(null)
        setPacienteSearch('')
        setEmptyTerm(null)
    }

    const handleRegistrar = () => {
        if (!onRegistrar || !termForRegister) return
        onRegistrar(termForRegister)
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
                loading={loadingPacientes && hasSearch}
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
                        setEmptyTerm(null)
                        return
                    }

                    const option = pacienteOptions.find((item) => item.value === nextId)
                    if (option) {
                        seleccionarPaciente(option.paciente)
                    }
                }}
                notFoundContent={
                    !hasSearch && !emptyTerm ? (
                        <Text type="secondary">Escriba para buscar un paciente</Text>
                    ) : loadingPacientes ? (
                        <Text type="secondary">Buscando…</Text>
                    ) : (
                        <Text type="secondary">Sin coincidencias</Text>
                    )
                }
            />

            {showEmptyCta ? (
                <div
                    className="paciente-search-box__empty"
                    onMouseDown={(event) => {
                        event.preventDefault()
                    }}
                >
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={null}>
                        <Flex vertical align="center" gap={6}>
                            <Text strong className="paciente-search-box__empty-title">
                                No se encontró el paciente
                            </Text>
                            <Text
                                type="secondary"
                                className="paciente-search-box__empty-desc"
                            >
                                No hay coincidencias para «{termForRegister}». Puede
                                registrarlo ahora y continuar la recepción.
                            </Text>
                            {onRegistrar ? (
                                <Button
                                    type="primary"
                                    htmlType="button"
                                    icon={<UserAddOutlined />}
                                    disabled={disabled}
                                    onClick={handleRegistrar}
                                    className="paciente-search-box__empty-btn"
                                >
                                    Registrar paciente nuevo
                                </Button>
                            ) : null}
                        </Flex>
                    </Empty>
                </div>
            ) : null}
        </Form.Item>
    )
}
