import { useState } from 'react'
import { Button, Form, InputNumber, Modal, Select, Table, Tag } from 'antd'
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
import { pacienteEndpoints } from '../../../../shared/api/endpoints'
import { getPaged } from '../../../../shared/api/http'
import { useProductosAlmacen } from '../../../almacen/productos/hooks/productos.hooks'
import { dispensacionesService } from '../services/dispensaciones.service'

export function DispensacionesView() {
  const filters = usePagedSearchFilters()
  const qc = useQueryClient()
  const { data, isFetching } = useAppQuery({
    queryKey: queryKeys.farmacia.dispensaciones.list({
      page: filters.page,
      pageSize: filters.pageSize,
      search: filters.search,
    }),
    queryFn: () =>
      dispensacionesService.getPaged({
        page: filters.page,
        pageSize: filters.pageSize,
        search: filters.search,
      }),
  })
  const { data: productos } = useProductosAlmacen({ page: 1, pageSize: 100 })
  const { data: pacientes } = useAppQuery({
    queryKey: ['pacientes', 'lookup-farmacia'],
    queryFn: () => getPaged<{ id: string; codigo?: string }>(pacienteEndpoints.root, { page: 1, pageSize: 50 }),
  })
  const [open, setOpen] = useState(false)
  const [form] = Form.useForm()

  const createMutation = useAppMutation({
    mutationFn: dispensacionesService.create,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.farmacia.dispensaciones.all })
      notify.success('Dispensación creada', 'Queda en borrador.')
      setOpen(false)
    },
    onError: (e) => notify.error('Error', getApiErrorMessage(e)),
  })
  const confirmarMutation = useAppMutation({
    mutationFn: (id: string) => dispensacionesService.confirmar(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.farmacia.dispensaciones.all })
      notify.success('Confirmada', 'Enviada a caja y stock descontado.')
    },
    onError: (e) => notify.error('Error', getApiErrorMessage(e)),
  })

  const handleCreate = async () => {
    const values = await form.validateFields()
    await createMutation.mutateAsync({
      pacienteId: values.pacienteId,
      detalles: [{ productoId: values.productoId, cantidad: values.cantidad }],
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
            ariaLabel="Filtros de dispensaciones"
            searchAriaLabel="Buscar"
            placeholder="Buscar por número…"
          />
        }
        actions={
          <CrudCreateHeader
            label="Nueva dispensación"
            ariaLabel="Crear dispensación"
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
                row.estado === 'BORRADOR' ? (
                  <Button
                    size="small"
                    type="primary"
                    onClick={() => void confirmarMutation.mutateAsync(row.id)}
                  >
                    Confirmar → Caja
                  </Button>
                ) : (
                  '—'
                ),
            },
          ]}
        />
      </CrudSectionPanel>
      <Modal
        title="Nueva dispensación"
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => void handleCreate()}
        confirmLoading={createMutation.isPending}
        destroyOnHidden
      >
        <Form form={form} layout="vertical">
          <Form.Item name="pacienteId" label="Paciente" rules={[{ required: true }]}>
            <Select
              options={(pacientes?.items ?? []).map((p) => ({
                value: p.id,
                label: p.codigo ?? p.id,
              }))}
            />
          </Form.Item>
          <Form.Item name="productoId" label="Medicamento" rules={[{ required: true }]}>
            <Select
              options={(productos?.items ?? [])
                .filter((p) => p.esMedicamento)
                .map((p) => ({ value: p.id, label: `${p.codigo} — ${p.nombre}` }))}
            />
          </Form.Item>
          <Form.Item name="cantidad" label="Cantidad" rules={[{ required: true }]}>
            <InputNumber min={0.0001} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
