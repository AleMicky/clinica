import {
    CodigoNombreDescripcionFormModal,
    CrudCreateHeader,
    CrudSearchFiltersBar,
    CrudSectionPanel,
} from '../../../../shared/components/ui/crud-section'
import { TiposExamenTable } from '../components/TiposExamenTable'
import { useTiposExamenView } from '../hooks/use-tipos-examen-view'

export function TiposExamenView() {
    const { loading, caption, filters, table, formModal } = useTiposExamenView()

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
                        ariaLabel="Filtros de tipos de examen"
                        searchAriaLabel="Buscar tipo de examen"
                    />
                }
                actions={
                    <CrudCreateHeader
                        label="Nuevo tipo de examen"
                        ariaLabel="Crear nuevo tipo de examen"
                        onCreate={formModal.openCreateModal}
                    />
                }
                caption={caption}
            >
                <TiposExamenTable
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

            <CodigoNombreDescripcionFormModal
                open={formModal.open}
                entityLabel="tipo de examen"
                entity={formModal.entity}
                loading={formModal.isSaving}
                onClose={formModal.closeModal}
                onSubmit={formModal.handleSubmit}
                codigoHelp="Identificador único, ej. HEMOGRAMA"
                codigoPlaceholder="Ej. HEMOGRAMA"
                nombrePlaceholder="Hemograma completo"
            />
        </>
    )
}
