import { useState } from 'react'

import {
    useConceptosCaja,
    useMetodosPago,
    useMovimientos,
    useResumenTurno,
    useTurnoAbierto,
} from './caja.hooks'

const DEFAULT_PAGE_SIZE = 20

export function useMovimientosView() {
    const { data: turno } = useTurnoAbierto()
    const { data: resumen } = useResumenTurno(turno?.id)
    const { data: conceptos } = useConceptosCaja()
    const { data: metodos } = useMetodosPago()

    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
    const [tipoMovimiento, setTipoMovimiento] = useState<string | undefined>()
    const [conceptoCajaId, setConceptoCajaId] = useState<string | undefined>()
    const [metodoPagoId, setMetodoPagoId] = useState<string | undefined>()
    const [estado, setEstado] = useState<string | undefined>()
    const [filtroTurnoAbierto, setFiltroTurnoAbierto] = useState(true)

    const hasTurnoAbierto = Boolean(turno?.id)
    const turnoCajaId = filtroTurnoAbierto && turno?.id ? turno.id : undefined

    const { data, isFetching } = useMovimientos({
        page,
        pageSize,
        turnoCajaId,
        tipoMovimiento,
        conceptoCajaId,
        metodoPagoId,
        estado,
    })

    const items = data?.items ?? []
    const total = data?.totalRecords ?? 0

    const hasActiveFilters = Boolean(
        tipoMovimiento ||
            conceptoCajaId ||
            metodoPagoId ||
            estado ||
            (hasTurnoAbierto && !filtroTurnoAbierto),
    )

    const conceptoOptions =
        conceptos?.map((c) => ({
            label: `${c.codigo} · ${c.nombre}`,
            value: c.id,
        })) ?? []

    const metodoOptions =
        metodos?.map((m) => ({
            label: m.nombre,
            value: m.id,
        })) ?? []

    const handlePageChange = (nextPage: number, nextPageSize: number) => {
        setPage(nextPage)
        setPageSize(nextPageSize)
    }

    const resetPage = () => setPage(1)

    const clearFilters = () => {
        setTipoMovimiento(undefined)
        setConceptoCajaId(undefined)
        setMetodoPagoId(undefined)
        setEstado(undefined)
        setFiltroTurnoAbierto(true)
        setPage(1)
    }

    return {
        loading: isFetching,
        caption: `${total} movimiento${total === 1 ? '' : 's'}`,
        turno,
        resumen,
        filters: {
            tipoMovimiento,
            conceptoCajaId,
            metodoPagoId,
            estado,
            filtroTurnoAbierto,
            hasTurnoAbierto,
            conceptoOptions,
            metodoOptions,
            hasActiveFilters,
            onTipoChange: (value: string | undefined) => {
                setTipoMovimiento(value)
                resetPage()
            },
            onConceptoChange: (value: string | undefined) => {
                setConceptoCajaId(value)
                resetPage()
            },
            onMetodoChange: (value: string | undefined) => {
                setMetodoPagoId(value)
                resetPage()
            },
            onEstadoChange: (value: string | undefined) => {
                setEstado(value)
                resetPage()
            },
            onTurnoAbiertoChange: (value: boolean) => {
                setFiltroTurnoAbierto(value)
                resetPage()
            },
            onClearFilters: clearFilters,
        },
        table: {
            items,
            total,
            page,
            pageSize,
            onPageChange: handlePageChange,
        },
    }
}
