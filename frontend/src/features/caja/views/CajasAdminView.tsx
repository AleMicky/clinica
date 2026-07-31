import { CajaFormDrawer } from '../components/CajaFormDrawer'
import { CajasFiltersBar } from '../components/CajasFiltersBar'
import { CajasHeader } from '../components/CajasHeader'
import { CajasTable } from '../components/CajasTable'
import { useCajasView } from '../hooks/use-cajas-view'

export function CajasAdminView() {
    const { loading, caption, filters, table, formDrawer } = useCajasView()

    return (
        <>
            <div className="rrhh-section-panel rrhh-empleados">
                <div className="rrhh-section-panel__filters">
                    <CajasFiltersBar
                        searchInput={filters.searchInput}
                        activoFilter={filters.activoFilter}
                        hasActiveFilters={filters.hasActiveFilters}
                        onSearchInputChange={filters.onSearchInputChange}
                        onSearch={filters.onSearch}
                        onActivoFilterChange={filters.onActivoFilterChange}
                        onClearFilters={filters.onClearFilters}
                    />
                    <CajasHeader onCreate={formDrawer.openCreate} />
                </div>
                <div className="rrhh-section-panel__body">
                    <p className="rrhh-section-panel__caption rrhh-empleados__caption">
                        {caption}
                    </p>
                    <CajasTable
                        cajas={table.cajas}
                        loading={loading}
                        total={table.total}
                        page={table.page}
                        pageSize={table.pageSize}
                        onPageChange={table.onPageChange}
                        onEdit={table.onEdit}
                        onDelete={table.onDelete}
                        onCreate={formDrawer.openCreate}
                        deletingId={table.deletingId}
                        hasActiveFilters={filters.hasActiveFilters}
                        className="rrhh-empleados__table"
                    />
                </div>
            </div>

            <CajaFormDrawer
                open={formDrawer.open}
                entity={formDrawer.entity}
                loading={formDrawer.isSaving}
                onClose={formDrawer.closeDrawer}
                onSubmit={formDrawer.handleSubmit}
            />
        </>
    )
}
