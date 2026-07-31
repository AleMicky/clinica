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
import { useEmpleadosLookup } from '../../../recursos-humanos/hooks/medicos.hooks'
import { almacenesCatalogService } from '../../almacenes/services/almacenes.service'
import { useProductosAlmacen } from '../../productos/hooks/productos.hooks'
import { transferenciasAlmacenService } from '../services/transferencias.service'

export function TransferenciasAlmacenView() {
  const filters = usePagedSearchFilters()
  const qc = useQueryClient()
  const { data, isFetching } = useAppQuery({
    queryKey: queryKeys.almacen.transferencias.list({
      page: filters.page,
      pageSize: filters.pageSize,
      search: filters.search,
    }),
    queryFn: () =>
      transferenciasAlmacenService.getPaged({
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
  const { data: empleados } = useEmpleadosLookup()

  const [open, setOpen] = useState(false)
  const [empleadoModal, setEmpleadoModal] = useState<{
    id: string
    action: 'aprobar' | 'enviar' | 'recibir' | 'rechazar'
  } | null>(null)
  const [form] = Form.useForm()
  const [empleadoForm] = Form.useForm()

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: queryKeys.almacen.transferencias.all })
  }

  const createMutation = useAppMutation({
    mutationFn: transferenciasAlmacenService.create,
    onSuccess: () => {
      invalidate()
      notify.success('Transferencia creada', 'Borrador registrado.')
      setOpen(false)
    },
    onError: (e) => notify.error('Error', getApiErrorMessage(e)),
  })

  const actionMutation = useAppMutation({
    mutationFn: async ({
      id,
      action,
      empleadoId,
    }: {
      id: string
      action: string
      empleadoId?: string
    }) => {
      switch (action) {
        case 'solicitar':
          return transferenciasAlmacenService.solicitar(id)
        case 'aprobar':
          return transferenciasAlmacenService.aprobar(id, empleadoId!)
        case 'preparar':
          return transferenciasAlmacenService.preparar(id)
        case 'enviar':
          return transferenciasAlmacenService.enviar(id, empleadoId!)
        case 'recibir':
          return transferenciasAlmacenService.recibir(id, empleadoId!)
        case 'rechazar':
          return transferenciasAlmacenService.rechazar(id, empleadoId!)
        case 'anular':
          return transferenciasAlmacenService.anular(id)
        default:
          throw new Error('Acción no soportada')
      }
    },
    onSuccess: () => {
      invalidate()
      notify.success('Estado actualizado', 'Transferencia actualizada.')
      setEmpleadoModal(null)
    },
    onError: (e) => notify.error('Error', getApiErrorMessage(e)),
  })

  const handleCreate = async () => {
    const values = await form.validateFields()
    await createMutation.mutateAsync({
      almacenOrigenId: values.almacenOrigenId,
      almacenDestinoId: values.almacenDestinoId,
      empleadoSolicitanteId: values.empleadoSolicitanteId,
      observacion: values.observacion,
      detalles: [
        {
          productoId: values.productoId,
          cantidadSolicitada: values.cantidadSolicitada,
        },
      ],
    })
  }

  const handleEmpleadoAction = async () => {
    if (!empleadoModal) return
    const values = await empleadoForm.validateFields()
    await actionMutation.mutateAsync({
      id: empleadoModal.id,
      action: empleadoModal.action,
      empleadoId: values.empleadoId,
    })
  }

  const empleadoOptions = (empleados?.items ?? []).map((e) => ({
    value: e.id,
    label: `${e.personaNombreCompleto} (${e.codigoEmpleado})`,
  }))

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
            ariaLabel="Filtros de transferencias"
            searchAriaLabel="Buscar transferencia"
            placeholder="Buscar por número…"
          />
        }
        actions={
          <CrudCreateHeader
            label="Nueva transferencia"
            ariaLabel="Crear transferencia"
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
              dataIndex: 'fechaSolicitud',
              render: (v: string) => dayjs(v).format('DD/MM/YYYY'),
            },
            { title: 'Origen', dataIndex: 'almacenOrigenNombre' },
            { title: 'Destino', dataIndex: 'almacenDestinoNombre' },
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
                      onClick={() =>
                        void actionMutation.mutateAsync({ id: row.id, action: 'solicitar' })
                      }
                    >
                      Solicitar
                    </Button>
                  ) : null}
                  {row.estado === 'Solicitada' ? (
                    <>
                      <Button
                        size="small"
                        type="primary"
                        onClick={() => {
                          empleadoForm.resetFields()
                          setEmpleadoModal({ id: row.id, action: 'aprobar' })
                        }}
                      >
                        Aprobar
                      </Button>
                      <Button
                        size="small"
                        danger
                        onClick={() => {
                          empleadoForm.resetFields()
                          setEmpleadoModal({ id: row.id, action: 'rechazar' })
                        }}
                      >
                        Rechazar
                      </Button>
                    </>
                  ) : null}
                  {row.estado === 'Aprobada' ? (
                    <Button
                      size="small"
                      onClick={() =>
                        void actionMutation.mutateAsync({ id: row.id, action: 'preparar' })
                      }
                    >
                      Preparar
                    </Button>
                  ) : null}
                  {row.estado === 'EnPreparacion' ? (
                    <Button
                      size="small"
                      type="primary"
                      onClick={() => {
                        empleadoForm.resetFields()
                        setEmpleadoModal({ id: row.id, action: 'enviar' })
                      }}
                    >
                      Enviar
                    </Button>
                  ) : null}
                  {row.estado === 'Enviada' ? (
                    <Button
                      size="small"
                      type="primary"
                      onClick={() => {
                        empleadoForm.resetFields()
                        setEmpleadoModal({ id: row.id, action: 'recibir' })
                      }}
                    >
                      Recibir
                    </Button>
                  ) : null}
                  {row.estado === 'Borrador' || row.estado === 'Solicitada' ? (
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
        title="Nueva transferencia"
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => void handleCreate()}
        confirmLoading={createMutation.isPending}
        destroyOnHidden
        width={560}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="almacenOrigenId" label="Almacén origen" rules={[{ required: true }]}>
            <Select
              options={(almacenes?.items ?? []).map((a) => ({ value: a.id, label: a.nombre }))}
            />
          </Form.Item>
          <Form.Item name="almacenDestinoId" label="Almacén destino" rules={[{ required: true }]}>
            <Select
              options={(almacenes?.items ?? []).map((a) => ({ value: a.id, label: a.nombre }))}
            />
          </Form.Item>
          <Form.Item
            name="empleadoSolicitanteId"
            label="Empleado solicitante"
            rules={[{ required: true }]}
          >
            <Select showSearch optionFilterProp="label" options={empleadoOptions} />
          </Form.Item>
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
          <Form.Item name="cantidadSolicitada" label="Cantidad" rules={[{ required: true }]}>
            <InputNumber min={0.0001} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="observacion" label="Observación">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={
          empleadoModal?.action === 'aprobar'
            ? 'Aprobar transferencia'
            : empleadoModal?.action === 'enviar'
              ? 'Enviar transferencia'
              : empleadoModal?.action === 'recibir'
                ? 'Recibir transferencia'
                : 'Rechazar transferencia'
        }
        open={!!empleadoModal}
        onCancel={() => setEmpleadoModal(null)}
        onOk={() => void handleEmpleadoAction()}
        confirmLoading={actionMutation.isPending}
        destroyOnHidden
      >
        <Form form={empleadoForm} layout="vertical">
          <Form.Item name="empleadoId" label="Empleado" rules={[{ required: true }]}>
            <Select showSearch optionFilterProp="label" options={empleadoOptions} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
