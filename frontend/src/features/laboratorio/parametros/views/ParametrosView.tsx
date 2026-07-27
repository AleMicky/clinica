import { Select } from 'antd'

import {
    CrudCreateHeader,
    CrudSearchFiltersBar,
    CrudSectionPanel,
} from '../../../../shared/components/ui/crud-section'
import { ParametroFormModal } from '../components/ParametroFormModal'
import { ParametrosTable } from '../components/ParametrosTable'
import { useParametrosView } from '../hooks/use-parametros-view'

export function ParametrosView() {
    const { loading, caption, filters, table, formModal } = useParametrosView()

    return (
        <>
            <CrudSectionPanel
                filters={
                    <>
                        <CrudSearchFiltersBar
                            searchInput={filters.searchInput}
                            hasActiveFilters={filters.hasActiveFilters}
                            onSearchInputChange={filters.onSearchInputChange}
                            onSearch={filters.onSearch}
                            onClearFilters={filters.onClearFilters}
                            ariaLabel="Filtros de parámetros"
                            searchAriaLabel="Buscar parámetro"
                        />
                        <Select
                            allowClear
                            showSearch
                            size="small"
                            style={{ minWidth: 220 }}
                            placeholder="Filtrar por prueba"
                            optionFilterProp="label"
                            options={filters.pruebaOptions}
                            value={filters.pruebaId}
                            onChange={(value) => filters.onFilterPrueba(value ?? undefined)}
                            aria-label="Filtrar por prueba"
                        />
                    </>
                }
                actions={
                    <CrudCreateHeader
                        label="Nuevo parámetro"
                        ariaLabel="Crear nuevo parámetro"
                        onCreate={formModal.openCreateModal}
                    />
                }
                caption={caption}
            >
                <ParametrosTable
                    items={table.items}
                    loading={loading}
                    total={table.total}
                    page={table.page}
                    pageSize={table.pageSize}
                    onPageChange={table.onPageChange}
                    onEdit={table.onEdit}
                    onDelete={table.onDelete}
                    deletingId={table.deletingId}
                    className="rrhh-empleados__table"
                />
            </CrudSectionPanel>

            <ParametroFormModal
                open={formModal.open}
                entity={formModal.entity}
                loading={formModal.isSaving}
                initialPruebaId={formModal.initialPruebaId}
                onClose={formModal.closeModal}
                onSubmit={formModal.handleSubmit}
            />
        </>
    )
}
