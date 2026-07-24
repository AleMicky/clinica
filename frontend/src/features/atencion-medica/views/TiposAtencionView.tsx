import { TipoAtencionFormModal } from '../components/TipoAtencionFormModal'
import { TiposAtencionFiltersBar } from '../components/TiposAtencionFiltersBar'
import { TiposAtencionHeader } from '../components/TiposAtencionHeader'
import { TiposAtencionTable } from '../components/TiposAtencionTable'
import { useTiposAtencionView } from '../hooks/use-tipos-atencion-view'

export function TiposAtencionView() {
    const { loading, caption, filters, table, formModal } = useTiposAtencionView()

    return (
        <>
            <div className="rrhh-section-panel rrhh-tipos-atencion">
                <div className="rrhh-section-panel__filters">
                    <TiposAtencionFiltersBar
                        searchInput={filters.searchInput}
                        onSearchInputChange={filters.onSearchInputChange}
                        onSearch={filters.onSearch}
                    />
                    <TiposAtencionHeader onCreate={formModal.openCreateModal} />
                </div>
                <div className="rrhh-section-panel__body">
                    <p className="rrhh-section-panel__caption rrhh-tipos-atencion__caption">
                        {caption}
                    </p>
                    <TiposAtencionTable
                        items={table.items}
                        loading={loading}
                        total={table.total}
                        page={table.page}
                        pageSize={table.pageSize}
                        onPageChange={table.onPageChange}
                        onEdit={table.onEdit}
                        onDelete={table.onDelete}
                        onManageForms={table.onManageForms}
                        onCreate={table.onCreate}
                        deletingId={table.deletingId}
                        hasActiveFilters={table.hasActiveFilters}
                        className="rrhh-tipos-atencion__table"
                    />
                </div>
            </div>

            <TipoAtencionFormModal
                open={formModal.open}
                entity={formModal.entity}
                loading={formModal.isSaving}
                onClose={formModal.closeModal}
                onSubmit={formModal.handleSubmit}
            />
        </>
    )
}
