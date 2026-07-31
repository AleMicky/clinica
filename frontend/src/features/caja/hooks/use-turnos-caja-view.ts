import { useState } from 'react'

import {
    useAbrirTurno,
    useCajas,
    useCerrarArqueo,
    useResumenTurno,
    useTurnos,
} from './caja.hooks'
import type {
    AbrirTurnoPayload,
    CerrarArqueoPayload,
    TurnoCaja,
} from '../types/caja.types'

const DEFAULT_PAGE_SIZE = 20

export function useTurnosCajaView() {
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
    const [cajaId, setCajaId] = useState<string | undefined>()
    const [estado, setEstado] = useState<string | undefined>()

    const [abrirOpen, setAbrirOpen] = useState(false)
    const [cerrarTurno, setCerrarTurno] = useState<TurnoCaja | null>(null)

    const { data: cajasPage } = useCajas({ page: 1, pageSize: 100, activo: true })
    const { data, isFetching } = useTurnos({
        page,
        pageSize,
        cajaId,
        estado,
    })
    const { data: resumen } = useResumenTurno(cerrarTurno?.id)

    const abrirTurno = useAbrirTurno()
    const cerrarArqueo = useCerrarArqueo()

    const turnos = data?.items ?? []
    const total = data?.totalRecords ?? 0
    const hasActiveFilters = Boolean(cajaId || estado)

    const cajaOptions =
        cajasPage?.items.map((caja) => ({
            label: `${caja.codigo} · ${caja.nombre}`,
            value: caja.id,
        })) ?? []

    const openAbrir = () => setAbrirOpen(true)

    const closeAbrir = () => {
        if (abrirTurno.isPending) return
        setAbrirOpen(false)
    }

    const handleAbrir = async (payload: AbrirTurnoPayload) => {
        await abrirTurno.mutateAsync(payload)
        setAbrirOpen(false)
    }

    const openCerrar = (turno: TurnoCaja) => setCerrarTurno(turno)

    const closeCerrar = () => {
        if (cerrarArqueo.isPending) return
        setCerrarTurno(null)
    }

    const handleCerrar = async (payload: CerrarArqueoPayload) => {
        if (!cerrarTurno) return
        await cerrarArqueo.mutateAsync({
            turnoId: cerrarTurno.id,
            payload,
        })
        setCerrarTurno(null)
    }

    const caption = `${total} turno${total === 1 ? '' : 's'}${
        hasActiveFilters ? ' · filtros activos' : ''
    }`

    return {
        loading: isFetching,
        caption,
        cajaOptions,
        filters: {
            cajaId,
            estado,
            hasActiveFilters,
            onCajaFilterChange: (value: string | undefined) => {
                setCajaId(value)
                setPage(1)
            },
            onEstadoFilterChange: (value: string | undefined) => {
                setEstado(value)
                setPage(1)
            },
            onClearFilters: () => {
                setCajaId(undefined)
                setEstado(undefined)
                setPage(1)
            },
        },
        table: {
            turnos,
            total,
            page,
            pageSize,
            onPageChange: (nextPage: number, nextPageSize: number) => {
                setPage(nextPage)
                setPageSize(nextPageSize)
            },
            onCerrar: openCerrar,
            onAbrir: openAbrir,
        },
        abrirDrawer: {
            open: abrirOpen,
            loading: abrirTurno.isPending,
            cajaOptions,
            onClose: closeAbrir,
            onSubmit: handleAbrir,
        },
        cerrarDrawer: {
            open: cerrarTurno != null,
            turno: cerrarTurno,
            resumen,
            loading: cerrarArqueo.isPending,
            onClose: closeCerrar,
            onSubmit: handleCerrar,
        },
    }
}
