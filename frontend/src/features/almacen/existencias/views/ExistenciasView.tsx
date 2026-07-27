import { Table, Tag } from 'antd'
import {
  CrudSearchFiltersBar,
  CrudSectionPanel,
} from '../../../../shared/components/ui/crud-section'
import { useAppQuery } from '../../../../shared/hooks/use-app-query'
import { usePagedSearchFilters } from '../../../../shared/hooks/use-paged-search-filters'
import { queryKeys } from '../../../../shared/constants/query-keys'
import { formatRegistrosCaption } from '../../../../shared/utils/crud-search'
import { existenciasService } from '../services/existencias.service'

export function ExistenciasAlmacenView() {
  const filters = usePagedSearchFilters()
  const { data, isFetching } = useAppQuery({
    queryKey: queryKeys.almacen.existencias.list({
      page: filters.page,
      pageSize: filters.pageSize,
      search: filters.search,
    }),
    queryFn: () =>
      existenciasService.getPaged({
        page: filters.page,
        pageSize: filters.pageSize,
        search: filters.search,
      }),
  })

  return (
    <CrudSectionPanel
      filters={
        <CrudSearchFiltersBar
          searchInput={filters.searchInput}
          hasActiveFilters={filters.hasActiveFilters}
          onSearchInputChange={filters.handleSearchInputChange}
          onSearch={filters.handleSearch}
          onClearFilters={filters.clearFilters}
          ariaLabel="Filtros de existencias"
          searchAriaLabel="Buscar existencia"
          placeholder="Buscar producto o lote…"
        />
      }
      actions={<span />}
      caption={formatRegistrosCaption(data?.totalRecords ?? 0, filters.hasActiveFilters)}
    >
      <Table
        rowKey="id"
        loading={isFetching}
        dataSource={data?.items ?? []}
        pagination={{
          current: filters.page,
          pageSize: filters.pageSize,
          total: data?.totalRecords ?? 0,
          onChange: filters.handlePageChange,
        }}
        columns={[
          { title: 'Producto', dataIndex: 'productoNombre' },
          { title: 'Código', dataIndex: 'productoCodigo' },
          { title: 'Lote', dataIndex: 'loteNumero' },
          { title: 'Vence', dataIndex: 'fechaVencimiento', render: (v) => v ?? '—' },
          { title: 'Cantidad', dataIndex: 'cantidad' },
          {
            title: 'Stock mín.',
            dataIndex: 'bajoMinimo',
            render: (v: boolean) =>
              v ? <Tag color="red">Bajo mínimo</Tag> : <Tag color="green">OK</Tag>,
          },
        ]}
      />
    </CrudSectionPanel>
  )
}
