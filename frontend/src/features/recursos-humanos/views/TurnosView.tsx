import {
    CrudCreateHeader,
    CrudSearchFiltersBar,
    CrudSectionPanel,
} from '../../../shared/components/ui/crud-section'
import { TurnoFormDrawer } from '../components/TurnoFormDrawer'
import { TurnosTable } from '../components/TurnosTable'
import { useTurnosView } from '../hooks/use-turnos-view'

export function TurnosView() {
    const { loading, caption, filters, table, formDrawer } = useTurnosView()

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
                        ariaLabel="Filtros de turnos"
                        searchAriaLabel="Buscar turno"
                        placeholder="Buscar por código o nombre…"
                    />
                }
                actions={
                    <CrudCreateHeader
                        label="Nuevo turno"
                        ariaLabel="Crear nuevo turno"
                        onCreate={formDrawer.openCreate}
                    />
                }
                caption={caption}
            >
                <TurnosTable
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

            <TurnoFormDrawer
                open={formDrawer.open}
                entity={formDrawer.entity}
                loading={formDrawer.isSaving}
                onClose={formDrawer.closeDrawer}
                onSubmit={formDrawer.handleSubmit}
            />
        </>
    )
}
