import { EmpleadoFormDrawer } from '../components/EmpleadoFormDrawer'
import { EmpleadosFiltersBar } from '../components/EmpleadosFiltersBar'
import { EmpleadosHeader } from '../components/EmpleadosHeader'
import { EmpleadosTable } from '../components/EmpleadosTable'
import { useEmpleadosView } from '../hooks/use-empleados-view'

export function EmpleadosView() {
    const { loading, caption, areaOptions, filters, table, formDrawer } = useEmpleadosView()

    return (
        <>
            <div className="rrhh-section-panel rrhh-empleados">
                <div className="rrhh-section-panel__filters">
                    <EmpleadosFiltersBar
                        searchInput={filters.searchInput}
                        areaFilter={filters.areaFilter}
                        areaOptions={areaOptions}
                        hasActiveFilters={filters.hasActiveFilters}
                        onSearchInputChange={filters.onSearchInputChange}
                        onSearch={filters.onSearch}
                        onAreaFilterChange={filters.onAreaFilterChange}
                        onClearFilters={filters.onClearFilters}
                    />
                    <EmpleadosHeader onCreate={formDrawer.openCreate} />
                </div>
                <div className="rrhh-section-panel__body">
                    <p className="rrhh-section-panel__caption rrhh-empleados__caption">
                        {caption}
                    </p>
                    <EmpleadosTable
                        empleados={table.empleados}
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
                </div>
            </div>

            <EmpleadoFormDrawer
                open={formDrawer.open}
                empleado={formDrawer.empleado}
                loading={formDrawer.isSaving}
                onClose={formDrawer.closeDrawer}
                onSubmit={formDrawer.handleSubmit}
            />
        </>
    )
}
