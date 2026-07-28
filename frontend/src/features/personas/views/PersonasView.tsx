import {
    CrudSearchFiltersBar,
    CrudSectionPanel,
} from '../../../shared/components/ui/crud-section'
import { PersonaFormDrawer } from '../components/PersonaFormDrawer'
import { PersonasTable } from '../components/PersonasTable'
import { usePersonasView } from '../hooks/use-personas-view'

export function PersonasView() {
    const { loading, caption, filters, table, formDrawer } = usePersonasView()

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
                        ariaLabel="Filtros de personas"
                        searchAriaLabel="Buscar persona"
                        placeholder="Buscar por documento o nombre…"
                    />
                }
                actions={null}
                caption={caption}
            >
                <PersonasTable
                    personas={table.personas}
                    loading={loading}
                    total={table.total}
                    page={table.page}
                    pageSize={table.pageSize}
                    onPageChange={table.onPageChange}
                    onEdit={table.onEdit}
                    className="rrhh-empleados__table"
                />
            </CrudSectionPanel>

            <PersonaFormDrawer
                open={formDrawer.open}
                persona={formDrawer.persona}
                loading={formDrawer.isSaving}
                onClose={formDrawer.closeDrawer}
                onSubmit={formDrawer.handleSubmit}
            />
        </>
    )
}
