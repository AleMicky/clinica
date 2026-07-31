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
import { useAreas } from '../../../catalogo-clinico/hooks/catalogo-clinico.hooks'
import { useEmpleadosLookup } from '../../../recursos-humanos/hooks/medicos.hooks'
import { almacenesCatalogService } from '../../almacenes/services/almacenes.service'
import { useProductosAlmacen } from '../../productos/hooks/productos.hooks'
import { solicitudesAlmacenService } from '../services/solicitudes.service'
import type { Solicitud } from '../types/solicitud.types'

export function SolicitudesAlmacenView() {
  const filters = usePagedSearchFilters()
  const qc = useQueryClient()
  const { data, isFetching } = useAppQuery({
    queryKey: queryKeys.almacen.solicitudes.list({
      page: filters.page,
      pageSize: filters.pageSize,
      search: filters.search,
    }),
    queryFn: () =>
      solicitudesAlmacenService.getPaged({
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
  const { data: areas } = useAreas({ page: 1, pageSize: 200 })

  const [open, setOpen] = useState(false)
  const [detalleModal, setDetalleModal] = useState<{
    solicitud: Solicitud
    action: 'aprobar' | 'atender'
  } | null>(null)
  const [form] = Form.useForm()
  const [detalleForm] = Form.useForm()

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: queryKeys.almacen.solicitudes.all })
  }

  const createMutation = useAppMutation({
    mutationFn: solicitudesAlmacenService.create,
    onSuccess: () => {
      invalidate()
      notify.success('Solicitud creada', 'Borrador registrado.')
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
      payload?: unknown
    }) => {
      switch (action) {
        case 'solicitar':
          return solicitudesAlmacenService.solicitar(id)
        case 'aprobar':
          return solicitudesAlmacenService.aprobar(
            id,
            payload as { detalles: Array<{ detalleId: string; cantidadAprobada: number }> },
          )
        case 'atender':
          return solicitudesAlmacenService.atender(
            id,
            payload as { detalles: Array<{ detalleId: string; cantidadEntregar: number }> },
          )
        case 'rechazar':
          return solicitudesAlmacenService.rechazar(id)
        case 'anular':
          return solicitudesAlmacenService.anular(id)
        default:
          throw new Error('Acción no soportada')
      }
    },
    onSuccess: () => {
      invalidate()
      notify.success('Estado actualizado', 'Solicitud actualizada.')
      setDetalleModal(null)
    },
    onError: (e) => notify.error('Error', getApiErrorMessage(e)),
  })

  const handleCreate = async () => {
    const values = await form.validateFields()
    await createMutation.mutateAsync({
      areaSolicitanteId: values.areaSolicitanteId,
      empleadoSolicitanteId: values.empleadoSolicitanteId,
      almacenId: values.almacenId,
      observacion: values.observacion,
      detalles: [
        {
          productoId: values.productoId,
          cantidadSolicitada: values.cantidadSolicitada,
        },
      ],
    })
  }

  const openDetalleAction = async (id: string, action: 'aprobar' | 'atender') => {
    try {
      const solicitud = await solicitudesAlmacenService.getById(id)
      const initial: Record<string, number> = {}
      for (const d of solicitud.detalles) {
        if (action === 'aprobar') {
          initial[`cant_${d.id}`] = d.cantidadSolicitada
        } else {
          initial[`cant_${d.id}`] = Math.max(
            0,
            d.cantidadAprobada - d.cantidadEntregada,
          )
        }
      }
      detalleForm.setFieldsValue(initial)
      setDetalleModal({ solicitud, action })
    } catch (e) {
      notify.error('Error', getApiErrorMessage(e))
    }
  }

  const handleDetalleAction = async () => {
    if (!detalleModal) return
    const values = await detalleForm.validateFields()
    if (detalleModal.action === 'aprobar') {
      await actionMutation.mutateAsync({
        id: detalleModal.solicitud.id,
        action: 'aprobar',
        payload: {
          detalles: detalleModal.solicitud.detalles.map((d) => ({
            detalleId: d.id,
            cantidadAprobada: values[`cant_${d.id}`] as number,
          })),
        },
      })
    } else {
      await actionMutation.mutateAsync({
        id: detalleModal.solicitud.id,
        action: 'atender',
        payload: {
          detalles: detalleModal.solicitud.detalles
            .map((d) => ({
              detalleId: d.id,
              cantidadEntregar: values[`cant_${d.id}`] as number,
            }))
            .filter((d) => d.cantidadEntregar > 0),
        },
      })
    }
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
            ariaLabel="Filtros de solicitudes"
            searchAriaLabel="Buscar solicitud"
            placeholder="Buscar por número…"
          />
        }
        actions={
          <CrudCreateHeader
            label="Nueva solicitud"
            ariaLabel="Crear solicitud"
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
            { title: 'Almacén', dataIndex: 'almacenNombre' },
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
                        onClick={() => void openDetalleAction(row.id, 'aprobar')}
                      >
                        Aprobar
                      </Button>
                      <Button
                        size="small"
                        danger
                        onClick={() =>
                          void actionMutation.mutateAsync({ id: row.id, action: 'rechazar' })
                        }
                      >
                        Rechazar
                      </Button>
                    </>
                  ) : null}
                  {row.estado === 'Aprobada' || row.estado === 'ParcialmenteAtendida' ? (
                    <Button
                      size="small"
                      type="primary"
                      onClick={() => void openDetalleAction(row.id, 'atender')}
                    >
                      Atender
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
        title="Nueva solicitud"
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => void handleCreate()}
        confirmLoading={createMutation.isPending}
        destroyOnHidden
        width={560}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="areaSolicitanteId" label="Área solicitante" rules={[{ required: true }]}>
            <Select
              showSearch
              optionFilterProp="label"
              options={(areas?.items ?? []).map((a) => ({
                value: a.id,
                label: `${a.codigo} — ${a.nombre}`,
              }))}
            />
          </Form.Item>
          <Form.Item
            name="empleadoSolicitanteId"
            label="Empleado solicitante"
            rules={[{ required: true }]}
          >
            <Select
              showSearch
              optionFilterProp="label"
              options={(empleados?.items ?? []).map((e) => ({
                value: e.id,
                label: `${e.personaNombreCompleto} (${e.codigoEmpleado})`,
              }))}
            />
          </Form.Item>
          <Form.Item name="almacenId" label="Almacén" rules={[{ required: true }]}>
            <Select
              options={(almacenes?.items ?? []).map((a) => ({ value: a.id, label: a.nombre }))}
            />
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
          detalleModal?.action === 'aprobar' ? 'Aprobar solicitud' : 'Atender solicitud'
        }
        open={!!detalleModal}
        onCancel={() => setDetalleModal(null)}
        onOk={() => void handleDetalleAction()}
        confirmLoading={actionMutation.isPending}
        destroyOnHidden
        width={640}
      >
        {detalleModal ? (
          <Form form={detalleForm} layout="vertical">
            {detalleModal.solicitud.detalles.map((d) => (
              <Form.Item
                key={d.id}
                name={`cant_${d.id}`}
                label={`${d.productoCodigo} — ${d.productoNombre} (sol: ${d.cantidadSolicitada}, apr: ${d.cantidadAprobada}, ent: ${d.cantidadEntregada})`}
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            ))}
          </Form>
        ) : null}
      </Modal>
    </>
  )
}
