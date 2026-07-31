import { AnularPagoDrawer } from '../components/AnularPagoDrawer'
import { PagoDetailDrawer } from '../components/PagoDetailDrawer'
import { PagosFiltersBar } from '../components/PagosFiltersBar'
import { PagosTable } from '../components/PagosTable'
import { ReciboDrawer } from '../components/ReciboDrawer'
import { usePagosView } from '../hooks/use-pagos-view'

export function PagosView() {
    const {
        loading,
        caption,
        turnoAbiertoId,
        filters,
        table,
        detailDrawer,
        reciboDrawer,
        anularDrawer,
    } = usePagosView()

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
                        turnoAbiertoId={turnoAbiertoId}
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
                canAnular={detailDrawer.canAnular}
                onClose={detailDrawer.onClose}
                onAnular={detailDrawer.onAnular}
            />

            <ReciboDrawer
                open={reciboDrawer.open}
                recibo={reciboDrawer.recibo}
                loading={reciboDrawer.loading}
                notFound={reciboDrawer.notFound}
                onClose={reciboDrawer.onClose}
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
