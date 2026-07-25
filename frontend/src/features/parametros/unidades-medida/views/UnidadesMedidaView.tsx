import { UnidadMedidaFormModal } from '../components/UnidadMedidaFormModal'
import { UnidadesMedidaFiltersBar } from '../components/UnidadesMedidaFiltersBar'
import { UnidadesMedidaHeader } from '../components/UnidadesMedidaHeader'
import { UnidadesMedidaTable } from '../components/UnidadesMedidaTable'
import { useUnidadesMedidaView } from '../hooks/use-unidades-medida-view'

export function UnidadesMedidaView() {
    const { loading, caption, filters, table, formModal } = useUnidadesMedidaView()

    return (
        <>
            <div className="rrhh-section-panel rrhh-empleados">
                <div className="rrhh-section-panel__filters">
                    <UnidadesMedidaFiltersBar
                        searchInput={filters.searchInput}
                        hasActiveFilters={filters.hasActiveFilters}
                        onSearchInputChange={filters.onSearchInputChange}
                        onSearch={filters.onSearch}
                        onClearFilters={filters.onClearFilters}
                    />
                    <UnidadesMedidaHeader onCreate={formModal.openCreateModal} />
                </div>
                <div className="rrhh-section-panel__body">
                    <p className="rrhh-section-panel__caption rrhh-empleados__caption">
                        {caption}
                    </p>
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
                </div>
            </div>

            <UnidadMedidaFormModal
                open={formModal.open}
                entity={formModal.entity}
                loading={formModal.isSaving}
                onClose={formModal.closeModal}
                onSubmit={formModal.handleSubmit}
            />
        </>
    )
}
