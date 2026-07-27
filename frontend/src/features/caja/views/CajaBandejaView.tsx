import { Flex, Select } from 'antd'

import {
    CrudSearchFiltersBar,
    CrudSectionPanel,
} from '../../../shared/components/ui/crud-section'
import { CuentasTable } from '../components/CuentasTable'
import { useCajaBandejaView } from '../hooks/use-caja-bandeja-view'

export function CajaBandejaView() {
    const { loading, caption, filters, table } = useCajaBandejaView()

    return (
        <CrudSectionPanel
            filters={
                <Flex gap={8} wrap="wrap" align="center">
                    <CrudSearchFiltersBar
                        searchInput={filters.searchInput}
                        hasActiveFilters={
                            filters.hasActiveFilters ||
                            Boolean(
                                filters.estadoFilter && filters.estadoFilter !== 'ABIERTA',
                            )
                        }
                        onSearchInputChange={filters.onSearchInputChange}
                        onSearch={filters.onSearch}
                        onClearFilters={() => {
                            filters.onClearFilters()
                            filters.setEstadoFilter('ABIERTA')
                        }}
                        ariaLabel="Filtros de cuentas de caja"
                        searchAriaLabel="Buscar por número de cuenta"
                        placeholder="Buscar por número…"
                    />
                    <Select
                        style={{ minWidth: 160 }}
                        value={filters.estadoFilter ?? 'ABIERTA'}
                        onChange={(value) => {
                            filters.setEstadoFilter(value)
                            filters.onPageChange(1, filters.pageSize)
                        }}
                        options={[
                            { value: 'ABIERTA', label: 'Abiertas' },
                            { value: 'PARCIAL', label: 'Parciales' },
                            { value: 'PAGADA', label: 'Pagadas' },
                            { value: 'ANULADA', label: 'Anuladas' },
                            { value: 'TODAS', label: 'Todas' },
                        ]}
                    />
                </Flex>
            }
            actions={null}
            caption={caption}
        >
            <CuentasTable
                items={table.items}
                loading={loading}
                total={table.total}
                page={table.page}
                pageSize={table.pageSize}
                onPageChange={table.onPageChange}
                onOpen={table.onOpen}
                onAnular={table.onAnular}
                deletingId={table.deletingId ?? null}
            />
        </CrudSectionPanel>
    )
}
