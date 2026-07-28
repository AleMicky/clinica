import {
    CrudCreateHeader,
    CrudSearchFiltersBar,
    CrudSectionPanel,
} from '../../../../shared/components/ui/crud-section'
import { UnidadMedidaFormDrawer } from '../components/UnidadMedidaFormDrawer'
import { UnidadesMedidaTable } from '../components/UnidadesMedidaTable'
import { useUnidadesMedidaView } from '../hooks/use-unidades-medida-view'

export function UnidadesMedidaView() {
    const { loading, caption, filters, table, formDrawer } = useUnidadesMedidaView()

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
                        ariaLabel="Filtros de unidades de medida"
                        searchAriaLabel="Buscar unidad de medida"
                        placeholder="Buscar por código, nombre o símbolo…"
                    />
                }
                actions={
                    <CrudCreateHeader
                        label="Nueva unidad"
                        ariaLabel="Crear nueva unidad de medida"
                        onCreate={formDrawer.openCreate}
                    />
                }
                caption={caption}
            >
                <UnidadesMedidaTable
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

            <UnidadMedidaFormDrawer
                open={formDrawer.open}
                entity={formDrawer.entity}
                loading={formDrawer.isSaving}
                onClose={formDrawer.closeDrawer}
                onSubmit={formDrawer.handleSubmit}
            />
        </>
    )
}
