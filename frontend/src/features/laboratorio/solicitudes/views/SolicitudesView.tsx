import { useState } from 'react'
import { Select } from 'antd'
import { useNavigate } from '@tanstack/react-router'

import {
    CrudCreateHeader,
    CrudSearchFiltersBar,
    CrudSectionPanel,
} from '../../../../shared/components/ui/crud-section'
import { useCrudModalState } from '../../../../shared/hooks/use-crud-modal-state'
import { formatRegistrosCaption } from '../../../../shared/utils/crud-search'
import { usePagedSearchFilters } from '../../../../shared/hooks/use-paged-search-filters'
import { SolicitudFormDrawer } from '../components/SolicitudFormDrawer'
import { SolicitudesTable } from '../components/SolicitudesTable'
import {
    useCreateSolicitud,
    useDeleteSolicitud,
    useSolicitudes,
    useUpdateSolicitud,
} from '../hooks/solicitudes.hooks'
import type {
    CreateSolicitudPayload,
    Solicitud,
    UpdateSolicitudPayload,
} from '../types/solicitud.types'
import { SOLICITUD_ESTADO_LABELS, SOLICITUD_ORIGEN_OPTIONS } from '../types/solicitud.types'
import type { SolicitudFormValues } from '../schemas/solicitud.schema'

const ESTADO_OPTIONS = Object.entries(SOLICITUD_ESTADO_LABELS).map(([value, label]) => ({
    value,
    label,
}))

function toLineas(values: SolicitudFormValues) {
    return values.lineas.map((linea) => ({
        pruebaId: linea.pruebaId,
        cantidad: linea.cantidad,
        observaciones: linea.observaciones,
    }))
}

function toCreatePayload(values: SolicitudFormValues): CreateSolicitudPayload {
    return {
        pacienteId: values.pacienteId,
        origen: values.origen,
        atencionId: values.atencionId,
        medicoSolicitanteId: values.medicoSolicitanteId,
        medicoExternoNombre: values.medicoExternoNombre,
        observaciones: values.observaciones,
        empleadoId: values.empleadoId,
        lineas: toLineas(values),
    }
}

function toUpdatePayload(values: SolicitudFormValues): UpdateSolicitudPayload {
    return {
        pacienteId: values.pacienteId,
        origen: values.origen,
        atencionId: values.atencionId,
        medicoSolicitanteId: values.medicoSolicitanteId,
        medicoExternoNombre: values.medicoExternoNombre,
        observaciones: values.observaciones,
        lineas: toLineas(values),
    }
}

export function SolicitudesView() {
    const navigate = useNavigate()
    const filters = usePagedSearchFilters()
    const modal = useCrudModalState<Solicitud>()
    const [estado, setEstado] = useState<string | undefined>(undefined)
    const [origen, setOrigen] = useState<string | undefined>(undefined)

    const { data, isFetching } = useSolicitudes({
        page: filters.page,
        pageSize: filters.pageSize,
        estado,
        origen,
    })
    const createSolicitud = useCreateSolicitud()
    const updateSolicitud = useUpdateSolicitud()
    const deleteSolicitud = useDeleteSolicitud()

    const items = data?.items ?? []
    const filteredItems = filters.search
        ? items.filter((item) =>
              item.numero.toLowerCase().includes(filters.search.toLowerCase()),
          )
        : items
    const total = filters.search ? filteredItems.length : (data?.totalRecords ?? 0)
    const isSaving = createSolicitud.isPending || updateSolicitud.isPending

    const handleSubmit = async (values: SolicitudFormValues) => {
        if (modal.editing) {
            await updateSolicitud.mutateAsync({
                id: modal.editing.id,
                data: toUpdatePayload(values),
            })
            modal.close()
            return
        }

        const created = await createSolicitud.mutateAsync(toCreatePayload(values))
        modal.close()
        void navigate({
            to: '/laboratorio/solicitudes/$id',
            params: { id: created.id },
        })
    }

    const handleDelete = async (item: Solicitud) => {
        modal.setDeletingId(item.id)
        try {
            await deleteSolicitud.mutateAsync(item.id)
        } finally {
            modal.setDeletingId(null)
        }
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
                        onCreate={modal.openCreate}
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
                    onEdit={modal.openEdit}
                    onDelete={handleDelete}
                    deletingId={modal.deletingId}
                />
            </CrudSectionPanel>

            <SolicitudFormDrawer
                open={modal.open}
                entity={modal.editing}
                loading={isSaving}
                onClose={() => modal.close(isSaving)}
                onSubmit={handleSubmit}
            />
        </>
    )
}
