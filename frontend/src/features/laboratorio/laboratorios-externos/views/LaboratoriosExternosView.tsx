import {
    CrudCreateHeader,
    CrudSearchFiltersBar,
    CrudSectionPanel,
} from '../../../../shared/components/ui/crud-section'
import { LaboratorioExternoFormModal } from '../components/LaboratorioExternoFormModal'
import { LaboratoriosExternosTable } from '../components/LaboratoriosExternosTable'
import { useLaboratoriosExternosView } from '../hooks/use-laboratorios-externos-view'

export function LaboratoriosExternosView() {
    const { loading, caption, filters, table, formModal } = useLaboratoriosExternosView()

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
                        ariaLabel="Filtros de laboratorios externos"
                        searchAriaLabel="Buscar laboratorio externo"
                    />
                }
                actions={
                    <CrudCreateHeader
                        label="Nuevo laboratorio externo"
                        ariaLabel="Crear nuevo laboratorio externo"
                        onCreate={formModal.openCreateModal}
                    />
                }
                caption={caption}
            >
                <LaboratoriosExternosTable
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

            <LaboratorioExternoFormModal
                open={formModal.open}
                entity={formModal.entity}
                loading={formModal.isSaving}
                onClose={formModal.closeModal}
                onSubmit={formModal.handleSubmit}
            />
        </>
    )
}
