import { ConceptoCajaFormDrawer } from '../components/ConceptoCajaFormDrawer'
import { ConceptosCajaFiltersBar } from '../components/ConceptosCajaFiltersBar'
import { ConceptosCajaHeader } from '../components/ConceptosCajaHeader'
import { ConceptosCajaTable } from '../components/ConceptosCajaTable'
import { useConceptosCajaView } from '../hooks/use-conceptos-caja-view'

export function ConceptosCajaAdminView() {
    const { loading, caption, filters, table, formDrawer } = useConceptosCajaView()

    return (
        <>
            <div className="rrhh-section-panel rrhh-empleados">
                <div className="rrhh-section-panel__filters">
                    <ConceptosCajaFiltersBar
                        searchInput={filters.searchInput}
                        activoFilter={filters.activoFilter}
                        tipoFilter={filters.tipoFilter}
                        hasActiveFilters={filters.hasActiveFilters}
                        onSearchInputChange={filters.onSearchInputChange}
                        onSearch={filters.onSearch}
                        onActivoFilterChange={filters.onActivoFilterChange}
                        onTipoFilterChange={filters.onTipoFilterChange}
                        onClearFilters={filters.onClearFilters}
                    />
                    <ConceptosCajaHeader onCreate={formDrawer.openCreate} />
                </div>
                <div className="rrhh-section-panel__body">
                    <p className="rrhh-section-panel__caption rrhh-empleados__caption">
                        {caption}
                    </p>
                    <ConceptosCajaTable
                        conceptos={table.conceptos}
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

            <ConceptoCajaFormDrawer
                open={formDrawer.open}
                entity={formDrawer.entity}
                loading={formDrawer.isSaving}
                onClose={formDrawer.closeDrawer}
                onSubmit={formDrawer.handleSubmit}
            />
        </>
    )
}
