import { useState } from 'react'
import { Select } from 'antd'
import { useNavigate } from '@tanstack/react-router'

import {
    CrudCreateHeader,
    CrudSearchFiltersBar,
    CrudSectionPanel,
} from '../../../../shared/components/ui/crud-section'
import { formatRegistrosCaption } from '../../../../shared/utils/crud-search'
import { usePagedSearchFilters } from '../../../../shared/hooks/use-paged-search-filters'
import { SolicitudFormModal } from '../components/SolicitudFormModal'
import { SolicitudesTable } from '../components/SolicitudesTable'
import { useCreateSolicitud, useSolicitudes } from '../hooks/solicitudes.hooks'
import type { CreateSolicitudPayload } from '../types/solicitud.types'
import { SOLICITUD_ESTADO_LABELS, SOLICITUD_ORIGEN_OPTIONS } from '../types/solicitud.types'
import type { SolicitudFormValues } from '../schemas/solicitud.schema'

const ESTADO_OPTIONS = Object.entries(SOLICITUD_ESTADO_LABELS).map(([value, label]) => ({
    value,
    label,
}))

function toCreatePayload(values: SolicitudFormValues): CreateSolicitudPayload {
    return {
        pacienteId: values.pacienteId,
        origen: values.origen,
        atencionId: values.atencionId,
        medicoSolicitanteId: values.medicoSolicitanteId,
        medicoExternoNombre: values.medicoExternoNombre,
        observaciones: values.observaciones,
        empleadoId: values.empleadoId,
        lineas: values.lineas.map((linea) => ({
            pruebaId: linea.pruebaId,
            cantidad: linea.cantidad,
            observaciones: linea.observaciones,
        })),
    }
}

export function SolicitudesView() {
    const navigate = useNavigate()
    const filters = usePagedSearchFilters()
    const [estado, setEstado] = useState<string | undefined>(undefined)
    const [origen, setOrigen] = useState<string | undefined>(undefined)
    const [modalOpen, setModalOpen] = useState(false)

    const { data, isFetching } = useSolicitudes({
        page: filters.page,
        pageSize: filters.pageSize,
        estado,
        origen,
    })
    const createSolicitud = useCreateSolicitud()

    const items = data?.items ?? []
    const filteredItems = filters.search
        ? items.filter((item) =>
              item.numero.toLowerCase().includes(filters.search.toLowerCase()),
          )
        : items
    const total = filters.search ? filteredItems.length : (data?.totalRecords ?? 0)

    const handleCreate = async (values: SolicitudFormValues) => {
        const created = await createSolicitud.mutateAsync(toCreatePayload(values))
        setModalOpen(false)
        void navigate({
            to: '/laboratorio/solicitudes/$id',
            params: { id: created.id },
        })
    }

    return (
        <>
            <CrudSectionPanel
                className="laboratorio-solicitudes"
                filters={
                    <>
                        <CrudSearchFiltersBar
                            searchInput={filters.searchInput}
                            hasActiveFilters={filters.hasActiveFilters}
                            onSearchInputChange={filters.handleSearchInputChange}
                            onSearch={filters.handleSearch}
                            onClearFilters={filters.clearFilters}
                            ariaLabel="Filtros de solicitudes"
                            searchAriaLabel="Buscar solicitud"
                            placeholder="Buscar por número…"
                        />
                        <Select
                            allowClear
                            size="small"
                            style={{ minWidth: 180 }}
                            placeholder="Filtrar por estado"
                            options={ESTADO_OPTIONS}
                            value={estado}
                            onChange={(value) => setEstado(value ?? undefined)}
                            aria-label="Filtrar por estado"
                        />
                        <Select
                            allowClear
                            size="small"
                            style={{ minWidth: 180 }}
                            placeholder="Filtrar por origen"
                            options={SOLICITUD_ORIGEN_OPTIONS}
                            value={origen}
                            onChange={(value) => setOrigen(value ?? undefined)}
                            aria-label="Filtrar por origen"
                        />
                    </>
                }
                actions={
                    <CrudCreateHeader
                        label="Nueva solicitud"
                        ariaLabel="Crear nueva solicitud de laboratorio"
                        onCreate={() => setModalOpen(true)}
                    />
                }
                caption={formatRegistrosCaption(total, Boolean(filters.search || estado || origen))}
            >
                <SolicitudesTable
                    solicitudes={filteredItems}
                    loading={isFetching}
                    total={total}
                    page={filters.page}
                    pageSize={filters.pageSize}
                    onPageChange={filters.handlePageChange}
                />
            </CrudSectionPanel>

            <SolicitudFormModal
                open={modalOpen}
                loading={createSolicitud.isPending}
                onClose={() => setModalOpen(false)}
                onSubmit={handleCreate}
            />
        </>
    )
}
