import { useState } from 'react'
import { Form, InputNumber, Modal, Select, Table, Tag } from 'antd'
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
import { farmaciaEndpoints, pacienteEndpoints } from '../../../../shared/api/endpoints'
import { getPaged, post } from '../../../../shared/api/http'
import { useProductosAlmacen } from '../../../almacen/productos/hooks/productos.hooks'

export function RecetasView() {
  const filters = usePagedSearchFilters()
  const qc = useQueryClient()
  const { data, isFetching } = useAppQuery({
    queryKey: queryKeys.farmacia.recetas.list({
      page: filters.page,
      pageSize: filters.pageSize,
    }),
    queryFn: () =>
      getPaged(farmaciaEndpoints.recetas.root, {
        page: filters.page,
        pageSize: filters.pageSize,
      }),
  })
  const { data: productos } = useProductosAlmacen({ page: 1, pageSize: 100 })
  const { data: pacientes } = useAppQuery({
    queryKey: ['pacientes', 'lookup-recetas'],
    queryFn: () => getPaged(pacienteEndpoints.root, { page: 1, pageSize: 50 }),
  })
  const [open, setOpen] = useState(false)
  const [form] = Form.useForm()

  const createMutation = useAppMutation({
    mutationFn: (payload: unknown) => post(farmaciaEndpoints.recetas.root, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.farmacia.recetas.all })
      notify.success('Receta creada', 'Registro guardado.')
      setOpen(false)
    },
    onError: (e) => notify.error('Error', getApiErrorMessage(e)),
  })

  const handleOk = async () => {
    const values = await form.validateFields()
    await createMutation.mutateAsync({
      pacienteId: values.pacienteId,
      esExterna: values.esExterna ?? false,
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
            ariaLabel="Filtros de recetas"
            searchAriaLabel="Buscar"
            placeholder="Buscar…"
          />
        }
        actions={
          <CrudCreateHeader
            label="Nueva receta"
            ariaLabel="Crear receta"
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
          dataSource={(data?.items as Array<Record<string, unknown>>) ?? []}
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
              render: (v: string) => dayjs(v).format('DD/MM/YYYY'),
            },
            {
              title: 'Externa',
              dataIndex: 'esExterna',
              render: (v: boolean) => (v ? 'Sí' : 'No'),
            },
            {
              title: 'Estado',
              dataIndex: 'estado',
              render: (v: string) => <Tag>{v}</Tag>,
            },
          ]}
        />
      </CrudSectionPanel>
      <Modal
        title="Nueva receta"
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => void handleOk()}
        confirmLoading={createMutation.isPending}
        destroyOnHidden
      >
        <Form form={form} layout="vertical">
          <Form.Item name="pacienteId" label="Paciente" rules={[{ required: true }]}>
            <Select
              options={((pacientes?.items as Array<{ id: string; codigo?: string }>) ?? []).map(
                (p) => ({ value: p.id, label: p.codigo ?? p.id }),
              )}
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
