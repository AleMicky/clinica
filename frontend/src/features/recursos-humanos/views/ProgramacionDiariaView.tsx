import { useEffect, useMemo, useState } from 'react'
import {
    Button,
    DatePicker,
    Empty,
    Flex,
    Select,
    Space,
    Tag,
    Typography,
} from 'antd'
import {
    PlusOutlined,
    SettingOutlined,
    CalendarOutlined,
} from '@ant-design/icons'
import dayjs, { type Dayjs } from 'dayjs'

import { useAreas } from '../../catalogo-clinico/hooks/catalogo-clinico.hooks'
import { useEmpleados } from '../hooks/empleados.hooks'
import {
    useCreateGrupoProgramacion,
    useCreateProgramacion,
    useCreateProgramacionDiaria,
    useDeleteProgramacionDiaria,
    useGrupoProgramacion,
    useGruposProgramacion,
    useProgramacionDiaria,
    useProgramaciones,
    useSetGrupoProgramacionEmpleados,
    useTurnos,
    useUpdateGrupoProgramacion,
    useUpdateProgramacionDiaria,
    useUpdateProgramacionEstado,
} from '../hooks/turnos.hooks'
import {
    GrupoProgramacionFormDrawer,
    type GrupoFormValues,
} from '../components/GrupoProgramacionFormDrawer'
import { ProgramacionCalendarioMatrix } from '../components/ProgramacionCalendarioMatrix'
import {
    ProgramacionCeldaDrawer,
    toCeldaPayload,
    type CeldaFormValues,
} from '../components/ProgramacionCeldaDrawer'
import {
    ESTADO_PROGRAMACION_LABELS,
    type GrupoProgramacion,
    type ProgramacionDiaria,
} from '../types/turnos.types'

const LOOKUP_QUERY = { page: 1, pageSize: 200 }
const DATE_FORMAT = 'YYYY-MM-DD'
const { Text } = Typography

function daysOfMonth(month: Dayjs): string[] {
    const days: string[] = []
    const total = month.daysInMonth()
    for (let d = 1; d <= total; d += 1) {
        days.push(month.date(d).format(DATE_FORMAT))
    }
    return days
}

export function ProgramacionDiariaView() {
    const [mes, setMes] = useState(() => dayjs().startOf('month'))
    const [grupoId, setGrupoId] = useState<string | undefined>()
    const [programacionId, setProgramacionId] = useState<string | undefined>()

    const [celdaOpen, setCeldaOpen] = useState(false)
    const [editingCelda, setEditingCelda] = useState<ProgramacionDiaria | null>(null)
    const [celdaDefaults, setCeldaDefaults] = useState<{
        fecha: string
        empleadoId?: string
    }>({ fecha: dayjs().format(DATE_FORMAT) })

    const [grupoDrawerOpen, setGrupoDrawerOpen] = useState(false)
    const [editingGrupo, setEditingGrupo] = useState<GrupoProgramacion | null>(null)

    const fechaDesde = mes.startOf('month').format(DATE_FORMAT)
    const fechaHasta = mes.endOf('month').format(DATE_FORMAT)
    const dias = useMemo(() => daysOfMonth(mes), [mes])

    const { data: gruposData, isFetching: loadingGrupos } = useGruposProgramacion(LOOKUP_QUERY)
    const { data: grupoDetalle, isFetching: loadingGrupoDetalle } = useGrupoProgramacion(grupoId)
    const { data: programacionesData, isFetching: loadingProgramaciones } = useProgramaciones(
        {
            page: 1,
            pageSize: 50,
            grupoProgramacionId: grupoId,
            fechaDesde,
            fechaHasta,
        },
        !!grupoId,
    )
    const { data: diariaData, isFetching: loadingDiaria } = useProgramacionDiaria(
        {
            page: 1,
            pageSize: 500,
            grupoProgramacionId: grupoId,
            fechaDesde,
            fechaHasta,
            programacionId,
        },
        !!grupoId,
    )
    const { data: turnosData } = useTurnos({ page: 1, pageSize: 100, activo: true })
    const { data: empleadosData } = useEmpleados(LOOKUP_QUERY)
    const { data: areasResult } = useAreas(LOOKUP_QUERY)

    const createCelda = useCreateProgramacionDiaria()
    const updateCelda = useUpdateProgramacionDiaria()
    const deleteCelda = useDeleteProgramacionDiaria()
    const createProgramacion = useCreateProgramacion()
    const updateEstado = useUpdateProgramacionEstado()
    const createGrupo = useCreateGrupoProgramacion()
    const updateGrupo = useUpdateGrupoProgramacion()
    const setEmpleados = useSetGrupoProgramacionEmpleados()

    const grupos = gruposData?.items ?? []
    const programaciones = programacionesData?.items ?? []
    const programacionActiva =
        programaciones.find((p) => p.id === programacionId) ??
        programaciones.find((p) => p.estado !== 4) ??
        null

    const grupoOptions = useMemo(
        () =>
            grupos.map((g) => ({
                value: g.id,
                label: `${g.codigo} – ${g.nombre}`,
            })),
        [grupos],
    )

    const programacionOptions = useMemo(
        () =>
            programaciones.map((p) => ({
                value: p.id,
                label: `${p.nombre} · ${ESTADO_PROGRAMACION_LABELS[p.estado]} (${p.fechaInicio} → ${p.fechaFin})`,
            })),
        [programaciones],
    )

    const empleadoOptions = useMemo(
        () =>
            (grupoDetalle?.empleados ?? []).map((e) => ({
                value: e.empleadoId,
                label: `${e.empleadoCodigo} – ${e.empleadoNombre}`,
            })),
        [grupoDetalle?.empleados],
    )

    const turnoOptions = useMemo(
        () =>
            (turnosData?.items ?? []).map((t) => ({
                value: t.id,
                label: `${t.codigo} (${t.horaInicio.slice(0, 5)}–${t.horaFin.slice(0, 5)})`,
            })),
        [turnosData?.items],
    )

    const areaOptions = useMemo(
        () =>
            (areasResult?.items ?? []).map((a) => ({
                value: a.id,
                label: `${a.codigo} – ${a.nombre}`,
            })),
        [areasResult?.items],
    )

    const allEmpleadoTransfer = useMemo(
        () =>
            (empleadosData?.items ?? []).map((e) => ({
                key: e.id,
                title: `${e.codigoEmpleado} – ${e.personaNombreCompleto}`,
            })),
        [empleadosData?.items],
    )

    useEffect(() => {
        if (!grupoId) {
            setProgramacionId(undefined)
            return
        }
        if (programacionId && programaciones.some((p) => p.id === programacionId)) return
        const preferred =
            programaciones.find((p) => p.estado === 2) ??
            programaciones.find((p) => p.estado === 1) ??
            programaciones[0]
        setProgramacionId(preferred?.id)
    }, [grupoId, programaciones, programacionId])

    const loading =
        loadingGrupos ||
        loadingGrupoDetalle ||
        loadingProgramaciones ||
        loadingDiaria ||
        createCelda.isPending ||
        updateCelda.isPending

    const handleCreateMes = async () => {
        if (!grupoId || !grupoDetalle) return
        const nombre = `${grupoDetalle.nombre} · ${mes.format('MMMM YYYY')}`
        const created = await createProgramacion.mutateAsync({
            nombre,
            fechaInicio: fechaDesde,
            fechaFin: fechaHasta,
            grupoProgramacionId: grupoId,
            observacion: null,
        })
        setProgramacionId(created.id)
    }

    const handleCeldaClick = (
        empleadoId: string,
        fecha: string,
        existing?: ProgramacionDiaria,
    ) => {
        if (!existing && !programacionId) {
            return
        }
        setEditingCelda(existing ?? null)
        setCeldaDefaults({ fecha, empleadoId })
        setCeldaOpen(true)
    }

    const handleCeldaSubmit = async (values: CeldaFormValues) => {
        const payload = toCeldaPayload(values)
        if (editingCelda) {
            await updateCelda.mutateAsync({ id: editingCelda.id, data: payload })
        } else {
            await createCelda.mutateAsync(payload)
        }
        setCeldaOpen(false)
        setEditingCelda(null)
    }

    const handleGrupoSubmit = async (values: GrupoFormValues) => {
        const payload = {
            codigo: values.codigo.trim(),
            nombre: values.nombre.trim(),
            descripcion: values.descripcion?.trim() || null,
            areaId: values.areaId,
        }

        if (editingGrupo) {
            await updateGrupo.mutateAsync({ id: editingGrupo.id, data: payload })
            await setEmpleados.mutateAsync({
                id: editingGrupo.id,
                data: { empleadoIds: values.empleadoIds },
            })
        } else {
            const created = await createGrupo.mutateAsync(payload)
            if (values.empleadoIds.length > 0) {
                await setEmpleados.mutateAsync({
                    id: created.id,
                    data: { empleadoIds: values.empleadoIds },
                })
            }
            setGrupoId(created.id)
        }

        setGrupoDrawerOpen(false)
        setEditingGrupo(null)
    }

    const handleCambiarEstado = async () => {
        if (!programacionActiva) return
        if (programacionActiva.estado === 1) {
            await updateEstado.mutateAsync({
                id: programacionActiva.id,
                data: { estado: 2 },
            })
            return
        }
        if (programacionActiva.estado === 2) {
            await updateEstado.mutateAsync({
                id: programacionActiva.id,
                data: { estado: 3 },
            })
        }
    }

    return (
        <div className="rrhh-section-panel">
            <Flex gap={12} wrap="wrap" align="center" style={{ marginBottom: 16 }}>
                <Select
                    placeholder="Seleccione un grupo"
                    style={{ minWidth: 280 }}
                    showSearch
                    optionFilterProp="label"
                    options={grupoOptions}
                    value={grupoId}
                    onChange={(value) => {
                        setGrupoId(value)
                        setProgramacionId(undefined)
                    }}
                    allowClear
                />
                <DatePicker
                    picker="month"
                    value={mes}
                    onChange={(value) => {
                        if (value) {
                            setMes(value.startOf('month'))
                            setProgramacionId(undefined)
                        }
                    }}
                    format="MMMM YYYY"
                    allowClear={false}
                />
                <Select
                    placeholder="Programación del mes"
                    style={{ minWidth: 280 }}
                    showSearch
                    optionFilterProp="label"
                    options={programacionOptions}
                    value={programacionId}
                    onChange={setProgramacionId}
                    disabled={!grupoId}
                    allowClear
                />
                <Space wrap>
                    <Button
                        icon={<PlusOutlined />}
                        onClick={() => {
                            setEditingGrupo(null)
                            setGrupoDrawerOpen(true)
                        }}
                    >
                        Nuevo grupo
                    </Button>
                    <Button
                        icon={<SettingOutlined />}
                        disabled={!grupoDetalle}
                        onClick={() => {
                            if (!grupoDetalle) return
                            setEditingGrupo(grupoDetalle)
                            setGrupoDrawerOpen(true)
                        }}
                    >
                        Editar grupo
                    </Button>
                    <Button
                        icon={<CalendarOutlined />}
                        type="dashed"
                        disabled={!grupoId || createProgramacion.isPending}
                        loading={createProgramacion.isPending}
                        onClick={() => void handleCreateMes()}
                    >
                        Crear programación del mes
                    </Button>
                    {programacionActiva &&
                        (programacionActiva.estado === 1 ||
                            programacionActiva.estado === 2) && (
                        <Button
                            onClick={() => void handleCambiarEstado()}
                            loading={updateEstado.isPending}
                        >
                            {programacionActiva.estado === 1 ? 'Publicar' : 'Cerrar'}
                        </Button>
                    )}
                </Space>
            </Flex>

            {grupoDetalle && (
                <Flex gap={8} align="center" style={{ marginBottom: 12 }} wrap="wrap">
                    <Text strong>
                        Grupo: {grupoDetalle.nombre}
                    </Text>
                    <Text type="secondary">· {mes.format('MMMM YYYY')}</Text>
                    <Tag>{grupoDetalle.areaNombre}</Tag>
                    {programacionActiva && (
                        <Tag color={programacionActiva.estado === 2 ? 'success' : 'default'}>
                            {ESTADO_PROGRAMACION_LABELS[programacionActiva.estado]}
                        </Tag>
                    )}
                    {!programacionId && grupoId && (
                        <Tag color="warning">
                            Cree o seleccione una programación del mes para asignar celdas
                        </Tag>
                    )}
                    <Text type="secondary">
                        {grupoDetalle.empleados.length} empleado
                        {grupoDetalle.empleados.length === 1 ? '' : 's'}
                    </Text>
                </Flex>
            )}

            {!grupoId ? (
                <Empty description="Seleccione un grupo para ver el calendario" />
            ) : (
                <ProgramacionCalendarioMatrix
                    dias={dias}
                    empleados={grupoDetalle?.empleados ?? []}
                    asignaciones={diariaData?.items ?? []}
                    loading={loading}
                    onCellClick={handleCeldaClick}
                />
            )}

            <ProgramacionCeldaDrawer
                open={celdaOpen}
                loading={createCelda.isPending || updateCelda.isPending}
                deleting={deleteCelda.isPending}
                editing={editingCelda}
                defaultFecha={celdaDefaults.fecha}
                defaultEmpleadoId={celdaDefaults.empleadoId}
                programacionId={programacionId}
                empleadoOptions={empleadoOptions}
                turnoOptions={turnoOptions}
                programacionOptions={programacionOptions}
                onClose={() => {
                    setCeldaOpen(false)
                    setEditingCelda(null)
                }}
                onSubmit={handleCeldaSubmit}
                onDelete={
                    editingCelda
                        ? async () => {
                              await deleteCelda.mutateAsync(editingCelda.id)
                              setCeldaOpen(false)
                              setEditingCelda(null)
                          }
                        : undefined
                }
            />

            <GrupoProgramacionFormDrawer
                open={grupoDrawerOpen}
                loading={
                    createGrupo.isPending ||
                    updateGrupo.isPending ||
                    setEmpleados.isPending
                }
                entity={editingGrupo}
                areaOptions={areaOptions}
                empleadoOptions={allEmpleadoTransfer}
                onClose={() => {
                    setGrupoDrawerOpen(false)
                    setEditingGrupo(null)
                }}
                onSubmit={handleGrupoSubmit}
            />
        </div>
    )
}
