import { useState } from 'react'
import { Button, DatePicker, Form, Input, InputNumber, Modal, Select, Table, Tag } from 'antd'
import dayjs from 'dayjs'
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
import { useQueryClient } from '@tanstack/react-query'
import { useProductosAlmacen } from '../../productos/hooks/productos.hooks'
import { movimientosAlmacenService } from '../services/movimientos.service'

export function MovimientosAlmacenView() {
  const filters = usePagedSearchFilters()
  const qc = useQueryClient()
  const { data, isFetching } = useAppQuery({
    queryKey: queryKeys.almacen.movimientos.list({
      page: filters.page,
      pageSize: filters.pageSize,
      search: filters.search,
    }),
    queryFn: () =>
      movimientosAlmacenService.getPaged({
        page: filters.page,
        pageSize: filters.pageSize,
        search: filters.search,
      }),
  })
  const { data: productos } = useProductosAlmacen({ page: 1, pageSize: 100 })
  const [open, setOpen] = useState(false)
  const [form] = Form.useForm()

  const ingresoMutation = useAppMutation({
    mutationFn: movimientosAlmacenService.registrarIngreso,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.almacen.movimientos.all })
      void qc.invalidateQueries({ queryKey: queryKeys.almacen.existencias.all })
      notify.success('Ingreso registrado', 'Stock actualizado.')
      setOpen(false)
    },
    onError: (e) => notify.error('Error', getApiErrorMessage(e)),
  })

  const aplicarMutation = useAppMutation({
    mutationFn: (id: string) => movimientosAlmacenService.aplicar(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.almacen.movimientos.all })
      void qc.invalidateQueries({ queryKey: queryKeys.almacen.existencias.all })
      notify.success('Movimiento aplicado', 'Stock actualizado.')
    },
    onError: (e) => notify.error('Error', getApiErrorMessage(e)),
  })

  const handleIngreso = async () => {
    const values = await form.validateFields()
    await ingresoMutation.mutateAsync({
      lineas: [
        {
          productoId: values.productoId,
          cantidad: values.cantidad,
          numeroLote: values.numeroLote,
          fechaVencimiento: values.fechaVencimiento
            ? dayjs(values.fechaVencimiento).format('YYYY-MM-DD')
            : null,
          costoUnitario: values.costoUnitario,
        },
      ],
      observaciones: values.observaciones,
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
            ariaLabel="Filtros de movimientos"
            searchAriaLabel="Buscar movimiento"
            placeholder="Buscar por número…"
          />
        }
        actions={
          <CrudCreateHeader
            label="Registrar ingreso"
            ariaLabel="Registrar ingreso"
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
            { title: 'Tipo', dataIndex: 'tipo' },
            {
              title: 'Fecha',
              dataIndex: 'fecha',
              render: (v: string) => dayjs(v).format('DD/MM/YYYY HH:mm'),
            },
            {
              title: 'Estado',
              dataIndex: 'estado',
              render: (v: string) => <Tag>{v}</Tag>,
            },
            {
              title: 'Acciones',
              render: (_, row) =>
                row.requiereAprobacion && row.estado !== 'APLICADO' ? (
                  <Button
                    size="small"
                    onClick={() => void aplicarMutation.mutateAsync(row.id)}
                  >
                    Aplicar
                  </Button>
                ) : (
                  '—'
                ),
            },
          ]}
        />
      </CrudSectionPanel>

      <Modal
        title="Registrar ingreso de stock"
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => void handleIngreso()}
        confirmLoading={ingresoMutation.isPending}
        destroyOnHidden
      >
        <Form form={form} layout="vertical">
          <Form.Item name="productoId" label="Producto" rules={[{ required: true }]}>
            <Select
              showSearch
              optionFilterProp="label"
              options={(productos?.items ?? []).map((p) => ({
                value: p.id,
                label: `${p.codigo} — ${p.nombre}`,
              }))}
            />
          </Form.Item>
          <Form.Item name="cantidad" label="Cantidad" rules={[{ required: true }]}>
            <InputNumber min={0.0001} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="numeroLote" label="Número de lote" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="fechaVencimiento" label="Fecha de vencimiento">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="costoUnitario" label="Costo unitario">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="observaciones" label="Observaciones">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
