import { useState } from 'react'
import { Button, Form, InputNumber, Modal, Select, Space, Table, Tag } from 'antd'
import dayjs from 'dayjs'
import { useQueryClient } from '@tanstack/react-query'
import {
  CrudCreateHeader,
  CrudSearchFiltersBar,
  CrudSectionPanel,
} from '../../../../shared/components/ui/crud-section'
import { useAppMutation } from '../../../../shared/hooks/use-app-mutation'
import { useAppQuery } from '../../../../shared/hooks/use-app-query'
import { usePagedSearchFilters } from '../../../../shared/hooks/use-paged-search-filters'
import { queryKeys } from '../../../../shared/constants/query-keys'
import { formatRegistrosCaption } from '../../../../shared/utils/crud-search'
import { notify } from '../../../../shared/utils/notify'
import { getApiErrorMessage } from '../../../../shared/utils/api-error'
import { useProductosAlmacen } from '../../../almacen/productos/hooks/productos.hooks'
import { proveedoresService } from '../../proveedores/services/proveedores.service'
import { ordenesCompraService } from '../services/ordenes.service'

export function OrdenesCompraView() {
  const filters = usePagedSearchFilters()
  const qc = useQueryClient()
  const { data, isFetching } = useAppQuery({
    queryKey: queryKeys.compras.ordenes.list({
      page: filters.page,
      pageSize: filters.pageSize,
      search: filters.search,
    }),
    queryFn: () =>
      ordenesCompraService.getPaged({
        page: filters.page,
        pageSize: filters.pageSize,
        search: filters.search,
      }),
  })
  const { data: proveedores } = useAppQuery({
    queryKey: queryKeys.compras.proveedores.list({ page: 1, pageSize: 100 }),
    queryFn: () => proveedoresService.getPaged({ page: 1, pageSize: 100 }),
  })
  const { data: productos } = useProductosAlmacen({ page: 1, pageSize: 100 })
  const [open, setOpen] = useState(false)
  const [form] = Form.useForm()

  const createMutation = useAppMutation({
    mutationFn: ordenesCompraService.create,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.compras.ordenes.all })
      notify.success('Orden creada', 'Orden de compra registrada.')
      setOpen(false)
    },
    onError: (e) => notify.error('Error', getApiErrorMessage(e)),
  })
  const confirmarMutation = useAppMutation({
    mutationFn: ordenesCompraService.confirmar,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.compras.ordenes.all })
      notify.success('Orden confirmada', 'Lista para recepción.')
    },
    onError: (e) => notify.error('Error', getApiErrorMessage(e)),
  })

  const handleCreate = async () => {
    const values = await form.validateFields()
    await createMutation.mutateAsync({
      proveedorId: values.proveedorId,
      detalles: [
        {
          productoId: values.productoId,
          cantidad: values.cantidad,
          costoUnitario: values.costoUnitario,
        },
      ],
    })
  }

  return (
    <>
      <CrudSectionPanel
        filters={
          <CrudSearchFiltersBar
            searchInput={filters.searchInput}
            hasActiveFilters={filters.hasActiveFilters}
            onSearchInputChange={filters.handleSearchInputChange}
            onSearch={filters.handleSearch}
            onClearFilters={filters.clearFilters}
            ariaLabel="Filtros de órdenes"
            searchAriaLabel="Buscar orden"
            placeholder="Buscar por número…"
          />
        }
        actions={
          <CrudCreateHeader
            label="Nueva orden"
            ariaLabel="Crear orden de compra"
            onCreate={() => {
              form.resetFields()
              setOpen(true)
            }}
          />
        }
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
            { title: 'Número', dataIndex: 'numero' },
            { title: 'Proveedor', dataIndex: 'proveedorNombre' },
            {
              title: 'Fecha',
              dataIndex: 'fecha',
              render: (v: string) => dayjs(v).format('DD/MM/YYYY'),
            },
            {
              title: 'Estado',
              dataIndex: 'estado',
              render: (v: string) => <Tag>{v}</Tag>,
            },
            {
              title: 'Acciones',
              render: (_, row) => (
                <Space>
                  {row.estado === 'BORRADOR' && (
                    <Button
                      size="small"
                      onClick={() => void confirmarMutation.mutateAsync(row.id)}
                    >
                      Confirmar
                    </Button>
                  )}
                </Space>
              ),
            },
          ]}
        />
      </CrudSectionPanel>
      <Modal
        title="Nueva orden de compra"
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => void handleCreate()}
        confirmLoading={createMutation.isPending}
        destroyOnHidden
      >
        <Form form={form} layout="vertical">
          <Form.Item name="proveedorId" label="Proveedor" rules={[{ required: true }]}>
            <Select
              options={(proveedores?.items ?? []).map((p) => ({
                value: p.id,
                label: p.nombre,
              }))}
            />
          </Form.Item>
          <Form.Item name="productoId" label="Producto" rules={[{ required: true }]}>
            <Select
              options={(productos?.items ?? []).map((p) => ({
                value: p.id,
                label: `${p.codigo} — ${p.nombre}`,
              }))}
            />
          </Form.Item>
          <Form.Item name="cantidad" label="Cantidad" rules={[{ required: true }]}>
            <InputNumber min={0.0001} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="costoUnitario" label="Costo unitario" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
