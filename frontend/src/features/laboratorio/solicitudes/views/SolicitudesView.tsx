import { useState } from 'react'
import { Button, Flex, Input, Select, theme } from 'antd'
import { ClearOutlined, SearchOutlined } from '@ant-design/icons'
import { useNavigate } from '@tanstack/react-router'

import {
    CrudCreateHeader,
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

const ORIGEN_FILTER_OPTIONS = SOLICITUD_ORIGEN_OPTIONS.map((option) => ({
    value: option.value,
    label:
        option.value === 'PACIENTE'
            ? 'Mostrador'
            : option.value === 'ATENCION_MEDICA'
              ? 'Atención'
              : 'Externo',
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
    const { token } = theme.useToken()
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
    const hasActiveFilters = Boolean(filters.search || estado || origen)
    const total = filters.search ? filteredItems.length : (data?.totalRecords ?? 0)
    const isSaving = createSolicitud.isPending || updateSolicitud.isPending

    const clearAllFilters = () => {
        filters.clearFilters()
        setEstado(undefined)
        setOrigen(undefined)
    }

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
                className="rrhh-empleados"
                filters={
                    <Flex
                        gap={6}
                        wrap="wrap"
                        align="center"
                        className="rrhh-empleados__filters"
                        role="search"
                        aria-label="Filtros de solicitudes"
                    >
                        <Input
                            allowClear
                            size="small"
                            className="rrhh-empleados__filter-search"
                            prefix={
                                <SearchOutlined
                                    style={{ color: token.colorTextQuaternary }}
                                />
                            }
                            placeholder="Buscar por número…"
                            value={filters.searchInput}
                            onChange={(event) =>
                                filters.handleSearchInputChange(event.target.value)
                            }
                            onPressEnter={() => filters.handleSearch(filters.searchInput)}
                            onClear={() => {
                                filters.handleSearchInputChange('')
                                filters.handleSearch('')
                            }}
                            aria-label="Buscar solicitud"
                        />
                        <Select
                            allowClear
                            size="small"
                            placeholder="Estado"
                            options={ESTADO_OPTIONS}
                            value={estado}
                            onChange={(value) => {
                                setEstado(value ?? undefined)
                                filters.handlePageChange(1, filters.pageSize)
                            }}
                            className="rrhh-empleados__filter-select"
                            aria-label="Filtrar por estado"
                        />
                        <Select
                            allowClear
                            size="small"
                            placeholder="Origen"
                            options={ORIGEN_FILTER_OPTIONS}
                            value={origen}
                            onChange={(value) => {
                                setOrigen(value ?? undefined)
                                filters.handlePageChange(1, filters.pageSize)
                            }}
                            className="rrhh-empleados__filter-select"
                            aria-label="Filtrar por origen"
                        />
                        {hasActiveFilters ? (
                            <Button
                                type="text"
                                size="small"
                                icon={<ClearOutlined />}
                                onClick={clearAllFilters}
                                className="rrhh-empleados__filter-clear"
                                aria-label="Limpiar filtros"
                            >
                                Limpiar
                            </Button>
                        ) : null}
                    </Flex>
                }
                actions={
                    <CrudCreateHeader
                        label="Nueva solicitud"
                        ariaLabel="Crear nueva solicitud de laboratorio"
                        onCreate={modal.openCreate}
                    />
                }
                caption={formatRegistrosCaption(total, hasActiveFilters)}
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
                    onCreate={modal.openCreate}
                    deletingId={modal.deletingId}
                    hasActiveFilters={hasActiveFilters}
                    className="rrhh-empleados__table"
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
