import { MedicoFormModal } from '../components/MedicoFormModal'
import { MedicosFiltersBar } from '../components/MedicosFiltersBar'
import { MedicosHeader } from '../components/MedicosHeader'
import { MedicosTable } from '../components/MedicosTable'
import { useMedicosView } from '../hooks/use-medicos-view'

export function MedicosView() {
    const { loading, caption, especialidadOptions, filters, table, formModal } =
        useMedicosView()

    return (
        <>
            <div className="rrhh-section-panel rrhh-medicos">
                <div className="rrhh-section-panel__filters">
                    <MedicosFiltersBar
                        searchInput={filters.searchInput}
                        especialidadFilter={filters.especialidadFilter}
                        especialidadOptions={especialidadOptions}
                        hasActiveFilters={filters.hasActiveFilters}
                        onSearchInputChange={filters.onSearchInputChange}
                        onSearch={filters.onSearch}
                        onEspecialidadFilterChange={filters.onEspecialidadFilterChange}
                        onClearFilters={filters.onClearFilters}
                    />
                    <MedicosHeader onCreate={formModal.openCreateModal} />
                </div>
                <div className="rrhh-section-panel__body">
                    <p className="rrhh-section-panel__caption rrhh-medicos__caption">{caption}</p>
                    <MedicosTable
                        medicos={table.medicos}
                        loading={loading}
                        total={table.total}
                        page={table.page}
                        pageSize={table.pageSize}
                        onPageChange={table.onPageChange}
                        onEdit={table.onEdit}
                        onDelete={table.onDelete}
                        deletingId={table.deletingId}
                        className="rrhh-medicos__table"
                    />
                </div>
            </div>

            <MedicoFormModal
                open={formModal.open}
                medico={formModal.medico}
                loading={formModal.isSaving}
                onClose={formModal.closeModal}
                onSubmit={formModal.handleSubmit}
            />
        </>
    )
}
