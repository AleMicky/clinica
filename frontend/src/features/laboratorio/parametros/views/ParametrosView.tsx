import { Select } from 'antd'

import {
    CrudCreateHeader,
    CrudSearchFiltersBar,
    CrudSectionPanel,
} from '../../../../shared/components/ui/crud-section'
import { ValoresReferenciaDrawer } from '../../valores-referencia/components/ValoresReferenciaDrawer'
import { useValoresReferenciaDrawer } from '../../valores-referencia/hooks/use-valores-referencia-drawer'
import { ParametroFormDrawer } from '../components/ParametroFormDrawer'
import { ParametrosTable } from '../components/ParametrosTable'
import { useParametrosView } from '../hooks/use-parametros-view'

export function ParametrosView() {
    const { loading, caption, filters, table, formDrawer } = useParametrosView()
    const valoresRef = useValoresReferenciaDrawer()

    return (
        <>
            <CrudSectionPanel
                filters={
                    <>
                        <CrudSearchFiltersBar
                            searchInput={filters.searchInput}
                            hasActiveFilters={filters.hasActiveFilters}
                            onSearchInputChange={filters.onSearchInputChange}
                            onSearch={filters.onSearch}
                            onClearFilters={filters.onClearFilters}
                            ariaLabel="Filtros de parámetros"
                            searchAriaLabel="Buscar parámetro"
                        />
                        <Select
                            allowClear
                            showSearch
                            size="small"
                            style={{ minWidth: 220 }}
                            placeholder="Filtrar por prueba"
                            optionFilterProp="label"
                            options={filters.pruebaOptions}
                            value={filters.pruebaId}
                            onChange={(value) => filters.onFilterPrueba(value ?? undefined)}
                            aria-label="Filtrar por prueba"
                        />
                    </>
                }
                actions={
                    <CrudCreateHeader
                        label="Nuevo parámetro"
                        ariaLabel="Crear nuevo parámetro"
                        onCreate={formDrawer.openCreate}
                    />
                }
                caption={caption}
            >
                <ParametrosTable
                    items={table.items}
                    loading={loading}
                    total={table.total}
                    page={table.page}
                    pageSize={table.pageSize}
                    onPageChange={table.onPageChange}
                    onEdit={table.onEdit}
                    onDelete={table.onDelete}
                    onManageValoresRef={valoresRef.openDrawer}
                    deletingId={table.deletingId}
                    className="rrhh-empleados__table"
                />
            </CrudSectionPanel>

            <ParametroFormDrawer
                open={formDrawer.open}
                entity={formDrawer.entity}
                loading={formDrawer.isSaving}
                initialPruebaId={formDrawer.initialPruebaId}
                onClose={formDrawer.closeDrawer}
                onSubmit={formDrawer.handleSubmit}
            />

            <ValoresReferenciaDrawer
                open={valoresRef.open}
                parametro={valoresRef.parametro}
                loading={valoresRef.loading}
                items={valoresRef.items}
                onClose={valoresRef.closeDrawer}
                onCreate={valoresRef.formModal.openCreateModal}
                onEdit={valoresRef.table.onEdit}
                onDelete={valoresRef.table.onDelete}
                deletingId={valoresRef.table.deletingId}
                formModal={{
                    open: valoresRef.formModal.open,
                    entity: valoresRef.formModal.entity,
                    isSaving: valoresRef.formModal.isSaving,
                    onClose: valoresRef.formModal.closeModal,
                    onSubmit: valoresRef.formModal.handleSubmit,
                }}
            />
        </>
    )
}
