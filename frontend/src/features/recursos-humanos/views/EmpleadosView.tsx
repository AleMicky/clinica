import { useEffect, useRef, useState } from 'react'
import { Button, Flex, Input, Select, theme } from 'antd'
import { ClearOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons'

import {
    useAreaDepartamentos,
    useAreas,
} from '../../catalogo-clinico/hooks/catalogo-clinico.hooks'
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

const DEFAULT_PAGE_SIZE = 20
const LOOKUP_QUERY = { page: 1, pageSize: 200 }
const SEARCH_DEBOUNCE_MS = 400

export function EmpleadosView() {
    const { token } = theme.useToken()
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
    const [search, setSearch] = useState('')
    const [searchInput, setSearchInput] = useState('')
    const [areaFilter, setAreaFilter] = useState<string | undefined>()
    const [departamentoFilter, setDepartamentoFilter] = useState<string | undefined>()
    const [modalOpen, setModalOpen] = useState(false)
    const [editingEmpleado, setEditingEmpleado] = useState<Empleado | null>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null)

    const onSearchRef = useRef((value: string) => {
        setSearch(value.trim())
        setPage(1)
    })

    useEffect(() => {
        onSearchRef.current = (value: string) => {
            setSearch(value.trim())
            setPage(1)
        }
    })

    useEffect(() => {
        const timer = window.setTimeout(() => {
            onSearchRef.current(searchInput.trim())
        }, SEARCH_DEBOUNCE_MS)

        return () => window.clearTimeout(timer)
    }, [searchInput])

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

    const caption = `${totalEmpleados} registrado${totalEmpleados === 1 ? '' : 's'}${
        hasActiveFilters ? ' · filtros activos' : ''
    }`

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

    const handleAreaFilterChange = (value: string | undefined) => {
        setAreaFilter(value)
        setDepartamentoFilter(undefined)
        setPage(1)
    }

    const handlePageChange = (nextPage: number, nextPageSize: number) => {
        setPage(nextPage)
        setPageSize(nextPageSize)
    }

    const clearFilters = () => {
        setSearchInput('')
        setSearch('')
        setAreaFilter(undefined)
        setDepartamentoFilter(undefined)
        setPage(1)
    }

    return (
        <>
            <div className="rrhh-section-panel rrhh-empleados">
                <div className="rrhh-section-panel__filters">
                    <Flex
                        gap={6}
                        wrap="wrap"
                        align="center"
                        className="rrhh-empleados__filters"
                        role="search"
                        aria-label="Filtros de empleados"
                    >
                        <Input
                            allowClear
                            size="small"
                            className="rrhh-empleados__filter-search"
                            prefix={
                                <SearchOutlined style={{ color: token.colorTextQuaternary }} />
                            }
                            placeholder="Buscar por nombre o código…"
                            value={searchInput}
                            onChange={(event) => setSearchInput(event.target.value)}
                            onPressEnter={() => {
                                setSearch(searchInput.trim())
                                setPage(1)
                            }}
                            onClear={() => {
                                setSearchInput('')
                                setSearch('')
                                setPage(1)
                            }}
                            aria-label="Buscar empleado"
                        />
                        <Select
                            allowClear
                            size="small"
                            placeholder="Área"
                            options={areaOptions}
                            value={areaFilter}
                            onChange={handleAreaFilterChange}
                            className="rrhh-empleados__filter-select"
                            aria-label="Filtrar por área"
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
                            className="rrhh-empleados__filter-select"
                            aria-label="Filtrar por departamento"
                        />
                        {hasActiveFilters ? (
                            <Button
                                type="text"
                                size="small"
                                icon={<ClearOutlined />}
                                onClick={clearFilters}
                                className="rrhh-empleados__filter-clear"
                                aria-label="Limpiar filtros"
                            >
                                Limpiar
                            </Button>
                        ) : null}
                    </Flex>
                    <Flex gap={6} wrap="wrap" align="center" className="rrhh-section-panel__actions">
                        <Button
                            type="primary"
                            size="small"
                            icon={<PlusOutlined />}
                            onClick={openCreateModal}
                            aria-label="Crear nuevo empleado"
                        >
                            Nuevo empleado
                        </Button>
                    </Flex>
                </div>
                <div className="rrhh-section-panel__body">
                    <p className="rrhh-section-panel__caption rrhh-empleados__caption">
                        {caption}
                    </p>
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
                        className="rrhh-empleados__table"
                    />
                </div>
            </div>

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
