import {
    CrudCreateHeader,
    CrudSearchFiltersBar,
    CrudSectionPanel,
} from '../../../../shared/components/ui/crud-section'
import { PruebaFormModal } from '../components/PruebaFormModal'
import { PruebasTable } from '../components/PruebasTable'
import { usePruebasView } from '../hooks/use-pruebas-view'

export function PruebasView() {
    const { loading, caption, filters, table, formModal } = usePruebasView()

    return (
        <>
            <CrudSectionPanel
                filters={
                    <CrudSearchFiltersBar
                        searchInput={filters.searchInput}
                        hasActiveFilters={filters.hasActiveFilters}
                        onSearchInputChange={filters.onSearchInputChange}
                        onSearch={filters.onSearch}
                        onClearFilters={filters.onClearFilters}
                        ariaLabel="Filtros de pruebas de laboratorio"
                        searchAriaLabel="Buscar prueba"
                    />
                }
                actions={
                    <CrudCreateHeader
                        label="Nueva prueba"
                        ariaLabel="Crear nueva prueba de laboratorio"
                        onCreate={formModal.openCreateModal}
                    />
                }
                caption={caption}
            >
                <PruebasTable
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

            <PruebaFormModal
                open={formModal.open}
                entity={formModal.entity}
                loading={formModal.isSaving}
                onClose={formModal.closeModal}
                onSubmit={formModal.handleSubmit}
            />
        </>
    )
}
