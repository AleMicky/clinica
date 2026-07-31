import { useState } from 'react'
import { Button, Form, Input, InputNumber, Modal, Select, Space, Table, Tag } from 'antd'
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
import { almacenesCatalogService } from '../../almacenes/services/almacenes.service'
import { useProductosAlmacen } from '../../productos/hooks/productos.hooks'
import { inventariosFisicosService } from '../services/inventarios.service'

export function InventariosFisicosView() {
  const filters = usePagedSearchFilters()
  const qc = useQueryClient()
  const { data, isFetching } = useAppQuery({
    queryKey: queryKeys.almacen.inventarios.list({
      page: filters.page,
      pageSize: filters.pageSize,
      search: filters.search,
    }),
    queryFn: () =>
      inventariosFisicosService.getPaged({
        page: filters.page,
        pageSize: filters.pageSize,
        search: filters.search,
      }),
  })
  const { data: almacenes } = useAppQuery({
    queryKey: queryKeys.almacen.almacenes.list({ page: 1, pageSize: 100 }),
    queryFn: () => almacenesCatalogService.getPaged({ page: 1, pageSize: 100 }),
  })
  const { data: productos } = useProductosAlmacen({ page: 1, pageSize: 200 })

  const [open, setOpen] = useState(false)
  const [contarOpen, setContarOpen] = useState<string | null>(null)
  const [form] = Form.useForm()
  const [contarForm] = Form.useForm()

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: queryKeys.almacen.inventarios.all })
  }

  const createMutation = useAppMutation({
    mutationFn: inventariosFisicosService.create,
    onSuccess: () => {
      invalidate()
      notify.success('Inventario creado', 'Borrador registrado.')
      setOpen(false)
    },
    onError: (e) => notify.error('Error', getApiErrorMessage(e)),
  })

  const actionMutation = useAppMutation({
    mutationFn: async ({
      id,
      action,
      payload,
    }: {
      id: string
      action: string
      payload?: { productoId: string; cantidadContada: number }
    }) => {
      switch (action) {
        case 'iniciar':
          return inventariosFisicosService.iniciarConteo(id)
        case 'contar':
          return inventariosFisicosService.contar(id, {
            detalles: [
              {
                productoId: payload!.productoId,
                cantidadContada: payload!.cantidadContada,
              },
            ],
          })
        case 'finalizar':
          return inventariosFisicosService.finalizarConteo(id)
        case 'aprobar':
          return inventariosFisicosService.aprobar(id)
        case 'anular':
          return inventariosFisicosService.anular(id)
        default:
          throw new Error('Acción no soportada')
      }
    },
    onSuccess: () => {
      invalidate()
      notify.success('Estado actualizado', 'Inventario actualizado.')
      setContarOpen(null)
    },
    onError: (e) => notify.error('Error', getApiErrorMessage(e)),
  })

  const handleCreate = async () => {
    const values = await form.validateFields()
    await createMutation.mutateAsync(values)
  }

  const handleContar = async () => {
    if (!contarOpen) return
    const values = await contarForm.validateFields()
    await actionMutation.mutateAsync({
      id: contarOpen,
      action: 'contar',
      payload: {
        productoId: values.productoId,
        cantidadContada: values.cantidadContada,
      },
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
            ariaLabel="Filtros de inventarios"
            searchAriaLabel="Buscar inventario"
            placeholder="Buscar por número…"
          />
        }
        actions={
          <CrudCreateHeader
            label="Nuevo inventario"
            ariaLabel="Crear inventario físico"
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
            { title: 'Almacén', dataIndex: 'almacenNombre' },
            {
              title: 'Inicio',
              dataIndex: 'fechaInicio',
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
                <Space wrap>
                  {row.estado === 'Borrador' ? (
                    <Button
                      size="small"
                      type="primary"
                      onClick={() =>
                        void actionMutation.mutateAsync({ id: row.id, action: 'iniciar' })
                      }
                    >
                      Iniciar conteo
                    </Button>
                  ) : null}
                  {row.estado === 'EnConteo' ? (
                    <>
                      <Button
                        size="small"
                        onClick={() => {
                          contarForm.resetFields()
                          setContarOpen(row.id)
                        }}
                      >
                        Contar
                      </Button>
                      <Button
                        size="small"
                        type="primary"
                        onClick={() =>
                          void actionMutation.mutateAsync({ id: row.id, action: 'finalizar' })
                        }
                      >
                        Finalizar
                      </Button>
                    </>
                  ) : null}
                  {row.estado === 'ConteoFinalizado' ? (
                    <Button
                      size="small"
                      type="primary"
                      onClick={() =>
                        void actionMutation.mutateAsync({ id: row.id, action: 'aprobar' })
                      }
                    >
                      Aprobar
                    </Button>
                  ) : null}
                  {row.estado !== 'Aprobado' && row.estado !== 'Anulado' ? (
                    <Button
                      size="small"
                      danger
                      onClick={() =>
                        void actionMutation.mutateAsync({ id: row.id, action: 'anular' })
                      }
                    >
                      Anular
                    </Button>
                  ) : null}
                </Space>
              ),
            },
          ]}
        />
      </CrudSectionPanel>

      <Modal
        title="Nuevo inventario físico"
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => void handleCreate()}
        confirmLoading={createMutation.isPending}
        destroyOnHidden
      >
        <Form form={form} layout="vertical">
          <Form.Item name="almacenId" label="Almacén" rules={[{ required: true }]}>
            <Select
              options={(almacenes?.items ?? []).map((a) => ({ value: a.id, label: a.nombre }))}
            />
          </Form.Item>
          <Form.Item name="observacion" label="Observación">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Registrar conteo"
        open={!!contarOpen}
        onCancel={() => setContarOpen(null)}
        onOk={() => void handleContar()}
        confirmLoading={actionMutation.isPending}
        destroyOnHidden
      >
        <Form form={contarForm} layout="vertical">
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
          <Form.Item name="cantidadContada" label="Cantidad contada" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
