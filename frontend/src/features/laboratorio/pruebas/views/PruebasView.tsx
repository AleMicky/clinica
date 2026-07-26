import {
    CrudCreateHeader,
    CrudSearchFiltersBar,
    CrudSectionPanel,
} from '../../../../shared/components/ui/crud-section'
import { PruebaFormModal } from '../components/PruebaFormModal'
import { PruebaPreciosDrawer } from '../components/PruebaPreciosDrawer'
import { PruebasTable } from '../components/PruebasTable'
import { usePruebaPreciosDrawer } from '../hooks/use-prueba-precios-drawer'
import { usePruebasView } from '../hooks/use-pruebas-view'

export function PruebasView() {
    const { loading, caption, filters, table, formModal } = usePruebasView()
    const precios = usePruebaPreciosDrawer()

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
                    onManagePrecios={precios.openDrawer}
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

            <PruebaPreciosDrawer
                open={precios.open}
                prueba={precios.prueba}
                loading={precios.loading}
                items={precios.items}
                onClose={precios.closeDrawer}
                onCreate={precios.formModal.openCreateModal}
                onEdit={precios.table.onEdit}
                onDelete={precios.table.onDelete}
                deletingId={precios.table.deletingId}
                formModal={{
                    open: precios.formModal.open,
                    entity: precios.formModal.entity,
                    isSaving: precios.formModal.isSaving,
                    onClose: precios.formModal.closeModal,
                    onSubmit: precios.formModal.handleSubmit,
                }}
            />
        </>
    )
}
