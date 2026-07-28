import {
    CrudCreateHeader,
    CrudSearchFiltersBar,
    CrudSectionPanel,
} from '../../../../shared/components/ui/crud-section'
import { EspecialidadFormDrawer } from '../components/EspecialidadFormDrawer'
import { EspecialidadesTable } from '../components/EspecialidadesTable'
import { useEspecialidadesLabView } from '../hooks/use-especialidades-view'

export function EspecialidadesView() {
    const { loading, caption, filters, table, formDrawer } = useEspecialidadesLabView()

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
                        ariaLabel="Filtros de especialidades de laboratorio"
                        searchAriaLabel="Buscar especialidad"
                    />
                }
                actions={
                    <CrudCreateHeader
                        label="Nueva especialidad"
                        ariaLabel="Crear nueva especialidad de laboratorio"
                        onCreate={formDrawer.openCreate}
                    />
                }
                caption={caption}
            >
                <EspecialidadesTable
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

            <EspecialidadFormDrawer
                open={formDrawer.open}
                entity={formDrawer.entity}
                loading={formDrawer.isSaving}
                onClose={formDrawer.closeDrawer}
                onSubmit={formDrawer.handleSubmit}
            />
        </>
    )
}
