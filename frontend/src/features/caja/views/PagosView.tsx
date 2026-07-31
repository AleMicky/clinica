import { AnularPagoDrawer } from '../components/AnularPagoDrawer'
import { PagoDetailDrawer } from '../components/PagoDetailDrawer'
import { PagosFiltersBar } from '../components/PagosFiltersBar'
import { PagosTable } from '../components/PagosTable'
import { usePagosView } from '../hooks/use-pagos-view'

export function PagosView() {
    const { loading, caption, filters, table, detailDrawer, anularDrawer } = usePagosView()

    return (
        <>
            <div className="rrhh-section-panel rrhh-empleados">
                <div className="rrhh-section-panel__filters">
                    <PagosFiltersBar
                        searchInput={filters.searchInput}
                        estadoFilter={filters.estadoFilter}
                        hasActiveFilters={filters.hasActiveFilters}
                        onSearchInputChange={filters.onSearchInputChange}
                        onSearch={filters.onSearch}
                        onEstadoFilterChange={filters.setEstadoFilter}
                        onClearFilters={filters.onClearFilters}
                    />
                </div>
                <div className="rrhh-section-panel__body">
                    <p className="rrhh-section-panel__caption rrhh-empleados__caption">
                        {caption}
                    </p>
                    <PagosTable
                        items={table.items}
                        loading={loading}
                        total={table.total}
                        page={table.page}
                        pageSize={table.pageSize}
                        onPageChange={table.onPageChange}
                        onOpen={table.onOpen}
                        onAnular={table.onAnular}
                        onRecibo={table.onRecibo}
                        anulatingId={table.anulatingId}
                    />
                </div>
            </div>

            <PagoDetailDrawer
                open={detailDrawer.open}
                pago={detailDrawer.pago}
                loading={detailDrawer.loading}
                onClose={detailDrawer.onClose}
                onAnular={detailDrawer.onAnular}
            />

            <AnularPagoDrawer
                open={anularDrawer.open}
                pago={anularDrawer.pago}
                loading={anularDrawer.loading}
                onClose={anularDrawer.onClose}
                onSubmit={anularDrawer.onSubmit}
            />
        </>
    )
}
