import { useState } from 'react'
import { Alert, Select, Table, Tag } from 'antd'
import dayjs from 'dayjs'
import {
  CrudSectionPanel,
} from '../../../../shared/components/ui/crud-section'
import { useAppQuery } from '../../../../shared/hooks/use-app-query'
import { queryKeys } from '../../../../shared/constants/query-keys'
import { useProductosAlmacen } from '../../productos/hooks/productos.hooks'
import { stockAlmacenService } from '../services/stock.service'

export function StockAlmacenView() {
  const [productoId, setProductoId] = useState<string | undefined>()
  const { data: productos, isFetching: loadingProductos } = useProductosAlmacen({
    page: 1,
    pageSize: 200,
  })
  const { data, isFetching } = useAppQuery({
    queryKey: queryKeys.almacen.stock.disponibilidad(productoId ?? ''),
    queryFn: () => stockAlmacenService.getDisponibilidad(productoId!),
    enabled: !!productoId,
  })

  return (
    <CrudSectionPanel
      filters={
        <Select
          style={{ minWidth: 360 }}
          placeholder="Seleccione un producto"
          showSearch
          optionFilterProp="label"
          loading={loadingProductos}
          value={productoId}
          onChange={setProductoId}
          options={(productos?.items ?? []).map((p) => ({
            value: p.id,
            label: `${p.codigo} — ${p.nombre}`,
          }))}
          aria-label="Producto para consultar stock"
        />
      }
      actions={null}
      caption={
        data
          ? `${data.productoCodigo} — disponible: ${data.cantidadDisponible}`
          : 'Consulte la disponibilidad por producto'
      }
    >
      {!productoId ? (
        <Alert type="info" showIcon message="Seleccione un producto para ver lotes y stock." />
      ) : (
        <>
          {data?.bajoMinimo ? (
            <Alert
              type="warning"
              showIcon
              style={{ marginBottom: 16 }}
              message={`Stock bajo el mínimo (${data.stockMinimo}). Disponible: ${data.cantidadDisponible}`}
            />
          ) : null}
          <Table
            rowKey="loteId"
            loading={isFetching}
            dataSource={data?.lotes ?? []}
            pagination={false}
            columns={[
              { title: 'Lote', dataIndex: 'numero' },
              {
                title: 'Vencimiento',
                dataIndex: 'fechaVencimiento',
                render: (v?: string | null) =>
                  v ? dayjs(v).format('DD/MM/YYYY') : <Tag>Sin fecha</Tag>,
              },
              { title: 'Cantidad', dataIndex: 'cantidad' },
            ]}
          />
        </>
      )}
    </CrudSectionPanel>
  )
}
