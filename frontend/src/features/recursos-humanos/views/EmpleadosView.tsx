import { useState } from 'react'
import { Button, Select, Typography } from 'antd'

import {
    useAreaDepartamentos,
    useAreas,
} from '../../catalogo-clinico/hooks/catalogo-clinico.hooks'
import { SeguridadSectionPanel } from '../../seguridad/components/SeguridadSectionPanel'
import { EmpleadoFormModal } from '../components/EmpleadoFormModal'
import { EmpleadosTable } from '../components/EmpleadosTable'
import {
    useCreateEmpleado,
    useDeleteEmpleado,
    useEmpleados,
    useUpdateEmpleado,
} from '../hooks/empleados.hooks'
import {
    toCreateEmpleadoPayload,
    toUpdateEmpleadoPayload,
    type EmpleadoFormValues,
} from '../schemas/empleado.schema'
import type { Empleado } from '../types/empleado.types'

const { Text } = Typography

const DEFAULT_PAGE_SIZE = 20
const LOOKUP_QUERY = { page: 1, pageSize: 200 }

export function EmpleadosView() {
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
    const [search, setSearch] = useState('')
    const [searchInput, setSearchInput] = useState('')
    const [areaFilter, setAreaFilter] = useState<string | undefined>()
    const [departamentoFilter, setDepartamentoFilter] = useState<string | undefined>()
    const [modalOpen, setModalOpen] = useState(false)
    const [editingEmpleado, setEditingEmpleado] = useState<Empleado | null>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null)

    const { data: areasResult } = useAreas(LOOKUP_QUERY)
    const { data: departamentosResult } = useAreaDepartamentos(areaFilter ?? null)

    const { data, isFetching } = useEmpleados({
        page,
        pageSize,
        search: search || undefined,
        areaId: areaFilter,
        departamentoId: departamentoFilter,
    })

    const createEmpleado = useCreateEmpleado()
    const updateEmpleado = useUpdateEmpleado()
    const deleteEmpleado = useDeleteEmpleado()

    const empleados = data?.items ?? []
    const totalEmpleados = data?.totalRecords ?? 0
    const isSaving = createEmpleado.isPending || updateEmpleado.isPending

    const areaOptions =
        areasResult?.items.map((area) => ({
            label: area.nombre,
            value: area.id,
        })) ?? []

    const departamentoOptions = (departamentosResult ?? []).map((departamento) => ({
        label: departamento.nombre,
        value: departamento.id,
    }))

    const hasActiveFilters = Boolean(search || areaFilter || departamentoFilter)

    const openCreateModal = () => {
        setEditingEmpleado(null)
        setModalOpen(true)
    }

    const openEditModal = (empleado: Empleado) => {
        setEditingEmpleado(empleado)
        setModalOpen(true)
    }

    const closeModal = () => {
        if (isSaving) return
        setModalOpen(false)
        setEditingEmpleado(null)
    }

    const handleSubmit = async (values: EmpleadoFormValues) => {
        if (editingEmpleado) {
            await updateEmpleado.mutateAsync({
                id: editingEmpleado.id,
                data: toUpdateEmpleadoPayload(values),
            })
        } else {
            await createEmpleado.mutateAsync(toCreateEmpleadoPayload(values))
        }

        closeModal()
    }

    const handleDelete = async (empleado: Empleado) => {
        setDeletingId(empleado.id)

        try {
            await deleteEmpleado.mutateAsync(empleado.id)
        } finally {
            setDeletingId(null)
        }
    }

    const handleSearch = (value: string) => {
        setSearch(value.trim())
        setPage(1)
    }

    const handleAreaFilterChange = (value: string | undefined) => {
        setAreaFilter(value)
        setDepartamentoFilter(undefined)
        setPage(1)
    }

    const handlePageChange = (nextPage: number, nextPageSize: number) => {
        setPage(nextPage)
        setPageSize(nextPageSize)
    }

    return (
        <>
            <SeguridadSectionPanel
                title="Directorio de empleados"
                caption={
                    <>
                        {totalEmpleados} registrado{totalEmpleados === 1 ? '' : 's'}
                        {hasActiveFilters ? ' · filtros activos' : ''}
                    </>
                }
                searchPlaceholder="Buscar por nombre o código…"
                searchValue={searchInput}
                onSearchChange={setSearchInput}
                onSearch={handleSearch}
                actionLabel="Nuevo empleado"
                onAction={openCreateModal}
            >
                <div className="rrhh-page__filters rrhh-page__filters--embedded">
                    <Select
                        allowClear
                        size="small"
                        placeholder="Área"
                        options={areaOptions}
                        value={areaFilter}
                        onChange={handleAreaFilterChange}
                        className="rrhh-page__filter-select"
                    />
                    <Select
                        allowClear
                        size="small"
                        placeholder="Departamento"
                        options={departamentoOptions}
                        value={departamentoFilter}
                        onChange={(value) => {
                            setDepartamentoFilter(value)
                            setPage(1)
                        }}
                        disabled={!areaFilter}
                        className="rrhh-page__filter-select"
                    />
                    {hasActiveFilters ? (
                        <Button
                            type="link"
                            size="small"
                            onClick={() => {
                                setSearchInput('')
                                setSearch('')
                                setAreaFilter(undefined)
                                setDepartamentoFilter(undefined)
                                setPage(1)
                            }}
                        >
                            Limpiar
                        </Button>
                    ) : (
                        <Text type="secondary" className="rrhh-page__filter-hint">
                            Filtre por estructura organizacional
                        </Text>
                    )}
                </div>

                <EmpleadosTable
                    empleados={empleados}
                    loading={isFetching}
                    total={totalEmpleados}
                    page={page}
                    pageSize={pageSize}
                    onPageChange={handlePageChange}
                    onEdit={openEditModal}
                    onDelete={handleDelete}
                    deletingId={deletingId}
                />
            </SeguridadSectionPanel>

            <EmpleadoFormModal
                open={modalOpen}
                empleado={editingEmpleado}
                loading={isSaving}
                onClose={closeModal}
                onSubmit={handleSubmit}
            />
        </>
    )
}
