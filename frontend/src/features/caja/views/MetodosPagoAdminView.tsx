import { MetodoPagoFormDrawer } from '../components/MetodoPagoFormDrawer'
import { MetodosPagoFiltersBar } from '../components/MetodosPagoFiltersBar'
import { MetodosPagoHeader } from '../components/MetodosPagoHeader'
import { MetodosPagoTable } from '../components/MetodosPagoTable'
import { useMetodosPagoView } from '../hooks/use-metodos-pago-view'

export function MetodosPagoAdminView() {
    const { loading, caption, filters, table, formDrawer } = useMetodosPagoView()

    return (
        <>
            <div className="rrhh-section-panel rrhh-empleados">
                <div className="rrhh-section-panel__filters">
                    <MetodosPagoFiltersBar
                        searchInput={filters.searchInput}
                        hasActiveFilters={filters.hasActiveFilters}
                        onSearchInputChange={filters.onSearchInputChange}
                        onSearch={filters.onSearch}
                        onClearFilters={filters.onClearFilters}
                    />
                    <MetodosPagoHeader onCreate={formDrawer.openCreate} />
                </div>
                <div className="rrhh-section-panel__body">
                    <p className="rrhh-section-panel__caption rrhh-empleados__caption">
                        {caption}
                    </p>
                    <MetodosPagoTable
                        metodos={table.metodos}
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

            <MetodoPagoFormDrawer
                open={formDrawer.open}
                entity={formDrawer.entity}
                loading={formDrawer.isSaving}
                onClose={formDrawer.closeDrawer}
                onSubmit={formDrawer.handleSubmit}
            />
        </>
    )
}
