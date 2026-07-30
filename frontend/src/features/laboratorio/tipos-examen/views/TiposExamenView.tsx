import {
    CrudCreateHeader,
    CrudSearchFiltersBar,
    CrudSectionPanel,
} from '../../../../shared/components/ui/crud-section'
import { TipoExamenFormDrawer } from '../components/TipoExamenFormDrawer'
import { TiposExamenTable } from '../components/TiposExamenTable'
import { useTiposExamenView } from '../hooks/use-tipos-examen-view'

export function TiposExamenView() {
    const { loading, caption, filters, table, formDrawer } = useTiposExamenView()

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
                        ariaLabel="Filtros de tipos de examen"
                        searchAriaLabel="Buscar tipo de examen"
                    />
                }
                actions={
                    <CrudCreateHeader
                        label="Nuevo tipo de examen"
                        ariaLabel="Crear nuevo tipo de examen"
                        onCreate={formDrawer.openCreate}
                    />
                }
                caption={caption}
            >
                <TiposExamenTable
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

            <TipoExamenFormDrawer
                open={formDrawer.open}
                entity={formDrawer.entity}
                loading={formDrawer.isSaving}
                onClose={formDrawer.closeDrawer}
                onSubmit={formDrawer.handleSubmit}
            />
        </>
    )
}
