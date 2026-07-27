import { useState } from 'react'
import { DatePicker, Form, Input, InputNumber, Modal, Select, Table } from 'antd'
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
import { preciosFarmaciaService } from '../services/precios.service'

export function PreciosFarmaciaView() {
  const filters = usePagedSearchFilters()
  const qc = useQueryClient()
  const { data, isFetching } = useAppQuery({
    queryKey: queryKeys.farmacia.precios.list({
      page: filters.page,
      pageSize: filters.pageSize,
    }),
    queryFn: () =>
      preciosFarmaciaService.getPaged({ page: filters.page, pageSize: filters.pageSize }),
  })
  const { data: productos } = useProductosAlmacen({ page: 1, pageSize: 100 })
  const [open, setOpen] = useState(false)
  const [form] = Form.useForm()

  const createMutation = useAppMutation({
    mutationFn: preciosFarmaciaService.create,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.farmacia.precios.all })
      notify.success('Precio registrado', 'Historial actualizado.')
      setOpen(false)
    },
    onError: (e) => notify.error('Error', getApiErrorMessage(e)),
  })

  const handleOk = async () => {
    const values = await form.validateFields()
    await createMutation.mutateAsync({
      productoId: values.productoId,
      importe: values.importe,
      fechaInicio: dayjs(values.fechaInicio).format('YYYY-MM-DD'),
      fechaFin: values.fechaFin ? dayjs(values.fechaFin).format('YYYY-MM-DD') : null,
      motivoCambio: values.motivoCambio ?? '',
    })
  }

  const productoNombre = (id: string) =>
    productos?.items.find((p) => p.id === id)?.nombre ?? id

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
            ariaLabel="Filtros de precios"
            searchAriaLabel="Buscar"
            placeholder="Filtrar…"
          />
        }
        actions={
          <CrudCreateHeader
            label="Nuevo precio"
            ariaLabel="Registrar precio"
            onCreate={() => {
              form.setFieldsValue({ fechaInicio: dayjs() })
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
            {
              title: 'Producto',
              dataIndex: 'productoId',
              render: (id: string) => productoNombre(id),
            },
            { title: 'Importe', dataIndex: 'importe' },
            { title: 'Inicio', dataIndex: 'fechaInicio' },
            { title: 'Fin', dataIndex: 'fechaFin', render: (v) => v ?? '—' },
            { title: 'Motivo', dataIndex: 'motivoCambio' },
          ]}
        />
      </CrudSectionPanel>
      <Modal
        title="Nuevo precio"
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => void handleOk()}
        confirmLoading={createMutation.isPending}
        destroyOnHidden
      >
        <Form form={form} layout="vertical">
          <Form.Item name="productoId" label="Producto" rules={[{ required: true }]}>
            <Select
              options={(productos?.items ?? [])
                .filter((p) => p.esMedicamento)
                .map((p) => ({ value: p.id, label: `${p.codigo} — ${p.nombre}` }))}
            />
          </Form.Item>
          <Form.Item name="importe" label="Importe" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="fechaInicio" label="Fecha inicio" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="fechaFin" label="Fecha fin">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="motivoCambio" label="Motivo">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
