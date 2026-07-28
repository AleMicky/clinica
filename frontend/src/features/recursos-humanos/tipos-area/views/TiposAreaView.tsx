import {
    CrudCreateHeader,
    CrudSearchFiltersBar,
    CrudSectionPanel,
} from '../../../../shared/components/ui/crud-section'
import { TipoAreaFormDrawer } from '../components/TipoAreaFormDrawer'
import { TiposAreaTable } from '../components/TiposAreaTable'
import { useTiposAreaView } from '../hooks/use-tipos-area-view'

export function TiposAreaView() {
    const { loading, caption, filters, table, formDrawer } = useTiposAreaView()

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
                        ariaLabel="Filtros de tipos de área"
                        searchAriaLabel="Buscar tipo de área"
                    />
                }
                actions={
                    <CrudCreateHeader
                        label="Nuevo tipo de área"
                        ariaLabel="Crear nuevo tipo de área"
                        onCreate={formDrawer.openCreate}
                    />
                }
                caption={caption}
            >
                <TiposAreaTable
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

            <TipoAreaFormDrawer
                open={formDrawer.open}
                entity={formDrawer.entity}
                loading={formDrawer.isSaving}
                onClose={formDrawer.closeDrawer}
                onSubmit={formDrawer.handleSubmit}
            />
        </>
    )
}
