import { AbrirTurnoDrawer } from '../components/AbrirTurnoDrawer'
import { CerrarTurnoDrawer } from '../components/CerrarTurnoDrawer'
import { TurnosFiltersBar } from '../components/TurnosFiltersBar'
import { TurnosHeader } from '../components/TurnosHeader'
import { TurnosTable } from '../components/TurnosTable'
import { useTurnosCajaView } from '../hooks/use-turnos-caja-view'

export function TurnosCajaView() {
    const { loading, caption, cajaOptions, filters, table, abrirDrawer, cerrarDrawer } =
        useTurnosCajaView()

    return (
        <>
            <div className="rrhh-section-panel rrhh-empleados">
                <div className="rrhh-section-panel__filters">
                    <TurnosFiltersBar
                        cajaId={filters.cajaId}
                        estado={filters.estado}
                        cajaOptions={cajaOptions}
                        hasActiveFilters={filters.hasActiveFilters}
                        onCajaFilterChange={filters.onCajaFilterChange}
                        onEstadoFilterChange={filters.onEstadoFilterChange}
                        onClearFilters={filters.onClearFilters}
                    />
                    <TurnosHeader onAbrir={table.onAbrir} />
                </div>
                <div className="rrhh-section-panel__body">
                    <p className="rrhh-section-panel__caption rrhh-empleados__caption">
                        {caption}
                    </p>
                    <TurnosTable
                        turnos={table.turnos}
                        loading={loading}
                        total={table.total}
                        page={table.page}
                        pageSize={table.pageSize}
                        onPageChange={table.onPageChange}
                        onCerrar={table.onCerrar}
                        onAbrir={table.onAbrir}
                        hasActiveFilters={filters.hasActiveFilters}
                        className="rrhh-empleados__table"
                    />
                </div>
            </div>

            <AbrirTurnoDrawer
                open={abrirDrawer.open}
                loading={abrirDrawer.loading}
                cajaOptions={abrirDrawer.cajaOptions}
                onClose={abrirDrawer.onClose}
                onSubmit={abrirDrawer.onSubmit}
            />

            <CerrarTurnoDrawer
                open={cerrarDrawer.open}
                turno={cerrarDrawer.turno}
                resumen={cerrarDrawer.resumen}
                loading={cerrarDrawer.loading}
                onClose={cerrarDrawer.onClose}
                onSubmit={cerrarDrawer.onSubmit}
            />
        </>
    )
}
